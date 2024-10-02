const express = require("express");
const router = express.Router();
const Image = require("../models/file");
const multer = require("multer");
const storage = multer.memoryStorage(); //RAM


// Fetch one random Image file as base64
router.route("/single").get((req, res) => {
  res.render("fetch-single.hbs", {
    title: "Fetching a Random Image",
  });
});
// This route is triggered by the javascript within fetch-single.hbs in /fetch-single route
router.get("/random-image", (req, res) => {
  Image.aggregate([{ $sample: { size: 1 } }])
    .then((randomImage) => {
      if (randomImage.length === 0) {
        return res.status(404).send("No files found.");
      }
      console.log(randomImage[0]);
      res.json(randomImage[0]);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("Error fetching file.");
    });
});

// Fetch multiple images
router.route("/multiple").get((req, res) => {
  res.render("fetch-multiple.hbs", {
    title: "Fetching Multiple Random Images",
  });
});


//This route is triggered with js inside fetch-multiple.hbs
router.get('/fetch-multiple2', (req, res) => {
  let numImages = parseInt(req.query.num) || 3; // Default to 3 images

  if (numImages < 1 || numImages > 10) {
    return res.status(400).send({
      message:
        'Invalid number of images. Please request between 2 and 10 images.',
    });
  }

  Image.aggregate([
    { $sample: { size: numImages } },
    {
      $project: { imageBuffer: 0 },
    },
  ])
    .then((randomImages) => {
      if (randomImages.length === 0) {
        return res.status(404).json({ error: 'No images found.' });
      }
      res.json(randomImages); // Always return an array
    })
    .catch((error) => {
      console.error('Error fetching images:', error);
      res.status(500).json({ error: 'Error fetching images.' });
    });
});




// Fetch all images

router.route("/all").get((req, res) => {
  res.render("fetch-all.hbs", {
    title: "Fetching All Images",
  });
});

router.get("/fetch-all2", (req, res) => {
  Image.find({}, { imageBuffer: 0 })
    .then((allImages) => {
      if (allImages.length === 0) {
        return res.status(404).json({ error: "No files found." });
      }
      const formattedImages = allImages.map((image) => ({
        filename: image.filename,
        contentType: image.contentType,
        imageBuffer: image.imageBufferThumbnail
          ? image.imageBufferThumbnail.toString("base64")
          : "",
      }));

      res.json(formattedImages);
    })
    .catch((error) => {
      console.error("Error fetching files:", error);
      res.status(500).json({ error: "Error fetching files." });
    });
});


// Fetch all images Paginated
router.route("/gallery-pagination").get((req, res) => {
  res.render("gallery-pagination.hbs", {
    title: "Fetching Gallery with pagination",
  });
});

//Triggered by script inside gallery-pagination.hbs
router.get("/fetch-all/pages/:index", (req, res) => {
  const pageIndex = parseInt(req.params.index, 10);

  if (isNaN(pageIndex) || pageIndex < 1) {
    return res.status(400).send("Invalid page index.");
  }
  const ITEMS_PER_PAGE = 10;
  Image.find({}, { imageBuffer: 0 })
    .skip((pageIndex - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .then((page_results) => {
      if (page_results.length === 0) {
        return res.status(404).send("Page not found.");
      }
      Image.countDocuments()
      .then((total_images) => {
        const totalPages = Math.ceil(total_images / ITEMS_PER_PAGE);
        const formattedPageItems = page_results.map((image) => ({
          filename: image.filename,
          contentType: image.contentType,
          imageBuffer: image.imageBufferThumbnail
            ? image.imageBufferThumbnail.toString("base64")
            : "",
        }));
        const response = {
          page: pageIndex,
          totalPages: totalPages,
          files: formattedPageItems,
        };
        res.json(response);
      })
      .catch((error) => {
        console.error("Error counting Documents:", error);
        res.status(500).send("Error fetching files.");
      });
  })
  .catch((error) => {
    console.error("Error Finding Documents:", error);
    res.status(500).send("Error fetching files.");
  });
});


module.exports = router;
