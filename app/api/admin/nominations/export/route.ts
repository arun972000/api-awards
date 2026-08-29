import { NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME, verifyAdminSession } from '@/lib/adminAuth';
import { getAdminNominationClient } from '@/lib/adminNominations';
import { fetchAllNominations, nominationExportFields, valueFor } from '@/lib/nominationReport';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function csvCell(value: unknown) {
  const text = value == null ? '' : String(value);
  const spreadsheetSafe = /^[=+@-]/u.test(text) ? "'" + text : text;
  return '"' + spreadsheetSafe.replaceAll('"', '""') + '"';
}

export async function GET(request: NextRequest) {
  if (!verifyAdminSession(request.cookies.get(ADMIN_COOKIE_NAME)?.value)) {
    return Response.json(
      { error: 'Authentication required.' },
      { status: 401, headers: { 'Cache-Control': 'private, no-store' } },
    );
  }

  try {
    const nominations = await fetchAllNominations(getAdminNominationClient());

    const lines = [
      nominationExportFields.map(([label]) => csvCell(label)).join(','),
      ...nominations.map((row) =>
        nominationExportFields.map(([, key]) => csvCell(valueFor(row, key))).join(','),
      ),
    ];
    const date = new Date().toISOString().slice(0, 10);

    return new Response('\uFEFF' + lines.join('\r\n'), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename=api-awards-nominations-' + date + '.csv',
        'Cache-Control': 'private, no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Nomination export failed', error);
    return Response.json(
      { error: 'Could not export nominations.' },
      { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
    );
  }
}
