const express = require("express");
const {
  fetchDealerTickets,
  addMessage,
} = require("../controllers/dealer.js");
const { authenticateToken } = require("../middleware/authorization");

const router = express.Router();

router.get("/:user_id/tickets", authenticateToken, fetchDealerTickets);
router.put(
  "/:user_id/ticket/:ticket_id/add_message",
  authenticateToken,
  addMessage
);

module.exports = router;
