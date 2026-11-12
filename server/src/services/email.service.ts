import nodemailer, { Transporter } from 'nodemailer';
import { ENV } from '../config/env';

let transporter: Transporter | null = null;

export function isSmtpConfigured(): boolean {
  return !!(ENV.SMTP_HOST && ENV.SMTP_USER && ENV.SMTP_PASS);
}

function getTransporter(): Transporter | null {
  if (!isSmtpConfigured()) {
    return null;
  }

  if (!transporter) {
    const cleanPass = (ENV.SMTP_PASS || '').replace(/\s+/g, '');
    const cleanUser = (ENV.SMTP_USER || '').trim();
    const cleanHost = (ENV.SMTP_HOST || '').trim();

    transporter = nodemailer.createTransport({
      host: cleanHost,
      port: ENV.SMTP_PORT,
      secure: ENV.SMTP_SECURE,
      auth: {
        user: cleanUser,
        pass: cleanPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return transporter;
}

export interface SendVerificationEmailResult {
  sent: boolean;
  messageId?: string;
  fallbackOtp?: string;
  error?: string;
}

/**
 * Dispatches the 6-digit verification OTP email to the student's institutional email address.
 * If SMTP is not yet configured in environment variables, it safely captures and returns
 * the OTP as a fallback so the registration flow is never blocked.
 */
export async function sendVerificationOtpEmail(
  toEmail: string,
  fullName: string,
  otp: string
): Promise<SendVerificationEmailResult> {
  const mailTransporter = getTransporter();

  if (!mailTransporter) {
    console.log(`\n========================================================`);
    console.log(`📧 [EMAIL SERVICE - SMTP UNCONFIGURED]`);
    console.log(`Recipient: ${toEmail} (${fullName})`);
    console.log(`Verification OTP: [ ${otp} ]`);
    console.log(`Note: Provide SMTP_HOST, SMTP_USER, SMTP_PASS in .env to deliver real emails.`);
    console.log(`========================================================\n`);

    return {
      sent: false,
      fallbackOtp: otp,
    };
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { background: #0f172a; padding: 24px; text-align: center; }
          .header h1 { color: #ffffff; font-size: 18px; margin: 0; letter-spacing: 0.5px; text-transform: uppercase; }
          .header p { color: #38bdf8; font-size: 12px; margin: 4px 0 0; font-weight: 600; }
          .content { padding: 32px 24px; text-align: center; }
          .otp-box { background: #f1f5f9; border: 2px dashed #0284c7; border-radius: 8px; padding: 16px; margin: 24px 0; display: inline-block; }
          .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0284c7; margin: 0; }
          .footer { background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>IIIT Bhagalpur</h1>
            <p>MITRA • Centralized Student Community</p>
          </div>
          <div class="content">
            <h2 style="font-size: 18px; margin-top: 0; color: #0f172a;">Verify Your College Email</h2>
            <p style="font-size: 14px; line-height: 1.5; color: #475569;">
              Hello <strong>${fullName}</strong>,<br>
              Welcome to IIIT Bhagalpur's MITRA platform. Use the one-time passcode below to complete your registration.
            </p>
            <div class="otp-box">
              <p class="otp-code">${otp}</p>
            </div>
            <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">
              This code will expire in <strong>15 minutes</strong>. If you did not initiate this request, you can safely ignore this email.
            </p>
          </div>
          <div class="footer">
            <p style="margin: 0;">Indian Institute of Information Technology Bhagalpur • Sabour, Bihar 813210</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const info = await mailTransporter.sendMail({
      from: ENV.SMTP_FROM,
      to: toEmail,
      subject: `[IIITBH MITRA] ${otp} is your verification passcode`,
      text: `Hello ${fullName},\n\nYour IIIT Bhagalpur MITRA verification code is: ${otp}\n\nThis code expires in 15 minutes.\n\nIIIT Bhagalpur`,
      html: htmlContent,
    });

    console.log(`✅ [EMAIL SERVICE] Verification email sent to ${toEmail}: messageId=${info.messageId}`);
    return {
      sent: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error(`❌ [EMAIL SERVICE ERROR] Failed to send email to ${toEmail}:`, err?.message || err);
    // Return fallbackOtp so the student is never locked out due to network/SMTP misconfiguration
    return {
      sent: false,
      fallbackOtp: otp,
      error: err?.message || 'SMTP delivery failure',
    };
  }
}
