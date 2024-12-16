// api/models/bookingModel.js

const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    id: { type: String, required: true },
    byUser: { type: Number, required: true },
    cusName: { type: String, required: true },
    addhar: { type: String, required: true }, 
    addCus: { type: String, required: true },
    model: { type: String, required: true },
    colour: { type: String, required: true },
    variant: { type: String, required: true },
    executive: { type: String, required: true },
    branch: { type: String, required: true },
    createdOn: { type: Date, default: Date.now },
    bookingAmount: { type: Number, required: true, min: 0 }, 
    hp: { type: String, required: true },
    emailId: { type: String, required: true },
    mobileNumber: { type: String, required: true }, 

    logs: [
        {
            timestamp: {
                type: Date,
                default: Date.now,
            },
            userRole: { type: String, required: true },
            message: String,
        },
    ],
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
