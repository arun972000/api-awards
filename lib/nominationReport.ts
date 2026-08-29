import 'server-only';
import ExcelJS from 'exceljs';
import type { SupabaseClient } from '@supabase/supabase-js';
import { categories } from '@/lib/categories';
import type { NominationRecord } from '@/lib/adminNominations';

// Shared by the admin CSV download and the daily spreadsheet so the two never
// drift apart. Keys are read from the row first, then from the JSON payload.
export const nominationExportFields = [
  ['Submission reference', 'submission_reference', 22],
  ['Submitted at', 'created_at', 22],
  ['Status', 'status', 14],
  ['Category', 'category', 26],
  ['Nominee kind', 'nomineeKind', 14],
  ['Nominee name', 'nominee_name', 28],
  ['Initiative / project / contribution title', 'entry_title', 38],
  ['Contact person', 'contactPerson', 24],
  ['Contact email', 'nominee_email', 28],
  ['Contact phone', 'contactPhone', 16],
  ['Brief description', 'briefDescription', 60],
  ['Impact / outcomes', 'impactOutcomes', 60],
  ['Why it merits recognition', 'meritRecognition', 60],
  ['Supporting URL', 'supportingUrl', 32],
  ['Supporting file name', 'supportingFileName', 28],
  ['Supporting file path', 'supportingFilePath', 32],
  ['Under-35 eligibility confirmed', 'ageEligibilityConfirmed', 18],
  ['India delivery confirmed', 'indiaEligibilityConfirmed', 18],
  ['Person completing the form', 'personCompletingForm', 24],
  ['Submission date', 'submissionDate', 16],
  ['Finalist publicity consent', 'publicityConfirmed', 18],
  ['Terms accepted', 'termsAccepted', 14],
] as const;

export function valueFor(row: NominationRecord, key: string) {
  if (key === 'supportingFileName' || key === 'supportingFilePath') {
    const material =
      row.payload?.supportingMaterial && typeof row.payload.supportingMaterial === 'object'
        ? (row.payload.supportingMaterial as Record<string, unknown>)
        : null;
    return key === 'supportingFileName' ? material?.fileName : material?.path;
  }
  if (key in row) return row[key as keyof NominationRecord];
  return row.payload?.[key];
}

export async function fetchAllNominations(client: SupabaseClient) {
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

  return nominations;
}

function categoryName(id: string) {
  return categories.find((category) => category.id === id)?.name ?? id;
}

function cellText(value: unknown) {
  if (value == null) return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

export type NominationSummary = {
  total: number;
  addedInLastDay: number;
  byCategory: Array<{ name: string; count: number }>;
  byStatus: Array<{ name: string; count: number }>;
};

export function summariseNominations(nominations: NominationRecord[]): NominationSummary {
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;

  const tally = (values: string[]) => {
    const counts = new Map<string, number>();
    for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  return {
    total: nominations.length,
    addedInLastDay: nominations.filter((row) => Date.parse(row.created_at) >= dayAgo).length,
    byCategory: tally(nominations.map((row) => categoryName(row.category))),
    byStatus: tally(nominations.map((row) => row.status)),
  };
}

export async function buildNominationWorkbook(nominations: NominationRecord[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'API Excellence Awards 2026';
  workbook.created = new Date();

  const summary = summariseNominations(nominations);
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Measure', key: 'measure', width: 46 },
    { header: 'Count', key: 'count', width: 12 },
  ];
  summarySheet.addRows([
    { measure: 'Total nominations', count: summary.total },
    { measure: 'Received in the last 24 hours', count: summary.addedInLastDay },
  ]);
  summarySheet.addRow({});
  summarySheet.addRow({ measure: 'By award category' });
  summarySheet.addRows(
    summary.byCategory.map((entry) => ({ measure: entry.name, count: entry.count })),
  );
  summarySheet.addRow({});
  summarySheet.addRow({ measure: 'By status' });
  summarySheet.addRows(
    summary.byStatus.map((entry) => ({ measure: entry.name, count: entry.count })),
  );

  const detailSheet = workbook.addWorksheet('Nominations');
  detailSheet.columns = nominationExportFields.map(([header, key, width]) => ({
    header,
    key,
    width,
  }));

  for (const row of nominations) {
    detailSheet.addRow(
      Object.fromEntries(
        nominationExportFields.map(([, key]) => {
          const value = key === 'category' ? categoryName(row.category) : valueFor(row, key);
          return [key, cellText(value)];
        }),
      ),
    );
  }

  for (const sheet of [summarySheet, detailSheet]) {
    sheet.getRow(1).font = { bold: true };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
  }
  // Long nomination answers stay in one cell rather than stretching the column.
  detailSheet.getRow(1).alignment = { vertical: 'middle', wrapText: true };
  detailSheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: nominationExportFields.length },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  return { buffer: Buffer.from(buffer), summary };
}
