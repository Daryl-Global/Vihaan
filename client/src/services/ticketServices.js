// src/services/ticketService.js

import axios from 'axios';

// Function to update the ticket on the server
export const updateTicketOnServer = async (ticketId, updatedTicket) => {
  try {
    // Make the PUT request to the server with updated ticket data
    const updateTicketResponse = await axios.put(
      `/api/user/update_stock/${ticketId}`,
      updatedTicket,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return updateTicketResponse; // Return the response from the server
  } catch (error) {
    // Return a default error response in case of failure
    return { 
        data: { 
            status: 500,
            error: error.message
        } 
    };
  }
};
