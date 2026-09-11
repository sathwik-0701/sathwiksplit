"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendOTPEmail = exports.sendBrevoEmail = void 0;
const axios_1 = __importDefault(require("axios"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendBrevoEmail = async (options) => {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'sathwikredd7701@gmail.com';
    const smtpUser = process.env.BREVO_SMTP_USER || senderEmail;
    if (!apiKey) {
        console.error('❌ BREVO_API_KEY is not set in the environment. Cannot send email to', options.to);
        return false;
    }
    if (options.otp) {
        console.log('\n================================================================');
        console.log(`🔑 VERIFICATION OTP CODE FOR ${options.to}: [ ${options.otp} ]`);
        console.log('================================================================\n');
    }
    // 1. Try Brevo REST API v3 first (most reliable for Brevo API Keys)
    if (apiKey.startsWith('xkeysib-')) {
        try {
            const response = await axios_1.default.post('https://api.brevo.com/v3/smtp/email', {
                sender: { name: 'Split Expense App', email: senderEmail },
                to: [{ email: options.to }],
                subject: options.subject,
                htmlContent: options.htmlContent,
                textContent: options.textContent,
            }, {
                headers: {
                    accept: 'application/json',
                    'api-key': apiKey,
                    'content-type': 'application/json',
                },
            });
            console.log(`✉️ Brevo API Email sent to ${options.to}. MessageId: ${response.data?.messageId}`);
            return true;
        }
        catch (error) {
            const errData = error?.response?.data;
            console.error('⚠️ Brevo REST API Error:', errData?.message || error.message);
            if (errData?.code === 'unauthorized' && errData?.message?.includes('authorised_ips')) {
                console.error('👉 ACTION REQUIRED: Add your IP address to Brevo Security settings at https://app.brevo.com/security/authorised_ips or disable IP restrictions.');
            }
        }
    }
    // 2. Fallback: Send via Brevo SMTP Relay
    try {
        const transporter = nodemailer_1.default.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false,
            auth: {
                user: smtpUser,
                pass: apiKey,
            },
        });
        const info = await transporter.sendMail({
            from: `"Split Expense App" <${senderEmail}>`,
            to: options.to,
            subject: options.subject,
            html: options.htmlContent,
            text: options.textContent,
        });
        console.log(`✉️ REAL EMAIL SENT via Brevo SMTP to ${options.to}! MessageId: ${info.messageId}`);
        return true;
    }
    catch (error) {
        console.error('⚠️ Brevo SMTP Send Error:', error.message);
    }
    console.error(`❌ Failed to send email to ${options.to} via both Brevo REST API and SMTP.`);
    return false;
};
exports.sendBrevoEmail = sendBrevoEmail;
const sendOTPEmail = async (email, otp, name) => {
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #16a34a; text-align: center;">Verify Your Account</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Thank you for registering with Split Expense Management App! Use the 6-digit OTP code below to complete your registration:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a; background: #f1f5f9; padding: 12px 24px; border-radius: 8px; display: inline-block;">${otp}</span>
      </div>
      <p>This code is valid for 10 minutes. If you did not request this code, please ignore this email.</p>
    </div>
  `;
    return (0, exports.sendBrevoEmail)({
        to: email,
        subject: `${otp} is your verification code - Split Expense App`,
        htmlContent,
        textContent: `Your Split Expense App verification code is: ${otp}`,
        otp,
    });
};
exports.sendOTPEmail = sendOTPEmail;
const sendPasswordResetEmail = async (email, otp) => {
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #dc2626; text-align: center;">Reset Your Password</h2>
      <p>Use the 6-digit OTP code below to reset your Split Expense App password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a; background: #f1f5f9; padding: 12px 24px; border-radius: 8px; display: inline-block;">${otp}</span>
      </div>
      <p>This code is valid for 10 minutes.</p>
    </div>
  `;
    return (0, exports.sendBrevoEmail)({
        to: email,
        subject: `Password Reset Code: ${otp} - Split Expense App`,
        htmlContent,
        textContent: `Your password reset code is: ${otp}`,
        otp,
    });
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
