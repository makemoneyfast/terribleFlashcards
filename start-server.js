const express = require("express");
const app = express();
const port = process.argv[2] || 3000;
const wwwDir = __dirname + "/dist";
app.use(express.static(wwwDir));
app.listen(port);
