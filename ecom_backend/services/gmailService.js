const fs = require("fs").promises;
const path = require("path");
const process = require("process");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
  try {
    await fs.unlink(TOKEN_PATH); // delete the old token file if exists
  } catch (err) {
    // ignore if it doesn't exist
  }

  const client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });

  return client;
}

async function setSendAsAlias(auth, aliasEmail, displayName = "EduCareer") {
  const gmail = google.gmail({ version: "v1", auth });

  const { data } = await gmail.users.settings.sendAs.list({ userId: "me" });
  const alias = data.sendAs.find((a) => a.sendAsEmail === aliasEmail);

  if (!alias) {
    throw new Error(`Alias ${aliasEmail} not found..............`);
  }

  // PLEASE REMEMBER TO IMPLEMENT THIS PART
  await gmail.users.settings.sendAs.patch({
    userId: "me",
    sendAsEmail: aliasEmail,
    requestBody: {
      displayName,
      isDefault: true,
    },
  });

  console.log(`Alias ${aliasEmail} : ${displayName}`);
}

async function sendRegistrationVerificationEmail(email, username) {
  try {
    const auth = await authorize();
    const gmail = google.gmail({ version: "v1", auth });

    const dummyVerificationLink = `http://localhost:3000/api/verify-email?token=dummy-token`;

    const emailLines = [];
    emailLines.push(`From: "EduCareer" <educareer.test@gmail.com>`);
    emailLines.push(`To: ${email}`);
    emailLines.push(`Subject: Verify Your Email Address`);
    emailLines.push(`Content-Type: text/html; charset="UTF-8"`);
    emailLines.push("");
    emailLines.push(`<p>Hello ${username},</p>`);
    emailLines.push(
      `<p>Please verify your email address by clicking the following link:</p>`
    );
    emailLines.push(
      `<p><a href="${dummyVerificationLink}">Verify Email</a></p>`
    );

    const emailContent = emailLines.join("\n");

    // Base64 URL-safe encode the email
    const base64EncodedEmail = Buffer.from(emailContent)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: base64EncodedEmail,
      },
    });

    console.log("Email sent successfully:", res.data);
    return "Email sent successfully";
  } catch (error) {
    console.error("Error sending verification email:", error);
    return null;
  }
}

async function sendCertificateEmail(
  email,
  username,
  certificatePdfBuffer,
  certificateData
) {
  try {
    const auth = await authorize();
    const gmail = google.gmail({ version: "v1", auth });

    const boundary = "----=_Part_0_123456789.987654321";
    const subject = "Your Course Certificate";
    const textBody = `Hi ${username},\n\nCongratulations on completing the course "${certificateData.course}". Please find your certificate attached.\n\nBest regards,\nEduCareer Team`;

    // Convert the PDF buffer to a base64 string
    const attachment = certificatePdfBuffer.toString("base64");

    // Construct a MIME message with an attachment
    const messageParts = [];
    messageParts.push(`From: "EduCareer" <${process.env.GOOGLE_EMAIL}>`);
    messageParts.push(`To: ${email}`);
    messageParts.push(`Subject: ${subject}`);
    messageParts.push("MIME-Version: 1.0");
    messageParts.push(
      `Content-Type: multipart/mixed; boundary="${boundary}"\n`
    );
    messageParts.push(`--${boundary}`);
    messageParts.push('Content-Type: text/plain; charset="UTF-8"');
    messageParts.push("Content-Transfer-Encoding: 7bit\n");
    messageParts.push(textBody + "\n");
    messageParts.push(`--${boundary}`);
    messageParts.push('Content-Type: application/pdf; name="certificate.pdf"');
    messageParts.push("Content-Transfer-Encoding: base64");
    messageParts.push(
      'Content-Disposition: attachment; filename="certificate.pdf"\n'
    );
    messageParts.push(attachment);
    messageParts.push(`--${boundary}--`);

    const emailContent = messageParts.join("\n");

    // Base64 URL-safe encode the email content
    const raw = Buffer.from(emailContent)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw,
      },
    });

    console.log("Certificate email sent successfully:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error sending certificate email:", error);
    throw error;
  }
}

