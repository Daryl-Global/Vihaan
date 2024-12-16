// src/hooks/useUpdateTicket.js
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { updateTicketOnServer } from "../services/ticketServices";

export const useUpdateTicket = () => {
  const navigate = useNavigate();

  const updateTicket = async (ticketId, updatedTicket, userId) => {
    try {
      console.log('Inside useUpdateTicket Hook, updatedTicket:', updatedTicket);
      const updateTicketResponse = await updateTicketOnServer(ticketId, updatedTicket);
      if (updateTicketResponse.data.status === 200) {
        toast.success("Your stock has been successfully updated.");
        navigate(`/user/${userId}/tickets`);
      } else {
        toast.error("An error occurred while updating the stock.");
      }
    } catch (error) {
      toast.error("An error occurred while updating the stock.");
    }
  };

  return updateTicket;
};