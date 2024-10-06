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
const exphbs = require("express-handlebars");
const upload = require("./middleware/multer");
const mongoose = require("mongoose");
const uploadRouter = require("./routers/upload_router");
const fetchRouter = require("./routers/fetch_router");
const cors = require("cors");

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://node-express-app-to-upload-git-201821-rogers-projects-cf834b0b.vercel.app/",
    ], // Allow both localhost and production
    credentials: true, // Allows cookies and credentials to be sent
    methods: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
    allowedHeaders:
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  })
);

app.options("*", cors()); // Enable pre-flight for all routes

app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, "views"));
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: __dirname + "/views/layouts/",
    partialsDir: __dirname + "/views/partials/",
  })
);

// Application level middleware
app.use(express.urlencoded({ extended: true })); // handle normal forms -> url encoded
app.use(express.json()); // Handle raw json data
// localhost:8000/upload
app.use("/upload", uploadRouter);
app.use("/fetch", fetchRouter);

// Serve static files from the 'public' directory, without this no styles nor libraries will be loaded!!
// app.use(express.static("public"));
app.use("/public", express.static(path.join(__dirname, "public")));
// no longer fetching from uploads folder
// app.use("/uploads", express.static(path.join(__dirname, "uploads"))); //This is needed to allow the client to access the images using URLs!

mongoose.connect(process.env.MONGODB_URI);
let db = mongoose.connection;
db.once("open", () => {
  console.log("Connected to MongoDB");
});
db.on("error", (err) => {
  console.error("DB Error:" + err);
});

//ROUTES

app.get("/", (req, res) => {
  res.render("home", {
    title: "Home Page",
    message: "Welcome, select an option from the navigation menu at the top.",
  });
});

// Displaying my info on the credits route
app.get("/credits", (req, res) => {
  res.render("home", {
    title: "Credits",
    message: "Roger Paredes - ID: N01602284 (using a ton of libraries ha ha)",
  });
});

//Catch all other routes
app.use((req, res) => {
  res.status(404).send("Route not found 😕");
});
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
