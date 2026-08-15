import { z } from "zod";
import { categoryIds } from "@/lib/categories";

const optionalShortText = z.string().trim().max(200).optional().or(z.literal(""));

export const nominationSchema = z
  .object({
    category: z.enum(categoryIds),
    nominationType: z.enum(["self", "other"]),
    nomineeKind: z.enum(["individual", "team", "organisation", "initiative"]),
    nomineeName: z.string().trim().min(2).max(160),
    nomineeOrganisation: z.string().trim().min(2).max(160),
    nomineeRole: optionalShortText,
    nomineeEmail: z.string().trim().email().max(200),
    nomineePhone: z.string().trim().min(7).max(30),
    nomineeWebsite: z.string().trim().url().max(300).optional().or(z.literal("")),
    nomineeCity: z.string().trim().min(2).max(120),
    publicationTitle: optionalShortText,
    isbnOrIdentifier: optionalShortText,
    entryTitle: z.string().trim().min(5).max(180),
    impactSummary: z.string().trim().max(1200).optional().or(z.literal("")),
    caseForRecognition: z.string().trim().max(2500).optional().or(z.literal("")),
    measurableOutcomes: z.string().trim().max(1500).optional().or(z.literal("")),
    categoryEvidence: z.string().trim().max(3000).optional().or(z.literal("")),
    workPeriod: z.string().trim().max(120).optional().or(z.literal("")),
    supportingLinks: z.string().trim().max(1200).optional().or(z.literal("")),
    ageEligibilityConfirmed: z.boolean().default(false),
    birthYear: z.string().trim().regex(/^\d{4}$/).optional().or(z.literal("")),
    nominatorName: z.string().trim().min(2).max(160),
    nominatorOrganisation: z.string().trim().min(2).max(160),
    nominatorRole: optionalShortText,
    nominatorEmail: z.string().trim().email().max(200),
    nominatorPhone: z.string().trim().min(7).max(30),
    relationshipToNominee: z.string().trim().min(2).max(200),
    conflictDisclosure: z.string().trim().max(1200).optional().or(z.literal("")),
    accuracyConfirmed: z.literal(true),
    consentConfirmed: z.literal(true),
    websiteConfirm: z.string().max(0).optional().or(z.literal("")),
  })
  .superRefine((data, context) => {
    if (data.category === "young_professional" && !data.ageEligibilityConfirmed) {
      context.addIssue({
        code: "custom",
        path: ["ageEligibilityConfirmed"],
        message: "Please confirm the nominee meets the under-35 requirement.",
      });
    }
  });

export type NominationInput = z.input<typeof nominationSchema>;
export type Nomination = z.output<typeof nominationSchema>;
