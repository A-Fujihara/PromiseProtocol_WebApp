import { vi, describe, test, expect, beforeEach } from 'vitest';
import {
  getPromises,
  createPromise,
  getAssessments,
  submitAssessment,
} from './api';

vi.mock('./httpService', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import httpService from './httpService';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('API Functions', () => {
  test('GET /api/promises', async () => {
    const mockResData = [
      {
        id: 'prm_1234567890_abc123',
        promiserId: 'dev_user_001',
        promiseeScope: 'individual',
        domain: 'health',
        objective: 'Run 3 times a week for 30 days',
        timeline: 30,
        successCriteria: 'Completed 12 runs in 30 days',
        stake: {
          type: 'financial',
          amount: 50,
          currency: 'USD',
          status: 'held',
        },
        status: 'pending',
        createdAt: '2026-03-17T00:00:00.000Z',
      },
    ];
    httpService.get.mockResolvedValue({ data: mockResData });
    const res = await getPromises();
    expect(res).toEqual(mockResData);
  });

  test('POST /api/promises', async () => {
    const mockReq = {
      promiserId: 'dev_user_001',
      promiseeScope: 'individual',
      domain: 'health',
      objective: 'Run 3 times a week for 30 days',
      days: 30,
      successCriteria: 'Completed 12 runs in 30 days',
      stake: { type: 'financial', amount: 50 },
    };
    const mockRes = { data: mockReq, status: 201 };
    httpService.post.mockResolvedValue(mockRes);
    const res = await createPromise(mockReq);
    expect(res).toEqual(mockRes.data);
  });

  test('GET /api/assessments', async () => {
    const mockResData = [
      {
        id: 'asm_1234567890_xyz456',
        promiseId: 'prm_1234567890_abc123',
        assessorId: 'dev_user_001',
        judgment: 'KEPT',
        evidenceCid: 'QmXyz...',
        stake: 25,
        createdAt: '2026-03-17T00:00:00.000Z',
      },
    ];
    httpService.get.mockResolvedValue({ data: mockResData });
    const res = await getAssessments();
    expect(res).toEqual(mockResData);
  });

  test('POST /api/assessments', async () => {
    const mockReq = {
      promiseId: 'prm_1234567890_abc123',
      assessorId: 'dev_user_001',
      judgment: 'KEPT',
      evidenceCid: 'QmXyz...',
      stake: 25,
    };
    const mockRes = { data: mockReq, status: 201 };
    httpService.post.mockResolvedValue(mockRes);
    const res = await submitAssessment(mockReq);
    expect(res).toEqual(mockRes.data);
  });
});

describe('Error handling', () => {
  test('GET /api/promises', async () => {
    httpService.get.mockRejectedValue({ response: { status: 500 } });
    try {
      await getPromises();
      throw new Error('Did not throw error');
    } catch (error) {
      expect(error.status).toBe(500);
    }
  });

  test('POST /api/promises', async () => {
    httpService.post.mockRejectedValue({ response: { status: 400 } });
    try {
      await createPromise({});
      throw new Error('Did not throw error');
    } catch (error) {
      expect(error.status).toBe(400);
    }
  });

  test('GET /api/assessments', async () => {
    httpService.get.mockRejectedValue({ response: { status: 500 } });
    try {
      await getAssessments();
      throw new Error('Did not throw error');
    } catch (error) {
      expect(error.status).toBe(500);
    }
  });

  test('POST /api/assessments', async () => {
    httpService.post.mockRejectedValue({ response: { status: 400 } });
    try {
      await submitAssessment({});
      throw new Error('Did not throw error');
    } catch (error) {
      expect(error.status).toBe(400);
    }
  });
});
