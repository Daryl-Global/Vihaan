// api/models/LocationModel.js

const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  id: { type: String, required: true },
  byUser: { type: Number, required: true },
  locationName: { type: String, required: true }, 
  logs: [
    {
      timestamp: {
        type: Date,
        default: Date.now(),
      },
      userRole: { type: String, required: true },
      message: String,
    },
  ],
});

const Location = mongoose.model("Location", locationSchema);

module.exports = Location;
