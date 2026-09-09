import { NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME, verifyAdminSession } from '@/lib/adminAuth';
import { getAdminNominationClient } from '@/lib/adminNominations';
import { istDateStamp } from '@/lib/cronAuth';
import {
  buildNominationWorkbook,
  exportCellValue,
  fetchAllNominations,
  nominationExportFields,
  nominationNumberFor,
} from '@/lib/nominationReport';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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

  // CSV stays the default so existing links keep working.
  const wantsWorkbook = request.nextUrl.searchParams.get('format') === 'xlsx';

  try {
    const nominations = await fetchAllNominations(getAdminNominationClient());
    // Stamped in IST: the deadline and the daily report are both quoted in it.
    const date = istDateStamp();

    if (wantsWorkbook) {
      // Same builder the daily emailed report uses, so the file the client is
      // handed is identical to the one staff already receive each morning.
      const { buffer } = await buildNominationWorkbook(nominations);

      return new Response(new Uint8Array(buffer), {
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition':
            'attachment; filename=api-awards-nominations-' + date + '.xlsx',
          'Cache-Control': 'private, no-store, max-age=0',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    const lines = [
      nominationExportFields.map((field) => csvCell(field.header)).join(','),
      ...nominations.map((row, index) => {
        const number = nominationNumberFor(index, nominations.length);
        return nominationExportFields
          .map((field) => csvCell(exportCellValue(row, field, number)))
          .join(',');
      }),
    ];

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
