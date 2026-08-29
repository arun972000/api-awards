import { z } from 'zod';
import { awardDates } from '@/lib/awardContent';
import { categoryIds } from '@/lib/categories';
import {
  defaultPhoneCountry,
  findPhoneCountry,
  isSupportedPhoneCountry,
  isValidNationalNumber,
  toInternationalNumber,
} from '@/lib/phone';

// Nominators are not technical. Every rule carries its own wording so Zod's
// developer-facing defaults ("Invalid input: expected true") never reach them.
const optionalUrl = z
  .string()
  .trim()
  .url('Enter a full web address, including https://')
  .max(500, 'That web address is too long. Please use a shorter link.')
  .optional()
  .or(z.literal(''));

// Nominators are not all in India, so the number is held as national digits
// plus a country, and checked against that country's own rules.
const optionalPhoneDigits = z
  .string()
  .trim()
  .max(15, 'That phone number is too long.')
  .refine((value) => value === '' || /^\d+$/u.test(value), {
    error: 'Enter the phone number using numbers only.',
  })
  .optional()
  .or(z.literal(''));

const phoneCountry = z
  .string()
  .trim()
  .refine(isSupportedPhoneCountry, { error: 'Choose a country dialling code.' })
  .default(defaultPhoneCountry);

/** Every good-faith style tick box, worded as an instruction rather than a rule. */
function requiredConfirmation(instruction: string) {
  return z.literal(true, { error: instruction });
}

export function countWords(value: string) {
  const normalized = value.trim();
  return normalized ? normalized.split(/\s+/u).length : 0;
}

function requiredWordLimitedText(label: string, maxWords: number, maxCharacters: number) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(maxCharacters, `${label} is too long. Please shorten it.`)
    .refine((value) => countWords(value) <= maxWords, {
      error: `${label} must be ${maxWords} words or fewer.`,
    });
}

export const nominationSchema = z
  .object({
    category: z.enum(categoryIds, { error: 'Choose an award category.' }),
    nomineeKind: z.enum(['individual', 'organisation', 'team'], {
      error: 'Choose whether the nominee is an individual, an organisation or a team.',
    }),
    nomineeName: z
      .string()
      .trim()
      .min(2, 'Enter the nominee name.')
      .max(180, 'That name is too long. Please shorten it.'),
    entryTitle: z
      .string()
      .trim()
      .min(5, 'Enter a clear initiative, project or contribution title.')
      .max(220, 'That title is too long. Please shorten it.'),
    contactPerson: z
      .string()
      .trim()
      .min(2, 'Enter the contact person name.')
      .max(160, 'That name is too long. Please shorten it.'),
    contactEmail: z
      .string()
      .trim()
      .email('Enter a valid email address.')
      .max(200, 'That email address is too long.'),
    contactPhone: optionalPhoneDigits,
    contactPhoneCountry: phoneCountry,
    briefDescription: requiredWordLimitedText('Brief description', 300, 3_500),
    impactOutcomes: requiredWordLimitedText('Impact and outcomes', 150, 2_000),
    meritRecognition: requiredWordLimitedText('Reason for recognition', 150, 2_000),
    supportingUrl: optionalUrl,
    ageEligibilityConfirmed: z.boolean().default(false),
    submitterIsContact: z.boolean().default(true),
    personCompletingForm: z
      .string()
      .trim()
      .max(160, 'That name is too long. Please shorten it.'),
    goodFaithAccurate: requiredConfirmation(
      'Please tick this box to confirm the information is accurate.',
    ),
    goodFaithResponsibility: requiredConfirmation(
      'Please tick this box to accept responsibility for the information.',
    ),
    goodFaithAuthority: requiredConfirmation(
      'Please tick this box to confirm you have the required permissions.',
    ),
    goodFaithClarification: requiredConfirmation(
      'Please tick this box to confirm API may seek clarification.',
    ),
    goodFaithDisqualification: requiredConfirmation(
      'Please tick this box to acknowledge the disqualification terms.',
    ),
    goodFaithIpRights: requiredConfirmation(
      'Please tick this box to confirm no third-party rights are infringed.',
    ),
    indiaEligibilityConfirmed: requiredConfirmation(
      'Please tick this box to confirm the work was delivered in India.',
    ),
    publicityConfirmed: requiredConfirmation(
      'Please tick this box to accept the finalist publicity terms.',
    ),
    termsAccepted: requiredConfirmation(
      'Please tick this box to accept the Terms and Conditions.',
    ),
    websiteConfirm: z.string().max(0).optional().or(z.literal('')),
  })
  .superRefine((data, context) => {
    if (data.contactPhone && !isValidNationalNumber(data.contactPhone, data.contactPhoneCountry)) {
      context.addIssue({
        code: 'custom',
        path: ['contactPhone'],
        message:
          'Enter a valid phone number for ' + findPhoneCountry(data.contactPhoneCountry).name + '.',
      });
    }

    if (data.category === 'young_professional' && !data.ageEligibilityConfirmed) {
      context.addIssue({
        code: 'custom',
        path: ['ageEligibilityConfirmed'],
        message: 'Confirm the nominee will be under 35 on ' + awardDates.nominationsClose + '.',
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
    // Stored alongside the parts so the register and the export read one value.
    contactPhoneInternational: toInternationalNumber(
      data.contactPhone ?? '',
      data.contactPhoneCountry,
    ),
  }));

export type NominationInput = z.input<typeof nominationSchema>;
export type Nomination = z.output<typeof nominationSchema>;
