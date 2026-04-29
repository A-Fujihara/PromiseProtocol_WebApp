import { useEffect, useState } from 'react';
import PromiseCard from '../components/PromiseCard';
import { getPromises } from '../services/api';
import styles from './MyPromises.module.css';

const StatusSearchFilter = Object.freeze({
  All: 0,
  Active: 1,
  Kept: 2,
  Broken: 3,
});

export default function MyPromises() {
  const [promises, setPromises] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(StatusSearchFilter.All);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const allPromises = await getPromises();
        setPromises(allPromises);
      } catch (err) {
        setError('Failed to load promises. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const checkFilter = (promise) => {
    switch (selectedFilter) {
      case StatusSearchFilter.All:
        return true;
      case StatusSearchFilter.Active:
        return promise.status === 'pending';
      case StatusSearchFilter.Kept:
        return promise.status === 'KEPT';
      case StatusSearchFilter.Broken:
        return promise.status === 'BROKEN';
      default:
        return false;
    }
  };

  const filteredPromises = promises.filter(checkFilter);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>My Promises</h1>
      <p className={styles.subtitle}>{promises.length} Total Commitments</p>
      <div className={styles.filterRow}>
        {Object.entries(StatusSearchFilter).map((filter) => {
          return (
            <button
              key={filter[1]}
              className={
                selectedFilter === StatusSearchFilter[filter[0]]
                  ? styles.filterBtnActive
                  : styles.filterBtn
              }
              onClick={() => {
                if (selectedFilter !== StatusSearchFilter[filter[0]]) {
                  setSelectedFilter(StatusSearchFilter[filter[0]]);
                }
              }}
            >
              {filter[0]}
            </button>
          );
        })}
      </div>
      {loading && <div className={styles.loadingState}>Loading...</div>}
      {error && <div className={styles.errorState}>{error}</div>}
      {!loading && !error && promises.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>No commitments yet.</p>
        </div>
      ) : !loading && !error && filteredPromises.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>
            No commitments match the selected filter. Try another status.
          </p>
        </div>
      ) : (
        <div className={styles.promiseList}>
          {filteredPromises.map((promise) => (
            <PromiseCard
              key={promise.id}
              promise={promise}
              showNavigateToDetails={true}
              showPromiserId={true}
              showDateAdded={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
