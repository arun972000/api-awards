"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import styles from "./AdminNominations.module.css";

type NominationRecord = {
  id: string;
  created_at: string;
  submission_reference: string;
  status: string;
  category: string;
  nomination_type: string;
  nominee_name: string;
  nominee_organisation: string;
  nominee_email: string;
  nominator_name: string;
  nominator_email: string;
  entry_title: string;
  payload: Record<string, unknown>;
};

type ListResponse = {
  nominations: NominationRecord[];
  total: number;
  nextCursor: string | null;
};

const categoryLabels: Record<string, string> = {
  publishing_innovation: "Publishing Innovation",
  editorial_excellence: "Editorial Excellence",
  production_sustainability: "Production & Sustainability",
  social_impact: "Publishing for Social Impact",
  young_professional: "Young Publishing Professional",
};

const statusLabels: Record<string, string> = {
  submitted: "Submitted",
  screening: "Screening",
  eligible: "Eligible",
  shortlisted: "Shortlisted",
  winner: "Winner",
  ineligible: "Ineligible",
  withdrawn: "Withdrawn",
};

const detailFields = [
  ["Nominee type", "nomineeKind"],
  ["Contact person", "contactPerson"],
  ["Phone number", "contactPhone"],
  ["Person completing the form", "personCompletingForm"],
  ["Submission date", "submissionDate"],
  ["Under-35 eligibility confirmed", "ageEligibilityConfirmed"],
  ["India delivery confirmed", "indiaEligibilityConfirmed"],
] as const;

const narrativeFields = [
  ["Brief description", "briefDescription"],
  ["Impact / outcomes", "impactOutcomes"],
  ["Why it merits recognition", "meritRecognition"],
] as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function textValue(value: unknown) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  return typeof value === "string" ? value.trim() : "";
}

