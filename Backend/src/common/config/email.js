import nodemailer from "nodemailer";
import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

const getEmailProvider = () =>
  (process.env.EMAIL_PROVIDER || (process.env.BREVO_API_KEY ? "brevo" : "smtp")).toLowerCase();

const requiredCommonEnv = [
  "SMTP_FROM_NAME",
  "SMTP_FROM_EMAIL",
  "CLIENT_URL",
];

const requiredSmtpEnv = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
];

const requiredBrevoEnv = ["BREVO_API_KEY"];

const assertEmailConfig = () => {
  const provider = getEmailProvider();
  const providerEnv = provider === "brevo" ? requiredBrevoEnv : requiredSmtpEnv;
  const missing = [...requiredCommonEnv, ...providerEnv].filter((key) => !process.env[key]);

  if (missing.length > 0) {
    const error = new Error(`Missing email configuration: ${missing.join(", ")}`);
    error.code = "EMAIL_CONFIG_MISSING";
    throw error;
  }
};

const getEmailConfigSummary = () => ({
  provider: getEmailProvider(),
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  userConfigured: Boolean(process.env.SMTP_USER),
  passConfigured: Boolean(process.env.SMTP_PASS),
  brevoKeyConfigured: Boolean(process.env.BREVO_API_KEY),
  fromEmail: process.env.SMTP_FROM_EMAIL,
  clientUrl: getClientUrl(),
});

const getClientUrl = () => {
  return (process.env.CLIENT_URL || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean)[0];
};

// SMTP transporter — works with Mailtrap, Gmail, SendGrid, or any SMTP provider
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  family: 4,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS?.replace(/\s/g, ""),
  },
});

const sendEmailWithSmtp = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.error("\n========== SMTP ERROR ==========");
    console.error("Config:", getEmailConfigSummary());
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Response Code:", error.responseCode);
    console.error("Response:", error.response);
    console.error("Command:", error.command);
    console.error("Full Error:", error);
    console.error("================================\n");

    throw error;
  }
};

const sendEmailWithBrevo = async (to, subject, html) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: process.env.SMTP_FROM_NAME,
          email: process.env.SMTP_FROM_EMAIL,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const responseText = await response.text();
      const error = new Error(`Brevo email API failed with status ${response.status}`);
      error.code = "BREVO_API_ERROR";
      error.responseCode = response.status;
      error.response = responseText;
      throw error;
    }

    console.log("Email sent successfully");
  } catch (error) {
    console.error("\n========== EMAIL API ERROR ==========");
    console.error("Config:", getEmailConfigSummary());
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Response Code:", error.responseCode);
    console.error("Response:", error.response);
    console.error("=====================================\n");

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

const sendEmail = async (to, subject, html) => {
  assertEmailConfig();

  if (getEmailProvider() === "brevo") {
    await sendEmailWithBrevo(to, subject, html);
    return;
  }

  await sendEmailWithSmtp(to, subject, html);
};

const sendResetPasswordEmail = async (email, token) => {
  const url = `${getClientUrl()}/reset-password/${token}`;
  await sendEmail(
    email,
    "Reset your password",
    `<h2>Password Reset</h2><p>Click <a href="${url}">here</a> to reset your password. This link expires in 15 minutes.</p>`,
  );
};

const sendVerificationEmail = async (email, token) => {
  const url = `${getClientUrl()}/verify-email/${token}`;
  await sendEmail(
    email,
    "Verify your email",
    `<h2>Verify your email</h2><p>Click <a href="${url}">here</a> to verify your email address. This link expires in 15 minutes.</p>`,
  );
};

const sendMemberAddedEmail = async (toEmail, toName, tripTitle, inviterName) => {
  const url = `${getClientUrl()}/trips`;
  await sendEmail(
    toEmail,
    `You have been added to "${tripTitle}" on TripSync`,
    `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f9f9f9;border-radius:10px;">
      <h2 style="margin:0 0 8px;color:#1B231C;">You are going on a trip!</h2>
      <p style="color:#555;margin:0 0 20px;">Hi ${toName}, <strong>${inviterName}</strong> has added you to <strong>${tripTitle}</strong> on TripSync.</p>
      <a href="${url}" style="display:inline-block;background:#FF6B35;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;">View Trip</a>
      <p style="color:#aaa;font-size:12px;margin-top:28px;">If you did not expect this, you can ignore this email.</p>
    </div>
    `
  );
};

const sendExpenseAddedEmail = async (toEmail, toName, tripTitle, expenseTitle, amount, paidBy) => {
  const url = `${getClientUrl()}/trips`;
  await sendEmail(
    toEmail,
    `New expense added to "${tripTitle}"`,
    `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f9f9f9;border-radius:10px;">
      <h2 style="margin:0 0 8px;color:#1B231C;">New expense logged</h2>
      <p style="color:#555;margin:0 0 8px;">Hi ${toName}, a new expense has been added to <strong>${tripTitle}</strong>.</p>
      <div style="background:#fff;border-radius:8px;padding:16px 20px;margin:16px 0;border:1px solid #eee;">
        <p style="margin:0 0 6px;font-weight:600;color:#1B231C;">${expenseTitle}</p>
        <p style="margin:0;color:#FF6B35;font-family:monospace;font-size:18px;">&#8377;${amount}</p>
        <p style="margin:6px 0 0;color:#888;font-size:13px;">Paid by ${paidBy}</p>
      </div>
      <a href="${url}" style="display:inline-block;background:#FF6B35;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;">View Trip</a>
    </div>
    `
  );
};

export { sendResetPasswordEmail, sendVerificationEmail, sendMemberAddedEmail, sendExpenseAddedEmail };
