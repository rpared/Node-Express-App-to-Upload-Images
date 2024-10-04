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

// app
//   .route("/upload-multipleimages")
//   .get((req, res) => {
//     res.render("upload-multiple.hbs", {
//       title: "Upload Multiple Images",
//     });
//   })
//   .post(upload.array("files", 15), (req, res) => {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).send("No files uploaded.");
//     }
//     const filePaths = req.files.map((file) => file.path);
//     res.status(200).render("if-upload-multiple", {
//       message: `😃 File(s) uploaded successfully to this location(s): ${filePaths.join(
//         ", "
//       )}`,
//     });
//   });

// FETCHING ROUTES

// Single Random Image
// app.route("/fetch-single").get((req, res) => {
//   res.render("fetch-single.hbs", {
//     title: "Fetching a Random Image",
//   });
// });
// // This route is triggered by the javascript within fetch-single.hbs in /fetch-single route
// app.get("/random-image", (req, res) => {
//   let upload_dir = path.join(__dirname, "uploads");

//   let uploads = fs.readdirSync(upload_dir);
//   if (uploads.length === 0) {
//     return res.status(503).send({
//       message: "There are no images, upload some.",
//     });
//   }

//   let max = uploads.length - 1;
//   let min = 0;

//   let index = Math.round(Math.random() * (max - min) + min);
//   let randomImage = uploads[index];

//   res.sendFile(path.join(upload_dir, randomImage));
// });

// Multiple Random Images
// app.route("/fetch-multiple").get((req, res) => {
//   res.render("fetch-multiple.hbs", {
//     title: "Fetching Multiple Random Images",
//   });
// });

// //This route is triggered with js inside fetch-multiple.hbs
// app.get("/fetch-multiple2", (req, res) => {
//   let upload_dir = path.join(__dirname, "uploads");

//   let numImages = parseInt(req.query.num) || 3; // Default to 3 images

//   if (numImages < 1 || numImages > 10) {
//     return res.status(400).send({
//       message:
//         "Invalid number of images. Please request between 2 and 10 images.",
//     });
//   }

//   let uploads = fs.readdirSync(upload_dir);
//   if (uploads.length === 0) {
//     return res.status(503).send({
//       message: "There are no images, upload some.",
//     });
//   }

//   if (uploads.length < numImages) {
//     numImages = uploads.length; // Adjust to available images
//   }

//   let randomIndexes = [];
//   while (randomIndexes.length < numImages) {
//     let randomIndex = Math.floor(Math.random() * uploads.length);
//     if (!randomIndexes.includes(randomIndex)) {
//       randomIndexes.push(randomIndex);
//     }
//   }

//   let selectedImages = [];
//   for (let index of randomIndexes) {
//     selectedImages.push("/uploads/" + uploads[index]); // Relative URL
//   }

//   res.json(selectedImages);
// });

// // Fetching All Images
// app.route("/fetch-all").get((req, res) => {
//   res.render("fetch-all.hbs", {
//     title: "Fetching All Images",
//   });
// });

// //This route is triggered with js inside fetch-all.hbs
// app.get("/fetch-all2", (req, res) => {
//   let upload_dir = path.join(__dirname, "uploads");

//   let uploads = fs.readdirSync(upload_dir);
//   if (uploads.length === 0) {
//     return res.status(503).send({
//       message: "There are no images, upload some.",
//     });
//   }

//   let randomIndexes = [];
//   while (randomIndexes.length < uploads.length) {
//     let randomIndex = Math.floor(Math.random() * uploads.length);
//     if (!randomIndexes.includes(randomIndex)) {
//       randomIndexes.push(randomIndex);
//     }
//   }

//   let selectedImages = [];
//   for (let index of randomIndexes) {
//     selectedImages.push("/uploads/" + uploads[index]); // Relative URL
//   }

//   res.json(selectedImages);
// });

// Fetching Paginated Gallery
// Serve gallery-pagination.hbs
// app.route("/fetch-gallery-pagination").get((req, res) => {
//   res.render("gallery-pagination.hbs", {
//     title: "Fetching Gallery with pagination",
//   });
// });

// //Triggered by script inside gallery-pagination.hbs
// app.get("/fetch-all/pages/:index", (req, res) => {
//   const ITEMS_PER_PAGE = parseInt(req.query.items_per_page, 10) || 10; // Number of items per page
//   const pageIndex = parseInt(req.params.index, 10);
//   if (isNaN(pageIndex) || pageIndex < 1) {
//     return res.status(400).send("Invalid page index.");
//   }

//   const allFiles = Object.entries(getAllFiles());
//   const totalItems = allFiles.length;
//   const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

//   if (pageIndex > totalPages) {
//     return res.status(404).send("Page not found.");
//   }

//   const startIndex = (pageIndex - 1) * ITEMS_PER_PAGE;
//   const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
//   const pageItems = allFiles.slice(startIndex, endIndex);

//   const response = {
//     page: pageIndex,
//     totalPages: totalPages,
//     files: Object.fromEntries(pageItems),
//   };

//   res.json(response);
// });
// // Fetch all files as base64
// const getAllFiles = () => {
//   const directoryPath = path.join(__dirname, "uploads");
//   const files = fs.readdirSync(directoryPath);
//   const fileContents = {};

//   files.forEach((file) => {
//     const filePath = path.join(directoryPath, file);
//     const content = fs.readFileSync(filePath, "base64");
//     fileContents[file] = content;
//   });

//   return fileContents;
// };

// app.use((req, res) => {
//   res.status(404).send("Route not found 😕");
// });
// app.listen(PORT, () => {
//   console.log(`http://localhost:${PORT}`);
// });
