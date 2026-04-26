import { useState, useEffect } from 'react';
import { getPromises, getAssessments } from '../services/api';
import styles from './PromiseDetail.module.css';

// Epic 3 note: replace with useParams() from React Router
// Epic 3 note: replace promiseId prop with route param

const STATUS = {
  pending: { label: 'Active', color: '#4FC3F7', bg: 'rgba(79,195,247,0.10)' },
  KEPT: { label: 'Kept', color: '#4CAF82', bg: 'rgba(76,175,130,0.10)' },
  BROKEN: { label: 'Broken', color: '#E05252', bg: 'rgba(224,82,82,0.10)' },
};

export default function PromiseDetail({ promiseId }) {
  const [promise, setPromise] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [allPromises, allAssessments] = await Promise.all([
          getPromises(),
          getAssessments(),
        ]);

        const matched = allPromises.find((p) => p.id === promiseId);

        if (!matched) {
          setNotFound(true);
          return;
        }

        const linkedAssessments = allAssessments.filter(
          (a) => a.promiseId === promiseId
        );

        setPromise(matched);
        setAssessments(linkedAssessments);
      } catch (err) {
        setError('Failed to load promise details. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    if (promiseId) {
      fetchData();
    }
  }, [promiseId]);

  if (loading) {
    return (
      <div className={styles.centered}>
        <p className={styles.mutedText}>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.centered}>
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className={styles.centered}>
        <p className={styles.notFound}>Promise not found.</p>
      </div>
    );
  }

  const status = promise.status || 'pending';
  const cfg = STATUS[status] || STATUS.pending;

  const stakeDisplay =
    promise.stake.type === 'financial'
      ? `$${promise.stake.amount}`
      : 'Reputation';

  const timelineDisplay =
    status === 'pending'
      ? '--' // Epic 3 stub: days remaining calculation pending clarification
      : 'Closed';

  const createdAtDisplay = new Date(promise.createdAt).toLocaleDateString(
    'en-US',
    { month: 'short', day: 'numeric', year: 'numeric' }
  );

  return (
    <div className={styles.container}>
      {/* Back navigation — Epic 3: replace with useNavigate() */}
      <button
        className={styles.backButton}
        onClick={() =>
          console.log('Navigate back to My Promises — wired in Epic 3')
        }
      >
        ← Back to Promises
      </button>

      <div className={styles.content}>
        {/* Promise Card */}
        <div className={styles.promiseCard}>
          <div className={styles.statusBar} style={{ background: cfg.color }} />
          <div className={styles.promiseCardBody}>
            <div className={styles.promiseCardHeader}>
              <div className={styles.domainRow}>
                <span className={styles.domain}>{promise.domain}</span>
                <span className={styles.arrow}>→</span>
                <span className={styles.promisee}>{promise.promiseeScope}</span>
              </div>
              <span
                className={styles.badge}
                style={{ color: cfg.color, background: cfg.bg }}
              >
                {cfg.label}
              </span>
            </div>

            <div className={styles.objective}>{promise.objective}</div>

            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <div className={styles.metaLabel}>Created</div>
                <div className={styles.metaValue}>{createdAtDisplay}</div>
              </div>
              <div className={styles.metaItem}>
                <div className={styles.metaLabel}>Timeline</div>
                <div className={styles.metaValue}>{timelineDisplay}</div>
              </div>
              <div className={styles.metaItem}>
                <div className={styles.metaLabel}>Deposit</div>
                <div className={styles.metaValue}>{stakeDisplay}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Assessments Card */}
        <div className={styles.assessmentsCard}>
          <div className={styles.assessmentsHeader}>Assessments</div>
          {assessments.length === 0 ? (
            <div className={styles.emptyAssessments}>
              No assessments yet. This promise is still active.
            </div>
          ) : (
            assessments.map((a) => {
              const aCfg = STATUS[a.judgment] || STATUS.pending;
              const aDate = new Date(a.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              return (
                <div key={a.id} className={styles.assessmentRow}>
                  <div>
                    <div className={styles.assessorName}>{a.assessorId}</div>
                    <div className={styles.assessmentDate}>{aDate}</div>
                  </div>
                  <span
                    className={styles.badge}
                    style={{ color: aCfg.color, background: aCfg.bg }}
                  >
                    {aCfg.label}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Submit Assessment CTA — Epic 3: wire navigation to PP-012 */}
        {status === 'pending' && (
          <div className={styles.ctaCard}>
            <div>
              <div className={styles.ctaTitle}>Ready to assess?</div>
              <div className={styles.ctaSubtitle}>
                Submit a verdict when this commitment is fulfilled or broken.
              </div>
            </div>
            <button
              className={styles.ctaButton}
              onClick={() =>
                console.log('Navigate to Submit Assessment — wired in Epic 3')
              }
            >
              Submit Assessment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
