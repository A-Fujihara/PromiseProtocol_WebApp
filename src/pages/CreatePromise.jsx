import { useState } from 'react';
import { createPromise, createSelfPromise } from '../services/api';
import styles from './CreatePromise.module.css';

const MODE_ASSESSED = 'assessed';
const MODE_SELF = 'self';

const INITIAL_FORM = {
  mode: MODE_ASSESSED,
  objective: '',
  promiseeName: '',
  promiseeScope: '',
  domain: '',
  days: '',
  successCriteria: '',
  stakeType: 'reputational',
  stakeAmount: '',
};

const CURRENT_USER = 'dev_user_001';

export default function CreatePromise() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'stakeType' && value === 'reputational'
        ? { stakeAmount: '' }
        : {}),
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSubmitError('');
  };

  const validate = () => {
    const nextErrors = {};
    const isSelf = form.mode === MODE_SELF;

    if (!form.objective.trim())
      nextErrors.objective = 'Commitment objective is required.';

    if (!isSelf) {
      if (!form.promiseeName.trim())
        nextErrors.promiseeName = 'Commitment recipient is required.';
      if (!form.promiseeScope)
        nextErrors.promiseeScope = 'Commitment scope is required.';
    }

    if (!form.domain.trim()) nextErrors.domain = 'Domain is required.';

    const daysNumber = Number(form.days);
    if (
      !form.days ||
      Number.isNaN(daysNumber) ||
      !Number.isInteger(daysNumber) ||
      daysNumber <= 0
    ) {
      nextErrors.days = 'Timeline must be a positive whole number of days.';
    }

    if (!form.successCriteria.trim()) {
      nextErrors.successCriteria = 'Success criteria is required.';
    }

    if (!isSelf && form.stakeType === 'financial') {
      const amountNumber = Number(form.stakeAmount);
      if (
        !form.stakeAmount ||
        Number.isNaN(amountNumber) ||
        amountNumber <= 0
      ) {
        nextErrors.stakeAmount =
          'Financial deposit amount must be a positive number.';
      }
    }

    return nextErrors;
  };

  const buildAssessedPayload = () => {
    // PP-031: promiseeName is included in the payload as a frontend stub.
    // The backend does not currently store this field but will silently ignore it.
    // Full backend support is deferred to Sprint 4.
    const payload = {
      promiserId: CURRENT_USER,
      promiseeScope: form.promiseeScope,
      promiseeName: form.promiseeName.trim(),
      domain: form.domain.trim(),
      objective: form.objective.trim(),
      days: Number(form.days),
      successCriteria: form.successCriteria.trim(),
      stake: {
        type: form.stakeType,
      },
    };

    if (form.stakeType === 'financial') {
      payload.stake.amount = Number(form.stakeAmount);
    }

    return payload;
  };

  // PP-B1: a self-promise carries no promisee info and no stake - nothing
  // about who it's "to" or what's staked is collected or sent. promiseeScope
  // is still required by the backend model regardless of kind, so it's fixed
  // to "self" here rather than exposed as a user choice.
  const buildSelfPayload = () => ({
    promiserId: CURRENT_USER,
    promiseeScope: 'self',
    domain: form.domain.trim(),
    objective: form.objective.trim(),
    days: Number(form.days),
    successCriteria: form.successCriteria.trim(),
    kind: MODE_SELF,
    visibility: 'private',
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      if (form.mode === MODE_SELF) {
        await createSelfPromise(buildSelfPayload());
      } else {
        await createPromise(buildAssessedPayload());
      }
      setSubmitSuccess('Commitment created successfully.');
      setErrors({});
      setForm(INITIAL_FORM);
    } catch {
      setSubmitError('Failed to create commitment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.card}>
        <h1 className={styles.heading}>Create Commitment</h1>
        <p className={styles.subheading}>
          Record your commitment details below.
        </p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <fieldset className={styles.fieldset}>
            <legend>Promise type</legend>
            <label className={styles.inlineOption}>
              <input
                type="radio"
                name="mode"
                value={MODE_ASSESSED}
                checked={form.mode === MODE_ASSESSED}
                onChange={handleChange}
              />
              Assessed promise
            </label>
            <label className={styles.inlineOption}>
              <input
                type="radio"
                name="mode"
                value={MODE_SELF}
                checked={form.mode === MODE_SELF}
                onChange={handleChange}
              />
              Promise to myself
            </label>
          </fieldset>

          <label htmlFor="objective">Commitment objective</label>
          <input
            id="objective"
            name="objective"
            value={form.objective}
            onChange={handleChange}
            aria-invalid={Boolean(errors.objective)}
          />
          {errors.objective && (
            <p className={styles.error}>{errors.objective}</p>
          )}

          {form.mode !== MODE_SELF && (
            <>
              <label htmlFor="promiseeName">Commitment recipient name</label>
              <input
                id="promiseeName"
                name="promiseeName"
                value={form.promiseeName}
                onChange={handleChange}
                aria-invalid={Boolean(errors.promiseeName)}
              />
              {errors.promiseeName && (
                <p className={styles.error}>{errors.promiseeName}</p>
              )}

              <label htmlFor="promiseeScope">Commitment scope</label>
              <select
                id="promiseeScope"
                name="promiseeScope"
                value={form.promiseeScope}
                onChange={handleChange}
                aria-invalid={Boolean(errors.promiseeScope)}
              >
                <option value="" disabled>
                  Select commitment scope
                </option>
                <option value="self">Self</option>
                <option value="individual">Individual</option>
                <option value="organization">Organization</option>
                <option value="public">Public</option>
              </select>
              {errors.promiseeScope && (
                <p className={styles.error}>{errors.promiseeScope}</p>
              )}
            </>
          )}

          <label htmlFor="domain">Domain</label>
          <input
            id="domain"
            name="domain"
            value={form.domain}
            onChange={handleChange}
            aria-invalid={Boolean(errors.domain)}
          />
          {errors.domain && <p className={styles.error}>{errors.domain}</p>}

          <label htmlFor="days">Timeline (days)</label>
          <input
            id="days"
            name="days"
            type="number"
            min="1"
            value={form.days}
            onChange={handleChange}
            aria-invalid={Boolean(errors.days)}
          />
          {errors.days && <p className={styles.error}>{errors.days}</p>}

          <label htmlFor="successCriteria">Success criteria</label>
          <textarea
            id="successCriteria"
            name="successCriteria"
            rows="4"
            value={form.successCriteria}
            onChange={handleChange}
            aria-invalid={Boolean(errors.successCriteria)}
          />
          {errors.successCriteria && (
            <p className={styles.error}>{errors.successCriteria}</p>
          )}

          {form.mode !== MODE_SELF && (
            <>
              <fieldset className={styles.fieldset}>
                <legend>Deposit type</legend>
                <label className={styles.inlineOption}>
                  <input
                    type="radio"
                    name="stakeType"
                    value="reputational"
                    checked={form.stakeType === 'reputational'}
                    onChange={handleChange}
                  />
                  Reputational
                </label>
                <label className={styles.inlineOption}>
                  <input
                    type="radio"
                    name="stakeType"
                    value="financial"
                    checked={form.stakeType === 'financial'}
                    onChange={handleChange}
                  />
                  Financial
                </label>
              </fieldset>

              {form.stakeType === 'financial' && (
                <>
                  <label htmlFor="stakeAmount">Deposit amount</label>
                  <input
                    id="stakeAmount"
                    name="stakeAmount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.stakeAmount}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.stakeAmount)}
                  />
                  {errors.stakeAmount && (
                    <p className={styles.error}>{errors.stakeAmount}</p>
                  )}
                </>
              )}
            </>
          )}

          {form.mode === MODE_SELF && (
            // This checkbox is just a preview of a future feature - it doesn't work yet.
            // It's grayed out on purpose and clicking it does nothing.
            <label
              className={`${styles.inlineOption} ${styles.disabledOption}`}
              title="Coming soon"
            >
              <input type="checkbox" disabled />
              Make public
            </label>
          )}

          <button
            className={styles.submitButton}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Commitment'}
          </button>
        </form>

        {submitSuccess && <p className={styles.success}>{submitSuccess}</p>}
        {submitError && <p className={styles.error}>{submitError}</p>}
      </main>
    </div>
  );
}
