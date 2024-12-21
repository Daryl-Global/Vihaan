import axios from "axios";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useUpdateTicket } from '../hooks/useUpdateTicket';
import { getUser } from "../stores/userStore";
import "react-toastify/dist/ReactToastify.css";


const IssueSaleLetter = ({ setSaleLetter, ticket }) => {
  const user = getUser();
  const updateTicket = useUpdateTicket();
  const { user_id } = useParams();
  const navigate = useNavigate();

  // states for all the input fields
  const [colour, setcolour] = useState(ticket.colour);
  const [issueAmountPlaceholder, setIssueAmountPlaceholder] = useState(`Amount should be atleast ${ticket.bookingAmount}`);
  const [deliveryAmount, setdeliveryAmount] = useState("");
  const [issueFinance, setissueFinance] = useState(ticket.issueFinance);
  const [issueAmount, setissueAmount] = useState(ticket.issueAmount);
  const [isApproved, setApproved] = useState(ticket.isApproved);
  const [approvedDate, setApprovedDate] = useState(ticket.approvedDate || null);

  const handleToggleApproval = () => {
    setApproved(!isApproved);
    setApprovedDate(!isApproved ? new Date().toISOString() : null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Update initiated");

    if (parseFloat(issueAmount) < parseFloat(ticket.bookingAmount)) {
      toast.error(`Issue amount cannot be lower than ${ticket.bookingAmount}`);
      return;
  }

    const currentDate = new Date();
    const updatedTicket = {
      //user_id: user_id, //user_id is coming from the URL itself and then it is passed to the backend
      colour: colour,
      assignedDealer: "",
      ticket_id: ticket.id,
      deliveryAmount: deliveryAmount,
      issueFinance: issueFinance,
      issueAmount: issueAmount,
      isApproved: isApproved,
      approvedDate: approvedDate,
      passingDate: null,
      status: isApproved ? 'soldButNotDelivered' : 'allocated',
      status1: "Issue"
    };
    console.log(updatedTicket);

    await updateTicket(ticket.id, updatedTicket, user.id);
    // Reset the form after submission
    setcolour("");
    setcompanyName(""), setEmail("");
    setPhone("");
    setEmail1("");
    setLandline("");
    setDepartment("");
    setIssue("");
    setChannel("");
    setRemarks("");
    setdeliveryAmount("");
    setissueFinance("");
    setissueAmount("");
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center m-4 overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
        <div className="relative w-auto max-w-3xl mx-auto my-6">
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            <div className="flex items-center justify-between gap-5 p-5 border-b border-solid rounded-t border-slate-200">
              <h3 className="text-3xl font-semibold">Issue Sale Letter.</h3>
              <button
                onClick={() => setSaleLetter(false)}
                className="text-2xl text-red-500"
              >
                X
              </button>
            </div>
            <div className="max-w-md p-6 mx-auto bg-white rounded-lg shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">

                  <input
                    required
                    type="number"
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={issueAmountPlaceholder}
                    name="issueAmount"
                    value={issueAmount}
                    onChange={(e) => setissueAmount(e.target.value)}
                    min={ticket.bookingAmount}
                  />

                  <select
                    required
                    value={issueFinance}
                    onChange={(e) => setissueFinance(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select HP</option>
                    <option value="Bajaj Finance Limited.">Bajaj Finance Limited.</option>
                    <option value="Tata Capital Financial Services Ltd.">Tata Capital Financial Services Ltd.</option>
                    <option value="Aditya Birla Finance Ltd.">Aditya Birla Finance Ltd.</option>
                    <option value="Mahindra & Mahindra Financial Services Limited.">Mahindra & Mahindra Financial Services Limited.</option>
                    <option value="Cash.">Cash.</option>
                  </select>
                </div>

                <div className="flex justify-center items-center">
                  <button
                    type="button"
                    onClick={handleToggleApproval}
                    className={`relative inline-flex items-center h-10 w-40 rounded-full transition-colors duration-300 ease-in-out
          ${isApproved ? "bg-green-500" : "bg-red-500"}`}
                  >
                    <span
                      className={`absolute left-10 text-white font-semibold transition-opacity duration-300 ease-in-out
            ${isApproved ? "opacity-100" : "opacity-0"}`}
                    >
                      Approved
                    </span>
                    <span
                      className={`absolute right-4 text-white font-semibold transition-opacity duration-300 ease-in-out
            ${isApproved ? "opacity-0" : "opacity-100"}`}
                    >
                      Not Approved
                    </span>
                    <span
                      className={`inline-block w-7 h-7 transform bg-white rounded-full transition-transform duration-300 ease-in-out
            ${isApproved ? "translate-x-32" : "translate-x-1"}`}
                    />
                  </button>
                </div>


                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="w-40 px-8 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed inset-0 z-40 opacity-60 bg-slate-900"></div>
    </>
  );
};



export default IssueSaleLetter;
