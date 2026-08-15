"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";
import { categories, CategoryId } from "@/lib/categories";

type FormState = {
  category: CategoryId | "";
  nominationType: "self" | "other";
  nomineeKind: "individual" | "team" | "organisation" | "initiative";
  nomineeName: string;
  nomineeOrganisation: string;
  nomineeRole: string;
  nomineeEmail: string;
  nomineePhone: string;
  nomineeWebsite: string;
  nomineeCity: string;
  publicationTitle: string;
  isbnOrIdentifier: string;
  entryTitle: string;
  impactSummary: string;
  caseForRecognition: string;
  measurableOutcomes: string;
  categoryEvidence: string;
  workPeriod: string;
  supportingLinks: string;
  ageEligibilityConfirmed: boolean;
  birthYear: string;
  nominatorName: string;
  nominatorOrganisation: string;
  nominatorRole: string;
  nominatorEmail: string;
  nominatorPhone: string;
  relationshipToNominee: string;
  conflictDisclosure: string;
  accuracyConfirmed: boolean;
  consentConfirmed: boolean;
  websiteConfirm: string;
};

const initialForm: FormState = {
  category: "",
  nominationType: "self",
  nomineeKind: "individual",
  nomineeName: "",
  nomineeOrganisation: "",
  nomineeRole: "",
  nomineeEmail: "",
  nomineePhone: "",
  nomineeWebsite: "",
  nomineeCity: "",
  publicationTitle: "",
  isbnOrIdentifier: "",
  entryTitle: "",
  impactSummary: "",
  caseForRecognition: "",
  measurableOutcomes: "",
  categoryEvidence: "",
  workPeriod: "",
  supportingLinks: "",
  ageEligibilityConfirmed: false,
  birthYear: "",
  nominatorName: "",
  nominatorOrganisation: "",
  nominatorRole: "",
  nominatorEmail: "",
  nominatorPhone: "",
  relationshipToNominee: "",
  conflictDisclosure: "",
  accuracyConfirmed: false,
  consentConfirmed: false,
  websiteConfirm: "",
};

const steps = ["Award", "Nominee", "Nomination", "Review"];

const requiredByStep: Record<number, (keyof FormState)[]> = {
  1: ["category", "nominationType"],
  2: [
    "nomineeKind",
    "nomineeName",
    "nomineeOrganisation",
    "nomineeEmail",
    "nomineePhone",
    "nomineeCity",
  ],
  3: [
    "entryTitle",
  ],
  4: [
    "nominatorName",
    "nominatorOrganisation",
    "nominatorEmail",
    "nominatorPhone",
    "relationshipToNominee",
    "accuracyConfirmed",
    "consentConfirmed",
  ],
};

const readableFieldNames: Partial<Record<keyof FormState, string>> = {
  category: "award category",
  nomineeName: "nominee name",
  nomineeOrganisation: "organisation",
  nomineeEmail: "nominee email",
  nomineePhone: "nominee phone",
  nomineeCity: "city",
  entryTitle: "entry title",
  nominatorName: "nominator name",
  nominatorOrganisation: "nominator organisation",
  nominatorEmail: "nominator email",
  nominatorPhone: "nominator phone",
  relationshipToNominee: "relationship to nominee",
  accuracyConfirmed: "accuracy declaration",
  consentConfirmed: "consent declaration",
};

function CharacterCount({ value, max }: { value: string; max: number }) {
  return (
    <span className={value.length > max ? "character-count over" : "character-count"}>
      {value.length.toLocaleString("en-IN")} / {max.toLocaleString("en-IN")}
    </span>
  );
}

