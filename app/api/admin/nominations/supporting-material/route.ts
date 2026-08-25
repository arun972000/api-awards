import { NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME, verifyAdminSession } from '@/lib/adminAuth';
import { getAdminNominationClient } from '@/lib/adminNominations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bucket = 'nomination-supporting-materials';
const noStore = { 'Cache-Control': 'private, no-store, max-age=0' };

function safeDownloadName(value: string) {
  return value.replace(/[^a-zA-Z0-9._ -]+/gu, '-').slice(0, 140) || 'supporting-material';
}

export async function GET(request: NextRequest) {
  if (!verifyAdminSession(request.cookies.get(ADMIN_COOKIE_NAME)?.value)) {
    return Response.json({ error: 'Authentication required.' }, { status: 401, headers: noStore });
  }

  const path = request.nextUrl.searchParams.get('path') ?? '';
  const name = request.nextUrl.searchParams.get('name') ?? 'supporting-material';
  if (!/^API26-[A-F0-9]{8}\/[a-zA-Z0-9._-]+$/u.test(path)) {
    return Response.json({ error: 'Invalid supporting-material path.' }, { status: 400, headers: noStore });
  }

  try {
    const { data, error } = await getAdminNominationClient().storage.from(bucket).download(path);
    if (error || !data) {
      return Response.json({ error: 'Supporting material was not found.' }, { status: 404, headers: noStore });
    }

    return new Response(await data.arrayBuffer(), {
      headers: {
        ...noStore,
        'Content-Type': data.type || 'application/octet-stream',
        'Content-Disposition': 'attachment; filename=' + safeDownloadName(name),
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Supporting material download failed', error);
    return Response.json({ error: 'Could not download supporting material.' }, { status: 503, headers: noStore });
  }
}
