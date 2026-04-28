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
        if (promise.status === 'pending') {
          return true;
        }
        return false;
      case StatusSearchFilter.Kept:
        if (promise.status === 'KEPT') {
          return true;
        }
        return false;
      case StatusSearchFilter.Broken:
        if (promise.status === 'BROKEN') {
          return true;
        }
        return false;
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>My Promises</h1>
      <p className={styles.subheading}>{promises.length} Total Commitments</p>
      <div className={styles.filterRow}>
        {Object.entries(StatusSearchFilter).map((filter) => {
          return (
            <button
              key={filter[1]}
              className={
                selectedFilter === StatusSearchFilter[filter[0]]
                  ? styles.filterSelected
                  : styles.filterUnselected
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
      {promises.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.mutedText}>
            No commitments yet. Create your first one!
          </p>
        </div>
      ) : (
        <div className={styles.promisesList}>
          {promises.map((promise) => {
            const filterCheck = checkFilter(promise);
            if (filterCheck) {
              return (
                <PromiseCard
                  key={promise.id}
                  promise={promise}
                  showNavigateToDetails={true}
                  showPromiserId={true}
                  showDateAdded={true}
                />
              );
            }
          })}
        </div>
      )}
    </div>
  );
}
