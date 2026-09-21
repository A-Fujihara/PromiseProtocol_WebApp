import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getPromises,
  getAssessments,
  getSelfTrust,
  getOutcomes,
} from '../services/api';
import SelfTrustScore from '../components/SelfTrustScore';
import LogOutcome from '../components/LogOutcome';
import styles from './PromiseDetail.module.css';

const CURRENT_USER = 'dev_user_001'; // Epic 4 Auth stub

const STATUS = {
  pending: {
    label: 'Active',
    color: 'var(--pp-accent)',
    bg: 'var(--pp-accent-dim)',
  },
  KEPT: {
    label: 'Kept',
    color: 'var(--pp-green)',
    bg: 'var(--pp-green-dim)',
  },
  BROKEN: {
    label: 'Broken',
    color: 'var(--pp-red)',
    bg: 'var(--pp-red-dim)',
  },
};

// PP-B3: same plain-language, non-shameful labels as LogOutcome (PP-B2) -
// failed_but_noticed must read identically to the other four here too, not
// just at submission time.
const OUTCOME_LABELS = {
  kept: 'Did it',
  partially_kept: 'Did part of it',
  failed_but_noticed: 'Missed it, logged honestly',
  forgotten: 'Forgot',
  renegotiated: 'Changed the commitment',
};

