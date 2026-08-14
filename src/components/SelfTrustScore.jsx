import styles from './SelfTrustScore.module.css';

// Range thresholds for the low/mid/high visual treatment.
// score is 0-100; anything below LOW_MAX reads as low, at/above HIGH_MIN reads as high.
const LOW_MAX = 40;
const HIGH_MIN = 70;

function getRange(score) {
  if (score < LOW_MAX) return 'low';
  if (score >= HIGH_MIN) return 'high';
  return 'mid';
}

const RANGE_LABEL = {
  low: 'Needs attention',
  mid: 'Building',
  high: 'Strong',
};

export default function SelfTrustScore({ score = 50, count = 0 }) {
  const range = getRange(score);

  return (
    <div className={styles.container} data-range={range}>
      <div className={styles.scoreRow}>
        <span className={styles.score}>{score}</span>
        <span className={styles.scoreMax}>/100</span>
      </div>
      <div className={styles.label}>Self-Trust Score</div>
      <div className={styles.meta}>
        <span className={styles.rangeTag}>{RANGE_LABEL[range]}</span>
        <span className={styles.divider}>·</span>
        <span className={styles.count}>
          {count} check-in{count === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  );
}
