const Ticket = require("../models/ticketModel");

const fetchDealerTickets = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (user_id !== req.userId) {
      return res.sendStatus(403);
    }

    // complete this function to return all the tickets that have an assigned dealer as the logged in dealer. Will assigning, save the user_id of the assigned dealer in the ticket.
    const tickets = await Ticket.find({ assignedDealer: user_id });
    res.json({ status: 200, tickets });
  } catch (err) {
    res.json({ err });
  }
};

const addMessage = async (req, res) => {
  const { user_id } = req.params;
  const { ticket_id } = req.params;
  const { userRole, textMessage } = req.body;

  if (user_id !== req.userId) {
    return res.sendStatus(403);
  }

  const updatedTicket = await Ticket.findOneAndUpdate(
    { id: ticket_id },
    {
      $push: {
        logs: {
          timestamp: Date.now(),
          userRole: userRole,
          message: textMessage,
        },
      },
    },
    { new: true } // This option returns the updated ticket after the update
  );
  // console.log(ticket.logs);
  res.json({ status: 200 });
};

module.exports = { fetchDealerTickets, addMessage };
