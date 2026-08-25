import { z } from 'zod';
import { categoryIds } from '@/lib/categories';

const optionalUrl = z.string().trim().url().max(500).optional().or(z.literal(''));
const optionalPhone = z.string().trim().max(30).optional().or(z.literal(''));

export function countWords(value: string) {
  const normalized = value.trim();
  return normalized ? normalized.split(/\s+/u).length : 0;
}

function requiredWordLimitedText(label: string, maxWords: number, maxCharacters: number) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(maxCharacters)
    .refine((value) => countWords(value) <= maxWords, {
      message: `${label} must be ${maxWords} words or fewer.`,
    });
}

export const nominationSchema = z
  .object({
    category: z.enum(categoryIds),
    nomineeKind: z.enum(['individual', 'organisation', 'team']),
    nomineeName: z.string().trim().min(2).max(180),
    entryTitle: z.string().trim().min(5).max(220),
    contactPerson: z.string().trim().min(2).max(160),
    contactEmail: z.string().trim().email().max(200),
    contactPhone: optionalPhone,
    briefDescription: requiredWordLimitedText('Brief description', 300, 3_500),
    impactOutcomes: requiredWordLimitedText('Impact and outcomes', 150, 2_000),
    meritRecognition: requiredWordLimitedText('Reason for recognition', 150, 2_000),
    supportingUrl: optionalUrl,
    ageEligibilityConfirmed: z.boolean().default(false),
    submitterIsContact: z.boolean().default(true),
    personCompletingForm: z.string().trim().max(160),
    goodFaithAccurate: z.literal(true),
    goodFaithResponsibility: z.literal(true),
    goodFaithAuthority: z.literal(true),
    goodFaithClarification: z.literal(true),
    goodFaithDisqualification: z.literal(true),
    goodFaithIpRights: z.literal(true),
    indiaEligibilityConfirmed: z.literal(true),
    publicityConfirmed: z.literal(true),
    termsAccepted: z.literal(true),
    websiteConfirm: z.string().max(0).optional().or(z.literal('')),
  })
  .superRefine((data, context) => {
    if (data.category === 'young_professional' && !data.ageEligibilityConfirmed) {
      context.addIssue({
        code: 'custom',
        path: ['ageEligibilityConfirmed'],
        message: 'Confirm the nominee will be under 35 on the submission deadline.',
      });
    }

    if (!data.submitterIsContact && data.personCompletingForm.length < 2) {
      context.addIssue({
        code: 'custom',
        path: ['personCompletingForm'],
        message: 'Enter the name of the person completing this form.',
      });
    }
  })
  .transform((data) => ({
    ...data,
    personCompletingForm: data.submitterIsContact
      ? data.contactPerson
      : data.personCompletingForm,
  }));

export type NominationInput = z.input<typeof nominationSchema>;
export type Nomination = z.output<typeof nominationSchema>;