export default function PromiseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [promise, setPromise] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [selfTrust, setSelfTrust] = useState(null);
  const [outcomes, setOutcomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [refreshError, setRefreshError] = useState(null);
  // PP-B3/PP-B3-fix: one generation counter for the whole page load, not
  // just the self-promise branch, so navigating to an assessed or missing
  // promise still invalidates a slower, still-in-flight self-promise fetch
  // left over from the previous route - that branch never calls
  // fetchSelfPromiseData itself, so a guard scoped only to that function
  // would never advance and would miss this case.
  const requestSeqRef = useRef(0);

  // PP-B3: pulled out so it can be re-run standalone after a new check-in is
  // logged, without re-fetching the promise itself or flipping loading/error
  // state for what's just a background refresh. Takes the caller's sequence
  // number rather than minting its own, so it shares one generation counter
  // with the route-level load.
  const fetchSelfPromiseData = useCallback(
    async (seq) => {
      let trustData, outcomeData;
      try {
        [trustData, outcomeData] = await Promise.all([
          getSelfTrust(id, CURRENT_USER),
          getOutcomes(id, CURRENT_USER),
        ]);
      } catch (err) {
        // Only the most recent request's failure is worth surfacing - an
        // older, superseded request failing after a newer one already
        // succeeded (or after the route moved on) isn't a real problem for
        // what's on screen.
        if (seq === requestSeqRef.current) {
          throw err;
        }
        return;
      }

      // A newer request started (and possibly already finished) since this
      // one began - discard these now-stale results rather than apply them.
      if (seq !== requestSeqRef.current) {
        return;
      }

      setSelfTrust(trustData);
      setOutcomes(outcomeData);
    },
    [id]
  );

  useEffect(() => {
    // PP-B3-fix: PromiseDetail is reused across /promises/:id navigations
    // (React doesn't remount it just because the route param changed), so
    // without this, navigating away from a not-found/error page leaves the
    // new page stuck on that state, and self-to-self navigation can show the
    // previous promise's score/history until the new fetch resolves.
    setLoading(true);
    setError(null);
    setNotFound(false);
    setPromise(null);
    setAssessments([]);
    setSelfTrust(null);
    setOutcomes([]);
    setRefreshError(null);

    const seq = ++requestSeqRef.current;

    async function fetchData() {
      try {
        const allPromises = await getPromises(CURRENT_USER);
        if (seq !== requestSeqRef.current) return;

        const matched = allPromises.find((p) => p.id === id);

        if (!matched) {
          setNotFound(true);
          return;
        }

        setPromise(matched);

        // PP-B3: branch by kind - self-promises get their live score and
        // check-in history, assessed promises keep the existing assessment
        // flow untouched (per AC regression requirement).
        if (matched.kind === 'self') {
          await fetchSelfPromiseData(seq);
        } else {
          const allAssessments = await getAssessments();
          if (seq !== requestSeqRef.current) return;
          const linkedAssessments = allAssessments.filter(
            (a) => a.promiseId === id
          );
          setAssessments(linkedAssessments);
        }
      } catch (err) {
        if (seq === requestSeqRef.current) {
          setError('Failed to load promise details. Please try again.');
        }
      } finally {
        if (seq === requestSeqRef.current) {
          setLoading(false);
        }
      }
    }

    fetchData();
  }, [id, fetchSelfPromiseData]);

  // PP-B3: the "money moment" from the user story - re-fetch score and
  // history immediately after a check-in is logged, so the update is visible
  // without navigating away and back. The check-in itself already succeeded
  // by the time this runs (LogOutcome only calls onLogged after its own POST
  // resolves), so a failure here is just the refresh, not a lost check-in.
  // Caught explicitly rather than left to reject silently, so the screen
  // shows a warning instead of quietly displaying a stale score/history.
  const handleOutcomeLogged = async () => {
    const seq = ++requestSeqRef.current;
    setRefreshError(null);
    try {
      await fetchSelfPromiseData(seq);
    } catch {
      if (seq === requestSeqRef.current) {
        setRefreshError(
          'Check-in saved, but the score and history could not be refreshed. Reload the page to see the latest.'
        );
      }
    }
  };

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

  const isSelf = promise.kind === 'self';
  const status = promise.status || 'pending';
  const cfg = STATUS[status] || STATUS.pending;

  const stakeDisplay = !promise.stake
    ? 'No deposit'
    : promise.stake.type === 'financial'
      ? `$${promise.stake.amount}`
      : 'Reputation';

  const timelineDisplay = status === 'pending' ? '--' : 'Closed';

  const createdAtDisplay = new Date(promise.createdAt).toLocaleDateString(
    'en-US',
    { month: 'short', day: 'numeric', year: 'numeric' }
  );

  return (
    <div className={styles.container}>
      <button
        className={styles.backButton}
        onClick={() => navigate('/promises')}
      >
        ← Back to Promises
      </button>

      <div className={styles.content}>
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
              <div className={styles.metaItem}>
                <div className={styles.metaLabel}>Promised To</div>
                <div className={styles.metaValue}>
                  {promise.promiseeName || '--'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {isSelf ? (
          <>
            <div className={styles.selfTrustCard}>
              <SelfTrustScore
                score={selfTrust?.score}
                count={selfTrust?.count}
              />
            </div>

            <div className={styles.assessmentsCard}>
              <div className={styles.assessmentsHeader}>Check-in History</div>
              {outcomes.length === 0 ? (
                <div className={styles.emptyAssessments}>
                  No check-ins yet. Log one below when you're ready.
                </div>
              ) : (
                outcomes.map((o) => {
                  const oDate = new Date(o.createdAt).toLocaleDateString(
                    'en-US',
                    { month: 'short', day: 'numeric', year: 'numeric' }
                  );
                  return (
                    <div key={o.id} className={styles.assessmentRow}>
                      <div>
                        <div className={styles.assessorName}>
                          {OUTCOME_LABELS[o.outcome] || o.outcome}
                        </div>
                        <div className={styles.assessmentDate}>{oDate}</div>
                      </div>
                      {o.note && (
                        <span className={styles.outcomeNote}>{o.note}</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {refreshError && (
              <div className={styles.refreshWarning} role="alert">
                {refreshError}
              </div>
            )}

            <div className={styles.logOutcomeCard}>
              <div className={styles.assessmentsHeader}>Log a Check-in</div>
              <div className={styles.logOutcomeBody}>
                <LogOutcome
                  promiseId={id}
                  userId={CURRENT_USER}
                  onLogged={handleOutcomeLogged}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className={styles.assessmentsCard}>
              <div className={styles.assessmentsHeader}>Assessments</div>
              {assessments.length === 0 ? (
                <div className={styles.emptyAssessments}>
                  No assessments yet. This promise is still active.
                </div>
              ) : (
                assessments.map((a) => {
                  const aCfg = STATUS[a.judgment] || STATUS.pending;
                  const aDate = new Date(a.createdAt).toLocaleDateString(
                    'en-US',
                    { month: 'short', day: 'numeric', year: 'numeric' }
                  );
                  return (
                    <div key={a.id} className={styles.assessmentRow}>
                      <div>
                        <div className={styles.assessorName}>
                          {a.assessorId}
                        </div>
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

            {status === 'pending' && (
              <div className={styles.ctaCard}>
                <div>
                  <div className={styles.ctaTitle}>Ready to assess?</div>
                  <div className={styles.ctaSubtitle}>
                    Submit a verdict when this commitment is fulfilled or
                    broken.
                  </div>
                </div>
                <button
                  className={styles.ctaButton}
                  onClick={() => navigate('/create')}
                >
                  Submit Assessment
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
