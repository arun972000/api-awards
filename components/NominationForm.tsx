'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleAlert,
  FileText,
  Inbox,
  LockKeyhole,
  Send,
  Upload,
  X,
} from 'lucide-react';
import AwardTerms from '@/components/AwardTerms';
import { awardDates } from '@/lib/awardContent';
import { categories, type CategoryId } from '@/lib/categories';
import { countWords, nominationSchema } from '@/lib/validation';

type FormState = {
  category: CategoryId | '';
  nomineeKind: 'individual' | 'organisation' | 'team';
  nomineeName: string;
  entryTitle: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  briefDescription: string;
  impactOutcomes: string;
  meritRecognition: string;
  supportingUrl: string;
  ageEligibilityConfirmed: boolean;
  submitterIsContact: boolean;
  personCompletingForm: string;
  goodFaithAccurate: boolean;
  goodFaithResponsibility: boolean;
  goodFaithAuthority: boolean;
  goodFaithClarification: boolean;
  goodFaithDisqualification: boolean;
  goodFaithIpRights: boolean;
  indiaEligibilityConfirmed: boolean;
  publicityConfirmed: boolean;
  termsAccepted: boolean;
  websiteConfirm: string;
};

const initialForm: FormState = {
  category: '',
  nomineeKind: 'individual',
  nomineeName: '',
  entryTitle: '',
  contactPerson: '',
  contactEmail: '',
  contactPhone: '',
  briefDescription: '',
  impactOutcomes: '',
  meritRecognition: '',
  supportingUrl: '',
  ageEligibilityConfirmed: false,
  submitterIsContact: true,
  personCompletingForm: '',
  goodFaithAccurate: false,
  goodFaithResponsibility: false,
  goodFaithAuthority: false,
  goodFaithClarification: false,
  goodFaithDisqualification: false,
  goodFaithIpRights: false,
  indiaEligibilityConfirmed: false,
  publicityConfirmed: false,
  termsAccepted: false,
  websiteConfirm: '',
};

const steps = ['Award', 'Nominee', 'Nomination', 'Declaration'];
const allowedFileTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
] as const;
const maxFileSize = 4 * 1024 * 1024;

const requiredByStep: Record<number, (keyof FormState)[]> = {
  1: ['category'],
  2: ['nomineeKind', 'nomineeName', 'entryTitle', 'contactPerson', 'contactEmail'],
  3: ['briefDescription', 'impactOutcomes', 'meritRecognition'],
  4: [
    'goodFaithAccurate',
    'goodFaithResponsibility',
    'goodFaithAuthority',
    'goodFaithClarification',
    'goodFaithDisqualification',
    'goodFaithIpRights',
    'indiaEligibilityConfirmed',
    'publicityConfirmed',
    'termsAccepted',
  ],
};

const readableFieldNames: Partial<Record<keyof FormState, string>> = {
  category: 'an award category',
  nomineeName: 'the nominee name',
  entryTitle: 'the initiative or contribution title',
  contactPerson: 'a contact person',
  contactEmail: 'a contact email',
  contactPhone: 'a valid 10-digit phone number',
  briefDescription: 'a brief description',
  impactOutcomes: 'the impact or outcomes',
  meritRecognition: 'why the nomination merits recognition',
  personCompletingForm: 'the name of the person completing the form',
  goodFaithAccurate: 'Accurate and complete information',
  goodFaithResponsibility: 'Responsibility for submitted information',
  goodFaithAuthority: 'Authority and required permissions',
  goodFaithClarification: 'API clarification and verification',
  goodFaithDisqualification: 'Disqualification for misrepresentation',
  goodFaithIpRights: 'Third-party rights confirmation',
  indiaEligibilityConfirmed: 'India delivery confirmation',
  publicityConfirmed: 'Finalist participation and publicity consent',
  termsAccepted: 'Terms and Conditions acceptance',
};

