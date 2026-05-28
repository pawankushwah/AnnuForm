import nodemailer from "nodemailer";

export const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === "ssl", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== "false",
  }
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const info = await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

/**
 * Compiles a template string with data by replacing {{key}} with data[key]
 */
export function compileTemplate(templateString: string, data: Record<string, any>) {
  return templateString.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, key) => {
    const val = data[key.trim()];
    return val !== undefined ? String(val) : match;
  });
}
