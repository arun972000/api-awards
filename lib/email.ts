import nodemailer, { type Transporter } from 'nodemailer';
import { awardDates } from '@/lib/awardContent';

const defaultSenderEmail = 'apiexcellenceawards2026@gmail.com';
const senderName = 'API Excellence Awards 2026';

type ConfirmationEmailInput = {
  recipientEmail: string;
  recipientName: string;
  nomineeName: string;
  categoryName: string;
  entryTitle: string;
  reference: string;
  submissionDate: string;
};

export type ConfirmationEmailResult =
  | { sent: true; messageId?: string }
  | {
      sent: false;
      reason: 'not_configured' | 'authentication_failed' | 'rate_limited' | 'provider_error';
      diagnostic?: {
        errorCode?: string;
        errorMessage?: string;
      };
    };

// Reused across warm invocations so repeat submissions skip the TLS handshake.
let cachedTransporter: Transporter | null = null;

function getTransporter(user: string, pass: string) {
  cachedTransporter ??= nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
    // Without these a stalled SMTP connection would run until the serverless
    // function itself times out.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  return cachedTransporter;
}

function cleanDiagnostic(value: string | undefined) {
  return value?.replace(/\s+/gu, ' ').trim().slice(0, 240);
}

function smtpErrorFields(error: unknown) {
  const { code, responseCode } = (error ?? {}) as { code?: string; responseCode?: number };
  return { code, responseCode };
}

function classifyFailure(error: unknown) {
  const { code, responseCode } = smtpErrorFields(error);
  const message = error instanceof Error ? error.message.toLocaleLowerCase() : '';

  if (code === 'EAUTH' || responseCode === 534 || responseCode === 535) {
    return 'authentication_failed' as const;
  }
  // Gmail reports its daily cap as "550-5.4.5 Daily user sending limit exceeded".
  if (responseCode === 421 || responseCode === 450 || /limit|quota/u.test(message)) {
    return 'rate_limited' as const;
  }

  return 'provider_error' as const;
}

function escapeHtml(value: string) {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return value.replace(/[&<>"']/gu, (character) => entities[character]);
}

function formatSubmissionDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value + 'T00:00:00Z'));
}

