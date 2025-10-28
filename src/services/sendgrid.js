import sgMail from '@sendgrid/mail';
import { config } from '../config/config.js';

class SendGridService {
  constructor() {
    this.initialized = false;
  }

  initialize() {
    try {
      sgMail.setApiKey(config.sendgrid.apiKey);
      this.initialized = true;
      console.log('✅ SendGrid service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize SendGrid:', error.message);
      throw error;
    }
  }

  async sendEmail(to, subject, htmlContent, textContent) {
    if (!this.initialized) {
      throw new Error('SendGrid service not initialized');
    }

    try {
      const msg = {
        to,
        from: {
          email: config.sendgrid.fromEmail,
          name: config.sendgrid.fromName,
        },
        subject,
        text: textContent,
        html: htmlContent,
      };

      await sgMail.send(msg);
      return { success: true };
    } catch (error) {
      console.error(`❌ Error sending email to ${to}:`, error.message);
      throw error;
    }
  }

  async sendBulkEmails(subscribers, emailTemplate) {
    if (!this.initialized) {
      throw new Error('SendGrid service not initialized');
    }

    const results = {
      total: subscribers.length,
      sent: 0,
      failed: 0,
      errors: [],
      sentEmails: [],
    };

    // Send emails with rate limiting (to avoid SendGrid limits)
    for (const subscriber of subscribers) {
      try {
        const personalizedHtml = this.personalizeEmail(
          emailTemplate.html,
          subscriber.name,
          subscriber.email
        );
        
        const personalizedText = this.personalizeEmail(
          emailTemplate.text,
          subscriber.name,
          subscriber.email
        );

        await this.sendEmail(
          subscriber.email,
          emailTemplate.subject,
          personalizedHtml,
          personalizedText
        );

        results.sent++;
        results.sentEmails.push({
          email: subscriber.email,
          rowIndex: subscriber.rowIndex,
        });

        // Add delay to avoid rate limiting (adjust based on your SendGrid plan)
        await this.delay(100); // 100ms delay between emails
      } catch (error) {
        results.failed++;
        results.errors.push({
          email: subscriber.email,
          error: error.message,
        });
      }
    }

    return results;
  }

  personalizeEmail(content, name, email) {
    return content
      .replace(/\{\{name\}\}/g, name || 'Subscriber')
      .replace(/\{\{email\}\}/g, email);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Default email template
  getDefaultTemplate() {
    return {
      subject: 'Welcome to Our Newsletter!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Our Newsletter!</h1>
            </div>
            <div class="content">
              <p>Hi {{name}},</p>
              <p>Thank you for subscribing to our newsletter! We're excited to have you on board.</p>
              <p>You'll receive updates about:</p>
              <ul>
                <li>New features and product updates</li>
                <li>Exclusive content and insights</li>
                <li>Special offers and promotions</li>
              </ul>
              <p>Stay tuned for great content coming your way!</p>
              <a href="#" class="button">Visit Our Website</a>
            </div>
            <div class="footer">
              <p>You're receiving this email because you subscribed to our newsletter.</p>
              <p>If you wish to unsubscribe, please reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hi {{name}},

Thank you for subscribing to our newsletter! We're excited to have you on board.

You'll receive updates about:
- New features and product updates
- Exclusive content and insights
- Special offers and promotions

Stay tuned for great content coming your way!

---
You're receiving this email because you subscribed to our newsletter.
If you wish to unsubscribe, please reply to this email.
      `,
    };
  }
}

export const sendGridService = new SendGridService();