export default function NominationForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState("");
  const [reference, setReference] = useState("");

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === form.category),
    [form.category],
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validateStep(currentStep: number) {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    for (const field of requiredByStep[currentStep]) {
      const value = form[field];
      if (value === "" || value === false) {
        nextErrors[field] = `Please provide ${readableFieldNames[field] ?? "this information"}.`;
      }
    }

    if (currentStep === 2) {
      if (form.nomineeEmail && !/^\S+@\S+\.\S+$/.test(form.nomineeEmail)) {
        nextErrors.nomineeEmail = "Enter a valid email address.";
      }
      if (form.nomineeWebsite && !/^https?:\/\//i.test(form.nomineeWebsite)) {
        nextErrors.nomineeWebsite = "Include https:// at the start of the URL.";
      }
    }

    if (currentStep === 3) {
      if (form.category === "young_professional" && !form.ageEligibilityConfirmed) {
        nextErrors.ageEligibilityConfirmed = "Confirm the nominee meets the under-35 requirement.";
      }
    }

    if (currentStep === 4 && form.nominatorEmail && !/^\S+@\S+\.\S+$/.test(form.nominatorEmail)) {
      nextErrors.nominatorEmail = "Enter a valid email address.";
    }

    setErrors(nextErrors);
    const firstError = Object.keys(nextErrors)[0];
    if (firstError) {
      requestAnimationFrame(() => document.getElementById(firstError)?.focus());
    }
    return Object.keys(nextErrors).length === 0;
  }

  function nextStep() {
    if (!validateStep(step)) return;
    setStep((current) => Math.min(current + 1, 4));
    document.getElementById("nominate")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function previousStep() {
    setStep((current) => Math.max(current - 1, 1));
    setErrors({});
    setServerMessage("");
  }

  async function submitNomination(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateStep(4)) return;

    setStatus("submitting");
    setServerMessage("");

    try {
      const response = await fetch("/api/nominations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = (await response.json()) as {
        error?: string;
        reference?: string;
        fields?: Partial<Record<keyof FormState, string[]>>;
      };

      if (!response.ok) {
        if (result.fields) {
          const fieldErrors = Object.fromEntries(
            Object.entries(result.fields).map(([key, messages]) => [key, messages?.[0]]),
          );
          setErrors(fieldErrors);
        }
        throw new Error(result.error ?? "Unable to submit the nomination.");
      }

      setReference(result.reference ?? "API26-RECEIVED");
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setServerMessage(error instanceof Error ? error.message : "Unable to submit the nomination.");
    }
  }

  if (status === "success") {
    return (
      <section className="nomination-section" id="nominate">
        <div className="success-card">
          <div className="success-icon">
            <CheckCircle2 size={34} />
          </div>
          <p className="eyebrow">Nomination received</p>
          <h2>Thank you for putting excellence forward.</h2>
          <p>
            Your nomination has been recorded. Keep the reference below for future correspondence;
            the API team may contact you if the jury requires clarification.
          </p>
          <div className="reference-box">
            <span>Submission reference</span>
            <strong>{reference}</strong>
          </div>
          <button
            className="button button-dark"
            type="button"
            onClick={() => {
              setForm(initialForm);
              setStep(1);
              setStatus("idle");
            }}
          >
            Make another nomination
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="nomination-section" id="nominate">
      <div className="form-shell">
        <aside className="form-sidebar">
          <p className="eyebrow light">Official nomination form</p>
          <h2>Put excellence forward.</h2>
          <p>
            Your progress stays in this browser while the page remains open. Allow approximately
            5–7 minutes to complete the entry.
          </p>
          <ol className="step-list">
            {steps.map((label, index) => {
              const number = index + 1;
              return (
                <li className={number === step ? "active" : number < step ? "complete" : ""} key={label}>
                  <span>{number < step ? <Check size={14} /> : number}</span>
                  <div>
                    <small>Step {number}</small>
                    <strong>{label}</strong>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="privacy-note">
            <LockKeyhole size={17} />
            <span>Your entry is securely stored and accessible only to authorised reviewers.</span>
          </div>
        </aside>

        <form className="nomination-form" onSubmit={submitNomination} noValidate>
          <div className="mobile-progress" aria-label={`Step ${step} of 4`}>
            <span style={{ width: `${step * 25}%` }} />
          </div>

          {step === 1 && (
            <fieldset className="form-step">
              <legend>
                <span>01</span>
                Select the award
              </legend>
              <p className="step-intro">
                Choose the category most closely aligned with the nominee&apos;s strongest contribution.
              </p>
              <div className="category-options">
                {categories.map((category) => (
                  <label className={form.category === category.id ? "selected" : ""} key={category.id}>
                    <input
                      type="radio"
                      name="category"
                      value={category.id}
                      checked={form.category === category.id}
                      onChange={() => update("category", category.id)}
                    />
                    <span className="option-number">{category.number}</span>
                    <span className="option-copy">
                      <strong>{category.name}</strong>
                      <small>{category.description}</small>
                    </span>
                    <span className="radio-mark" />
                  </label>
                ))}
              </div>
              {errors.category && <p className="field-error standalone">{errors.category}</p>}

              <div className="field-group top-gap">
                <span className="group-label">Who are you nominating?</span>
                <div className="segmented-control">
                  <label>
                    <input
                      type="radio"
                      name="nominationType"
                      checked={form.nominationType === "self"}
                      onChange={() => update("nominationType", "self")}
                    />
                    <span>Myself / my organisation</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="nominationType"
                      checked={form.nominationType === "other"}
                      onChange={() => update("nominationType", "other")}
                    />
                    <span>Someone else</span>
                  </label>
                </div>
              </div>
            </fieldset>
          )}

          {step === 2 && (
            <fieldset className="form-step">
              <legend>
                <span>02</span>
                Tell us about the nominee
              </legend>
              <p className="step-intro">
                Use the nominee&apos;s professional details. We may use these to verify the entry.
              </p>

              <div className="field-group full-width">
                <label htmlFor="nomineeKind">Nominee type</label>
                <select
                  id="nomineeKind"
                  value={form.nomineeKind}
                  onChange={(event) => update("nomineeKind", event.target.value as FormState["nomineeKind"])}
                >
                  <option value="individual">Individual professional</option>
                  <option value="team">Team</option>
                  <option value="organisation">Organisation / publisher</option>
                  <option value="initiative">Programme / initiative</option>
                </select>
              </div>

              <div className="field-grid">
                <Field
                  id="nomineeName"
                  label={form.nomineeKind === "individual" ? "Nominee's full name" : "Nominee / initiative name"}
                  value={form.nomineeName}
                  onChange={(value) => update("nomineeName", value)}
                  error={errors.nomineeName}
                  required
                />
                <Field
                  id="nomineeOrganisation"
                  label="Organisation / publisher"
                  value={form.nomineeOrganisation}
                  onChange={(value) => update("nomineeOrganisation", value)}
                  error={errors.nomineeOrganisation}
                  required
                />
                <Field
                  id="nomineeRole"
                  label="Role / designation"
                  value={form.nomineeRole}
                  onChange={(value) => update("nomineeRole", value)}
                />
                <Field
                  id="nomineeCity"
                  label="City"
                  value={form.nomineeCity}
                  onChange={(value) => update("nomineeCity", value)}
                  error={errors.nomineeCity}
                  required
                />
                <Field
                  id="nomineeEmail"
                  label="Professional email"
                  type="email"
                  value={form.nomineeEmail}
                  onChange={(value) => update("nomineeEmail", value)}
                  error={errors.nomineeEmail}
                  required
                />
                <Field
                  id="nomineePhone"
                  label="Phone number"
                  type="tel"
                  value={form.nomineePhone}
                  onChange={(value) => update("nomineePhone", value)}
                  error={errors.nomineePhone}
                  required
                />
                <Field
                  id="nomineeWebsite"
                  label="Website or professional profile"
                  type="url"
                  placeholder="https://"
                  value={form.nomineeWebsite}
                  onChange={(value) => update("nomineeWebsite", value)}
                  error={errors.nomineeWebsite}
                />
                <Field
                  id="publicationTitle"
                  label="Publication / programme title"
                  hint="If the entry relates to a specific title or initiative"
                  value={form.publicationTitle}
                  onChange={(value) => update("publicationTitle", value)}
                />
                <Field
                  id="isbnOrIdentifier"
                  label="ISBN or public identifier"
                  value={form.isbnOrIdentifier}
                  onChange={(value) => update("isbnOrIdentifier", value)}
                />
              </div>
            </fieldset>
          )}

          {step === 3 && (
            <fieldset className="form-step">
              <legend>
                <span>03</span>
                Your nomination
              </legend>
              <p className="step-intro">
                Only the entry title is required. Add context or evidence if it is readily available.
              </p>

              <div className="field-grid one-column">
                <Field
                  id="entryTitle"
                  label="Entry title"
                  hint="A concise title that captures the work or contribution"
                  value={form.entryTitle}
                  onChange={(value) => update("entryTitle", value)}
                  error={errors.entryTitle}
                  required
                />
                <TextArea
                  id="caseForRecognition"
                  label="Why should this nominee be recognised?"
                  hint={`${selectedCategory?.prompt ?? "Share the nominee's most important contribution."} Skip this if you do not have the details.`}
                  value={form.caseForRecognition}
                  onChange={(value) => update("caseForRecognition", value)}
                  maxLength={2500}
                  rows={5}
                />
                <TextArea
                  id="measurableOutcomes"
                  label="A result or example"
                  hint="If available, share one metric, outcome, testimonial, or concrete example."
                  value={form.measurableOutcomes}
                  onChange={(value) => update("measurableOutcomes", value)}
                  maxLength={1500}
                  rows={4}
                />
              </div>

              <div className="field-grid">
                <Field
                  id="workPeriod"
                  label="Period of the work"
                  placeholder="e.g. April 2024 – March 2026"
                  value={form.workPeriod}
                  onChange={(value) => update("workPeriod", value)}
                />
                <Field
                  id="supportingLinks"
                  label="Supporting links"
                  hint="Separate multiple URLs with commas"
                  value={form.supportingLinks}
                  onChange={(value) => update("supportingLinks", value)}
                />
              </div>

              {form.category === "young_professional" && (
                <div className="eligibility-box">
                  <div className="field-group">
                    <label htmlFor="birthYear">
                      Nominee&apos;s year of birth <span className="optional-tag">Optional</span>
                    </label>
                    <input
                      id="birthYear"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="YYYY"
                      value={form.birthYear}
                      onChange={(event) => update("birthYear", event.target.value.replace(/\D/g, ""))}
                    />
                    <small>Optional; eligibility may be verified later.</small>
                  </div>
                  <Checkbox
                    id="ageEligibilityConfirmed"
                    checked={form.ageEligibilityConfirmed}
                    onChange={(checked) => update("ageEligibilityConfirmed", checked)}
                    error={errors.ageEligibilityConfirmed}
                    label="I confirm the nominee will be under 35 at the time of the August 2026 event."
                  />
                </div>
              )}
            </fieldset>
          )}

          {step === 4 && (
            <fieldset className="form-step">
              <legend>
                <span>04</span>
                Nominator &amp; declaration
              </legend>
              <p className="step-intro">
                Tell us who is submitting this entry, then review the declarations before sending.
              </p>

              <div className="review-banner">
                <div>
                  <span>{selectedCategory?.number}</span>
                  <p>
                    <small>Selected award</small>
                    <strong>{selectedCategory?.name}</strong>
                  </p>
                </div>
                <button type="button" onClick={() => setStep(1)}>
                  Change
                </button>
              </div>

              <div className="field-grid">
                <Field
                  id="nominatorName"
                  label="Your full name"
                  value={form.nominatorName}
                  onChange={(value) => update("nominatorName", value)}
                  error={errors.nominatorName}
                  required
                />
                <Field
                  id="nominatorOrganisation"
                  label="Your organisation"
                  value={form.nominatorOrganisation}
                  onChange={(value) => update("nominatorOrganisation", value)}
                  error={errors.nominatorOrganisation}
                  required
                />
                <Field
                  id="nominatorRole"
                  label="Your role / designation"
                  value={form.nominatorRole}
                  onChange={(value) => update("nominatorRole", value)}
                />
                <Field
                  id="relationshipToNominee"
                  label="Relationship to nominee"
                  placeholder="e.g. Self, manager, colleague"
                  value={form.relationshipToNominee}
                  onChange={(value) => update("relationshipToNominee", value)}
                  error={errors.relationshipToNominee}
                  required
                />
                <Field
                  id="nominatorEmail"
                  label="Your email"
                  type="email"
                  value={form.nominatorEmail}
                  onChange={(value) => update("nominatorEmail", value)}
                  error={errors.nominatorEmail}
                  required
                />
                <Field
                  id="nominatorPhone"
                  label="Your phone number"
                  type="tel"
                  value={form.nominatorPhone}
                  onChange={(value) => update("nominatorPhone", value)}
                  error={errors.nominatorPhone}
                  required
                />
              </div>

              <div className="field-group full-width top-gap">
                <label htmlFor="conflictDisclosure">
                  Conflict of interest disclosure <span className="optional-tag">Optional</span>
                </label>
                <textarea
                  id="conflictDisclosure"
                  rows={4}
                  maxLength={1200}
                  placeholder="Disclose any relationship that could reasonably be perceived as a conflict, or write ‘None’."
                  value={form.conflictDisclosure}
                  onChange={(event) => update("conflictDisclosure", event.target.value)}
                />
              </div>

              <div className="declarations">
                <Checkbox
                  id="accuracyConfirmed"
                  checked={form.accuracyConfirmed}
                  onChange={(checked) => update("accuracyConfirmed", checked)}
                  error={errors.accuracyConfirmed}
                  label="I confirm that the information in this nomination is accurate to the best of my knowledge."
                />
                <Checkbox
                  id="consentConfirmed"
                  checked={form.consentConfirmed}
                  onChange={(checked) => update("consentConfirmed", checked)}
                  error={errors.consentConfirmed}
                  label="I am authorised to submit this nomination and consent to API processing these details for award administration and jury review."
                />
              </div>

              <div className="honeypot" aria-hidden="true">
                <label htmlFor="websiteConfirm">Leave this field empty</label>
                <input
                  id="websiteConfirm"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.websiteConfirm}
                  onChange={(event) => update("websiteConfirm", event.target.value)}
                />
              </div>

              {status === "error" && (
                <div className="form-alert" role="alert">
                  <CircleAlert size={18} />
                  <span>{serverMessage}</span>
                </div>
              )}
            </fieldset>
          )}

          <div className="form-actions">
            {step > 1 ? (
              <button className="button button-ghost" type="button" onClick={previousStep}>
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <span />
            )}
            {step < 4 ? (
              <button className="button button-dark" type="button" onClick={nextStep}>
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button className="button button-dark" type="submit" disabled={status === "submitting"}>
                {status === "submitting" ? (
                  <>
                    <LoaderCircle className="spin" size={17} /> Submitting
                  </>
                ) : (
                  <>
                    Submit nomination <ArrowRight size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  required,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="field-group">
      <label htmlFor={id}>
        {label}{" "}
        {required ? (
          <span aria-hidden="true">*</span>
        ) : (
          <span className="optional-tag">Optional</span>
        )}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint && !error && <small id={`${id}-hint`}>{hint}</small>}
      {error && (
        <small className="field-error" id={`${id}-error`}>
          {error}
        </small>
      )}
    </div>
  );
}

function TextArea({
  id,
  label,
  hint,
  error,
  required,
  value,
  onChange,
  maxLength,
  rows,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  rows: number;
}) {
  return (
    <div className="field-group full-width">
      <div className="label-row">
        <label htmlFor={id}>
          {label}{" "}
          {required ? (
            <span aria-hidden="true">*</span>
          ) : (
            <span className="optional-tag">Optional</span>
          )}
        </label>
        <CharacterCount value={value} max={maxLength} />
      </div>
      <textarea
        id={id}
        rows={rows}
        maxLength={maxLength}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : `${id}-hint`}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint && !error && <small id={`${id}-hint`}>{hint}</small>}
      {error && (
        <small className="field-error" id={`${id}-error`}>
          {error}
        </small>
      )}
    </div>
  );
}

function Checkbox({
  id,
  checked,
  onChange,
  label,
  error,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  error?: string;
}) {
  return (
    <div className="checkbox-wrap">
      <label className="checkbox-label" htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          aria-invalid={Boolean(error)}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="custom-checkbox">{checked && <Check size={13} />}</span>
        <span>{label}</span>
      </label>
      {error && <small className="field-error">{error}</small>}
    </div>
  );
}
