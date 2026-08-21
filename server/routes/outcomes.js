const express = require("express");
const router = express.Router();
const { logOutcome, listOutcomes, getPromiseById } = require("../src/cli");
const { canAccessPromise } = require("../src/accessControl");

router.post("/", (req, res) => {
  const { promiseId, outcome, note, attachmentRef, userId } = req.body;

  if (!promiseId || !outcome) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const promise = getPromiseById(promiseId);
  // PP-A6: a private self-promise can only have outcomes logged by its
  // owner. Checked before the not-found/kind checks below so a non-owner
  // gets the same 404 whether the promise is private or doesn't exist,
  // and can't use this endpoint to log against (or probe the existence
  // of) someone else's private promise.
  if (!canAccessPromise(promise, userId)) {
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

// PP-A6: outcomes for a private self-promise are only visible to its owner,
// same check as GET /api/promises/:id.
router.get("/", (req, res) => {
  const { promiseId, userId } = req.query;

  if (!promiseId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const promise = getPromiseById(promiseId);
  if (!canAccessPromise(promise, userId)) {
    return res.status(404).json({ error: "Promise not found" });
  }

  const outcomes = listOutcomes({ promiseId });
  return res.status(200).json(outcomes || []);
});

module.exports = router;