async function sendForgotPasswordEmail(email, username, newPassword) {
  try {
    const auth = await authorize();
    const gmail = google.gmail({ version: "v1", auth });

    const emailLines = [];
    emailLines.push(`From: "EduCareer" <educareer.test@gmail.com>`);
    emailLines.push(`To: ${email}`);
    emailLines.push(`Subject: Reset Your Password`);
    emailLines.push(`Content-Type: text/html; charset="UTF-8"`);
    emailLines.push("");
    emailLines.push(`<p>Hello ${username},</p>`);
    emailLines.push(`<p>Your password has been reset.</p>`);
    emailLines.push(
      `<p>Your new temporary password is: <strong>${newPassword}</strong></p>`
    );
    emailLines.push(
      `<p>Please log in using this password and immediately update your password for security purposes.</p>`
    );

    const emailContent = emailLines.join("\n");

    const base64EncodedEmail = Buffer.from(emailContent)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: base64EncodedEmail,
      },
    });

    console.log("Forgot password email sent successfully:", res.data);
    return "Email sent successfully";
  } catch (error) {
    console.error("Error sending forgot password email:", error);
    return null;
  }
}

async function sendEnrollmentReceipt(email, username, courseDetails) {
  try {
    const auth = await authorize();
    const gmail = google.gmail({ version: "v1", auth });

    const currentDate = new Date().toLocaleDateString();
    const formattedPrice =
      Number(courseDetails.price) === 0 ? "Free" : `$${courseDetails.price}`;

    const emailLines = [];
    emailLines.push(`From: "EduCareer" <${process.env.GOOGLE_EMAIL}>`);
    emailLines.push(`To: ${email}`);
    emailLines.push(
      `Subject: Course Enrollment Confirmation: ${
        courseDetails.name || courseDetails.title
      }`
    );
    emailLines.push(`Content-Type: text/html; charset="UTF-8"`);
    emailLines.push("");
    emailLines.push(
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">`
    );
    emailLines.push(`<h2 style="color: #4a90e2;">Enrollment Confirmation</h2>`);
    emailLines.push(`<p>Dear ${username},</p>`);
    emailLines.push(
      `<p>Thank you for enrolling in <strong>${
        courseDetails.name || courseDetails.title
      }</strong>.</p>`
    );

    emailLines.push(
      `<div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">`
    );
    emailLines.push(`<h3 style="margin-top: 0;">Receipt Details</h3>`);
    emailLines.push(`<p><strong>Date:</strong> ${currentDate}</p>`);
    emailLines.push(
      `<p><strong>Course:</strong> ${
        courseDetails.name || courseDetails.title
      }</p>`
    );
    emailLines.push(
      `<p><strong>Provider:</strong> ${
        courseDetails.training_provider_alias || courseDetails.provider || "N/A"
      }</p>`
    );
    emailLines.push(
      `<p><strong>Category:</strong> ${courseDetails.category || "N/A"}</p>`
    );
    emailLines.push(
      `<p><strong>Duration:</strong> ${
        courseDetails.total_training_hours || courseDetails.duration || "N/A"
      }</p>`
    );
    emailLines.push(`<p><strong>Amount Paid:</strong> ${formattedPrice}</p>`);
    emailLines.push(`</div>`);

    emailLines.push(
      `<p>You can access your course by logging into our platform. We hope you enjoy the learning experience!</p>`
    );
    emailLines.push(`<p>Best regards,<br />The EduCareer Team</p>`);
    emailLines.push(`</div>`);

    const emailContent = emailLines.join("\n");

    // Base64 URL-safe encode the email
    const encodedEmail = Buffer.from(emailContent)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedEmail,
      },
    });

    console.log("Enrollment receipt sent successfully:", res.data);
    return "Email sent successfully";
  } catch (error) {
    console.error("Error sending enrollment receipt:", error);
    return null;
  }
}

// Don't forget to export the new function
module.exports = {
  sendRegistrationVerificationEmail,
  setSendAsAlias, // exported in case you want to call it elsewhere
  sendForgotPasswordEmail,
  sendEnrollmentReceipt,
  sendCertificateEmail,
};
