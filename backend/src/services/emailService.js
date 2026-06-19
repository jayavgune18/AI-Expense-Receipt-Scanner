const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.port === 465,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Expense Scanner" <${env.smtp.from}>`,
      to,
      subject,
      html,
      text,
    });
    logger.info(`Email sent: ${info.messageId} to ${to}`);
    return info;
  } catch (error) {
    logger.error('Email sending error:', error);
    // Don't throw - email failures shouldn't break main flow
    return null;
  }
};

const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">Welcome to Expense Scanner! 🎉</h1>
      </div>
      <div style="padding: 30px; background: #f8fafc; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #334155;">Hi ${user.name},</p>
        <p style="font-size: 16px; color: #334155;">Welcome to Expense Scanner! We're excited to help you digitize and manage your expenses with AI-powered insights.</p>
        <p style="font-size: 16px; color: #334155;">Get started by:</p>
        <ul style="font-size: 15px; color: #475569;">
          <li>Uploading your first receipt</li>
          <li>Setting up your monthly budget</li>
          <li>Exploring your expense dashboard</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${env.frontendUrl}/dashboard" style="background: #6366f1; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">Go to Dashboard</a>
        </div>
        <p style="font-size: 14px; color: #94a3b8;">Best regards,<br/>The Expense Scanner Team</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Welcome to Expense Scanner!',
    html,
    text: `Welcome ${user.name}! Start digitizing your receipts and managing expenses with AI.`,
  });
};

const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${env.frontendUrl}/reset-password/${resetToken}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">Password Reset</h1>
      </div>
      <div style="padding: 30px; background: #f8fafc; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #334155;">Hi ${user.name},</p>
        <p style="font-size: 16px; color: #334155;">You requested a password reset. Click the button below to set a new password. This link expires in 1 hour.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #6366f1; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="font-size: 14px; color: #94a3b8;">If you didn't request this, please ignore this email.</p>
        <p style="font-size: 14px; color: #94a3b8;">Best regards,<br/>The Expense Scanner Team</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Password Reset - Expense Scanner',
    html,
    text: `Reset your password here: ${resetUrl}`,
  });
};

const sendReceiptProcessedEmail = async (user, receipt) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">Receipt Processed ✅</h1>
      </div>
      <div style="padding: 30px; background: #f8fafc; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #334155;">Hi ${user.name},</p>
        <p style="font-size: 16px; color: #334155;">Your receipt has been processed successfully!</p>
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
          <p><strong>Merchant:</strong> ${receipt.extractedData?.merchantName || 'N/A'}</p>
          <p><strong>Amount:</strong> $${receipt.extractedData?.totalAmount?.toFixed(2) || '0.00'}</p>
          <p><strong>Category:</strong> ${receipt.aiClassification?.category || 'Others'}</p>
          <p><strong>Date:</strong> ${receipt.extractedData?.date ? new Date(receipt.extractedData.date).toLocaleDateString() : 'N/A'}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${env.frontendUrl}/receipts/${receipt._id}" style="background: #6366f1; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Receipt</a>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Receipt Processed Successfully',
    html,
    text: `Receipt from ${receipt.extractedData?.merchantName || 'Unknown'} for $${receipt.extractedData?.totalAmount?.toFixed(2) || '0.00'} has been processed.`,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendReceiptProcessedEmail,
};