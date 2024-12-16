// api/models/executiveModel.js

const mongoose = require("mongoose");

const executiveSchema = new mongoose.Schema({
  id: { type: String, required: true },
  byUser: { type: Number, required: true },
  executiveName: { type: String, required: true },  
  phone: { type: String, required: true },
  branch: { type: String, required: true },
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

const Executive = mongoose.model("Executive", executiveSchema);

module.exports = Executive;
