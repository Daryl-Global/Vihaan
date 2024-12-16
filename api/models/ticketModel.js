const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    byUser: { type: Number, required: true },
    colour: { type: String, required: true },
    model: { type: String, required: true },
    variant: { type: String, required: true },
    deliveryAmount: { type: String },
    gatePassSerialNumber: { type: String },
    engineNo: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    chassisNo: { type: String, required: true, unique: true },
    status: String,
    assignedDealer: String,
    nameCus: String,
    executive: String,
    hp: String,
    createdOn: { type: Date },
    issueFinance: String,
    issueAmount: String,
    bookingAmount: String,
    addCus: String,
    srno: String,
    vehicleNumber: String,
    isApproved: Boolean,
    sentForIssueSaleLetter: Boolean,
    allocationDate: { type: Date },
    approvedDate: { type: Date },
    passingDate: { type: Date },
    registrationDate: { type: Date },
    deliveryDate: { type: Date },
    dealerHistory: [
        {
            fromDealerId: { type: String, default: null },
            toDealerId: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
        },
    ],
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
}, {
    timestamps: true // createdAt, updatedAt
});

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;