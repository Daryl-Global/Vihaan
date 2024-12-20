const mongoose = require("mongoose");

const User = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  email: { type: String },
  phone: { type: String },
  name: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String },
  permissions: { type: [String], required: true },
  branch: { type: String },
  session: {
    token: { type: String },
    sessionStartTime: { type: Date },
    sessionExpiry: { type: Date },
  },
});

const UserData = mongoose.model("userdata", User);

module.exports = UserData;