const fieldSteps: Partial<Record<keyof FormState, number>> = {
  category: 1,
  nomineeKind: 2,
  nomineeName: 2,
  entryTitle: 2,
  contactPerson: 2,
  contactEmail: 2,
  contactPhone: 2,
  ageEligibilityConfirmed: 2,
  briefDescription: 3,
  impactOutcomes: 3,
  meritRecognition: 3,
  supportingUrl: 3,
  submitterIsContact: 4,
  personCompletingForm: 4,
  goodFaithAccurate: 4,
  goodFaithResponsibility: 4,
  goodFaithAuthority: 4,
  goodFaithClarification: 4,
  goodFaithDisqualification: 4,
  goodFaithIpRights: 4,
  indiaEligibilityConfirmed: 4,
  publicityConfirmed: 4,
  termsAccepted: 4,
};

function normaliseFieldErrors(
  fieldErrors: Partial<Record<keyof FormState, string[] | string | undefined>>,
) {
  return Object.fromEntries(
    Object.entries(fieldErrors)
      .map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
      .filter((entry): entry is [string, string] => Boolean(entry[1])),
  ) as Partial<Record<keyof FormState, string>>;
}

function WordCount({ value, max }: { value: string; max: number }) {
  const words = countWords(value);
  return (
    <span className={words > max ? 'character-count over' : 'character-count'}>
      {words.toLocaleString('en-IN')} / {max.toLocaleString('en-IN')} words
    </span>
  );
}

