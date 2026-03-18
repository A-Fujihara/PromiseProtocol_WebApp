const express = require("express");
const router = express.Router();
const { createPromise, listPromises } = require("../src/cli");

router.post("/", (req, res) => {
  const { promiserId, promiseeScope = null, domain, objective, days, stake } = req.body;

  if (!promiserId || !domain || !objective || !days || !stake || !stake.type || stake.amount === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

try {
    // 2. Execution: Pass the nested properties as separate arguments
    const promise = createPromise(
      promiserId,
      promiseeScope,
      domain,
      objective,
      days,
      stake.type,
      stake.amount
    );
    return res.status(201).json(promise);
  } catch (error) {
    // Catch any validation errors thrown by your new Promise model
    return res.status(400).json({ error: error.message });
  }
});

router.get("/", (req, res) => {
  const promises = listPromises();
  return res.status(200).json(promises || []);
});

module.exports = router;
