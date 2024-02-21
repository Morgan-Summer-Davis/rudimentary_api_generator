const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

app.use("/api/example", require("./routes/api/example.js"));
app.use("/api/another/example", require("./routes/api/another/example.js"));
app.use("/api/another/example/again", require("./routes/api/another/example/again.js"));

const port = 3000;

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
