import Image from "next/image";
import {
  ArrowDown,
  ArrowUpRight,
  Award,
  BookOpen,
  CalendarDays,
  Check,
  Scale,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import NominationForm from "@/components/NominationForm";
import { categories } from "@/lib/categories";

const principles = [
  {
    icon: Scale,
    title: "Independent review",
    text: "A jury of respected leaders from publishing, academia, and allied sectors.",
  },
  {
    icon: ShieldCheck,
    title: "Credible by design",
    text: "Transparent evaluation and robust conflict-of-interest safeguards.",
  },
  {
    icon: Sparkles,
    title: "Impact over acclaim",
    text: "Evidence, craft, systems, and meaningful progress—not bestseller status.",
  },
];

export default function Home() {
  return (
    <main>
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
          <span className="edition-pill">Founders Edition · 2026</span>
          <a className="button button-small" href="#nominate">
            Begin nomination <ArrowDown size={15} />
          </a>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-grain" />
        <div className="hero-copy">
          <p className="eyebrow light">Nominations · August 2026</p>
          <h1>
            Excellence,
            <br />
            <em>beyond the bestseller.</em>
          </h1>
          <p className="hero-intro">
            A new platform recognising the people, practices, and ideas moving Indian publishing
            forward—through innovation, editorial craft, sustainability, and social impact.
          </p>
          <div className="hero-actions">
            <a className="button button-light" href="#nominate">
              Submit a nomination <ArrowUpRight size={17} />
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
            <CalendarDays size={16} /> August 2026
          </span>
          <span>
            <Users size={16} /> India&apos;s publishing ecosystem
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
            The API Excellence Awards recognise the institutions, teams, initiatives, and
            professionals enabling that transformation. Entries are considered for their quality,
            originality, rigour, and demonstrable impact.
          </p>
        </div>
      </section>

      <section className="categories-section" id="categories">
        <div className="section-shell">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Founders Edition · Year One</p>
              <h2>Five signals of a stronger publishing future</h2>
            </div>
            <p>
              Choose the category that most closely reflects the nominee&apos;s primary contribution.
              One clear, evidence-led entry is stronger than a broad one.
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
          <p className="eyebrow">Governance &amp; credibility</p>
          <h2>Recognition you can trust.</h2>
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
            <h2>A thoughtful nomination can still be simple.</h2>
          </div>
          <ul>
            <li>
              <Check size={17} /> Nominee and nominator contact details
            </li>
            <li>
              <Check size={17} /> An optional short statement explaining why the nominee stands out
            </li>
            <li>
              <Check size={17} /> An outcome or example, if one is readily available
            </li>
            <li>
              <Check size={17} /> Optional links to published work or supporting evidence
            </li>
          </ul>
        </div>
      </section>

      <NominationForm />

      <footer>
        <div className="footer-top">
          <div className="footer-brand">
            <span className="brand-mark small" aria-hidden="true">
              <span>API</span>
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
          <span>API Excellence Awards &amp; Summit · Founders Edition</span>
        </div>
      </footer>
    </main>
  );
}
