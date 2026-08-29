import { getAdminNominationClient } from '@/lib/adminNominations';
import { isAuthorisedCronRequest, istDateStamp, istReadableDate, unauthorisedResponse } from '@/lib/cronAuth';
import { sendDailyNominationReport } from '@/lib/email';
import { buildNominationWorkbook, fetchAllNominations } from '@/lib/nominationReport';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!isAuthorisedCronRequest(request)) return unauthorisedResponse();

  try {
    const nominations = await fetchAllNominations(getAdminNominationClient());
    const { buffer, summary } = await buildNominationWorkbook(nominations);
    const fileName = `api-awards-nominations-${istDateStamp()}.xlsx`;

    const report = await sendDailyNominationReport({
      workbook: buffer,
      fileName,
      summary,
      reportDate: istReadableDate(),
    });

    if (!report.sent) {
      console.error('Daily nomination report was not sent', {
        reason: report.reason,
        ...report.diagnostic,
      });
      return Response.json(
        { ok: false, stage: 'email', reason: report.reason },
        { status: 502, headers: { 'Cache-Control': 'private, no-store' } },
      );
    }

    return Response.json(
      {
        ok: true,
        total: summary.total,
        addedInLastDay: summary.addedInLastDay,
        recipients: report.recipients,
        fileName,
      },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    console.error('Daily nomination report failed', error);
    return Response.json(
      { ok: false, stage: 'report', error: 'Could not build the nomination report.' },
      { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
    );
  }
}
