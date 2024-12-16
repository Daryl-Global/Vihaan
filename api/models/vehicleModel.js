// api/models/vehicleModel.js

const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  byUser: { type: Number, required: true },
  model: { type: String, required: true },
  colour: { type: String, required: true },
  variant: { type: String, required: true },
  priceLock: { type: String },

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

vehicleSchema.index({ model: 1, variant: 1, colour: 1 }, { unique: true });

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

// Force index creation
Vehicle.syncIndexes().then(() => {
  console.log("Vehicle Indexes have been synced");
});

module.exports = Vehicle;
