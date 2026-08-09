const express = require("express");
const router = express.Router();
const { createPromise, listPromises, getPromiseById, listOutcomes } = require("../src/cli");
const { computeSelfTrust } = require("../src/SelfTrust");

router.post("/", (req, res) => {
  const {
    promiserId,
    promiseeScope = null,
    domain,
    objective,
    days,
    stake,
    successCriteria,
    kind,
    visibility,
  } = req.body;

  const isSelfPromise = kind === "self";

  if (
    !promiserId ||
    !domain ||
    !objective ||
    !days ||
    !successCriteria ||
    successCriteria.trim() === "" ||
    (!isSelfPromise && (!stake || !stake.type || stake.amount === undefined))
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const promise = createPromise(
      promiserId,
      promiseeScope,
      domain,
      objective,
      days,
      successCriteria,
      stake ? stake.type : undefined,
      stake ? stake.amount : undefined,
      stake ? stake.currency : undefined,
      kind,
      visibility,
    );
    return res.status(201).json(promise);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.get("/", (req, res) => {
  const promises = listPromises();
  return res.status(200).json(promises || []);
});

// PP-A4: self-trust score for a self-promise. Never stored — recomputed on
// every request straight from the logged outcomes via SelfTrust.computeSelfTrust,
// so the number can never go stale.
router.get("/:id/self-trust", (req, res) => {
  const { id } = req.params;

  const promise = getPromiseById(id);
  if (!promise) {
    return res.status(404).json({ error: "Promise not found" });
  }
  if (promise.kind !== "self") {
    return res.status(400).json({
      error: "Self-trust score is only available for self-promises",
    });
  }

  const outcomes = listOutcomes({ promiseId: id });
  const { score, count } = computeSelfTrust(outcomes);
  return res.status(200).json({ score, count });
});

module.exports = router;