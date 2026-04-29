import { useEffect, useState } from 'react';
import styles from './PromiseCard.module.css';

const DAYS_TO_MS = 86400000;

export const STATUS = {
  pending: { label: 'Active', color: '#4FC3F7', bg: 'rgba(79,195,247,0.10)' },
  KEPT: { label: 'Kept', color: '#4CAF82', bg: 'rgba(76,175,130,0.10)' },
  BROKEN: { label: 'Broken', color: '#E05252', bg: 'rgba(224,82,82,0.10)' },
};

export default function PromiseCard({
  promise,
  showNavigateToDetails = false,
  showPromiserId = false,
  showDateAdded = false,
}) {
  const [dateAddedStr, setDateAddedStr] = useState('');
  const [daysLeftNum, setDaysLeftNum] = useState(0);

  const status = promise.status || 'pending';
  const cfg = STATUS[status] || STATUS.pending;

  const navigateToDetailPage = () => {
    console.log('Navigate to Promise Detail — wired in Epic 3');
  };

  useEffect(() => {
    if (showDateAdded) {
      // Formatting createdAt with Date
      const dateAdded = new Date(promise.createdAt);

      // Calculating days left
      const timeline = new Date();
      timeline.setTime(dateAdded.getTime() + promise.timeline * DAYS_TO_MS);
      const msLeft = timeline.getTime() - Date.now();

      setDateAddedStr(dateAdded.toDateString());
      setDaysLeftNum(msLeft <= 0 ? 0 : Math.ceil(msLeft / DAYS_TO_MS));
    }
  }, [showDateAdded, promise.timeline, promise.createdAt]);

  return (
    <div
      className={showNavigateToDetails ? styles.selectableCard : styles.card}
      onClick={showNavigateToDetails ? navigateToDetailPage : () => {}}
    >
      <div className={styles.cardAccent} style={{ background: cfg.color }} />
      <div className={styles.cardBody}>
        <div className={styles.cardTopRow}>
          <div className={styles.cardMeta}>
            <span className={styles.domain}>{promise.domain}</span>
            {showPromiserId && (
              <>
                <span className={styles.arrow}>→</span>
                <span className={styles.promisee}>{promise.promiseeScope}</span>
              </>
            )}
          </div>
          <span
            className={styles.badge}
            style={{ color: cfg.color, background: cfg.bg }}
          >
            {cfg.label}
          </span>
        </div>
        <div className={styles.objective}>{promise.objective}</div>
        <div className={styles.cardBottomRow}>
          <div className={styles.cardFooterLeft}>
            <span className={styles.stakeChip}>
              <span className={styles.stakeIcon}>
                {promise.stake.type === 'financial' ? '$' : '◎'}
              </span>
              {promise.stake.type === 'financial'
                ? `$${promise.stake.amount} deposited`
                : 'Reputation deposited'}
            </span>
            {showDateAdded && (
              <span className={styles.createdAt}>Created {dateAddedStr}</span>
            )}
          </div>
          <span
            className={
              daysLeftNum < 7 ? styles.daysUrgent : styles.daysRemaining
            }
          >
            {daysLeftNum}d left
          </span>
        </div>
      </div>
    </div>
  );
}
