const router = require("express").Router();
const paginatedResults = require("../middleware/paginatedResults");
const paginatedSearchResults = require("../middleware/paginatedSearchResults");
const Poster = require("../models/posterModel");

router.post("/", async (req, res) => {
  try {
    const newPoster = new Poster(req.body);

    const savedPoster = await newPoster.save();

    res.json(savedPoster);
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

router.get("/", paginatedResults(Poster), async (req, res) => {
  try {
    res.json(res.paginatedResults);
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

router.get("/search", paginatedSearchResults(Poster), async (req, res) => {
  try {
    res.json(res.paginatedResults);
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

router.get("/:id", async (req, res) => {
  try {
    const poster = await Poster.findOne({ _id: req.params.id });
    res.json(poster);
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

module.exports = router;
