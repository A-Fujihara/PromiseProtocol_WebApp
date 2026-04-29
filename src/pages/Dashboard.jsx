import { useState, useEffect } from 'react';
import { getPromises, getAssessments } from '../services/api';
import PromiseCard from '../components/PromiseCard';
import styles from './Dashboard.module.css';

const CURRENT_USER = 'dev_user_001'; // Epic 4 Auth stub

export default function Dashboard() {
  const [promises, setPromises] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [allPromises, allAssessments] = await Promise.all([
          getPromises(),
          getAssessments(),
        ]);

        // Filter to current user's promises only
        const myPromises = allPromises.filter(
          (p) => p.promiserId === CURRENT_USER
        );
        const myPromiseIds = myPromises.map((p) => p.id);

        // Filter assessments to only those against the current user's promises
        const myAssessments = allAssessments.filter((a) =>
          myPromiseIds.includes(a.promiseId)
        );

        setPromises(myPromises);
        setAssessments(myAssessments);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const keptCount = assessments.filter((a) => a.judgment === 'KEPT').length;
  const brokenCount = assessments.filter((a) => a.judgment === 'BROKEN').length;
  const totalCount = promises.length;

  const recent = [...promises]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  // Derive status from assessments for each recent promise
  const recentWithDerivedStatus = recent.map((promise) => {
    const linkedAssessment = assessments.find(
      (a) => a.promiseId === promise.id
    );
    return {
      ...promise,
      status: linkedAssessment ? linkedAssessment.judgment : promise.status,
    };
  });

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

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>Good morning, Jordan.</h1>
          <p className={styles.subheading}>Here's your commitment activity.</p>
        </div>
        <button
          className={styles.newPromiseButton}
          onClick={() =>
            console.log('Navigate to Create Promise — wired in Epic 3')
          }
        >
          + New Commitment
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>REP SCORE</div>
          <div className={`${styles.statValue} ${styles.statValueDefault}`}>
            --
          </div>
          <div className={styles.statSub}>Pending algorithm</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>TOTAL MADE</div>
          <div className={`${styles.statValue} ${styles.statValueDefault}`}>
            {totalCount}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>KEPT</div>
          <div className={`${styles.statValue} ${styles.statValueGreen}`}>
            {keptCount}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>BROKEN</div>
          <div className={`${styles.statValue} ${styles.statValueRed}`}>
            {brokenCount}
          </div>
        </div>
      </div>

      {/* Recent Promises */}
      <div className={styles.recentCard}>
        <div className={styles.recentHeader}>
          <span className={styles.recentTitle}>Recent Commitments</span>
          <button
            className={styles.viewAll}
            onClick={() =>
              console.log('Navigate to My Promises — wired in Epic 3')
            }
          >
            View all →
          </button>
        </div>

        {promises.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.mutedText}>
              No commitments yet. Create your first one!
            </p>
          </div>
        ) : (
          recentWithDerivedStatus.map((promise) => (
            <PromiseCard key={promise.id} promise={promise} />
          ))
        )}
      </div>
    </div>
  );
}
