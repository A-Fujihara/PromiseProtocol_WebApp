const express = require("express");
const router = express.Router();
const { createPromise, listPromises } = require("../src/cli");

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

module.exports = router;