export default function AdminNominations() {
  const [authState, setAuthState] = useState<"checking" | "signedOut" | "signedIn">(
    "checking",
  );
  const [nominations, setNominations] = useState<NominationRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const loadNominations = useCallback(async (cursor?: string) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({ limit: "100" });
      if (cursor) params.set("cursor", cursor);
      const response = await fetch(`/api/admin/nominations?${params}`, { cache: "no-store" });

      if (response.status === 401) {
        setAuthState("signedOut");
        setNominations([]);
        return;
      }

      const data = (await response.json()) as Partial<ListResponse> & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not load nominations.");

      setNominations((current) =>
        cursor ? [...current, ...(data.nominations ?? [])] : (data.nominations ?? []),
      );
      setTotal(data.total ?? 0);
      setNextCursor(data.nextCursor ?? null);
      setAuthState("signedIn");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load nominations.");
      setAuthState((current) => (current === "checking" ? "signedOut" : current));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadNominations(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadNominations]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return nominations.filter((nomination) => {
      const matchesQuery =
        !needle ||
        [
          nomination.submission_reference,
          nomination.nominee_name,
          nomination.nominee_organisation,
          nomination.nominee_email,
          nomination.nominator_name,
          nomination.entry_title,
          textValue(nomination.payload?.contactPerson),
          textValue(nomination.payload?.personCompletingForm),
        ].some((value) => value.toLowerCase().includes(needle));
      return (
        matchesQuery &&
        (category === "all" || nomination.category === category) &&
        (status === "all" || nomination.status === status)
      );
    });
  }, [category, nominations, query, status]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.get("username"),
          password: form.get("password"),
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Sign in failed.");
      event.currentTarget.reset();
      await loadNominations();
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuthState("signedOut");
    setNominations([]);
    setError("");
  }

  async function downloadExport() {
    setExporting(true);
    setError("");
    try {
      const response = await fetch("/api/admin/nominations/export", { cache: "no-store" });
      if (response.status === 401) {
        setAuthState("signedOut");
        return;
      }
      if (!response.ok) throw new Error("Could not create the export.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `api-awards-nominations-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Could not export data.");
    } finally {
      setExporting(false);
    }
  }

  if (authState === "checking") {
    return (
      <main className={styles.centeredPage}>
        <LoaderCircle className={styles.spinner} size={28} aria-hidden="true" />
        <p>Opening the nomination desk…</p>
      </main>
    );
  }

  if (authState === "signedOut") {
    return (
      <main className={styles.loginPage}>
        <div className={styles.loginBackdrop} aria-hidden="true" />
        <Link className={styles.backLink} href="/">
          <ArrowLeft size={16} /> Return to nomination page
        </Link>
        <section className={styles.loginCard} aria-labelledby="admin-sign-in-title">
          <Image
            className={styles.loginLogo}
            src="/api-publishers-logo-navbar.png"
            alt="Association of Publishers in India"
            width={2074}
            height={523}
            priority
          />
          <div className={styles.lockMark} aria-hidden="true">
            <LockKeyhole size={23} />
          </div>
          <p className={styles.eyebrow}>Private administration</p>
          <h1 id="admin-sign-in-title">Nomination desk</h1>
          <p className={styles.loginIntro}>
            Sign in to review and export submissions for the API Excellence Awards 2026.
          </p>
          <form className={styles.loginForm} onSubmit={signIn}>
            <label>
              <span>Username</span>
              <input name="username" autoComplete="username" required />
            </label>
            <label>
              <span>Password</span>
              <input name="password" type="password" autoComplete="current-password" required />
            </label>
            {error ? <p className={styles.formError}>{error}</p> : null}
            <button className={styles.primaryButton} type="submit" disabled={loading}>
              {loading ? <LoaderCircle className={styles.spinner} size={17} /> : <ShieldCheck size={17} />}
              {loading ? "Signing in…" : "Enter nomination desk"}
            </button>
          </form>
          <p className={styles.securityNote}>
            <LockKeyhole size={13} /> Restricted to authorised API Awards staff.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.dashboard}>
      <header className={styles.header}>
        <Link href="/" aria-label="API Excellence Awards nomination page">
          <Image
            className={styles.headerLogo}
            src="/api-publishers-logo-navbar.png"
            alt="Association of Publishers in India"
            width={2074}
            height={523}
            priority
          />
        </Link>
        <div className={styles.headerDivider} />
        <div className={styles.headerTitle}>
          <span>Awards 2026</span>
          <strong>Nomination desk</strong>
        </div>
        <button className={styles.logoutButton} type="button" onClick={signOut}>
          <LogOut size={16} /> Sign out
        </button>
      </header>

      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Excellence Awards · 2026</p>
          <h1>Nomination desk</h1>
          <p>Review every entry, find nominee details, and export the complete submission register.</p>
        </div>
        <button className={styles.exportButton} type="button" onClick={downloadExport} disabled={exporting}>
          {exporting ? <LoaderCircle className={styles.spinner} size={17} /> : <Download size={17} />}
          {exporting ? "Preparing…" : "Export all as CSV"}
        </button>
      </section>

      <section className={styles.content}>
        <div className={styles.statGrid}>
          <article className={styles.statCard}>
            <span className={styles.statIcon}><FileText size={19} /></span>
            <div><strong>{total}</strong><span>Total submissions</span></div>
          </article>
          <article className={styles.statCard}>
            <span className={styles.statIcon}><Users size={19} /></span>
            <div><strong>{new Set(nominations.map((item) => item.nominee_email)).size}</strong><span>Nominees loaded</span></div>
          </article>
          <article className={styles.statCard}>
            <span className={styles.statIcon}><BookOpen size={19} /></span>
            <div><strong>{new Set(nominations.map((item) => item.category)).size}</strong><span>Award categories</span></div>
          </article>
        </div>

        <div className={styles.listPanel}>
          <div className={styles.panelHeading}>
            <div>
              <h2>Submitted nominations</h2>
              <p>{filtered.length} shown from {nominations.length} loaded</p>
            </div>
            <div className={styles.filters}>
              <label className={styles.searchBox}>
                <Search size={17} aria-hidden="true" />
                <span className={styles.srOnly}>Search nominations</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search name, reference or title"
                />
              </label>
              <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category">
                <option value="all">All categories</option>
                {Object.entries(categoryLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
              </select>
              <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status">
                <option value="all">All statuses</option>
                {Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
              </select>
            </div>
          </div>

          {error ? <div className={styles.notice}>{error}</div> : null}

          {filtered.length ? (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>Nominee</th><th>Award category</th><th>Submitted by</th><th>Date</th><th>Status</th><th><span className={styles.srOnly}>Details</span></th></tr></thead>
                <tbody>
                  {filtered.map((nomination) => {
                    const expanded = expandedId === nomination.id;
                    return (
                      <FragmentRow
                        key={nomination.id}
                        nomination={nomination}
                        expanded={expanded}
                        onToggle={() => setExpandedId(expanded ? null : nomination.id)}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <Search size={25} />
              <h3>{nominations.length ? "No matching nominations" : "No nominations yet"}</h3>
              <p>{nominations.length ? "Try changing your search or filters." : "New entries will appear here as soon as they are submitted."}</p>
            </div>
          )}

          {nextCursor ? (
            <div className={styles.loadMoreWrap}>
              <button className={styles.loadMoreButton} type="button" disabled={loading} onClick={() => void loadNominations(nextCursor)}>
                {loading ? <LoaderCircle className={styles.spinner} size={16} /> : null}
                {loading ? "Loading…" : "Load more nominations"}
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function FragmentRow({ nomination, expanded, onToggle }: { nomination: NominationRecord; expanded: boolean; onToggle: () => void }) {
  return (
    <>
      <tr className={expanded ? styles.expandedRow : undefined}>
        <td><strong>{nomination.nominee_name}</strong><span>{textValue(nomination.payload?.nomineeKind) || "Nominee"}</span><small>{nomination.submission_reference}</small></td>
        <td><span className={styles.categoryLabel}>{categoryLabels[nomination.category] ?? nomination.category}</span><small>{nomination.entry_title}</small></td>
        <td><strong>{nomination.nominator_name}</strong><span>{nomination.nominator_email}</span></td>
        <td><span>{formatDate(nomination.created_at)}</span></td>
        <td><span className={`${styles.status} ${styles[`status_${nomination.status}`] ?? ""}`}>{statusLabels[nomination.status] ?? nomination.status}</span></td>
        <td><button className={styles.expandButton} type="button" onClick={onToggle} aria-expanded={expanded} aria-label={`${expanded ? "Close" : "View"} ${nomination.nominee_name}'s nomination`}>{expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</button></td>
      </tr>
      {expanded ? <tr className={styles.detailRow}><td colSpan={6}><NominationDetails nomination={nomination} /></td></tr> : null}
    </>
  );
}

function NominationDetails({ nomination }: { nomination: NominationRecord }) {
  return (
    <div className={styles.details}>
      <div className={styles.detailTopline}>
        <div><span>Entry title</span><strong>{nomination.entry_title}</strong></div>
        <div><span>Nomination type</span><strong>{nomination.nomination_type === "self" ? "Self nomination" : "Nominated by another person"}</strong></div>
      </div>
      <div className={styles.contactGrid}>
        <div><span>Contact email</span><a href={`mailto:${nomination.nominee_email}`}>{nomination.nominee_email}</a></div>
        {detailFields.map(([label, key]) => {
          const value = textValue(nomination.payload?.[key]);
          return value ? <div key={key}><span>{label}</span><strong>{value}</strong></div> : null;
        })}
      </div>
      <div className={styles.narratives}>
        {narrativeFields.map(([label, key]) => {
          const value = textValue(nomination.payload?.[key]);
          return value ? <article key={key}><span>{label}</span><p>{value}</p></article> : null;
        })}
      </div>
      <SupportingMaterials payload={nomination.payload} />
    </div>
  );
}

function SupportingMaterials({ payload }: { payload: Record<string, unknown> }) {
  const supportingUrl = textValue(payload.supportingUrl);
  const material =
    payload.supportingMaterial && typeof payload.supportingMaterial === "object"
      ? payload.supportingMaterial as Record<string, unknown>
      : null;
  const path = textValue(material?.path);
  const name = textValue(material?.fileName) || "Supporting material";

  if (!supportingUrl && !path) return null;

  return (
    <div className={styles.narratives}>
      <article>
        <span>Supporting material</span>
        <p>
          {supportingUrl ? <a href={supportingUrl} target="_blank" rel="noreferrer">Open supporting URL</a> : null}
          {supportingUrl && path ? " · " : null}
          {path ? (
            <a href={`/api/admin/nominations/supporting-material?path=${encodeURIComponent(path)}&name=${encodeURIComponent(name)}`}>
              Download {name}
            </a>
          ) : null}
        </p>
      </article>
    </div>
  );
}
