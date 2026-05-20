const { getPromises, getAssessmentSummary } = require('../src/Storage');
const { listPromises } = require('../src/cli');

jest.mock('../src/Storage', () => ({
  getPromises: jest.fn(),
  getAssessmentSummary: jest.fn(),
  savePromise: jest.fn(),
  saveAssessment: jest.fn(),
  updatePromise: jest.fn()
}));

describe('cli.js - listPromises Regression Test (PP-038)', () => {
  let consoleSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test('returns an empty array when no promises exist', () => {
    getPromises.mockReturnValue([]);

    const result = listPromises();

    expect(result).toBeDefined();
    expect(result).not.toBeNull();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  test('returns an array containing promises when promises exist', () => {
    const mockPromises = [
      { id: 'prm_001', domain: 'Web Dev', objective: 'Test data' }
    ];
    getPromises.mockReturnValue(mockPromises);
    getAssessmentSummary.mockReturnValue({ kept: 0, broken: 0 });

    const result = listPromises();

    expect(result).toBeDefined();
    expect(result).not.toBeNull();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
    expect(result).toEqual(mockPromises);
  });
});