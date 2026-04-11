import styles from './RecentPromiseCard.module.css';

const STATUS = {
  pending: { label: 'Active', color: '#4FC3F7', bg: 'rgba(79,195,247,0.10)' },
  KEPT: { label: 'Kept', color: '#4CAF82', bg: 'rgba(76,175,130,0.10)' },
  BROKEN: { label: 'Broken', color: '#E05252', bg: 'rgba(224,82,82,0.10)' },
};

export default function RecentPromiseCard({ promise }) {
  const status = promise.status || 'pending';
  const cfg = STATUS[status] || STATUS.pending;

  return (
    <div className={styles.card}>
      <div className={styles.statusBar} style={{ background: cfg.color }} />
      <div className={styles.content}>
        <div className={styles.cardHeader}>
          <span className={styles.domain}>{promise.domain}</span>
          <span
            className={styles.badge}
            style={{ color: cfg.color, background: cfg.bg }}
          >
            {cfg.label}
          </span>
        </div>
        <div className={styles.objective}>{promise.objective}</div>
        <span className={styles.stakeChip}>
          <span className={styles.stakeIcon}>
            {promise.stake.type === 'financial' ? '$' : '◎'}
          </span>
          {promise.stake.type === 'financial'
            ? `$${promise.stake.amount} deposited`
            : 'Reputation deposited'}
        </span>
      </div>
    </div>
  );
}
