import nodemailer from "nodemailer";
import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

const getEmailProvider = () =>
  (process.env.EMAIL_PROVIDER || (process.env.BREVO_API_KEY ? "brevo" : "smtp")).toLowerCase();

const requiredCommonEnv = ["SMTP_FROM_NAME", "SMTP_FROM_EMAIL", "CLIENT_URL"];
const requiredSmtpEnv = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];
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

const getClientUrl = () =>
  (process.env.CLIENT_URL || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean)[0];

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatAmount = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const buildBrevoEmailPayload = (to, subject, html) => ({
  sender: {
    name: process.env.SMTP_FROM_NAME,
    email: process.env.SMTP_FROM_EMAIL,
  },
  to: [{ email: to }],
  subject,
  htmlContent: html,
});

const emailLayout = ({ preheader, title, intro, children = "", buttonUrl, buttonText }) => `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;background:#f4f7fb;color:#17202a;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e6edf5;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:26px 30px;background:#1b231c;color:#ffffff;">
                <div style="font-size:22px;font-weight:700;letter-spacing:0;">TripSync</div>
                <div style="margin-top:6px;font-size:13px;color:#c9d8cc;">Plan together. Travel better.</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 30px 28px;">
                <h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;color:#1b231c;">${escapeHtml(title)}</h1>
                <p style="margin:0 0 22px;font-size:15px;line-height:1.65;color:#4d5a66;">${intro}</p>
                ${children}
                ${
                  buttonUrl && buttonText
                    ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:26px 0 10px;">
                        <tr>
                          <td style="border-radius:8px;background:#ff6b35;">
                            <a href="${buttonUrl}" style="display:inline-block;padding:13px 22px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;">${escapeHtml(buttonText)}</a>
                          </td>
                        </tr>
                      </table>`
                    : ""
                }
                ${
                  buttonUrl
                    ? `<p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#7d8a97;">If the button does not work, paste this link into your browser:<br><a href="${buttonUrl}" style="color:#ff6b35;word-break:break-all;">${buttonUrl}</a></p>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding:18px 30px;background:#f8fafc;border-top:1px solid #e6edf5;color:#7d8a97;font-size:12px;line-height:1.6;">
                This email was sent by TripSync. If you did not request this, you can safely ignore it.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

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
  await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to,
    subject,
    html,
  });
};

const sendEmailWithBrevo = async (to, subject, html) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const payload = buildBrevoEmailPayload(to, subject, html);

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
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
  const html = emailLayout({
    preheader: "Reset your TripSync password. This link expires in 15 minutes.",
    title: "Reset your password",
    intro:
      "We received a request to reset your TripSync password. Use the secure button below to choose a new password. This link expires in 15 minutes.",
    buttonUrl: url,
    buttonText: "Reset password",
  });

  await sendEmail(email, "Reset your TripSync password", html);
};

const sendVerificationEmail = async (email, token) => {
  const url = `${getClientUrl()}/verify-email/${token}`;
  const html = emailLayout({
    preheader: "Confirm your email address to start using TripSync.",
    title: "Verify your email",
    intro:
      "Welcome to TripSync. Confirm your email address so we can keep your trips, invites, and account updates connected to the right inbox. This link expires in 15 minutes.",
    children: `
      <div style="margin:0 0 22px;padding:16px 18px;background:#fff7f2;border:1px solid #ffd8c7;border-radius:10px;color:#5d4036;font-size:14px;line-height:1.6;">
        After verification, you can create trips, invite members, track expenses, and keep plans organized in one place.
      </div>
    `,
    buttonUrl: url,
    buttonText: "Verify email",
  });

  await sendEmail(email, "Verify your TripSync email", html);
};

const sendMemberAddedEmail = async (toEmail, toName, tripTitle, inviterName) => {
  const url = `${getClientUrl()}/trips`;
  const safeName = escapeHtml(toName || "there");
  const safeInviter = escapeHtml(inviterName || "A TripSync member");
  const safeTripTitle = escapeHtml(tripTitle);
  const html = emailLayout({
    preheader: `${inviterName} added you to ${tripTitle} on TripSync.`,
    title: "You are going on a trip",
    intro: `Hi ${safeName}, <strong>${safeInviter}</strong> added you to <strong>${safeTripTitle}</strong> on TripSync.`,
    children: `
      <div style="margin:0 0 22px;padding:16px 18px;background:#f8fafc;border:1px solid #e6edf5;border-radius:10px;">
        <div style="font-size:12px;text-transform:uppercase;color:#7d8a97;font-weight:700;letter-spacing:.04em;">Trip</div>
        <div style="margin-top:5px;font-size:18px;color:#1b231c;font-weight:700;">${safeTripTitle}</div>
      </div>
    `,
    buttonUrl: url,
    buttonText: "View trip",
  });

  await sendEmail(toEmail, `You have been added to "${tripTitle}" on TripSync`, html);
};

const sendTripInvitationEmail = async ({
  toEmail,
  tripTitle,
  inviterName,
  role,
  invitationUrl,
}) => {
  const safeInviter = escapeHtml(inviterName || "A TripSync member");
  const safeTripTitle = escapeHtml(tripTitle);
  const safeRole = escapeHtml(role);
  const html = emailLayout({
    preheader: `${inviterName || "Someone"} invited you to ${tripTitle} on TripSync.`,
    title: "You are invited to a trip",
    intro: `<strong>${safeInviter}</strong> invited you to collaborate on <strong>${safeTripTitle}</strong> as a <strong>${safeRole}</strong>.`,
    children: `
      <div style="margin:0 0 22px;padding:16px 18px;background:#f8fafc;border:1px solid #e6edf5;border-radius:10px;">
        <div style="font-size:12px;text-transform:uppercase;color:#7d8a97;font-weight:700;letter-spacing:.04em;">Trip invitation</div>
        <div style="margin-top:5px;font-size:18px;color:#1b231c;font-weight:700;">${safeTripTitle}</div>
        <div style="margin-top:8px;color:#4d5a66;font-size:14px;">Role: ${safeRole}</div>
      </div>
    `,
    buttonUrl: invitationUrl,
    buttonText: "Accept invitation",
  });

  await sendEmail(toEmail, `Invitation to join "${tripTitle}" on TripSync`, html);
};

const sendExpenseAddedEmail = async (toEmail, toName, tripTitle, expenseTitle, amount, paidBy) => {
  const url = `${getClientUrl()}/trips`;
  const safeName = escapeHtml(toName || "there");
  const safeTripTitle = escapeHtml(tripTitle);
  const safeExpenseTitle = escapeHtml(expenseTitle);
  const safePaidBy = escapeHtml(paidBy);
  const html = emailLayout({
    preheader: `A new expense was added to ${tripTitle}.`,
    title: "New expense logged",
    intro: `Hi ${safeName}, a new expense was added to <strong>${safeTripTitle}</strong>.`,
    children: `
      <div style="margin:0 0 22px;padding:18px 20px;background:#f8fafc;border:1px solid #e6edf5;border-radius:10px;">
        <div style="font-size:16px;color:#1b231c;font-weight:700;">${safeExpenseTitle}</div>
        <div style="margin-top:8px;color:#ff6b35;font-size:26px;font-weight:800;">${formatAmount(amount)}</div>
        <div style="margin-top:8px;color:#7d8a97;font-size:13px;">Paid by ${safePaidBy}</div>
      </div>
    `,
    buttonUrl: url,
    buttonText: "Review expense",
  });

  await sendEmail(toEmail, `New expense added to "${tripTitle}"`, html);
};

export {
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendMemberAddedEmail,
  sendTripInvitationEmail,
  sendExpenseAddedEmail,
};
