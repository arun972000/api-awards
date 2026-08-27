import { awardDates } from '@/lib/awardContent';

const mailjetEndpoint = 'https://api.mailjet.com/v3.1/send';
const defaultSenderEmail = 'apiexcellenceawars2026@gmail.com';
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
  | { sent: false; reason: 'not_configured' | 'provider_error' };

type MailjetResponse = {
  Messages?: Array<{
    Status?: string;
    To?: Array<{ MessageUUID?: string }>;
  }>;
};

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
  const apiKey = process.env.MAILJET_API_KEY?.trim();
  const secretKey = process.env.MAILJET_SECRET_KEY?.trim();
  const fromEmail = process.env.MAILJET_FROM_EMAIL?.trim() || defaultSenderEmail;

  if (!apiKey || !secretKey) return { sent: false, reason: 'not_configured' };

  const { html, text } = createEmailContent(input);

  try {
    const response = await fetch(mailjetEndpoint, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(apiKey + ':' + secretKey).toString('base64'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Messages: [
          {
            From: { Email: fromEmail, Name: senderName },
            To: [{ Email: input.recipientEmail, Name: input.recipientName }],
            ReplyTo: { Email: fromEmail, Name: senderName },
            Subject: 'Nomination received — API Excellence Awards 2026',
            TextPart: text,
            HTMLPart: html,
          },
        ],
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });

    const responseBody = (await response.json().catch(() => null)) as MailjetResponse | null;
    const message = responseBody?.Messages?.[0];
    if (!response.ok || message?.Status !== 'success') {
      return { sent: false, reason: 'provider_error' };
    }

    return { sent: true, messageId: message.To?.[0]?.MessageUUID };
  } catch {
    return { sent: false, reason: 'provider_error' };
  }
}
