import 'server-only';
import ExcelJS from 'exceljs';
import type { SupabaseClient } from '@supabase/supabase-js';
import { categories } from '@/lib/categories';
import type { NominationRecord } from '@/lib/adminNominations';

export type NominationExportField = {
  header: string;
  /** Read from the table row when present, otherwise from the JSON payload. */
  key: string;
  width: number;
  kind?: 'number' | 'timestamp' | 'category' | 'nominationType' | 'fileSize';
};

// Every stored field, in reading order. Shared by the admin CSV download and
// the daily spreadsheet so the two cannot drift apart.
export const nominationExportFields: NominationExportField[] = [
  { header: 'No.', key: 'nominationNumber', width: 7, kind: 'number' },
  { header: 'Submission reference', key: 'submission_reference', width: 22 },
  { header: 'Status', key: 'status', width: 13 },
  { header: 'Submitted at', key: 'created_at', width: 22, kind: 'timestamp' },
  { header: 'Submission date', key: 'submissionDate', width: 15 },
  { header: 'Last updated', key: 'updated_at', width: 22, kind: 'timestamp' },

  { header: 'Award category', key: 'category', width: 30, kind: 'category' },
  { header: 'Nominee kind', key: 'nomineeKind', width: 14 },
  { header: 'Nominee name', key: 'nominee_name', width: 28 },
  { header: 'Nominee organisation', key: 'nominee_organisation', width: 28 },
  { header: 'Initiative / project / contribution title', key: 'entry_title', width: 38 },

  { header: 'Nomination type', key: 'nomination_type', width: 20, kind: 'nominationType' },
  { header: 'Contact person', key: 'contactPerson', width: 24 },
  { header: 'Contact email', key: 'nominee_email', width: 28 },
  { header: 'Contact phone', key: 'contactPhone', width: 15 },
  { header: 'Submitter is the contact', key: 'submitterIsContact', width: 16 },
  { header: 'Person completing the form', key: 'personCompletingForm', width: 24 },
  { header: 'Nominator name', key: 'nominator_name', width: 24 },
  { header: 'Nominator email', key: 'nominator_email', width: 28 },

  { header: 'Brief description (300 words)', key: 'briefDescription', width: 70 },
  { header: 'Impact and outcomes (150 words)', key: 'impactOutcomes', width: 60 },
  { header: 'Why it merits recognition (150 words)', key: 'meritRecognition', width: 60 },

  { header: 'Supporting URL', key: 'supportingUrl', width: 32 },
  { header: 'Supporting file name', key: 'supportingFileName', width: 26 },
  { header: 'Supporting file type', key: 'supportingFileType', width: 22 },
  { header: 'Supporting file size (KB)', key: 'supportingFileSize', width: 16, kind: 'fileSize' },
  { header: 'Supporting file path', key: 'supportingFilePath', width: 34 },

  // Declaration labels match the wording shown on the form.
  { header: 'Under-35 eligibility confirmed', key: 'ageEligibilityConfirmed', width: 16 },
  { header: 'Accurate and complete information', key: 'goodFaithAccurate', width: 16 },
  { header: 'Responsibility for submitted information', key: 'goodFaithResponsibility', width: 16 },
  { header: 'Authority and required permissions', key: 'goodFaithAuthority', width: 16 },
  { header: 'API clarification and verification', key: 'goodFaithClarification', width: 16 },
  { header: 'Disqualification for misrepresentation', key: 'goodFaithDisqualification', width: 16 },
  { header: 'Third-party rights confirmation', key: 'goodFaithIpRights', width: 16 },
  { header: 'India delivery confirmation', key: 'indiaEligibilityConfirmed', width: 16 },
  { header: 'Finalist participation and publicity consent', key: 'publicityConfirmed', width: 16 },
  { header: 'Terms and Conditions acceptance', key: 'termsAccepted', width: 16 },

  { header: 'Internal notes', key: 'internal_notes', width: 40 },
  { header: 'Reviewed by', key: 'reviewed_by', width: 20 },
  { header: 'Reviewed at', key: 'reviewed_at', width: 22, kind: 'timestamp' },
];

function supportingMaterial(row: NominationRecord) {
  const material = row.payload?.supportingMaterial;
  return material && typeof material === 'object'
    ? (material as Record<string, unknown>)
    : null;
}

export function valueFor(row: NominationRecord, key: string) {
  switch (key) {
    case 'supportingFileName':
      return supportingMaterial(row)?.fileName;
    case 'supportingFilePath':
      return supportingMaterial(row)?.path;
    case 'supportingFileType':
      return supportingMaterial(row)?.mimeType;
    case 'supportingFileSize':
      return supportingMaterial(row)?.size;
    default:
      if (key in row) return row[key as keyof NominationRecord];
      return row.payload?.[key];
  }
}

function categoryName(id: string) {
  return categories.find((category) => category.id === id)?.name ?? id;
}

const timestampFormatter = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  dateStyle: 'medium',
  timeStyle: 'short',
});

function formatTimestamp(value: unknown) {
  if (typeof value !== 'string' || !value) return '';
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? String(value) : timestampFormatter.format(parsed) + ' IST';
}

/** One cell, resolved and formatted. Used by both export formats. */
export function exportCellValue(
  row: NominationRecord,
  field: NominationExportField,
  nominationNumber: number,
): string {
  if (field.kind === 'number') return String(nominationNumber);

  const value = valueFor(row, field.key);

  switch (field.kind) {
    case 'timestamp':
      return formatTimestamp(value);
    case 'category':
      return categoryName(String(value ?? ''));
    case 'nominationType':
      return value === 'self' ? 'Self-nomination' : value === 'other' ? 'On behalf of another' : '';
    case 'fileSize':
      return typeof value === 'number' ? String(Math.round(value / 1024)) : '';
    default:
      if (value == null) return '';
      if (typeof value === 'boolean') return value ? 'Yes' : 'No';
      return String(value);
  }
}

/**
 * Rows arrive newest first, so the oldest nomination is number 1 and the
 * numbering matches what the admin alert quoted when it arrived.
 */
export function nominationNumberFor(index: number, total: number) {
  return total - index;
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
  detailSheet.columns = nominationExportFields.map((field) => ({
    header: field.header,
    key: field.key,
    width: field.width,
  }));

  nominations.forEach((row, index) => {
    const number = nominationNumberFor(index, nominations.length);
    detailSheet.addRow(
      Object.fromEntries(
        nominationExportFields.map((field) => [field.key, exportCellValue(row, field, number)]),
      ),
    );
  });

  for (const sheet of [summarySheet, detailSheet]) {
    sheet.getRow(1).font = { bold: true };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
  }
  // Keep the long nomination answers inside their cell rather than letting them
  // stretch the row, and pin the reference column while scrolling sideways.
  detailSheet.getRow(1).alignment = { vertical: 'middle', wrapText: true };
  detailSheet.views = [{ state: 'frozen', xSplit: 2, ySplit: 1 }];
  detailSheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: nominationExportFields.length },
  };
  for (const key of ['briefDescription', 'impactOutcomes', 'meritRecognition', 'internal_notes']) {
    detailSheet.getColumn(key).alignment = { vertical: 'top', wrapText: true };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return { buffer: Buffer.from(buffer), summary };
}
