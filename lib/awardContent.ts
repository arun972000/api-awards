export const awardDates = {
  eligibilityStarts: "1 January 2025",
  // Date only. Used where the deadline is a cut-off date rather than a moment,
  // such as the under-35 test and the eligibility window.
  nominationsClose: "10 September 2026",
  nominationsCloseTime: "5:00 pm IST",
  nominationsCloseLong: "5:00 pm IST on 10 September 2026",
  // The actual closing moment, for the countdown.
  nominationsCloseIso: "2026-09-10T17:00:00+05:30",
  ceremony: "25 September 2026",
} as const;

export const awardsContactEmail = "associationofpublishers@gmail.com";

export const awardTerms = [
  {
    title: "Eligibility",
    clauses: [
      "The API Excellence Awards are open to eligible individuals, organisations, publishers and teams associated with the publishing ecosystem in India, subject to the requirements of the relevant award category.",
      "The initiative, project, practice, contribution or professional achievement nominated must have been undertaken, implemented or substantially delivered in India. International or cross-border work may be eligible where the substantive work being recognised was undertaken in India.",
      "The nominated work must have been undertaken, implemented or substantially delivered from 1 January 2025 up to 10 September 2026.",
      "For the Young Publishing Professional of the Year category, the nominee must be under 35 years of age as of 10 September 2026.",
      "A nominee may be considered for more than one category, provided a separate nomination is submitted for each category.",
    ],
  },
  {
    title: "Submission",
    clauses: [
      "Nominations must be submitted through the official API nomination form by 10 September 2026.",
      "Each nomination should provide sufficient information for the Jury to understand the work, its significance and its impact.",
      "Supporting material is optional. API may request additional information or evidence from finalists where reasonably required.",
      "API may close nominations for any category once a threshold determined by API is reached, in order to ensure an effective and timely evaluation process. Where practicable, reasonable notice will be provided through official channels.",
      "Late, incomplete or substantially non-responsive nominations may not be considered.",
    ],
  },
  {
    title: "Good-Faith Submission & Responsibility",
    clauses: [
      "All nominations are submitted on a good-faith basis.",
      "The nominee and, where applicable, the person submitting on the nominee's behalf are responsible for the accuracy, completeness and authenticity of the information and materials provided.",
      "API does not undertake independent verification of every statement, claim or metric at the nomination stage.",
      "API may rely on the submitted information for evaluation, subject to any verification or clarification undertaken by API or the Jury.",
    ],
  },
  {
    title: "Evaluation & Selection",
    clauses: [
      "Eligible nominations will be reviewed and evaluated by an independent Jury appointed by API against the objectives and criteria for the relevant category.",
      "The Jury will select up to three finalists in each category. Finalists may be asked for reasonable clarification or supporting evidence.",
      "The winner in each category will be selected by the Jury and announced at the API Excellence Awards ceremony.",
      "Jury members will not participate where they have a direct or material conflict of interest with a nominee or nomination.",
      "The Jury's decision is final and binding. API is not obliged to provide individual feedback or reasons for non-selection.",
      "API and/or the Jury may determine that no nomination meets the required standard and may withhold an award.",
    ],
  },
  {
    title: "Finalists & Public Announcement",
    clauses: [
      "Selection as a finalist does not constitute selection as the winner.",
      "API may announce finalists through its website, social media, press communications, event materials and other Awards-related channels.",
      "Submission acknowledges and consents to finalist announcement and related publicity under these Conditions.",
      "Finalists are encouraged to attend the ceremony. Attendance is not itself a condition of eligibility unless separately communicated by API.",
    ],
  },
  {
    title: "Disqualification & Withdrawal",
    clauses: [
      "API may disqualify a nomination that is materially false, misleading, fraudulent, misrepresented or otherwise ineligible, and may withdraw an award if such grounds are discovered after announcement.",
      "API may withhold an award or make alternative arrangements where a selected nominee becomes ineligible or is disqualified.",
      "A nominee may withdraw a submitted nomination by notifying API in writing within two calendar days of submission. Later requests will be accepted only at API's sole discretion.",
    ],
  },
  {
    title: "Intellectual Property & Use of Materials",
    clauses: [
      "Nominees retain ownership of the intellectual property in their submitted work and materials.",
      "Submission grants API a non-exclusive, royalty-free right to use nomination information and materials for judging, announcing, documenting and promoting the API Excellence Awards.",
      "Nominees are responsible for having the rights and permissions needed to submit third-party material.",
    ],
  },
  {
    title: "Confidentiality & Personal Information",
    clauses: [
      "Information submitted for judging will be used for administering and evaluating the Awards and, where applicable, for Awards-related communications and publicity.",
      "API may disclose information relating to finalists and winners as reasonably required for announcements, publicity and Awards-related communications.",
      "Personal information collected through the nomination process will be used for administering the Awards and related communications.",
    ],
  },
  {
    title: "Awards Ceremony",
    clauses: [
      "The API Excellence Awards ceremony will take place on 25 September 2026, when the winners will be announced.",
      "Finalists and winners may be featured in Awards-related communications and promotional activities.",
      "Nominees and finalists are responsible for their own travel, accommodation and related expenses unless otherwise communicated by API.",
    ],
  },
  {
    title: "General",
    clauses: [
      "API may amend these Terms and Conditions where reasonably necessary for the administration and integrity of the Awards.",
      "API may make reasonable decisions on matters not expressly covered to ensure the fair and effective conduct of the Awards.",
      "Submission of a nomination constitutes acceptance of these Terms and Conditions.",
    ],
  },
] as const;