function displaySubmissionDate() {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

export default function NominationForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [supportingFile, setSupportingFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [serverMessage, setServerMessage] = useState('');
  const [reference, setReference] = useState('');
  const [confirmationEmailSent, setConfirmationEmailSent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const successCardRef = useRef<HTMLDivElement>(null);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === form.category),
    [form.category],
  );
  const activeErrors = Object.entries(errors).filter(
    (entry): entry is [keyof FormState, string] => Boolean(entry[1]),
  );

  useEffect(() => {
    if (status !== 'success') return;
    successCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    successCardRef.current?.focus({ preventScroll: true });
  }, [status]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    if (status === 'error') {
      setStatus('idle');
      setServerMessage('');
    }
  }

  function goToField(field: keyof FormState) {
    setStep(fieldSteps[field] ?? 4);
    window.setTimeout(() => {
      const element = document.getElementById(field);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element?.focus({ preventScroll: true });
    }, 80);
  }

  function showSubmissionErrors(
    nextErrors: Partial<Record<keyof FormState, string>>,
    message = 'Please correct the highlighted information before submitting.',
  ) {
    setErrors(nextErrors);
    setStatus('error');
    setServerMessage(message);
    const firstField = Object.keys(nextErrors)[0] as keyof FormState | undefined;
    if (firstField) goToField(firstField);
  }

  function validateStep(currentStep: number) {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    const requiredFields = [...requiredByStep[currentStep]];
    if (currentStep === 4 && !form.submitterIsContact) {
      requiredFields.push('personCompletingForm');
    }
    for (const field of requiredFields) {
      const value = form[field];
      if (value === '' || value === false) {
        nextErrors[field] = `Please provide ${readableFieldNames[field] ?? 'this confirmation'}.`;
      }
    }
    if (currentStep === 2) {
      if (form.nomineeName.trim().length > 0 && form.nomineeName.trim().length < 2) {
        nextErrors.nomineeName = 'Enter the nominee name.';
      }
      if (form.entryTitle.trim().length > 0 && form.entryTitle.trim().length < 5) {
        nextErrors.entryTitle = 'Enter a clear initiative, project or contribution title.';
      }
      if (form.contactPerson.trim().length > 0 && form.contactPerson.trim().length < 2) {
        nextErrors.contactPerson = 'Enter the contact person name.';
      }
      if (form.contactEmail && !/^\S+@\S+\.\S+$/.test(form.contactEmail)) {
        nextErrors.contactEmail = 'Enter a valid email address.';
      }
      if (form.contactPhone && !/^\d{10}$/u.test(form.contactPhone)) {
        nextErrors.contactPhone = 'Enter a 10-digit phone number using numbers only.';
      }
      if (form.category === 'young_professional' && !form.ageEligibilityConfirmed) {
        nextErrors.ageEligibilityConfirmed =
          'Confirm the nominee will be under 35 on ' + awardDates.nominationsClose + '.';
      }
    }
    if (currentStep === 3) {
      const wordLimits = [
        ['briefDescription', 300],
        ['impactOutcomes', 150],
        ['meritRecognition', 150],
      ] as const;
      for (const [field, maximum] of wordLimits) {
        if (countWords(form[field]) > maximum) {
          nextErrors[field] = `Keep this response to ${maximum} words or fewer.`;
        }
      }
      if (form.supportingUrl && !/^https?:\/\//i.test(form.supportingUrl)) {
        nextErrors.supportingUrl = 'Include https:// at the start of the URL.';
      }
      if (form.supportingUrl && supportingFile) {
        nextErrors.supportingUrl = 'Choose either one supporting URL or one file, not both.';
      }
      if (fileError) return false;
    }
    setErrors(nextErrors);
    const firstError = Object.keys(nextErrors)[0];
    if (firstError) {
      goToField(firstError as keyof FormState);
    }
    return Object.keys(nextErrors).length === 0;
  }

  function nextStep() {
    if (!validateStep(step)) return;
    setStep((current) => Math.min(current + 1, 4));
    document.getElementById('nominate')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function previousStep() {
    setStep((current) => Math.max(current - 1, 1));
    setErrors({});
    setStatus('idle');
    setServerMessage('');
  }

  function chooseSupportingFile(file: File | undefined) {
    setFileError('');
    if (!file) {
      setSupportingFile(null);
      return;
    }
    if (!allowedFileTypes.includes(file.type as (typeof allowedFileTypes)[number])) {
      setSupportingFile(null);
      setFileError('Upload a PDF, Word document, JPG or PNG file.');
      return;
    }
    if (file.size > maxFileSize) {
      setSupportingFile(null);
      setFileError('The supporting file must be 4 MB or smaller.');
      return;
    }
    setSupportingFile(file);
  }

  function removeSupportingFile() {
    setSupportingFile(null);
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function submitNomination(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      ...form,
      personCompletingForm: form.submitterIsContact
        ? form.contactPerson
        : form.personCompletingForm,
    };
    const clientValidation = nominationSchema.safeParse(payload);
    if (!clientValidation.success) {
      showSubmissionErrors(
        normaliseFieldErrors(clientValidation.error.flatten().fieldErrors),
        'A few details still need attention. We have taken you to the first one.',
      );
      return;
    }
    if (fileError || (supportingFile && form.supportingUrl)) {
      showSubmissionErrors(
        { supportingUrl: fileError || 'Choose either one supporting URL or one file, not both.' },
        'Please review the supporting material before submitting.',
      );
      return;
    }

    setStatus('submitting');
    setServerMessage('');
    try {
      const requestBody = new FormData();
      requestBody.set('nomination', JSON.stringify(payload));
      if (supportingFile) requestBody.set('supportingFile', supportingFile);
      const response = await fetch('/api/nominations', { method: 'POST', body: requestBody });
      const result = (await response.json()) as {
        error?: string;
        reference?: string;
        confirmationEmailSent?: boolean;
        fields?: Partial<Record<keyof FormState, string[]>>;
      };
      if (!response.ok) {
        if (result.fields) {
          showSubmissionErrors(
            normaliseFieldErrors(result.fields),
            'A few details still need attention. We have taken you to the first one.',
          );
          return;
        }
        throw new Error(result.error ?? 'Unable to submit the nomination.');
      }
      setReference(result.reference ?? 'API26-RECEIVED');
      setConfirmationEmailSent(result.confirmationEmailSent === true);
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setServerMessage(error instanceof Error ? error.message : 'Unable to submit the nomination.');
    }
  }

  if (status === 'success') {
    return (
      <section className='nomination-section' id='nominate'>
        <div
          ref={successCardRef}
          className='success-card'
          role='status'
          aria-live='polite'
          tabIndex={-1}
        >
          <div className='success-icon'><CheckCircle2 size={34} /></div>
          <p className='eyebrow'>Nomination received</p>
          <h2>Thank you for your nomination.</h2>
          {confirmationEmailSent ? (
            <>
              <p>
                Your nomination has been recorded and a confirmation email has been sent to{' '}
                <strong>{form.contactEmail}</strong>. Keep this reference for correspondence. A
                withdrawal request may be made in writing to API within two calendar days of
                submission.
              </p>
              <div className='spam-note'>
                <Inbox size={18} />
                <span>
                  Our confirmation sometimes arrives in the spam or junk folder. If it is not in
                  your inbox within a few minutes, please do look there and mark it as{' '}
                  <strong>Not spam</strong> — that way our future updates will reach you safely.
                  Thank you.
                </span>
              </div>
            </>
          ) : (
            <p>
              Your nomination has been recorded, but we could not send the confirmation email.
              Please keep this reference for correspondence. A withdrawal request may be made in
              writing to API within two calendar days of submission.
            </p>
          )}
          <div className='reference-box'>
            <span>Submission reference</span>
            <strong>{reference}</strong>
          </div>
          <button
            className='button button-dark'
            type='button'
            onClick={() => {
              setForm(initialForm);
              setSupportingFile(null);
              setConfirmationEmailSent(false);
              setStep(1);
              setStatus('idle');
            }}
          >
            Make another nomination
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className='nomination-section' id='nominate'>
      <div className='form-shell'>
        <aside className='form-sidebar'>
          <p className='eyebrow light'>Official nomination form</p>
          <h2>Complete your nomination</h2>
          <p>
            Work through four short steps covering the nominee, their contribution, supporting
            information and the required declarations.
          </p>
          <div className='form-deadline'>
            <CalendarDays size={17} />
            <span>Nominations close<strong>{awardDates.nominationsClose}</strong></span>
          </div>
          <ol className='step-list'>
            {steps.map((label, index) => {
              const number = index + 1;
              return (
                <li className={number === step ? 'active' : number < step ? 'complete' : ''} key={label}>
                  <span>{number < step ? <Check size={14} /> : number}</span>
                  <div><small>Step {number}</small><strong>{label}</strong></div>
                </li>
              );
            })}
          </ol>
          <div className='privacy-note'>
            <LockKeyhole size={17} />
            <span>Your entry and any supporting file are private to authorised reviewers.</span>
          </div>
        </aside>

        <form className='nomination-form' onSubmit={submitNomination} noValidate>
          <div className='mobile-deadline'>
            <CalendarDays size={17} />
            <span>Nominations close <strong>{awardDates.nominationsClose}</strong></span>
          </div>
          <div className='mobile-step-copy'>
            <span>Step {step} of 4</span>
            <strong>{steps[step - 1]}</strong>
          </div>
          <div className='mobile-progress' aria-label={`Step ${step} of 4`}>
            <span style={{ width: `${step * 25}%` }} />
          </div>

          {step === 1 && (
            <fieldset className='form-step'>
              <legend><span>01</span>Select the award</legend>
              <p className='step-intro'>
                Choose the category that most closely reflects the contribution being recognised.
                Submit a separate nomination if the same nominee is entered in another category.
              </p>
              <div className='eligibility-notice'>
                <CalendarDays size={19} />
                <p>
                  <strong>Eligibility period</strong>
                  Work must have been undertaken, implemented or substantially delivered in India
                  between {awardDates.eligibilityStarts} and {awardDates.nominationsClose}.
                </p>
              </div>
              <div className='category-options'>
                {categories.map((category) => (
                  <label className={form.category === category.id ? 'selected' : ''} key={category.id}>
                    <input
                      type='radio'
                      name='category'
                      value={category.id}
                      checked={form.category === category.id}
                      onChange={() => update('category', category.id)}
                    />
                    <span className='option-number'>{category.number}</span>
                    <span className='option-copy'>
                      <strong>{category.name}</strong>
                      <small>{category.description}</small>
                    </span>
                    <span className='radio-mark' />
                  </label>
                ))}
              </div>
              {errors.category && <p className='field-error standalone'>{errors.category}</p>}
            </fieldset>
          )}

          {step === 2 && (
            <fieldset className='form-step'>
              <legend><span>02</span>Nominee information</legend>
              <p className='step-intro'>
                Provide one contact person who API may approach to verify or clarify the entry.
              </p>
              <div className='field-group full-width'>
                <label htmlFor='nomineeKind'>Nominee type</label>
                <select
                  id='nomineeKind'
                  value={form.nomineeKind}
                  onChange={(event) =>
                    update('nomineeKind', event.target.value as FormState['nomineeKind'])
                  }
                >
                  <option value='individual'>Individual</option>
                  <option value='organisation'>Organisation / publisher</option>
                  <option value='team'>Team</option>
                </select>
              </div>
              <div className='field-grid'>
                <Field
                  id='nomineeName'
                  label='Name of nominee / organisation / team'
                  value={form.nomineeName}
                  onChange={(value) => update('nomineeName', value)}
                  error={errors.nomineeName}
                  maxLength={180}
                  required
                />
                <Field
                  id='entryTitle'
                  label='Initiative, project or contribution title'
                  value={form.entryTitle}
                  onChange={(value) => update('entryTitle', value)}
                  error={errors.entryTitle}
                  maxLength={220}
                  required
                />
                <Field
                  id='contactPerson'
                  label='Contact person'
                  value={form.contactPerson}
                  onChange={(value) => update('contactPerson', value)}
                  error={errors.contactPerson}
                  maxLength={160}
                  autoComplete='name'
                  required
                />
                <Field
                  id='contactEmail'
                  label='Contact email address'
                  type='email'
                  value={form.contactEmail}
                  onChange={(value) => update('contactEmail', value)}
                  error={errors.contactEmail}
                  maxLength={200}
                  autoComplete='email'
                  inputMode='email'
                  hint='We will send the nomination receipt and submission reference to this address.'
                  required
                />
                <Field
                  id='contactPhone'
                  label='Phone number'
                  type='tel'
                  value={form.contactPhone}
                  onChange={(value) => update('contactPhone', value.replace(/\D/gu, '').slice(0, 10))}
                  error={errors.contactPhone}
                  maxLength={10}
                  autoComplete='tel'
                  inputMode='numeric'
                  pattern='[0-9]{10}'
                  hint='Enter a 10-digit number.'
                />
              </div>
              {form.category === 'young_professional' && (
                <div className='eligibility-box single-confirmation'>
                  <Checkbox
                    id='ageEligibilityConfirmed'
                    checked={form.ageEligibilityConfirmed}
                    onChange={(checked) => update('ageEligibilityConfirmed', checked)}
                    error={errors.ageEligibilityConfirmed}
                    label={'I confirm the nominee will be under 35 years of age as of ' + awardDates.nominationsClose + '.'}
                  />
                </div>
              )}
            </fieldset>
          )}

          {step === 3 && (
            <fieldset className='form-step'>
              <legend><span>03</span>The nomination</legend>
              <p className='step-intro'>
                Give the Jury a concise account of the work, its impact and why it represents
                excellence in the selected category.
              </p>
              <div className='field-grid one-column'>
                <TextArea
                  id='briefDescription'
                  label='Brief description'
                  hint='Describe what was done and the context in which it was undertaken.'
                  value={form.briefDescription}
                  onChange={(value) => update('briefDescription', value)}
                  error={errors.briefDescription}
                  maxWords={300}
                  maxLength={3500}
                  rows={7}
                  required
                />
                <TextArea
                  id='impactOutcomes'
                  label='Impact / outcomes'
                  hint='Include relevant reach, adoption, engagement, efficiency, beneficiaries, quality or environmental outcomes. Qualitative evidence is welcome where metrics do not apply.'
                  value={form.impactOutcomes}
                  onChange={(value) => update('impactOutcomes', value)}
                  error={errors.impactOutcomes}
                  maxWords={150}
                  maxLength={2000}
                  rows={5}
                  required
                />
                <TextArea
                  id='meritRecognition'
                  label='Why does it merit recognition?'
                  hint={selectedCategory?.prompt ?? 'Explain what distinguishes this nomination.'}
                  value={form.meritRecognition}
                  onChange={(value) => update('meritRecognition', value)}
                  error={errors.meritRecognition}
                  maxWords={150}
                  maxLength={2000}
                  rows={5}
                  required
                />
              </div>
              <div className='supporting-material'>
                <div>
                  <span className='group-label'>
                    Supporting material <span className='optional-tag'>Optional</span>
                  </span>
                  <p>
                    Add one relevant URL or upload one PDF, Word document, JPG or PNG file. Maximum
                    file size: 4 MB.
                  </p>
                </div>
                <Field
                  id='supportingUrl'
                  label='Supporting URL'
                  type='url'
                  placeholder='https://'
                  value={form.supportingUrl}
                  onChange={(value) => update('supportingUrl', value)}
                  error={errors.supportingUrl}
                  maxLength={500}
                  inputMode='url'
                />
                <div className='file-field'>
                  <label className='file-picker' htmlFor='supportingFile'>
                    <Upload size={18} />
                    <span>{supportingFile ? 'Replace supporting file' : 'Choose a supporting file'}</span>
                  </label>
                  <input
                    ref={fileInputRef}
                    id='supportingFile'
                    type='file'
                    accept='.pdf,.doc,.docx,.jpg,.jpeg,.png'
                    onChange={(event) => chooseSupportingFile(event.target.files?.[0])}
                  />
                  {supportingFile ? (
                    <div className='selected-file'>
                      <FileText size={17} />
                      <span>
                        <strong>{supportingFile.name}</strong>
                        <small>{(supportingFile.size / 1024 / 1024).toFixed(2)} MB</small>
                      </span>
                      <button type='button' onClick={removeSupportingFile} aria-label='Remove supporting file'>
                        <X size={16} />
                      </button>
                    </div>
                  ) : null}
                  {fileError ? <small className='field-error'>{fileError}</small> : null}
                </div>
              </div>
            </fieldset>
          )}

          {step === 4 && (
            <fieldset className='form-step'>
              <legend><span>04</span>Declaration &amp; consent</legend>
              <p className='step-intro'>
                Review the submission identity and confirm each declaration before sending.
              </p>
              <div className='review-banner'>
                <div>
                  <span>{selectedCategory?.number}</span>
                  <p><small>Selected award</small><strong>{selectedCategory?.name}</strong></p>
                </div>
                <button type='button' onClick={() => setStep(1)}>Change</button>
              </div>
              <div className='submission-review'>
                <div>
                  <small>Nominee</small>
                  <strong>{form.nomineeName}</strong>
                  <span>{form.entryTitle}</span>
                </div>
                <div>
                  <small>Contact person</small>
                  <strong>{form.contactPerson}</strong>
                  <span>{form.contactEmail}</span>
                </div>
                <div>
                  <small>Submission date</small>
                  <strong>{displaySubmissionDate()}</strong>
                  <span>Awards ceremony: {awardDates.ceremony}</span>
                </div>
              </div>
              <div className='person-completing'>
                <Checkbox
                  id='submitterIsContact'
                  checked={form.submitterIsContact}
                  onChange={(checked) => update('submitterIsContact', checked)}
                  label={`I am ${form.contactPerson || 'the contact person'} and I am completing this form.`}
                />
                {!form.submitterIsContact ? (
                  <Field
                    id='personCompletingForm'
                    label='Person completing the form'
                    value={form.personCompletingForm}
                    onChange={(value) => update('personCompletingForm', value)}
                    error={errors.personCompletingForm}
                    maxLength={160}
                    autoComplete='name'
                    required
                  />
                ) : null}
              </div>
              <div className='declaration-group'>
                <div className='declaration-heading'>
                  <span>Good-faith declaration</span>
                  <p>Confirm every statement below.</p>
                </div>
                <div className='declaration-checks'>
                  <Checkbox
                    id='goodFaithAccurate'
                    checked={form.goodFaithAccurate}
                    onChange={(checked) => update('goodFaithAccurate', checked)}
                    error={errors.goodFaithAccurate}
                    label='The information is submitted in good faith and is accurate, complete and not misleading to the best of my knowledge.'
                  />
                  <Checkbox
                    id='goodFaithResponsibility'
                    checked={form.goodFaithResponsibility}
                    onChange={(checked) => update('goodFaithResponsibility', checked)}
                    error={errors.goodFaithResponsibility}
                    label='I accept responsibility for the information, claims and materials submitted.'
                  />
                  <Checkbox
                    id='goodFaithAuthority'
                    checked={form.goodFaithAuthority}
                    onChange={(checked) => update('goodFaithAuthority', checked)}
                    error={errors.goodFaithAuthority}
                    label='I have the authority and permissions required to submit this information and supporting material.'
                  />
                  <Checkbox
                    id='goodFaithClarification'
                    checked={form.goodFaithClarification}
                    onChange={(checked) => update('goodFaithClarification', checked)}
                    error={errors.goodFaithClarification}
                    label='I understand that API may seek clarification or verification of any information submitted.'
                  />
                  <Checkbox
                    id='goodFaithDisqualification'
                    checked={form.goodFaithDisqualification}
                    onChange={(checked) => update('goodFaithDisqualification', checked)}
                    error={errors.goodFaithDisqualification}
                    label='I understand that misrepresentation or material inaccuracies may lead to disqualification or withdrawal of recognition.'
                  />
                  <Checkbox
                    id='goodFaithIpRights'
                    checked={form.goodFaithIpRights}
                    onChange={(checked) => update('goodFaithIpRights', checked)}
                    error={errors.goodFaithIpRights}
                    label='The submission does not knowingly infringe any third-party intellectual-property, privacy or confidentiality rights.'
                  />
                  <Checkbox
                    id='indiaEligibilityConfirmed'
                    checked={form.indiaEligibilityConfirmed}
                    onChange={(checked) => update('indiaEligibilityConfirmed', checked)}
                    error={errors.indiaEligibilityConfirmed}
                    label='I confirm that the nominated work was undertaken, implemented or substantially delivered in India.'
                  />
                </div>
              </div>
              <div className='declaration-group'>
                <div className='declaration-heading'>
                  <span>Finalist participation and publicity</span>
                  <p>Required for consideration.</p>
                </div>
                <div className='declaration-checks'>
                  <Checkbox
                    id='publicityConfirmed'
                    checked={form.publicityConfirmed}
                    onChange={(checked) => update('publicityConfirmed', checked)}
                    error={errors.publicityConfirmed}
                    label='If shortlisted, I consent to the nominee being recognised as a finalist, participating in awards-related communications and publicity, and attending the awards ceremony wherever possible.'
                  />
                </div>
              </div>
              <details className='terms-disclosure' id='terms'>
                <summary>Read the API Excellence Awards 2026 Terms &amp; Conditions</summary>
                <AwardTerms />
              </details>
              <div className='terms-confirmation'>
                <Checkbox
                  id='termsAccepted'
                  checked={form.termsAccepted}
                  onChange={(checked) => update('termsAccepted', checked)}
                  error={errors.termsAccepted}
                  label='I have read, understood and agree to the API Excellence Awards 2026 Terms & Conditions.'
                />
              </div>
              <div className='honeypot' aria-hidden='true'>
                <label htmlFor='websiteConfirm'>Leave this field blank</label>
                <input
                  id='websiteConfirm'
                  name='websiteConfirm'
                  tabIndex={-1}
                  autoComplete='off'
                  value={form.websiteConfirm}
                  onChange={(event) => update('websiteConfirm', event.target.value)}
                />
              </div>
            </fieldset>
          )}

          {status === 'error' ? (
            <FormErrorSummary
              message={serverMessage}
              errors={activeErrors}
              onSelect={goToField}
            />
          ) : null}

          <div className='form-actions'>
            {step > 1 ? (
              <button type='button' className='button-secondary' onClick={previousStep} disabled={status === 'submitting'}>
                <ArrowLeft size={18} /> Back
              </button>
            ) : <span />}
            {step < 4 ? (
              <button type='button' className='button-primary' onClick={nextStep}>
                Continue <ArrowRight size={18} />
              </button>
            ) : (
              <button type='submit' className='button-primary' disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Submitting...' : 'Submit nomination'}
                {status !== 'submitting' ? <Send size={18} /> : null}
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

function FormErrorSummary({
  message,
  errors,
  onSelect,
}: {
  message: string;
  errors: [keyof FormState, string][];
  onSelect: (field: keyof FormState) => void;
}) {
  return (
    <div className='submit-error' role='alert' aria-live='assertive'>
      <CircleAlert size={21} aria-hidden='true' />
      <div>
        <strong>Let&apos;s finish this nomination</strong>
        <p>{message || 'Please review the highlighted information and try again.'}</p>
        {errors.length ? (
          <ul>
            {errors.map(([field, error]) => (
              <li key={field}>
                <button type='button' onClick={() => onSelect(field)}>
                  <span>{readableFieldNames[field] ?? 'Required information'}</span>
                  <small>{error}</small>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  maxLength?: number;
  autoComplete?: string;
  inputMode?: 'text' | 'email' | 'tel' | 'url' | 'numeric';
  pattern?: string;
  hint?: string;
};

function Field({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  required,
  maxLength,
  autoComplete,
  inputMode,
  pattern,
  hint,
}: FieldProps) {
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>
        {label} {required ? <span className='required-mark'>*</span> : <span className='optional-tag'>Optional</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete={autoComplete}
        inputMode={inputMode}
        pattern={pattern}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={
          [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined
        }
      />
      {hint ? <small id={`${id}-hint`} className='field-hint'>{hint}</small> : null}
      {error ? <small id={`${id}-error`} className='field-error'>{error}</small> : null}
    </div>
  );
}

type TextAreaProps = FieldProps & {
  hint: string;
  maxWords: number;
  maxLength: number;
  rows: number;
};

function TextArea({ id, label, hint, value, onChange, error, required, maxWords, maxLength, rows }: TextAreaProps) {
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <div className='textarea-label'>
        <label htmlFor={id}>
          {label} {required ? <span className='required-mark'>*</span> : <span className='optional-tag'>Optional</span>}
        </label>
        <WordCount value={value} max={maxWords} />
      </div>
      <textarea
        id={id}
        value={value}
        rows={rows}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`}
      />
      <small id={`${id}-hint`} className='field-hint'>{hint}</small>
      {error ? <small id={`${id}-error`} className='field-error'>{error}</small> : null}
    </div>
  );
}

type CheckboxProps = {
  id: keyof FormState;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  error?: string;
};

function Checkbox({ id, checked, onChange, label, error }: CheckboxProps) {
  return (
    <div className={`checkbox-field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>
        <input
          id={id}
          type='checkbox'
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <span className='custom-checkbox' aria-hidden='true'><Check size={14} /></span>
        <span>{label}</span>
      </label>
      {error ? <small id={`${id}-error`} className='field-error'>{error}</small> : null}
    </div>
  );
}
