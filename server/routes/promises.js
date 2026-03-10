const express = require("express");
const router = express.Router();
const { createPromise, listPromises } = require("../src/cli");

router.post("/", (req, res) => {
  const { promiserId, domain, objective, days, stake } = req.body;

  if (!promiserId || !domain || !objective || !days || !stake) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const promise = createPromise(promiserId, domain, objective, days, stake);
  return res.status(201).json(promise);
});

router.get("/", (req, res) => {
  const promises = listPromises();
  return res.status(200).json(promises || []);
});

module.exports = router;
