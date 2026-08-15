import { NextResponse } from "next/server";
import { nominationSchema } from "@/lib/validation";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > 75_000) {
      return NextResponse.json({ error: "Submission is too large." }, { status: 413 });
    }

    const body: unknown = await request.json();
    const parsed = nominationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Please review the highlighted information and try again.",
          fields: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    if (parsed.data.websiteConfirm) {
      return NextResponse.json({ ok: true, reference: "API26-RECEIVED" });
    }

    const reference = `API26-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const { websiteConfirm: _honeypot, ...submission } = parsed.data;
    void _honeypot;

    const { error } = await getSupabaseAdmin().from("award_nominations").insert({
      submission_reference: reference,
      category: submission.category,
      nomination_type: submission.nominationType,
      nominee_name: submission.nomineeName,
      nominee_organisation: submission.nomineeOrganisation,
      nominee_email: submission.nomineeEmail,
      nominator_name: submission.nominatorName,
      nominator_email: submission.nominatorEmail,
      entry_title: submission.entryTitle,
      payload: submission,
    });

    if (error) {
      console.error("Nomination insert failed", error.code, error.message);
      return NextResponse.json(
        { error: "We could not save the nomination. Please try again shortly." },
        { status: 503 },
      );
    }

    return NextResponse.json({ ok: true, reference }, { status: 201 });
  } catch (error) {
    console.error("Nomination request failed", error);
    return NextResponse.json(
      { error: "The nomination service is not configured yet. Please contact API." },
      { status: 503 },
    );
  }
}
