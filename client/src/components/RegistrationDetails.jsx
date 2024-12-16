// client/src/components/RegistrationDetails.jsx

import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useUpdateTicket } from '../hooks/useUpdateTicket';
import { getUser } from "../stores/userStore";
import "react-toastify/dist/ReactToastify.css";
import PropTypes from 'prop-types';

const RegistrationDetails = ({ setRegistrationDetails, ticket }) => {
    const user = getUser();
    const updateTicket = useUpdateTicket();
    const { user_id } = useParams();
    const navigate = useNavigate();

    // states for all the input fields
    const [status, setStatus] = useState(null);
    const [registrationDate, setRegistrationDate] = useState(ticket.registrationDate ? new Date(ticket.registrationDate).toISOString().split('T')[0] : '');
    const [vehicleNumber, setvehicleNumber] = useState(ticket.vehicleNumber);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if(ticket.passingDate) {
            console.log("Update initiated");
            const updatedTicket = {
                ...ticket,
                registrationDate: new Date(registrationDate),
                vehicleNumber: vehicleNumber,
                status: (
                    ticket.gatePassSerialNumber
                      ? 'deliveredWithNumber'
                      : 'soldButNotDelivered'
                  )
            };
            // console.log(updatedTicket);
    
            await updateTicket(ticket.id, updatedTicket, user.id);
        } else {
            toast.error("You cannot submit Registration Details until Passing Date has been set first.")
        }
        
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center m-4 overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
                <div className="relative w-auto max-w-3xl mx-auto my-6">
                    <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                        <div className="flex items-center justify-between gap-5 p-5 border-b border-solid rounded-t border-slate-200">
                            <h3 className="text-3xl font-semibold">Registration Details</h3>
                            <button
                                onClick={() => setRegistrationDetails(false)}
                                className="text-2xl text-red-500"
                            >
                                X
                            </button>
                        </div>
                        <div className="max-w-md p-6 mx-auto bg-white rounded-lg">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <input
                                        required
                                        type="date"
                                        className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={registrationDate}
                                        onChange={(e) => setRegistrationDate(e.target.value)}
                                        autoComplete="registrationDate"
                                    />
                                    <input
                                        required
                                        type="text"
                                        className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Vehicle Number"
                                        value={vehicleNumber}
                                        onChange={(e) => setvehicleNumber(e.target.value)}
                                        autoComplete="vehicleNumber"
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


RegistrationDetails.propTypes = {
    setRegistrationDetails: PropTypes.func.isRequired,
    ticket: PropTypes.shape({
        id: PropTypes.string.isRequired,
        registrationDate: PropTypes.date,
        vehicleNumber: PropTypes.string,
    }).isRequired,
};

export default RegistrationDetails;
