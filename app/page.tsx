import Image from "next/image";
import {
  ArrowDown,
  ArrowUpRight,
  Award,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  Check,
  Scale,
  ShieldCheck,
} from "lucide-react";
import NominationForm from "@/components/NominationForm";
import { categories } from "@/lib/categories";
import { awardDates } from "@/lib/awardContent";

const principles = [
  {
    icon: Scale,
    title: "Independent jury",
    text: "An independent Jury appointed by API will assess every eligible nomination.",
  },
  {
    icon: ShieldCheck,
    title: "Clear safeguards",
    text: "Jury members will step aside where they have a direct or material conflict.",
  },
  {
    icon: BadgeCheck,
    title: "Evidence of impact",
    text: "Entries are considered for the work itself, its significance and its demonstrated impact.",
  },
];

export default function Home() {
  return (
    <main id="main-content">
      <aside className="nomination-status" aria-label="Nomination status">
        <div className="status-message">
          <span className="status-label"><span aria-hidden="true" />Nominations open</span>
          <p>
            Open to individuals, organisations and teams across the Indian publishing
            ecosystem.
          </p>
        </div>
        <p className="status-closing">
          <span>Nominations close</span>
          <strong>{awardDates.nominationsClose}</strong>
        </p>
      </aside>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="API Excellence Awards home">
          <Image
            className="brand-logo"
            src="/api-publishers-logo-navbar.png"
            alt="Association of Publishers in India"
            width={2074}
            height={523}
            priority
          />
        </a>
        <div className="header-actions">
          <a
            className="button button-small"
            href="#nominate"
            aria-label="Nominate now for the API Excellence Awards 2026"
          >
            Nominate now <ArrowDown size={15} />
          </a>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-grain" />
        <div className="hero-copy">
          <p className="eyebrow light">Founders Edition · 2026</p>
          <h1>
            Excellence,
            <br />
            <em>beyond the bestseller.</em>
          </h1>
          <p className="hero-intro">
            Know an organisation, initiative or individual advancing Indian publishing? Put them
            forward for the API Excellence Awards 2026.
          </p>
          <div className="hero-actions">
            <a className="button button-light" href="#nominate">
              Nominate now <ArrowUpRight size={17} />
            </a>
            <a className="text-link light-link" href="#categories">
              Explore the five awards <ArrowDown size={15} />
            </a>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="laurel laurel-left">
            {Array.from({ length: 8 }).map((_, index) => (
              <span key={index} />
            ))}
          </div>
          <div className="medallion">
            <div className="medallion-inner">
              <BookOpen size={42} strokeWidth={1.25} />
              <span>API</span>
              <small>Excellence · 2026</small>
            </div>
          </div>
          <div className="laurel laurel-right">
            {Array.from({ length: 8 }).map((_, index) => (
              <span key={index} />
            ))}
          </div>
        </div>
        <div className="hero-meta">
          <span>
            <CalendarDays size={16} /> Nominations close · {awardDates.nominationsClose}
          </span>
          <span>
            <CalendarDays size={16} /> Awards ceremony · {awardDates.ceremony}
          </span>
          <span>
            <Award size={16} /> Five founding categories
          </span>
        </div>
      </section>

      <section className="statement section-shell">
        <div>
          <p className="eyebrow">Why these awards</p>
          <h2>The work behind the work deserves to be seen.</h2>
        </div>
        <div className="statement-copy">
          <p>
            Publishing in India is being reshaped by digital innovation, AI, new distribution
            models, sustainability imperatives, and a deeper responsibility to widen access to
            knowledge.
          </p>
          <p>
            The API Excellence Awards recognise individuals, organisations, publishers and teams
            enabling that transformation. Entries are considered for their quality,
            originality, rigour, and demonstrable impact.
          </p>
        </div>
      </section>

      <section className="categories-section" id="categories">
        <div className="section-shell">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Founders Edition · Year One</p>
              <h2>Choose the right award category</h2>
            </div>
            <p>
              Choose the category that most closely reflects the nominee&apos;s primary contribution.
              If the same nominee is entered in more than one category, submit a separate form for
              each category.
            </p>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <article className="category-card" key={category.id}>
                <span className="category-number">{category.number}</span>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <a href="#nominate">
                  Nominate in this category <ArrowDown size={15} />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="principles section-shell">
        <div className="principles-heading">
          <p className="eyebrow">How nominations are assessed</p>
          <h2>A clear and fair process.</h2>
        </div>
        <div className="principle-list">
          {principles.map(({ icon: Icon, title, text }) => (
            <article key={title}>
              <div className="icon-disc">
                <Icon size={21} strokeWidth={1.7} />
              </div>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="before-you-start">
        <div className="section-shell preparation-grid">
          <div>
            <p className="eyebrow light">Before you begin</p>
            <h2>What you&apos;ll need to nominate</h2>
            <p className="preparation-deadline">
              Nominations close on <strong>{awardDates.nominationsClose}</strong>.
            </p>
          </div>
          <ul>
            <li>
              <Check size={17} /> Nominee details and one contact person
            </li>
            <li>
              <Check size={17} /> A brief description of up to 300 words
            </li>
            <li>
              <Check size={17} /> Impact and recognition statements of up to 150 words each
            </li>
            <li>
              <Check size={17} /> One optional URL or supporting file, up to 4 MB
            </li>
          </ul>
        </div>
      </section>

      <NominationForm />

      <footer>
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-logo-mark" aria-hidden="true">
              <Image
                className="footer-logo-source"
                src="/api-publishers-logo-navbar.png"
                alt=""
                width={2074}
                height={523}
              />
            </span>
            <div>
              <strong>Association of Publishers in India</strong>
              <p>Advancing publishing through advocacy, collaboration, and excellence.</p>
            </div>
          </div>
          <div className="footer-contact">
            <span>Nomination enquiries</span>
            <a href="mailto:associationofpublishers@gmail.com">
              associationofpublishers@gmail.com
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Association of Publishers in India</span>
          <span>API Excellence Awards · Founders Edition</span>
        </div>
      </footer>
    </main>
  );
}
