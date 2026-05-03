import { useState, useEffect } from 'react';
import { getPromises, getAssessments } from '../services/api';
import styles from './PublicProfile.module.css';

export default function PublicProfile({ promiserId }) {
  const [promises, setPromises] = useState([]);
  const [breakdown, setBreakdown] = useState({ active: 0, kept: 0, broken: 0 });
  const [keptRate, setKeptRate] = useState('--');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchProfileData() {
      try {
        const [allPromises, allAssessments] = await Promise.all([
          getPromises(),
          getAssessments(),
        ]); // Filter to current user's promises only

        const userPromises = allPromises.filter(
          (p) => p.promiserId === promiserId
        );
        const userPromiseIds = userPromises.map((p) => p.id); // Filter assessments to only those against the current user's promises

        const userAssessments = allAssessments.filter((a) =>
          userPromiseIds.includes(a.promiseId)
        ); // Derive breakdown counts
        // Active: promises still pending
        // Kept/Broken: derived from assessment judgments, not promise.status

        const active = userPromises.filter(
          (p) => p.status === 'pending'
        ).length;
        const keptCount = userAssessments.filter(
          (a) => a.judgment === 'KEPT'
        ).length;
        const brokenCount = userAssessments.filter(
          (a) => a.judgment === 'BROKEN'
        ).length; // Calculate kept rate percentage

        const totalAssessments = userAssessments.length;
        const keptAssessments = userAssessments.filter(
          (a) => a.judgment === 'KEPT'
        ).length;
        const calculatedKeptRate =
          totalAssessments > 0
            ? Math.round((keptAssessments / totalAssessments) * 100) + '%'
            : '--';

        setPromises(userPromises);
        setBreakdown({ active, kept: keptCount, broken: brokenCount });
        setKeptRate(calculatedKeptRate);
      } catch (err) {
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchProfileData();
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`promiseprotocol.com/profile/${promiserId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
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

  return (
    <div className={styles.container}>
            {/* Profile Header */}
            
      <div className={styles.profileCard}>
                <div className={styles.avatar}>J</div>
                
        <div className={styles.profileInfo}>
                    <h1 className={styles.profileName}>Jordan Lee</h1>
                    
          <p className={styles.profileRole}>Freelance Developer & Designer</p>
                  
        </div>
                
        <button className={styles.shareButton} onClick={handleCopyLink}>
                    {copied ? 'Copied!' : 'Share Profile :arrow_upper_right:'}
                  
        </button>
              
      </div>
            {/* Reputation Score & Kept Rate */}
            
      <div className={styles.statsGrid}>
                
        <div className={styles.statCard}>
                    <div className={styles.statLabel}>Reputation Score</div>
                    <div className={styles.statValue}>--</div>
                    <div className={styles.statSub}>Pending algorithm</div>
                  
        </div>
                
        <div className={styles.statCard}>
                    <div className={styles.statLabel}>Promise Kept Rate</div>
                    
          <div className={`${styles.statValue} ${styles.statValueGreen}`}>
                        {keptRate}
                      
          </div>
                    
          <div className={styles.statSub}>
                        
            {keptRate === '--'
              ? 'No assessments yet'
              : `${breakdown.kept} kept of ${promises.length} total`}
                      
          </div>
                  
        </div>
              
      </div>
            {/* Promise Breakdown */}
            
      <div className={styles.breakdownCard}>
                <div className={styles.breakdownHeader}>Promise Breakdown</div>
                
        {[
          { label: 'Active', value: breakdown.active, color: '#4FC3F7' },
          { label: 'Kept', value: breakdown.kept, color: '#4CAF82' },
          { label: 'Broken', value: breakdown.broken, color: '#E05252' },
        ].map((item) => (
          <div key={item.label} className={styles.breakdownRow}>
                        
            <div
              className={styles.breakdownDot}
              style={{ background: item.color }}
            />
                        
            <div className={styles.breakdownLabel}>{item.label}</div>
                        
            <div
              className={styles.breakdownValue}
              style={{ color: item.color }}
            >
                            {item.value}
                          
            </div>
                        
            <div className={styles.breakdownBarTrack}>
                            
              <div
                className={styles.breakdownBar}
                style={{
                  width:
                    promises.length > 0
                      ? `${(item.value / promises.length) * 100}%`
                      : '0%',
                  background: item.color,
                }}
              />
                          
            </div>
                      
          </div>
        ))}
              
      </div>
            {/* Shareable URL */}
            
      <div className={styles.shareCard}>
                
        <div>
                    
          <div className={styles.shareTitle}>Your public trust profile</div>
                    <div className={styles.shareUrl}>promiseprotocol.com/profile/{promiserId}</div>
                  
        </div>
                
        <button className={styles.copyButton} onClick={handleCopyLink}>
                    {copied ? 'Copied!' : 'Copy Link'}
                  
        </button>
              
      </div>
          
    </div>
  );
}
