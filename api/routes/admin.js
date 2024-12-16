const express = require("express");
const {
  fetchTickets,
  assignRole,
  fetchDealers,
  setDealer,
  acceptTicket,
  setPriority,
  setProblem,
  setServiceType,
  setAMC,
  addMessage,
  deleteTicket,
    exportTickets,
    getBookings,
    getVehicles,
  exportMyTickets,
} = require("../controllers/admin.js");
const { authenticateToken } = require("../middleware/authorization");

const router = express.Router();

router.get("/:user_id/tickets", authenticateToken, fetchTickets);
router.get("/:user_id/export_tickets", authenticateToken, exportTickets);
router.get("/:user_id/export_my_tickets", authenticateToken, exportMyTickets);
router.get("/:user_id/dealers", authenticateToken, fetchDealers);
router.put("/:user_id/create_dealer", authenticateToken, assignRole);
router.get('/:user_id/bookings', getBookings);
router.get('/:user_id/vehicle', getVehicles);
router.put(
  "/:user_id/ticket/:ticket_id/set_dealer",
  authenticateToken,
  setDealer
);
router.put(
  "/:user_id/ticket/:ticket_id/accept_ticket",
  authenticateToken,
  acceptTicket
);
router.put(
  "/:user_id/ticket/:ticket_id/set_priority",
  authenticateToken,
  setPriority
);
router.put(
  "/:user_id/ticket/:ticket_id/set_Problem",
  authenticateToken,
  setProblem
);
router.put(
  "/:user_id/ticket/:ticket_id/set_ServiceType",
  authenticateToken,
  setServiceType
);

router.put(
  "/:user_id/ticket/:ticket_id/set_AMC",
  authenticateToken,
  setAMC
);


router.put(
  "/:user_id/ticket/:ticket_id/add_message",
  authenticateToken,
  addMessage
);
router.delete(
  "/:user_id/ticket/:ticket_id/delete_ticket",
  authenticateToken,
  deleteTicket
);

module.exports = router;
