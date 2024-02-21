const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

// Routes go here

const port = 3000;

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
