const express = require("express");
const router = express.Router();
const { submitAssessment, listAssessments } = require("../src/cli");

class MeritEngine {
  recordAssessment(assessorId, path, judgment, stake) {
    // placeholder for merit tracking
  }
}

class CreditLedger {
  reward(assessorId, amount) {
    // placeholder for rewarding
  }
  slashStake(assessorId, amount) {
    // placeholder for slashing
  }
}

const meritEngine = new MeritEngine();
const creditLedger = new CreditLedger();

router.post("/", (req, res) => {
  const { promiseId, assessorId, judgment, evidenceCid, stake } = req.body;

  if (!promiseId || !assessorId || !judgment || !evidenceCid || !stake) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const assessment = submitAssessment(
    promiseId,
    assessorId,
    judgment,
    evidenceCid,
    stake,
    meritEngine,
    creditLedger,
  );
  return res.status(201).json(assessment);
});

router.get("/", (req, res) => {
  const assessments = listAssessments();
  return res.status(200).json(assessments || []);
});

module.exports = router;
