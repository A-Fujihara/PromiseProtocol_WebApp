import { useState } from 'react';
import { createPromise } from '../services/api';
import styles from './CreatePromise.module.css';

const INITIAL_FORM = {
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

    if (!form.objective.trim()) nextErrors.objective = 'Commitment objective is required.';
    if (!form.promiseeName.trim()) nextErrors.promiseeName = 'Commitment recipient is required.';
    if (!form.promiseeScope) nextErrors.promiseeScope = 'Commitment scope is required.';
    if (!form.domain.trim()) nextErrors.domain = 'Domain is required.';

    const daysNumber = Number(form.days);
    if (!form.days || Number.isNaN(daysNumber) || !Number.isInteger(daysNumber) || daysNumber <= 0) {
      nextErrors.days = 'Timeline must be a positive whole number of days.';
    }

    if (!form.successCriteria.trim()) {
      nextErrors.successCriteria = 'Success criteria is required.';
    }

    if (form.stakeType === 'financial') {
      const amountNumber = Number(form.stakeAmount);
      if (!form.stakeAmount || Number.isNaN(amountNumber) || amountNumber <= 0) {
        nextErrors.stakeAmount = 'Financial deposit amount must be a positive number.';
      }
    }

    return nextErrors;
  };

  const buildPayload = () => {
    const payload = {
      promiserId: CURRENT_USER,
      promiseeScope: form.promiseeScope,
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
      await createPromise(buildPayload());
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
        <p className={styles.subheading}>Record your commitment details below.</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <label htmlFor="objective">Commitment objective</label>
          <input
            id="objective"
            name="objective"
            value={form.objective}
            onChange={handleChange}
            aria-invalid={Boolean(errors.objective)}
          />
          {errors.objective && <p className={styles.error}>{errors.objective}</p>}

          <label htmlFor="promiseeName">Commitment recipient name</label>
          <input
            id="promiseeName"
            name="promiseeName"
            value={form.promiseeName}
            onChange={handleChange}
            aria-invalid={Boolean(errors.promiseeName)}
          />
          {errors.promiseeName && <p className={styles.error}>{errors.promiseeName}</p>}

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
          {errors.promiseeScope && <p className={styles.error}>{errors.promiseeScope}</p>}

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
          {errors.successCriteria && <p className={styles.error}>{errors.successCriteria}</p>}

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
              {errors.stakeAmount && <p className={styles.error}>{errors.stakeAmount}</p>}
            </>
          )}

          <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Commitment'}
          </button>
        </form>

        {submitSuccess && <p className={styles.success}>{submitSuccess}</p>}
        {submitError && <p className={styles.error}>{submitError}</p>}
      </main>
    </div>
  );
}
