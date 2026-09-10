import Image from "next/image";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Award,
  BadgeCheck,
  BookOpen,
  CalendarClock,
  CalendarDays,
  Clock,
  MapPin,
  Scale,
  ShieldCheck,
} from "lucide-react";
import AwardStructuredData from "@/components/AwardStructuredData";
import { categories } from "@/lib/categories";
import {
  awardCeremony,
  awardDates,
  awardsContactEmail,
  supportingPartners,
} from "@/lib/awardContent";

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
      <AwardStructuredData />
      <aside className="nomination-status is-closed" aria-label="Nomination status">
        <div className="status-message">
          <span className="status-label"><span aria-hidden="true" />Nominations closed</span>
          <p>
            Thank you to everyone who put forward a nomination. The independent Jury is now
            reviewing every eligible entry.
          </p>
        </div>
        <p className="status-closing">
          <span>Winners announced</span>
          <strong>
            {awardDates.ceremony}, {awardCeremony.city}
          </strong>
        </p>
      </aside>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="API Excellence Awards home">
          <Image
            className="brand-logo"
            src="/BLUE LOGO.png"
            alt="API Excellence Awards 2026"
            width={612}
            height={139}
            priority
          />
        </a>
        <div className="header-actions">
          <a
            className="button button-small"
            href="#ceremony"
            aria-label="Awards ceremony details"
          >
            Ceremony details <ArrowDown size={15} />
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
            Nominations are now closed. Thank you to everyone who put forward an organisation,
            initiative or individual advancing Indian publishing.
          </p>
          <div className="hero-actions">
            <a className="button button-light" href="#ceremony">
              Ceremony details <ArrowDown size={17} />
            </a>
            <a className="text-link light-link" href="#categories">
              Explore the five awards <ArrowDown size={15} />
            </a>
          </div>
          {/* Rendered on the server rather than by the live countdown, which paints
              its counting state until the browser takes over. */}
          <div className="countdown is-closed">
            <p className="countdown-label">
              <CalendarClock size={15} aria-hidden="true" />
              Nominations have closed
            </p>
            <p className="countdown-deadline">
              Nominations closed at <strong>{awardDates.nominationsCloseLong}</strong>. Winners
              will be announced on <strong>{awardDates.ceremony}</strong>.
            </p>
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
            <CalendarDays size={16} /> Awards ceremony · {awardDates.ceremony}
          </span>
          <span>
            <Award size={16} /> Five founding categories
          </span>
        </div>
      </section>

      <section className="associates" aria-labelledby="associates-title">
        <div className="section-shell">
          <h2 className="eyebrow light associates-title" id="associates-title">
            Supporting partners
          </h2>
          <ul className="associates-list">
            {supportingPartners.map((partner) => (
              <li className="associate" key={partner.name}>
                <p className="associate-role">{partner.role}</p>
                <a
                  className="associate-mark"
                  href={partner.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={partner.width}
                    height={partner.height}
                    style={{ height: partner.displayHeight, width: "auto" }}
                  />
                </a>
                <p className="associate-name">{partner.name}</p>
                <p className="associate-note">{partner.note}</p>
              </li>
            ))}
          </ul>
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
              <h2>The five Founders Edition awards</h2>
            </div>
            <p>
              Each category recognises a distinct contribution to Indian publishing. The Jury will
              select up to three finalists in each, and the winners will be announced at the
              ceremony.
            </p>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <article className="category-card" key={category.id}>
                <span className="category-number">{category.number}</span>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
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

      <section className="ceremony" id="ceremony">
        <div className="section-shell ceremony-grid">
          <div className="ceremony-intro">
            <p className="eyebrow">The awards evening</p>
            <h2>Winners announced in New Delhi.</h2>
            <p>
              The five Founders Edition winners will be revealed at the API Excellence Awards
              ceremony. Finalists are invited to attend.
            </p>
          </div>
          <div className="ceremony-card">
            <dl>
              <div>
                <dt><CalendarDays size={14} aria-hidden="true" /> Date</dt>
                <dd>{awardDates.ceremony}</dd>
              </div>
              <div>
                <dt><Clock size={14} aria-hidden="true" /> Time</dt>
                <dd>{awardCeremony.time}</dd>
              </div>
              <div>
                <dt><MapPin size={14} aria-hidden="true" /> Venue</dt>
                <dd>
                  <strong>{awardCeremony.hall}</strong>
                  {awardCeremony.building}
                  <br />
                  {awardCeremony.street}, {awardCeremony.city}
                </dd>
              </div>
            </dl>
            <a
              className="text-link"
              href={awardCeremony.mapUrl}
              target="_blank"
              rel="noreferrer"
            >
              View on map <ArrowUpRight size={15} />
            </a>
          </div>
        </div>
      </section>

      <section className="before-you-start">
        <div className="section-shell preparation-grid">
          <div>
            <p className="eyebrow light">What happens next</p>
            <h2>From nominations to the awards evening</h2>
            <p className="preparation-deadline">
              Nominations closed at <strong>{awardDates.nominationsCloseLong}</strong>.
            </p>
          </div>
          <ul>
            <li>
              <ArrowRight size={17} /> The independent Jury reviews every eligible nomination
            </li>
            <li>
              <ArrowRight size={17} /> Finalists may be asked for clarification or supporting
              evidence
            </li>
            <li>
              <ArrowRight size={17} /> Up to three finalists are selected in each category
            </li>
            <li>
              <ArrowRight size={17} /> Winners are announced at the ceremony on{" "}
              {awardDates.ceremony}
            </li>
          </ul>
        </div>
      </section>

      {/* Kept on #nominate so links shared during the campaign still land here. */}
      <section className="nomination-section" id="nominate">
        <div className="success-card closed-notice">
          <div className="success-icon">
            <Award size={34} />
          </div>
          <p className="eyebrow">Nominations closed</p>
          <h2>Thank you for your nominations.</h2>
          <p>
            Nominations for the API Excellence Awards 2026 closed at{" "}
            <strong>{awardDates.nominationsCloseLong}</strong>, and no further entries can be
            accepted.
          </p>
          <p>
            If you submitted a nomination, your confirmation email carries its submission
            reference. For any questions, write to{" "}
            <a href={`mailto:${awardsContactEmail}`}>{awardsContactEmail}</a>.
          </p>
          <a className="button button-dark" href="#ceremony">
            Ceremony details <ArrowUp size={15} />
          </a>
        </div>
      </section>

      <footer>
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-logo-mark" aria-hidden="true">
              <Image
                className="footer-logo-source"
                src="/WHITE LOGO.png"
                alt=""
                width={612}
                height={139}
              />
            </span>
            <div>
              <strong>Association of Publishers in India</strong>
              <p>Advancing publishing through advocacy, collaboration, and excellence.</p>
            </div>
          </div>
          <div className="footer-contact">
            <span>Awards enquiries</span>
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
