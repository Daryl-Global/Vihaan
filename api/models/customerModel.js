// api/models/customerModel.js

const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  id: { type: String, required: true },
  byUser: { type: Number, required: true },
  cusName: { type: String, required: true },
  addhar: { type: String, required: true },
  addCus: { type: String, required: true },
  emailId: { type: String},
  createdOn: { type: Date, default: Date.now },
  mobileNumber: { type: Number, required: true },
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

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
