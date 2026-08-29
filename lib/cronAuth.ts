import { timingSafeEqual } from 'node:crypto';

/**
 * Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` whenever the project
 * defines that variable. The same header lets the endpoints be triggered by
 * hand for testing.
 */
export function isAuthorisedCronRequest(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const offered = request.headers.get('authorization')?.replace(/^Bearer\s+/iu, '') ?? '';
  const expected = Buffer.from(secret);
  const received = Buffer.from(offered);

  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function unauthorisedResponse() {
  return Response.json(
    { error: 'Unauthorized.' },
    { status: 401, headers: { 'Cache-Control': 'private, no-store' } },
  );
}

/** Report dates follow the awards' own timezone, not the server's. */
export function istDateStamp(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function istReadableDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function istTimestamp(date = new Date()) {
  return (
    new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date) + ' IST'
  );
}
