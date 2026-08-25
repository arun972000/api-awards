import { NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME, verifyAdminSession } from '@/lib/adminAuth';
import { getAdminNominationClient, type NominationRecord } from '@/lib/adminNominations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const exportFields = [
  ['Submission reference', 'submission_reference'],
  ['Submitted at', 'created_at'],
  ['Status', 'status'],
  ['Category', 'category'],
  ['Nominee kind', 'nomineeKind'],
  ['Nominee name', 'nominee_name'],
  ['Initiative / project / contribution title', 'entry_title'],
  ['Contact person', 'contactPerson'],
  ['Contact email', 'nominee_email'],
  ['Contact phone', 'contactPhone'],
  ['Brief description', 'briefDescription'],
  ['Impact / outcomes', 'impactOutcomes'],
  ['Why it merits recognition', 'meritRecognition'],
  ['Supporting URL', 'supportingUrl'],
  ['Supporting file name', 'supportingFileName'],
  ['Supporting file path', 'supportingFilePath'],
  ['Under-35 eligibility confirmed', 'ageEligibilityConfirmed'],
  ['India delivery confirmed', 'indiaEligibilityConfirmed'],
  ['Person completing the form', 'personCompletingForm'],
  ['Submission date', 'submissionDate'],
  ['Finalist publicity consent', 'publicityConfirmed'],
  ['Terms accepted', 'termsAccepted'],
] as const;

function valueFor(row: NominationRecord, key: string) {
  if (key === 'supportingFileName' || key === 'supportingFilePath') {
    const material =
      row.payload?.supportingMaterial && typeof row.payload.supportingMaterial === 'object'
        ? row.payload.supportingMaterial as Record<string, unknown>
        : null;
    return key === 'supportingFileName' ? material?.fileName : material?.path;
  }
  if (key in row) return row[key as keyof NominationRecord];
  return row.payload?.[key];
}

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
    const client = getAdminNominationClient();
    const nominations: NominationRecord[] = [];
    const pageSize = 1000;

    for (let offset = 0; offset < 25_000; offset += pageSize) {
      const { data, error } = await client
        .from('award_nominations')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) throw error;
      const page = (data ?? []) as NominationRecord[];
      nominations.push(...page);
      if (page.length < pageSize) break;
    }

    const lines = [
      exportFields.map(([label]) => csvCell(label)).join(','),
      ...nominations.map((row) =>
        exportFields.map(([, key]) => csvCell(valueFor(row, key))).join(','),
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
