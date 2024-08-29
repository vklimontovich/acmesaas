import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { ReactElement, ReactNode } from "react";
import { brand } from "@/lib/content/branding";
import { serverEnv } from "@/lib/server/server-env";

interface SendEmailOptions {
  to: string;
  subject: string;
  component: ReactElement;
  plainText?: string; // Optional plaintext version
}

export async function sendEmail({ to, subject, component, plainText }: SendEmailOptions) {
  const smtpConnectionString = serverEnv.SMTP_CONNECTION_STRING;
  const smtpFromName = serverEnv.SMTP_FROM_NAME || brand.serviceName;
  const smtpFromEmail = serverEnv.SMTP_FROM_EMAIL || `support@${brand.domain}`;

  if (!serverEnv.SMTP_CONNECTION_STRING) {
    console.log(
      `Email from "${smtpFromName}" <${smtpFromEmail}> ${to} with subject "${subject}" will not be sent - HTTP is not configured`
    );
    return;
  }

  if (!smtpConnectionString || !smtpFromName || !smtpFromEmail) {
    throw new Error("SMTP configuration is missing in environment variables.");
  }

  // Create a transporter object using SMTP connection string
  const transporter = nodemailer.createTransport(smtpConnectionString);

  // Render the JSX component to HTML using React Email's render function
  const htmlContent = await render(component);

  const mailOptions = {
    from: `"${smtpFromName}" <${smtpFromEmail}>`,
    to,
    subject,
    html: htmlContent,
    plainText: plainText, // Add the plaintext version if provided
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `Email from "${smtpFromName}" <${smtpFromEmail}> ${to} with subject "${subject}" has been sent. Message id: ${info.messageId}`
    );
  } catch (error) {
    console.log(
      `Email from "${smtpFromName}" <${smtpFromEmail}> ${to} with subject "${subject}" has been FAILED`,
      error
    );
    throw error;
  }
}
