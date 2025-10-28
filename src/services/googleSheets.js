import { google } from "googleapis";
import { config } from "../config/config.js";

class GoogleSheetsService {
  constructor() {
    this.auth = null;
    this.sheets = null;
    this.sheetId = config.googleSheets.sheetId;
    this.sheetName = "Newsletter"; // Default sheet name
  }

  async initialize() {
    try {
      this.auth = new google.auth.JWT(
        config.googleSheets.serviceAccountEmail,
        null,
        config.googleSheets.privateKey,
        ["https://www.googleapis.com/auth/spreadsheets"]
      );

      await this.auth.authorize();
      this.sheets = google.sheets({ version: "v4", auth: this.auth });

      // Ensure headers exist
      await this.ensureHeaders();

      console.log("✅ Google Sheets service initialized");
    } catch (error) {
      console.error("❌ Failed to initialize Google Sheets:", error.message);
      throw error;
    }
  }

  async ensureHeaders() {
    try {
      // Check if headers exist
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: `${this.sheetName}!A1:C1`,
      });

      if (!response.data.values || response.data.values.length === 0) {
        // Add headers if they don't exist
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.sheetId,
          range: `${this.sheetName}!A1:C1`,
          valueInputOption: "RAW",
          resource: {
            values: [["Email", "Name", "SentMail"]],
          },
        });
        console.log("✅ Headers created in Google Sheet");
      }
    } catch (error) {
      console.error("❌ Error ensuring headers:", error.message);
      throw error;
    }
  }

  async addSubscriber(email, name = "") {
    try {
      // Check if email already exists
      const existingData = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: `${this.sheetName}!A:A`,
      });

      const emails = existingData.data.values || [];
      const emailExists = emails.some((row) => row[0] === email);

      if (emailExists) {
        return {
          success: false,
          message: "Email already subscribed",
          duplicate: true,
        };
      }

      // Add new subscriber
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.sheetId,
        range: `${this.sheetName}!A:B`,
        valueInputOption: "RAW",
        resource: {
          values: [[email, false]],
        },
      });

      return {
        success: true,
        message: "Successfully subscribed to newsletter",
      };
    } catch (error) {
      console.error("❌ Error adding subscriber:", error.message);
      throw error;
    }
  }

  async getUnsentSubscribers() {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: `${this.sheetName}!A:B`,
      });

      const rows = response.data.values || [];

      if (rows.length <= 1) {
        return []; // No data or only headers
      }

      // Skip header row and filter unsent emails
      const subscribers = [];
      for (let i = 1; i < rows.length; i++) {
        const [email, sentMail] = rows[i];

        // Check if sentMail is false or empty
        if (
          email &&
          (sentMail === "false" ||
            sentMail === "FALSE" ||
            sentMail === false ||
            !sentMail)
        ) {
          subscribers.push({
            email,
            rowIndex: i + 1, // 1-indexed for Google Sheets
          });
        }
      }

      return subscribers;
    } catch (error) {
      console.error("❌ Error getting unsent subscribers:", error.message);
      throw error;
    }
  }

  async markAsSent(rowIndex) {
    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.sheetId,
        range: `${this.sheetName}!B${rowIndex}`,
        valueInputOption: "RAW",
        resource: {
          values: [[true]],
        },
      });
    } catch (error) {
      console.error(`❌ Error marking row ${rowIndex} as sent:`, error.message);
      throw error;
    }
  }

  async markMultipleAsSent(rowIndices) {
    try {
      const requests = rowIndices.map((rowIndex) => ({
        range: `${this.sheetName}!B${rowIndex}`,
        values: [[true]],
      }));

      await this.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: this.sheetId,
        resource: {
          valueInputOption: "RAW",
          data: requests,
        },
      });
    } catch (error) {
      console.error("❌ Error marking multiple rows as sent:", error.message);
      throw error;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
