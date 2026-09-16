import { useState } from 'react';
import { logOutcome } from '../services/api';
import styles from './LogOutcome.module.css';

const CURRENT_USER = 'dev_user_001'; // Epic 4 Auth stub

// PP-B2: the five behavior outcomes from SelfTrust.VALID_OUTCOMES, given
// plain-language, non-shameful labels. failed_but_noticed in particular
// must read as a normal, selectable choice - not a warning or an error -
// so it gets no different treatment here or in the CSS from the other four.
const OUTCOME_OPTIONS = [
  { value: 'kept', label: 'I did it' },
  { value: 'partially_kept', label: 'I did part of it' },
  {
    value: 'failed_but_noticed',
    label: "I missed it but I'm logging it honestly",
  },
  { value: 'forgotten', label: 'I forgot' },
  { value: 'renegotiated', label: 'I changed the commitment' },
];

export default function LogOutcome({
  promiseId,
  userId = CURRENT_USER,
  onLogged,
}) {
  const [selected, setSelected] = useState('');
  const [note, setNote] = useState('');
  const [attachmentRef, setAttachmentRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const handleSelect = (value) => {
    setSelected(value);
    setSubmitError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selected) {
      setSubmitError('Choose what happened before logging it.');
      setSubmitSuccess('');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    // Only the network call is inside try/catch, so a throw from an
    // onLogged callback (a parent component's own bug) is never mistaken
    // for a failed submission - the outcome was already persisted by then.
    const payload = { promiseId, outcome: selected, userId };
    const trimmedNote = note.trim();
    if (trimmedNote) payload.note = trimmedNote;
    const trimmedAttachment = attachmentRef.trim();
    if (trimmedAttachment) payload.attachmentRef = trimmedAttachment;

    let result;
    try {
      result = await logOutcome(payload);
    } catch {
      setSubmitError('Failed to log this check-in. Please try again.');
      setIsSubmitting(false);
      return;
    }

    setSubmitSuccess('Check-in logged.');
    setSelected('');
    setNote('');
    setAttachmentRef('');
    setIsSubmitting(false);
    onLogged?.(result);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>What happened?</legend>
        {OUTCOME_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={styles.option}
            data-selected={selected === option.value}
          >
            <input
              type="radio"
              name="outcome"
              value={option.value}
              checked={selected === option.value}
              onChange={(event) => handleSelect(event.target.value)}
            />
            {option.label}
          </label>
        ))}
      </fieldset>

      <label htmlFor="note" className={styles.fieldLabel}>
        Note (optional)
      </label>
      <textarea
        id="note"
        rows="3"
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />

      <label htmlFor="attachmentRef" className={styles.fieldLabel}>
        Attachment (optional)
      </label>
      <input
        id="attachmentRef"
        type="text"
        placeholder="filename.jpg"
        value={attachmentRef}
        onChange={(event) => setAttachmentRef(event.target.value)}
      />

      <button
        className={styles.submitButton}
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Logging...' : 'Log check-in'}
      </button>

      {submitSuccess && (
        <p className={styles.success} role="status" aria-live="polite">
          {submitSuccess}
        </p>
      )}
      {submitError && (
        <p className={styles.error} role="alert">
          {submitError}
        </p>
      )}
    </form>
  );
}
