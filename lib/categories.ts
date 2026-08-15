export const categories = [
  {
    id: "publishing_innovation",
    number: "01",
    shortName: "Publishing Innovation",
    name: "Publishing Innovation Award",
    description:
      "Transformative business models, digital-first initiatives, AI-enabled workflows, or platform innovations.",
    prompt:
      "Explain what changed, why the approach is original, and how it improved reach, efficiency, or value creation.",
  },
  {
    id: "editorial_excellence",
    number: "02",
    shortName: "Editorial Excellence",
    name: "Editorial Excellence Award",
    description:
      "Outstanding editorial craft across trade, education, or academic publishing.",
    prompt:
      "Describe the editorial vision, rigour, originality, and resulting reader impact. Sales figures are not required.",
  },
  {
    id: "production_sustainability",
    number: "03",
    shortName: "Production & Sustainability",
    name: "Production & Sustainability Excellence Award",
    description:
      "Excellence in production, supply chains, responsible sourcing, efficiency, or environmental stewardship.",
    prompt:
      "Detail the production or sustainability practice and quantify improvements wherever possible.",
  },
  {
    id: "social_impact",
    number: "04",
    shortName: "Publishing for Social Impact",
    name: "Publishing for Social Impact Award",
    description:
      "Publishing initiatives advancing education, language inclusion, social awareness, or public good.",
    prompt:
      "Identify the community served, the need addressed, and credible evidence of positive societal outcomes.",
  },
  {
    id: "young_professional",
    number: "05",
    shortName: "Young Publishing Professional",
    name: "Young Publishing Professional of the Year (Under 35)",
    description:
      "A rising professional showing leadership, innovation, and measurable contribution to publishing.",
    prompt:
      "Show how the nominee has led, influenced, or improved publishing practice, with specific examples and outcomes.",
  },
] as const;

export type CategoryId = (typeof categories)[number]["id"];

export const categoryIds = categories.map((category) => category.id) as [
  CategoryId,
  ...CategoryId[],
];
