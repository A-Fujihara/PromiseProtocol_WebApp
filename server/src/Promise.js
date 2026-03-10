class Promise {
  constructor(
    promiserId,
    promiseeScope,
    domain,
    objective,
    timeline,
    successCriteria,
    stake,
  ) {
    this.id = this.generateId();
    this.promiserId = promiserId;
    this.promiseeScope = promiseeScope;
    this.domain = domain;
    this.objective = objective;
    this.timeline = timeline; // days
    this.successCriteria = successCriteria; // array of criteria
    this.stake = stake;
    this.createdAt = new Date();
    this.status = "pending";
  }

  generateId() {
    return `prm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = Promise;
