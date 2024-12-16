// client/src/components/DatePassing.jsx

import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useUpdateTicket } from '../hooks/useUpdateTicket';
import { getUser } from "../stores/userStore";
import PropTypes from 'prop-types';

const DatePassing = ({ setDatePassing, ticket }) => {
  const user = getUser();
  const updateTicket = useUpdateTicket();
  const { user_id } = useParams();
  const navigate = useNavigate();

  // states for all the input fields
  const [status, setStatus] = useState(null);
  const [passingDate, setPassingDate] = useState(ticket.passingDate ? new Date(ticket.passingDate).toISOString().split('T')[0] : '');

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Update initiated");
    const updatedTicket = {
      ticket_id: ticket.id,
      passingDate: new Date(passingDate),
    };
    // console.log(updatedTicket);

    await updateTicket(ticket.id, updatedTicket, user.id);

    setPassingDate("");
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center m-4 overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
        <div className="relative w-auto max-w-3xl mx-auto my-6">
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            <div className="flex items-center justify-between gap-5 p-5 border-b border-solid rounded-t border-slate-200">
              <h3 className="text-3xl font-semibold">Date of Passing</h3>
              <button
                onClick={() => setDatePassing(false)}
                className="text-2xl text-red-500"
              >
                X
              </button>
            </div>
            <div className="max-w-md p-6 mx-auto bg-white rounded-lg">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="">
                  <input
                    required
                    type="date"
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={passingDate}
                    onChange={(e) => setPassingDate(e.target.value)}
                    autoComplete="passingDate"
                  />
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


DatePassing.propTypes = {
  setDatePassing: PropTypes.func.isRequired,
  ticket: PropTypes.shape({
    id: PropTypes.string.isRequired,
    passingDate: PropTypes.date
  }).isRequired,
};

export default DatePassing;
