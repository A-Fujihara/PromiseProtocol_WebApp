import httpService from './httpService';

export const getPromises = async (userId) => {
  try {
    const res = await httpService.get('/api/promises', {
      params: userId ? { userId } : undefined,
    });
    return res.data;
  } catch (error) {
    throw {
      message: 'Failed to GET /api/promises',
      originalError: error,
      status: error.response?.status,
    };
  }
};

export const createPromise = async (req) => {
  try {
    const res = await httpService.post('/api/promises', req);
    return res.data;
  } catch (error) {
    throw {
      message: 'Failed to POST /api/promises',
      originalError: error,
      status: error.response?.status,
    };
  }
};

// PP-B1: self-promises submit through their own call, kept separate from
// createPromise so a self-promise's payload (no stake, no promisee info)
// never gets mixed with the assessed-promise path.
export const createSelfPromise = async (req) => {
  try {
    const res = await httpService.post('/api/promises', req);
    return res.data;
  } catch (error) {
    throw {
      message: 'Failed to POST /api/promises (self-promise)',
      originalError: error,
      status: error.response?.status,
    };
  }
};

// PP-B2: logs a check-in (Outcome) against a self-promise. note and
// attachmentRef are omitted from the payload entirely when not provided,
// rather than sent as null/empty string, so the backend's own
// note ?? null / attachmentRef ?? null defaulting is the only place that
// decides the stored value.
export const logOutcome = async (req) => {
  try {
    const res = await httpService.post('/api/outcomes', req);
    return res.data;
  } catch (error) {
    throw {
      message: 'Failed to POST /api/outcomes',
      originalError: error,
      status: error.response?.status,
    };
  }
};

// PP-B3: live self-trust score for a self-promise, recomputed server-side
// on every request from logged outcomes - never cached client-side beyond
// component state, so a fresh call after logging a check-in always reflects
// the true current value.
export const getSelfTrust = async (promiseId, userId) => {
  try {
    const res = await httpService.get(`/api/promises/${promiseId}/self-trust`, {
      params: userId ? { userId } : undefined,
    });
    return res.data;
  } catch (error) {
    throw {
      message: 'Failed to GET /api/promises/:id/self-trust',
      originalError: error,
      status: error.response?.status,
    };
  }
};

// PP-B3: check-in history for a self-promise's detail page. promiseId is
// always required by the backend (separate from the userId ownership check),
// so it's sent unconditionally while userId stays optional like getPromises.
export const getOutcomes = async (promiseId, userId) => {
  try {
    const res = await httpService.get('/api/outcomes', {
      params: userId ? { promiseId, userId } : { promiseId },
    });
    return res.data;
  } catch (error) {
    throw {
      message: 'Failed to GET /api/outcomes',
      originalError: error,
      status: error.response?.status,
    };
  }
};

export const getAssessments = async () => {
  try {
    const res = await httpService.get('/api/assessments');
    return res.data;
  } catch (error) {
    throw {
      message: 'Failed to GET /api/assessments',
      originalError: error,
      status: error.response?.status,
    };
  }
};

export const submitAssessment = async (req) => {
  try {
    const res = await httpService.post('/api/assessments', req);
    return res.data;
  } catch (error) {
    throw {
      message: 'Failed to POST /api/assessments',
      originalError: error,
      status: error.response?.status,
    };
  }
};
