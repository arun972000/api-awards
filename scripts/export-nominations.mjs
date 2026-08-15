import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Load them into your shell before exporting.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase
  .from("award_nominations")
  .select("*")
  .order("created_at", { ascending: true });

if (error) {
  console.error(`Export failed: ${error.message}`);
  process.exit(1);
}

const rows = (data ?? []).map((row) => ({
  submission_reference: row.submission_reference,
  submitted_at: row.created_at,
  status: row.status,
  category: row.category,
  nomination_type: row.nomination_type,
  nominee_name: row.nominee_name,
  nominee_organisation: row.nominee_organisation,
  nominee_role: row.payload?.nomineeRole ?? "",
  nominee_email: row.nominee_email,
  nominee_phone: row.payload?.nomineePhone ?? "",
  nominee_city: row.payload?.nomineeCity ?? "",
  nominee_website: row.payload?.nomineeWebsite ?? "",
  publication_title: row.payload?.publicationTitle ?? "",
  isbn_or_identifier: row.payload?.isbnOrIdentifier ?? "",
  entry_title: row.entry_title,
  impact_summary: row.payload?.impactSummary ?? "",
  case_for_recognition: row.payload?.caseForRecognition ?? "",
  measurable_outcomes: row.payload?.measurableOutcomes ?? "",
  category_evidence: row.payload?.categoryEvidence ?? "",
  work_period: row.payload?.workPeriod ?? "",
  supporting_links: row.payload?.supportingLinks ?? "",
  birth_year: row.payload?.birthYear ?? "",
  under_35_confirmed: row.payload?.ageEligibilityConfirmed ?? false,
  nominator_name: row.nominator_name,
  nominator_organisation: row.payload?.nominatorOrganisation ?? "",
  nominator_role: row.payload?.nominatorRole ?? "",
  nominator_email: row.nominator_email,
  nominator_phone: row.payload?.nominatorPhone ?? "",
  relationship_to_nominee: row.payload?.relationshipToNominee ?? "",
  conflict_disclosure: row.payload?.conflictDisclosure ?? "",
}));

function csvCell(value) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

const headers = rows.length ? Object.keys(rows[0]) : ["submission_reference"];
const csv = [
  headers.map(csvCell).join(","),
  ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(",")),
].join("\n");

const exportDirectory = path.resolve(process.env.EXPORT_DIRECTORY ?? "exports");
await mkdir(exportDirectory, { recursive: true });
const date = new Date().toISOString().slice(0, 10);
const outputPath = path.join(exportDirectory, `api-award-nominations-${date}.csv`);
await writeFile(outputPath, `\uFEFF${csv}`, "utf8");

console.log(`Exported ${rows.length} nomination(s) to ${outputPath}`);
