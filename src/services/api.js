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
