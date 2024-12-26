// api/route/user.js

const express = require("express");

const {
    fetchTickets,
    fetchTicketsByStatus,
    createTicket,
    updateTicket,
    updateVehicleStock,
    deliveryTicket,
    CustomerMaster,
    ExecutiveMaster,
    LocationMaster,
    BookingMaster,
    VehicleMaster,
    updateVehicle,
    createBulkTickets,
    fetchSingleTicket,
    updateTicketStatus,
    addMessage,
    getCustomers,
    getExecutives,
    getLocation,
    getBookings,
    getVehicles,
    saleLetter,
    datePassing,
    registrationDetails,
    getLatestGatePassSerialNumber,
    updateGatePassSerialNumber,
    assignDealerToTicket,
    getBookingByAadhaar,
    uploadVehicleBulk,
} = require("../controllers/user.js");

const { authenticateToken, gatePassAuthorization } = require("../middleware/authorization.js");

const router = express.Router();

router.post("/tickets", authenticateToken, fetchTickets);
router.post("/tickets_by_status", authenticateToken, fetchTicketsByStatus);
router.put("/update_stock/:stock_id", authenticateToken, updateVehicleStock)
// router.get("/:user_id/tickets", authenticateToken, fetchTickets);
// router.get("/:user_id/tickets", fetchTickets);
router.post("/:user_id/createticket", authenticateToken, createTicket);
router.post("/:user_id/customermaster", authenticateToken, CustomerMaster);
router.post("/:user_id/executivemaster", authenticateToken, ExecutiveMaster);
router.post("/:user_id/locationmaster", authenticateToken, LocationMaster);
router.post("/:user_id/bookingmaster", authenticateToken, BookingMaster);
router.post("/:user_id/vehiclemaster", authenticateToken, VehicleMaster);
router.post("/:user_id/vehicle/bulk-upload", authenticateToken, uploadVehicleBulk);
router.patch('/:user_id/ticket/:ticket_id/update', authenticateToken, updateTicket);
router.get('/customers', authenticateToken, getCustomers);
router.get('/executives', authenticateToken, getExecutives);
router.get('/locations', authenticateToken, getLocation);
router.get('/bookings', authenticateToken, getBookings);
router.get('/vehicles', authenticateToken, getVehicles);
router.patch("/:user_id/deliveryticket", authenticateToken, deliveryTicket);
router.patch("/:user_id/saleletter", authenticateToken, saleLetter);
router.patch("/:user_id/datepassing", authenticateToken, datePassing);
router.patch("/:user_id/registration_details", authenticateToken, registrationDetails);
router.post("/:user_id/bulkcreateticket", authenticateToken, createBulkTickets);
router.get("/:user_id/ticket/:ticket_id", authenticateToken, fetchSingleTicket);
router.get("/latest-gate-pass/:location", gatePassAuthorization, getLatestGatePassSerialNumber);
router.put("/update_gate_pass_serial_number", gatePassAuthorization, updateGatePassSerialNumber);
router.put('/:user_id/vehiclemaster', authenticateToken, updateVehicle);
router.put('/:user_id/ticket/:ticket_id/assign_dealer', authenticateToken, assignDealerToTicket);
router.get('/:user_id/bookings/:aadhaar', getBookingByAadhaar);

router.put(
    "/:user_id/ticket/:ticket_id/update",
    authenticateToken,
    updateTicketStatus
);
router.put(
    "/:user_id/ticket/:ticket_id/add_message",
    authenticateToken,
    addMessage
);

module.exports = router;
