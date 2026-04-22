import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPromises, getAssessments } from '../services/api';
import styles from './PublicProfile.module.css';

export default function PublicProfile() {
  const { promiserId } = useParams();
  
  const [data, setData] = useState({
    promises: [],
    breakdown: { active: 0, kept: 0, broken: 0 },
    keptRate: '--'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchProfileData() {
      try {
        const [allPromises, allAssessments] = await Promise.all([
          getPromises(),
          getAssessments(),
        ]);

        // Filter data to only this user [cite: 209]
        const userPromises = allPromises.filter(p => p.promiserId === promiserId);
        const userPromiseIds = userPromises.map(p => p.id);
        const userAssessments = allAssessments.filter(a => userPromiseIds.includes(a.promiseId));

        // Derive Breakdown [cite: 220, 233]
        const active = userPromises.filter(p => p.status === 'pending').length;
        const kept = userPromises.filter(p => p.status === 'KEPT').length;
        const broken = userPromises.filter(p => p.status === 'BROKEN').length;

        // Calculate Kept Rate % [cite: 211, 219, 232]
        const totalAssessments = userAssessments.length;
        const keptAssessments = userAssessments.filter(a => a.judgment === 'KEPT').length;
        const keptRate = totalAssessments > 0 
          ? Math.round((keptAssessments / totalAssessments) * 100) + '%'
          : '--';

        setData({ promises: userPromises, breakdown: { active, kept, broken }, keptRate });
      } catch (err) {
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    }
    if (promiserId) fetchProfileData();
  }, [promiserId]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className={styles.centered}>Loading...</div>;
  if (error) return <div className={styles.centered}>{error}</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Profile: {promiserId}</h1>
        <button className={styles.copyBtn} onClick={handleCopyLink}>
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </header>

      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.label}>Reputation Score</span>
          <span className={styles.value}>--</span> {/* stubbed per AC [cite: 212] */}
        </div>
        <div className={styles.statCard}>
          <span className={styles.label}>Kept Rate</span>
          <span className={styles.value}>{data.keptRate}</span>
        </div>
      </section>

      <div className={styles.breakdownLabel}>Promise Breakdown</div>
      <section className={styles.breakdownGrid}>
        <div className={styles.statCard}>
          <span className={styles.label}>Active</span>
          <span className={styles.value}>{data.breakdown.active}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.label}>Kept</span>
          <span className={styles.value}>{data.breakdown.kept}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.label}>Broken</span>
          <span className={styles.value}>{data.breakdown.broken}</span>
        </div>
      </section>
    </div>
  );
}