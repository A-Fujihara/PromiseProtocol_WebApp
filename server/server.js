require("dotenv").config();
const express = require("express");
const cors = require("cors");

const promisesRouter = require("./routes/promises");
const assessmentsRouter = require("./routes/assessments");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/promises", promisesRouter);
app.use("/api/assessments", assessmentsRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
