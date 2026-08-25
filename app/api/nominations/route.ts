import { NextResponse } from 'next/server';
import { nominationSchema } from '@/lib/validation';
import { getSupabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

const bucket = 'nomination-supporting-materials';
const maxRequestBytes = 4_600_000;
const maxFileBytes = 4 * 1024 * 1024;
const allowedFileTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
]);

function safeFileName(name: string) {
  const cleaned = name.normalize('NFKC').replace(/[^a-zA-Z0-9._-]+/gu, '-');
  return cleaned.replace(/^-+|-+$/gu, '').slice(0, 120) || 'supporting-material';
}

async function requestPayload(request: Request) {
  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const rawNomination = formData.get('nomination');
    if (typeof rawNomination !== 'string') throw new Error('INVALID_NOMINATION');
    return {
      body: JSON.parse(rawNomination) as unknown,
      file: formData.get('supportingFile'),
    };
  }

  return { body: await request.json() as unknown, file: null };
}

export async function POST(request: Request) {
  let uploadedPath: string | null = null;

  try {
    const contentLength = Number(request.headers.get('content-length') ?? 0);
    if (contentLength > maxRequestBytes) {
      return NextResponse.json({ error: 'Submission is too large.' }, { status: 413 });
    }

    const { body, file } = await requestPayload(request);
    const parsed = nominationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Please review the highlighted information and try again.',
          fields: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    if (parsed.data.websiteConfirm) {
      return NextResponse.json({ ok: true, reference: 'API26-RECEIVED' });
    }

    const supportingFile = file instanceof File && file.size > 0 ? file : null;
    if (supportingFile && parsed.data.supportingUrl) {
      return NextResponse.json(
        { error: 'Choose either one supporting URL or one file, not both.' },
        { status: 400 },
      );
    }
    if (
      supportingFile &&
      (!allowedFileTypes.has(supportingFile.type) || supportingFile.size > maxFileBytes)
    ) {
      return NextResponse.json(
        { error: 'Supporting files must be PDF, Word, JPG or PNG and no larger than 4 MB.' },
        { status: 400 },
      );
    }

    const reference = 'API26-' + crypto.randomUUID().slice(0, 8).toUpperCase();
    const client = getSupabaseAdmin();
    let supportingMaterial: Record<string, unknown> | null = null;

    if (supportingFile) {
      const storedName = crypto.randomUUID() + '-' + safeFileName(supportingFile.name);
      uploadedPath = reference + '/' + storedName;
      const bytes = await supportingFile.arrayBuffer();
      const { error: uploadError } = await client.storage
        .from(bucket)
        .upload(uploadedPath, bytes, {
          contentType: supportingFile.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Supporting material upload failed', uploadError.message);
        return NextResponse.json(
          { error: 'We could not upload the supporting file. Please try again shortly.' },
          { status: 503 },
        );
      }

      supportingMaterial = {
        bucket,
        path: uploadedPath,
        fileName: supportingFile.name,
        mimeType: supportingFile.type,
        size: supportingFile.size,
      };
    }

    const { websiteConfirm: _honeypot, ...submission } = parsed.data;
    void _honeypot;
    const payload = {
      ...submission,
      submissionDate: new Date().toISOString().slice(0, 10),
      supportingMaterial,
    };
    const nominationType =
      submission.personCompletingForm.toLocaleLowerCase() ===
      submission.contactPerson.toLocaleLowerCase()
        ? 'self'
        : 'other';

    const { error } = await client.from('award_nominations').insert({
      submission_reference: reference,
      category: submission.category,
      nomination_type: nominationType,
      nominee_name: submission.nomineeName,
      nominee_organisation: submission.nomineeName,
      nominee_email: submission.contactEmail,
      nominator_name: submission.personCompletingForm,
      nominator_email: submission.contactEmail,
      entry_title: submission.entryTitle,
      payload,
    });

    if (error) {
      if (uploadedPath) await client.storage.from(bucket).remove([uploadedPath]);
      console.error('Nomination insert failed', error.code, error.message);
      return NextResponse.json(
        { error: 'We could not save the nomination. Please try again shortly.' },
        { status: 503 },
      );
    }

    return NextResponse.json({ ok: true, reference }, { status: 201 });
  } catch (error) {
    if (uploadedPath) {
      try {
        await getSupabaseAdmin().storage.from(bucket).remove([uploadedPath]);
      } catch {
        // Best-effort cleanup only.
      }
    }
    console.error('Nomination request failed', error);
    return NextResponse.json(
      { error: 'We could not process the nomination. Please check the form and try again.' },
      { status: 400 },
    );
  }
}
