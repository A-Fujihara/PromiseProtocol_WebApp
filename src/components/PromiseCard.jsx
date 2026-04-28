import styles from './PromiseCard.module.css';

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
  const status = promise.status || 'pending';
  const cfg = STATUS[status] || STATUS.pending;

  const navigateToDetailPage = () => {
    console.log('Navigate to Promise Detail — wired in Epic 3');
  };

  return (
    <div
      className={showNavigateToDetails ? styles.selectableCard : styles.card}
      onClick={showNavigateToDetails && navigateToDetailPage}
    >
      <div className={styles.statusBar} style={{ background: cfg.color }} />
      <div className={styles.content}>
        <div className={styles.cardHeader}>
          <div className={styles.domainRow}>
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
        <span className={styles.stakeChip}>
          <span className={styles.stakeIcon}>
            {promise.stake.type === 'financial' ? '$' : '◎'}
          </span>
          {promise.stake.type === 'financial'
            ? `$${promise.stake.amount} deposited`
            : 'Reputation deposited'}
        </span>
        {showDateAdded && (
          <span className={styles.dateAdded}>Created {promise.createdAt}</span>
        )}
      </div>
    </div>
  );
}
