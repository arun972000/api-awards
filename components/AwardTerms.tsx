import { awardTerms, awardsContactEmail } from "@/lib/awardContent";

export default function AwardTerms() {
  return (
    <div className="award-terms-copy">
      <header>
        <p>API Excellence Awards 2026</p>
        <h3>General Terms and Conditions</h3>
      </header>
      <ol>
        {awardTerms.map((section, sectionIndex) => (
          <li key={section.title}>
            <h4>
              {sectionIndex + 1}. {section.title}
            </h4>
            <div>
              {section.clauses.map((clause, clauseIndex) => (
                <p key={clause}>
                  <span>{sectionIndex + 1}.{clauseIndex + 1}</span> {clause}
                </p>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <footer>
        <strong>Association of Publishers in India (API)</strong>
        <a href={`mailto:${awardsContactEmail}`}>{awardsContactEmail}</a>
      </footer>
    </div>
  );
}
