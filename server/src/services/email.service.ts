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

    // If host or username mentions gmail, use nodemailer's dedicated gmail service configuration
    const isGmail = cleanHost.toLowerCase().includes('gmail') || cleanUser.toLowerCase().includes('gmail');

    const transportConfig: any = isGmail
      ? {
          service: 'gmail',
          auth: {
            user: cleanUser,
            pass: cleanPass,
          },
          tls: {
            rejectUnauthorized: false,
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
        }
      : {
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
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
        };

    transporter = nodemailer.createTransport(transportConfig);
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

  // 1. Try Brevo HTTP REST API (Works over HTTPS port 443 - NEVER blocked by Render Free Tier)
  if (ENV.BREVO_API_KEY) {
    try {
      const cleanSender = (ENV.SMTP_USER || 'mitraiiitbh@gmail.com').trim();
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': ENV.BREVO_API_KEY,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: 'IIIT Bhagalpur MITRA',
            email: cleanSender,
          },
          to: [{ email: toEmail, name: fullName }],
          subject: `[IIITBH MITRA] ${otp} is your verification passcode`,
          htmlContent,
        }),
      });

      if (res.ok) {
        const data: any = await res.json();
        console.log(`✅ [EMAIL SERVICE: BREVO REST API] Email delivered to ${toEmail}: messageId=${data.messageId}`);
        return { sent: true, messageId: data.messageId };
      } else {
        const errorText = await res.text();
        console.error(`⚠️ [BREVO API ERROR]: ${res.status} - ${errorText}`);
      }
    } catch (e: any) {
      console.error(`⚠️ [BREVO API EXCEPTION]:`, e?.message || e);
    }
  }

  // 2. Try Resend HTTP REST API (Works over HTTPS port 443 - NEVER blocked by Render Free Tier)
  if (ENV.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ENV.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: ENV.SMTP_FROM || 'IIIT Bhagalpur MITRA <onboarding@resend.dev>',
          to: [toEmail],
          subject: `[IIITBH MITRA] ${otp} is your verification passcode`,
          html: htmlContent,
        }),
      });

      if (res.ok) {
        const data: any = await res.json();
        console.log(`✅ [EMAIL SERVICE: RESEND REST API] Email delivered to ${toEmail}: id=${data.id}`);
        return { sent: true, messageId: data.id };
      } else {
        const errorText = await res.text();
        console.error(`⚠️ [RESEND API ERROR]: ${res.status} - ${errorText}`);
      }
    } catch (e: any) {
      console.error(`⚠️ [RESEND API EXCEPTION]:`, e?.message || e);
    }
  }

  // 3. Try Standard SMTP (Nodemailer - works on paid instances or local network)
  const mailTransporter = getTransporter();
  if (mailTransporter) {
    try {
      const cleanUser = (ENV.SMTP_USER || '').trim();
      const fromAddress =
        ENV.SMTP_FROM && ENV.SMTP_FROM.includes('@')
          ? ENV.SMTP_FROM.replace(/[<>"]/g, '').trim().includes('@')
            ? `"IIIT Bhagalpur MITRA" <${cleanUser || 'no-reply@iiitbh.ac.in'}>`
            : ENV.SMTP_FROM
          : `"IIIT Bhagalpur MITRA" <${cleanUser || 'no-reply@iiitbh.ac.in'}>`;

      const info = await mailTransporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject: `[IIITBH MITRA] ${otp} is your verification passcode`,
        text: `Hello ${fullName},\n\nYour IIIT Bhagalpur MITRA verification code is: ${otp}\n\nThis code expires in 15 minutes.\n\nIIIT Bhagalpur`,
        html: htmlContent,
      });

      console.log(`✅ [EMAIL SERVICE: SMTP] Verification email sent to ${toEmail}: messageId=${info.messageId}`);
      return {
        sent: true,
        messageId: info.messageId,
      };
    } catch (err: any) {
      console.error(`❌ [EMAIL SERVICE: SMTP ERROR] Failed to send email to ${toEmail}:`, err?.message || err);
      return {
        sent: false,
        fallbackOtp: otp,
        error: err?.message || 'SMTP delivery failure (Render Free blocks SMTP ports)',
      };
    }
  }

  // 4. Fallback when unconfigured
  console.log(`\n========================================================`);
  console.log(`📧 [EMAIL SERVICE - NO DISPATCHER CONFIGURED]`);
  console.log(`Recipient: ${toEmail} (${fullName})`);
  console.log(`Verification OTP: [ ${otp} ]`);
  console.log(`========================================================\n`);

  return {
    sent: false,
    fallbackOtp: otp,
  };
}
