const mongoose = require("mongoose");

const posterSchema = new mongoose.Schema({
  // id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  images: { type: Array, required: true },
  retailers: [
    {
      name: String,
      logo: String,
      sizes: [
        {
          size: String,
          unit: String,
          price: Number,
        },
      ],
    },
  ],
});

const Poster = mongoose.model("poster", posterSchema);

module.exports = Poster;
