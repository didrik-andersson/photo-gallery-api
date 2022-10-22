const router = require("express").Router();
const fetch = require("node-fetch");

router.get("/:path", async (req, res) => {
  try {
    fetch(
      `https://didrikimages.blob.core.windows.net/images/${req.params.path}`
    ).then((actual) => {
      actual.headers.forEach((v, n) => res.setHeader(n, v));
      actual.body.pipe(res);
    });
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

module.exports = router;