function createEmailContent(input: ConfirmationEmailInput) {
  const recipientName = escapeHtml(input.recipientName);
  const nomineeName = escapeHtml(input.nomineeName);
  const categoryName = escapeHtml(input.categoryName);
  const entryTitle = escapeHtml(input.entryTitle);
  const reference = escapeHtml(input.reference);
  const submissionDate = formatSubmissionDate(input.submissionDate);

  const text = [
    `Dear ${input.recipientName},`,
    '',
    'Thank you for submitting a nomination for the API Excellence Awards 2026.',
    '',
    `Submission reference: ${input.reference}`,
    `Nominee: ${input.nomineeName}`,
    `Award category: ${input.categoryName}`,
    `Entry: ${input.entryTitle}`,
    `Submitted: ${submissionDate}`,
    '',
    'Please keep the submission reference for any correspondence with the Association of Publishers in India.',
    `Nominations close on ${awardDates.nominationsClose}. The awards ceremony will be held on ${awardDates.ceremony}.`,
    '',
    'This email confirms receipt only. It does not indicate that the nominee has been shortlisted or selected.',
    '',
    'Regards,',
    'API Excellence Awards 2026',
    'Association of Publishers in India',
  ].join('\n');

  const details = [
    ['Nominee', nomineeName],
    ['Award category', categoryName],
    ['Entry', entryTitle],
    ['Submitted', submissionDate],
  ]
    .map(
      ([label, value]) =>
        `<tr><td style='padding:9px 12px 9px 0;border-bottom:1px solid #e2e6e9;color:#657684;'>${label}</td><td style='padding:9px 0;border-bottom:1px solid #e2e6e9;font-weight:700;'>${value}</td></tr>`,
    )
    .join('');

  const html = `<!doctype html>
<html lang='en'>
  <body style='margin:0;background:#f1f3f5;color:#263746;font-family:Arial,Helvetica,sans-serif;'>
    <div style='display:none;max-height:0;overflow:hidden;opacity:0;'>Your API Excellence Awards 2026 nomination has been received.</div>
    <table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='background:#f1f3f5;padding:28px 12px;'>
      <tr><td align='center'>
        <table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='max-width:640px;background:#ffffff;border:1px solid #d9dee2;'>
          <tr><td style='background:#173b5e;padding:28px 34px;color:#ffffff;'>
            <div style='font-size:12px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#c8d0d8;'>Association of Publishers in India</div>
            <div style='margin-top:8px;font-size:25px;font-weight:700;'>API Excellence Awards 2026</div>
          </td></tr>
          <tr><td style='padding:34px;'>
            <div style='font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#526474;'>Nomination received</div>
            <h1 style='margin:10px 0 16px;color:#173b5e;font-size:28px;line-height:1.25;'>Thank you for your nomination.</h1>
            <p style='margin:0 0 22px;font-size:15px;line-height:1.7;'>Dear ${recipientName},<br><br>We have received your nomination for the API Excellence Awards 2026.</p>
            <div style='padding:20px 22px;background:#f5f6f7;border-left:4px solid #173b5e;'>
              <div style='font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#657684;'>Submission reference</div>
              <div style='margin-top:5px;color:#173b5e;font-size:23px;font-weight:700;letter-spacing:1px;'>${reference}</div>
            </div>
            <table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='margin-top:24px;border-collapse:collapse;font-size:14px;line-height:1.55;'>${details}</table>
            <p style='margin:24px 0 0;font-size:14px;line-height:1.7;'>Please keep your reference for correspondence with the Association of Publishers in India.</p>
            <p style='margin:16px 0 0;padding:16px 18px;background:#e9eef2;color:#173b5e;font-size:14px;line-height:1.6;'><strong>Nominations close ${awardDates.nominationsClose}.</strong><br>The awards ceremony will be held on ${awardDates.ceremony}.</p>
            <p style='margin:22px 0 0;color:#657684;font-size:12px;line-height:1.6;'>This email confirms receipt only. It does not indicate that the nominee has been shortlisted or selected.</p>
          </td></tr>
          <tr><td style='padding:22px 34px;background:#e3e6e8;color:#526474;font-size:12px;line-height:1.6;'>API Excellence Awards 2026<br>Association of Publishers in India</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  return { html, text };
}

export async function sendNominationConfirmation(
  input: ConfirmationEmailInput,
): Promise<ConfirmationEmailResult> {
  const user = process.env.GMAIL_USER?.trim() || defaultSenderEmail;
  // Google prints app passwords in four spaced blocks; pasting one verbatim is
  // the usual cause of an otherwise unexplained EAUTH.
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/gu, '');

  if (!user || !pass) return { sent: false, reason: 'not_configured' };

  const { html, text } = createEmailContent(input);

  try {
    // Gmail rewrites any From that is not the authenticated account, so the
    // address has to match the SMTP user for SPF and DKIM to stay aligned.
    const receipt = await getTransporter(user, pass).sendMail({
      from: { name: senderName, address: user },
      to: { name: input.recipientName, address: input.recipientEmail },
      replyTo: { name: senderName, address: user },
      subject: 'Nomination received — API Excellence Awards 2026',
      text,
      html,
    });

    return { sent: true, messageId: receipt.messageId };
  } catch (error) {
    const { code, responseCode } = smtpErrorFields(error);

    return {
      sent: false,
      reason: classifyFailure(error),
      diagnostic: {
        errorCode: code ?? responseCode?.toString(),
        errorMessage: cleanDiagnostic(error instanceof Error ? error.message : 'SMTP error'),
      },
    };
  }
}
