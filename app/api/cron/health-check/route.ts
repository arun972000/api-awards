import { getAdminNominationClient } from '@/lib/adminNominations';
import { isAuthorisedCronRequest, istTimestamp, unauthorisedResponse } from '@/lib/cronAuth';
import { sendHealthCheckAlert } from '@/lib/email';
import { nominationSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// A complete, valid submission. It is never stored and never emailed: it only
// proves the validation rules and the database write path still work.
const probeSubmission = {
  category: 'publishing_innovation',
  nomineeKind: 'organisation',
  nomineeName: 'Automated health check',
  entryTitle: 'Automated daily health check probe',
  contactPerson: 'Automated health check',
  contactEmail: 'healthcheck@example.invalid',
  contactPhone: '',
  briefDescription: 'Automated probe confirming the nomination pipeline accepts a submission.',
  impactOutcomes: 'Automated probe confirming the impact field validates.',
  meritRecognition: 'Automated probe confirming the merit field validates.',
  supportingUrl: '',
  ageEligibilityConfirmed: false,
  submitterIsContact: true,
  personCompletingForm: 'Automated health check',
  goodFaithAccurate: true,
  goodFaithResponsibility: true,
  goodFaithAuthority: true,
  goodFaithClarification: true,
  goodFaithDisqualification: true,
  goodFaithIpRights: true,
  indiaEligibilityConfirmed: true,
  publicityConfirmed: true,
  termsAccepted: true,
  websiteConfirm: '',
};

async function runCheck() {
  const parsed = nominationSchema.safeParse(probeSubmission);
  if (!parsed.success) {
    const fields = Object.keys(parsed.error.flatten().fieldErrors).join(', ');
    return { stage: 'validation', detail: `The nomination schema rejected the probe: ${fields}.` };
  }

  const client = getAdminNominationClient();

  // Writes one nomination row inside a subtransaction and rolls it back.
  const { error: writeError } = await client.rpc('health_check_nomination_write');
  if (writeError) {
    return {
      stage: 'database write',
      detail: `${writeError.message}${writeError.code ? ` (${writeError.code})` : ''}`,
    };
  }

  // The rollback should leave nothing behind. If a probe row is ever found, the
  // check itself is polluting the register and must be fixed.
  const { count, error: readError } = await client
    .from('award_nominations')
    .select('id', { count: 'exact', head: true })
    .eq('payload->>healthCheck', 'true');

  if (readError) {
    return { stage: 'database read', detail: readError.message };
  }
  if ((count ?? 0) > 0) {
    return {
      stage: 'isolation',
      detail: `${count} health check row(s) were left in the register; the rollback is not working.`,
    };
  }

  return null;
}

export async function GET(request: Request) {
  if (!isAuthorisedCronRequest(request)) return unauthorisedResponse();

  const checkedAt = istTimestamp();

  try {
    const failure = await runCheck();

    if (!failure) {
      // A healthy run is deliberately silent; only failures reach the admins.
      return Response.json(
        { ok: true, checkedAt },
        { headers: { 'Cache-Control': 'private, no-store' } },
      );
    }

    console.error('Nomination health check failed', failure);
    const alert = await sendHealthCheckAlert({ ...failure, checkedAt });
    if (!alert.sent) {
      console.error('Health check alert could not be delivered', {
        reason: alert.reason,
        ...alert.diagnostic,
      });
    }

    return Response.json(
      { ok: false, ...failure, alerted: alert.sent, checkedAt },
      { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown error.';
    console.error('Nomination health check errored', error);
    const alert = await sendHealthCheckAlert({ stage: 'unexpected error', detail, checkedAt });

    return Response.json(
      { ok: false, stage: 'unexpected error', detail, alerted: alert.sent, checkedAt },
      { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
    );
  }
}
