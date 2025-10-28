import express from "express";
import { googleSheetsService } from "../services/googleSheets.js";
import { sendGridService } from "../services/sendgrid.js";

const router = express.Router();

/**
 * POST /api/subscribe
 * Add a new email subscriber to Google Sheets
 */
router.post("/subscribe", async (req, res) => {
  try {
    const { email, name } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Add subscriber to Google Sheets
    const result = await googleSheetsService.addSubscriber(email, name || "");

    if (result.duplicate) {
      return res.status(409).json({
        success: false,
        message: "This email is already subscribed",
      });
    }

    res.status(201).json({
      success: true,
      message: "Successfully subscribed to newsletter",
    });
  } catch (error) {
    console.error("Error in /subscribe:", error);
    res.status(500).json({
      success: false,
      message: "Failed to subscribe. Please try again later.",
    });
  }
});

/**
 * POST /api/send-bulk-emails
 * Send emails to all subscribers who haven't received emails yet
 * This endpoint should be protected in production (add authentication)
 */
router.post("/send-bulk-emails", async (req, res) => {
  try {
    const { emailTemplate } = req.body;

    // Get all unsent subscribers
    const subscribers = await googleSheetsService.getUnsentSubscribers();

    if (subscribers.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No subscribers to send emails to",
        results: {
          total: 0,
          sent: 0,
          failed: 0,
        },
      });
    }

    // Use provided template or default template
    const template = emailTemplate || sendGridService.getDefaultTemplate();
    console.log("🚀 ~ template:", template);

    // Send bulk emails
    const results = await sendGridService.sendBulkEmails(subscribers, template);
    console.log("🚀 ~ results:", results);

    // Mark successfully sent emails as sent in Google Sheets
    if (results.sentEmails.length > 0) {
      const rowIndices = results.sentEmails.map((item) => item.rowIndex);
      await googleSheetsService.markMultipleAsSent(rowIndices);
    }

    res.status(200).json({
      success: true,
      message: `Bulk email sending completed. Sent: ${results.sent}, Failed: ${results.failed}`,
      results: {
        total: results.total,
        sent: results.sent,
        failed: results.failed,
        errors: results.errors,
      },
    });
  } catch (error) {
    console.error("Error in /send-bulk-emails:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send bulk emails. Please try again later.",
      error: error.message,
    });
  }
});

/**
 * GET /api/subscribers/unsent
 * Get count of subscribers who haven't received emails
 * This endpoint should be protected in production (add authentication)
 */
router.get("/subscribers/unsent", async (req, res) => {
  try {
    const subscribers = await googleSheetsService.getUnsentSubscribers();

    res.status(200).json({
      success: true,
      count: subscribers.length,
      subscribers: subscribers.map((s) => ({ email: s.email, name: s.name })),
    });
  } catch (error) {
    console.error("Error in /subscribers/unsent:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscribers",
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
