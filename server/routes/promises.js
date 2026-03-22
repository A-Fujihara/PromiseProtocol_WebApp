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
  } = req.body;

  if (
    !promiserId ||
    !domain ||
    !objective ||
    !days ||
    !stake ||
    !stake.type ||
    stake.amount === undefined ||
    !successCriteria ||
    successCriteria.trim() === ""
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
      stake.type,
      stake.amount,
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
