/* 
Roger Paredes
N01602284
*/
require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const path = require("path");
const fs = require("fs");

// middleware:
app.use(express.urlencoded({ extended: true })); // handle normal forms -> url encoded
app.use(express.json()); // Handle raw json data
// catch all other requests

// Serve static files from the 'public' directory, without this no styles nor libraries will be loaded!!
app.use("/public", express.static(path.join(__dirname, "public")));

// Displaying home on the root route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views" + "/index.html");
});

// Displaying my data on the credits route
app.get("/credits", (req, res) => {
  res.send("Roger Paredes - ID: N01602284");
});

app.use((req, res) => {
  res.status(404).send("Route not found");
});
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
