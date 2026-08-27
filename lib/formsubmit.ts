import { awardDates } from '@/lib/awardContent';
import { getSiteUrl } from '@/lib/site';

const formsubmitEndpoint = 'https://formsubmit.co/ajax/';
const defaultTarget = 'apiexcellenceawards2026@gmail.com';
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
      reason:
        | 'not_configured'
        | 'not_activated'
        | 'origin_rejected'
        | 'blocked'
        | 'rate_limited'
        | 'provider_error';
      diagnostic?: {
        httpStatus?: number;
        errorMessage?: string;
      };
    };

type FormsubmitResponse = {
  success?: boolean | string;
  message?: string;
};

function cleanDiagnostic(value: string | undefined) {
  return value?.replace(/\s+/gu, ' ').trim().slice(0, 240);
}

// FormSubmit answers 200 for both accepted and rejected submissions, so the
// JSON body is the only reliable signal.
function classifyFailure(httpStatus: number, message: string | undefined) {
  const reason = message?.toLocaleLowerCase() ?? '';

  if (/activat/u.test(reason)) return 'not_activated' as const;
  if (/web server|html file/u.test(reason)) return 'origin_rejected' as const;
  if (httpStatus === 429 || /rate limit|too many/u.test(reason)) return 'rate_limited' as const;
  if (/blacklist|spam|blocked/u.test(reason)) return 'blocked' as const;

  return 'provider_error' as const;
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
  return [
    `Dear ${input.recipientName},`,
    '',
    'Thank you for submitting a nomination for the API Excellence Awards 2026.',
    '',
    'Please keep the submission reference for any correspondence with the Association of Publishers in India.',
    `Nominations close on ${awardDates.nominationsClose}. The awards ceremony will be held on ${awardDates.ceremony}.`,
    '',
    'This email confirms receipt only. It does not indicate that the nominee has been shortlisted or selected.',
    '',
    'Regards,',
    senderName,
    'Association of Publishers in India',
  ].join('\n');
}

export async function sendNominationConfirmation(
  input: ConfirmationEmailInput,
): Promise<ConfirmationEmailResult> {
  // Either the awards mailbox itself or the random alias FormSubmit issues once
  // the address is activated.
  const target = process.env.FORMSUBMIT_TARGET?.trim() || defaultTarget;

  if (!target) return { sent: false, reason: 'not_configured' };

  const submissionDate = formatSubmissionDate(input.submissionDate);
  const { origin } = getSiteUrl();

  try {
    const response = await fetch(formsubmitEndpoint + encodeURIComponent(target), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // FormSubmit rejects submissions that arrive without a browser-like
        // origin, so server-side calls have to supply one.
        Origin: origin,
        Referer: origin + '/',
      },
      body: JSON.stringify({
        _subject: `Nomination received — ${senderName} (${input.reference})`,
        _template: 'table',
        _captcha: 'false',
        // FormSubmit always delivers to the activated mailbox; the copy is what
        // reaches the person who submitted the nomination.
        _cc: input.recipientEmail,
        name: input.recipientName,
        email: input.recipientEmail,
        'Submission reference': input.reference,
        Nominee: input.nomineeName,
        'Award category': input.categoryName,
        Entry: input.entryTitle,
        Submitted: submissionDate,
        'Submitted by': input.recipientName,
        Message: createEmailContent(input),
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });

    const responseBody = (await response.json().catch(() => null)) as FormsubmitResponse | null;
    const succeeded =
      responseBody?.success === true || responseBody?.success === 'true';

    if (!response.ok || !succeeded) {
      return {
        sent: false,
        reason: classifyFailure(response.status, responseBody?.message),
        diagnostic: {
          httpStatus: response.status,
          errorMessage: cleanDiagnostic(responseBody?.message),
        },
      };
    }

    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      reason: 'provider_error',
      diagnostic: {
        errorMessage: cleanDiagnostic(error instanceof Error ? error.message : 'Network error'),
      },
    };
  }
}
