const express = require("express");
const router = express.Router();
const { logOutcome, listOutcomes, getPromiseById } = require("../src/cli");

router.post("/", (req, res) => {
  const { promiseId, outcome, note, attachmentRef } = req.body;

  if (!promiseId || !outcome) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const promise = getPromiseById(promiseId);
  if (!promise) {
    return res.status(404).json({ error: "Promise not found" });
  }
  if (promise.kind !== "self") {
    return res.status(400).json({
      error: "Outcomes can only be logged against self-promises",
    });
  }

  try {
    const outcomeRecord = logOutcome(promiseId, outcome, note, attachmentRef);
    return res.status(201).json(outcomeRecord);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.get("/", (req, res) => {
  const { promiseId } = req.query;

  if (!promiseId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const outcomes = listOutcomes({ promiseId });
  return res.status(200).json(outcomes || []);
});

module.exports = router;