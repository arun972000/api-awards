import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "@/lib/adminAuth";
import { getAdminNominationClient, type NominationRecord } from "@/lib/adminNominations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "private, no-store, max-age=0" };

export async function GET(request: NextRequest) {
  if (!verifyAdminSession(request.cookies.get(ADMIN_COOKIE_NAME)?.value)) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401, headers });
  }

  const requestedLimit = Number(request.nextUrl.searchParams.get("limit") ?? 100);
  const limit = Number.isInteger(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 20), 100)
    : 100;
  const cursor = request.nextUrl.searchParams.get("cursor");

  if (cursor && Number.isNaN(Date.parse(cursor))) {
    return NextResponse.json({ error: "Invalid pagination cursor." }, { status: 400, headers });
  }

  try {
    let query = getAdminNominationClient()
      .from("award_nominations")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(limit + 1);

    if (cursor) query = query.lt("created_at", cursor);

    const { data, error, count } = await query;

    if (error) {
      console.error("Admin nominations query failed", error.code, error.message);
      return NextResponse.json(
        { error: "Could not load nominations." },
        { status: 503, headers },
      );
    }

    const rows = (data ?? []) as NominationRecord[];
    const hasMore = rows.length > limit;
    const nominations = hasMore ? rows.slice(0, limit) : rows;

    return NextResponse.json(
      {
        nominations,
        total: count ?? nominations.length,
        nextCursor: hasMore ? nominations.at(-1)?.created_at ?? null : null,
      },
      { headers },
    );
  } catch (error) {
    console.error("Admin nominations request failed", error);
    return NextResponse.json(
      { error: "The nominations database is not configured." },
      { status: 503, headers },
    );
  }
}
