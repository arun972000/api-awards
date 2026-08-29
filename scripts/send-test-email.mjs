import nodemailer from "nodemailer";

const user = process.env.GMAIL_USER?.trim() || "apiexcellenceawards2026@gmail.com";
const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/gu, "");
const recipient = process.argv[2]?.trim() || user;

if (!pass) {
  console.error(
    "Missing GMAIL_APP_PASSWORD. Run with `npm run email:test`, which loads .env.local, or export it into your shell first.",
  );
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user, pass },
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 15_000,
});

try {
  await transporter.verify();
  console.log(`SMTP credentials accepted for ${user}.`);
} catch (error) {
  const reason =
    error.code === "EAUTH"
      ? "Google rejected the credentials. Confirm 2-Step Verification is on and the app password belongs to this account."
      : error.message;
  console.error(`SMTP check failed: ${reason}`);
  process.exit(1);
}

try {
  const receipt = await transporter.sendMail({
    from: { name: "API Excellence Awards 2026", address: user },
    to: recipient,
    subject: "SMTP test — API Excellence Awards 2026",
    text: "Gmail SMTP is configured correctly. Nomination confirmations will send from this address.",
  });
  console.log(`Test email sent to ${recipient} (${receipt.messageId}).`);
  console.log("Check that it arrived in the inbox rather than the spam folder.");
} catch (error) {
  console.error(`Send failed: ${error.message}`);
  process.exit(1);
}
