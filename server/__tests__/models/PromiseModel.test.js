const PromiseModel = require('../../models/PromiseModel');

describe('Promise Data Model', () => {
  const defaultPromiser = 'user_123';
  const defaultScope = 'public';
  const defaultDomain = 'health';
  const defaultObjective = 'run 5 miles';
  const defaultTimeline = 30;
  const defaultCriteria = ['GPS tracked'];

  describe('promiseeScope Validation', () => {
    it.each(['self', 'individual', 'organization', 'public'])(
      'should accept valid promiseeScope: %s',
      (scope) => {
        const promise = new PromiseModel(
          defaultPromiser,
          scope,
          defaultDomain,
          defaultObjective,
          defaultTimeline,
          defaultCriteria,
          'financial',
          10,
        );

        expect(promise.promiseeScope).toBe(scope);
      }
    );

    it('should reject invalid promiseeScope', () => {
      const instantiatePromise = () => {
        new PromiseModel(
          defaultPromiser,
          'anyone',
          defaultDomain,
          defaultObjective,
          defaultTimeline,
          defaultCriteria,
          'financial',
          10,
        );
      };

      expect(instantiatePromise).toThrow('Invalid promiseeScope');
    });

    it('should reject null promiseeScope', () => {
      const instantiatePromise = () => {
        new PromiseModel(
          defaultPromiser,
          null,
          defaultDomain,
          defaultObjective,
          defaultTimeline,
          defaultCriteria,
          'financial',
          10,
        );
      };

      expect(instantiatePromise).toThrow('Invalid promiseeScope');
    });
  });

  describe('Stake Validation (PP-004)', () => {

    it('should create a financial stake from a legacy numeric input', () => {
      const legacyInput = 500;
      const promise = new PromiseModel(
        defaultPromiser, defaultScope, defaultDomain, defaultObjective, defaultTimeline, defaultCriteria, 
        legacyInput // Passing the legacy number
      );

      expect(promise.stake).toEqual({
        type: 'financial',
        amount: 500,
        currency: 'USD',
        status: 'held'
      });
    });

    it('should successfully create a valid financial stake object', () => {
      const promise = new PromiseModel(
        defaultPromiser, defaultScope, defaultDomain, defaultObjective, defaultTimeline, defaultCriteria, 
        'financial', 100
      );

      expect(promise.stake).toEqual({ 
        type: 'financial', 
        amount: 100,
        currency: 'USD',
        status: 'held'
      });
    });

    it('should successfully create a valid reputational stake object with null amount', () => {
      const promise = new PromiseModel(
        defaultPromiser, defaultScope, defaultDomain, defaultObjective, defaultTimeline, defaultCriteria, 
        'reputational', null
      );

      expect(promise.stake).toEqual({ 
        type: 'reputational', 
        amount: null,
        status: 'held'
      });
    });

    it('should throw an error if an invalid stake type is provided', () => {      
     
      const instantiatePromise = () => {
        new PromiseModel(
          defaultPromiser, defaultScope, defaultDomain, defaultObjective, defaultTimeline, defaultCriteria, 
          'social', 50
        );
      };

     expect(instantiatePromise).toThrow("Invalid stake type");
    });

    it('should throw an error if a financial stake amount is negative or missing', () => {
      
      const instantiatePromise = () => {
        new PromiseModel(
          defaultPromiser, defaultScope, defaultDomain, defaultObjective, defaultTimeline, defaultCriteria, 
          'financial', -10
        );
      };

      expect(instantiatePromise).toThrow("Invalid stake amount, number must be positive");
    });

  });
});