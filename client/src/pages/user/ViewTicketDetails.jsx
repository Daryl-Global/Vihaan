// frontend/src/components/ViewTicketDetails.jsx

import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CreateUpdateTicket from "../../components/CreateUpdateTicket";
import IssueSaleLetter from "../../components/IssueSaleLetter";
import DatePassing from "../../components/DatePassing";
import RegistrationDetails from "../../components/RegistrationDetails";
import DeliveryReport from "../../components/DeliveryReport";
import { getUser } from "../../stores/userStore";
import { useUpdateTicket } from '../../hooks/useUpdateTicket';

const PRIVILEGED_USER_ROLES = ['admin', 'owner', 'dealer'];

const ViewTicketDetails = () => {
    const user = getUser();
    const { ticket_id } = useParams();
    const navigate = useNavigate();
    const updateTicket = useUpdateTicket();

    const [ticket, setTicket] = useState({});
    const [status, setStatus] = useState(ticket.status);
    const [location, setLocation] = useState(ticket.location);
    const [showTransferStock, setShowTransferStock] = useState(false);
    const [dealerId, setDealerId] = useState("");
    const [dealerName, setDealerName] = useState("");
    const [dealerInfo, setDealerInfo] = useState([]);
    const [assignedDealerName, setAssignedDealerName] = useState("");
    const [dealerHistoryDetails, setDealerHistoryDetails] = useState([]);
    const [allocateStock, setAllocateStock] = useState(false);
    const [deliveryTicket, setDeliveryTicket] = useState(false);
    const [saleLetter, setSaleLetter] = useState(false);
    const [datePassing, setDatePassing] = useState(false);
    const [registrationDetails, setRegistrationDetails] = useState(false);
    const [partName, setPartName] = useState("");
    const [isHovered, setIsHovered] = useState(false);

    const getRole = () => {
        switch (user.role) {
            case "9087-t1-vaek-123-riop":
                return "admin";
            case "2069-t2-prlo-456-fiok":
                return "dealer";
            case "4032-t3-raek-789-chop":
                return "user";
            case "5001-t4-maek-101-znop":
                return "manager";
            case "6002-t5-saek-202-kiop":
                return "supervisor";
            case "7003-t6-laek-303-jiop":
                return "accounts";
        }
    };

    const handlePartNameChange = (e) => {
        setPartName(e.target.value);
    };

    const fetchTicketDetails = async () => {
        try {
            const res = await axios.get(`/api/user/${user.id}/ticket/${ticket_id}`);
            const ticketData = res.data.ticket;
            setTicket(ticketData);
            setStatus(ticketData.resolved);
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch ticket details.");
        }
    };

    const fetchDealers = async () => {
        try {
            const res = await axios.get(`/api/admin/${user.id}/dealers`, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = res.data;
            if (data.status === 200) {
                const dealerList = data.dealers;
                const dealerInfoScope = dealerList.map((dealer) => ({
                    name: dealer.name,
                    userId: dealer.userId,
                }));
                setDealerInfo(dealerInfoScope);
            } else {
                toast.error("Failed to fetch dealers.");
            }
        } catch (err) {
            console.log(err);
            toast.error("An error occurred while fetching dealers.");
        }
    };

    useEffect(() => {
        fetchTicketDetails();
    }, [user.id, ticket_id]);

    useEffect(() => {
        fetchDealers();
    }, [user.id]);

    useEffect(() => {
        if (ticket.assignedDealer && dealerInfo.length > 0) {
            const dealer = dealerInfo.find((d) => d.userId === ticket.assignedDealer);
            setAssignedDealerName(dealer ? dealer.name : "Unknown Dealer");
        } else {
            setAssignedDealerName("No dealer assigned");
        }

        if (ticket.dealerHistory && dealerInfo.length > 0) {
            const historyDetails = ticket.dealerHistory.map((entry) => {
                const fromDealer = entry.fromDealerId && entry.fromDealerId !== "None"
                    ? dealerInfo.find((d) => d.userId === entry.fromDealerId)
                    : null;
                const toDealer = dealerInfo.find((d) => d.userId === entry.toDealerId);
                return {
                    from: fromDealer ? fromDealer.name : "No Previous Dealer",
                    to: toDealer ? toDealer.name : "Unknown Dealer",
                    timestamp: entry.timestamp,
                };
            });
            setDealerHistoryDetails(historyDetails);
        } else {
            setDealerHistoryDetails([]);
        }
    }, [ticket, dealerInfo]);

    useEffect(() => {
        const updateResolvedStatus = async () => {
            try {
                await axios.put(
                    `/api/user/${user.id}/ticket/${ticket_id}/update`,
                    {
                        resolved: status,
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                /*toast.success("Ticket status updated successfully.");*/
            } catch (error) {
                console.error(error);
                toast.error("Failed to update ticket status.");
            }
        };

        if (ticket.id) {
            updateResolvedStatus();
        }
    }, [status, user.id, ticket_id, ticket.id]);

    const handleTransferStock = () => {
        setShowTransferStock(true);
    };

    const handleInputChange = (e) => {
        const selectedDealerId = e.target.value;
        setDealerId(selectedDealerId);
        const selectedDealer = dealerInfo.find((d) => d.userId === selectedDealerId);
        setDealerName(selectedDealer ? selectedDealer.name : "");
    };

    const handleCheckboxChange = async (newValue) => {
        if (ticket.nameCus && PRIVILEGED_USER_ROLES.includes(user.role)) {
            if (window.confirm("Are you sure you want to update 'Sent for Issue Sale Letter'?")) {
                // Update the value in the state
                const updatedTicket = { ...ticket, sentForIssueSaleLetter: newValue };
                setTicket(updatedTicket);
    
                try {
                    const updateTicketResponse = await updateTicketOnServer(updatedTicket);
                    if (updateTicketResponse.data.status === 200) {
                        setStatus("success");
                        toast.success("Your stock has been successfully updated.");
                        // navigate(`/user/${user.id}/tickets`);
                    } else {
                        setStatus("error");
                        toast.error("An error occurred while updating the stock.");
                    }
                } catch (error) {
                    // Handle any errors from updateTicketOnServer
                    setStatus("error");
                    toast.error("An error occurred while updating the stock.");
                }            
            }
        }
        else {
            toast.error("You don't have permission to do that.");
        }
        
    };
    
    const updateTicketOnServer = async (updatedTicket) => {
        try {
            const updateTicketResponse = await axios.put(
              `/api/user/update_stock/${ticket.id}`,
              updatedTicket,
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
            return updateTicketResponse;
          } catch (error) {
            console.log(error);
            return { data: { status: 500 } };
          }
    }

    const submitTransferLocation = async () => {
    
        console.log("Update initiated");
        const updatedTicket = {
          ...ticket,
          location: location,
        };
        console.log("Updated stock:", updatedTicket);
    
        await updateTicket(ticket.id, updatedTicket, user.id);
    }

    const setDealer = async () => {
        if (!dealerId) {
            toast.error("Please select a dealer to transfer stock.");
            return;
        }

        try {
            const res = await axios.put(
                `/api/user/${user.id}/ticket/${ticket_id}/assign_dealer`,
                { dealerId },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            const data = res.data;
            if (data.status === 200) {
                toast.success(`Stock has been transferred to ${dealerName}.`);
                fetchTicketDetails();
                setShowTransferStock(false);
            } else {
                toast.error("Failed to assign dealer.");
            }
        } catch (err) {
            console.log(err);
            toast.error("An error occurred while assigning dealer.");
        }
    };

    // Functions to handle clicks on module headers

    let transferStockRoles = ['admin', 'owner', 'dealer'];
    const handleTransferStockClick = () => {
        if (transferStockRoles.includes(user.role)) {
            setShowTransferStock(true);
        } else {
            toast.error('You do not have permission to access Transfer Stock.');
        }
    };


    let allocationRoles = ['admin', 'owner', 'dealer', 'allocation_user'];
    const handleAllocationClick = () => {
        if (allocationRoles.includes(user.role)) {
            setAllocateStock(true);
        } else {
            toast.error('You do not have permission to access Allocation Details.');
        }
    };

    let saleLetterRoles = ['admin', 'owner', 'sale_letter_user'];
    const handleSaleLetterClick = () => {
        if (saleLetterRoles.includes(user.role)) {
            if (ticket.nameCus && ticket.bookingAmount && ticket.hp && ticket.executive) {
                setSaleLetter(true);
            } else {
                toast.error('Please complete the Allocation Details section first.');
            }
        } else {
            toast.error('You do not have permission to access Issue Sale Letter.');
        }
    };

    let passingRoles = ['admin', 'owner', 'passing_details_user'];
    const handlePassingClick = () => {
        if (passingRoles.includes(user.role)) {
            if (ticket.approvedDate && ticket.issueFinance) {
                setDatePassing(true);
            } else {
                toast.error('Please complete the Issue Sale Letter section first.');
            }
        } else {
            toast.error('You do not have permission to access Passing Details.');
        }
    };

    let registrationRoles = ['admin', 'owner', 'registration_details_user'];
    const handleRegistrationClick = () => {
        if (registrationRoles.includes(user.role)) {
            if (ticket.approvedDate && ticket.issueFinance) {
                setRegistrationDetails(true);
            } else {
                toast.error('Please complete the Issue Sale Letter section first.');
            }
        } else {
            toast.error('You do not have permission to access Registration Details.');
        }
    };

    let deliveryRoles = ['admin', 'owner', 'dealer'];
    const handleDeliveryClick = () => {
        if (deliveryRoles.includes(user.role)) {
            if (ticket.approvedDate && ticket.issueFinance) {
                setDeliveryTicket(true);
            } else {
                toast.error('Please complete the Issue Sale Letter section first.');
            }
        } else {
            toast.error('You do not have permission to access Delivery Report.');
        }
    };

    const handleHeaderClick = () => {
        setShowTransferStock(true);
    };

    return (
        <>
            <div className="bg-gradient-to-br from-blue-500 to-green-200">
                <div className="w-full max-w-8xl p-4 bg-white rounded-lg shadow-lg ">
                    <div className="h-full max-h-10xl p-4 bg-pink rounded-lg shadow-lg">
                        <button
                            className="text-2xl font-bold text-center text-blue-800 mb-4 w-full bg-transparent hover:bg-blue-800 hover:text-white py-2 px-4 rounded transition-all duration-300 cursor-pointer focus:outline-none"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            onClick={handleTransferStockClick}
                            aria-label={isHovered ? "Transfer Stock" : "Stock Details"}
                        >
                            {isHovered ? "Transfer Stock" : "Stock Details"}
                        </button>
                        <table className="w-full table-fixed border-collapse">
                            <tbody className="text-gray-700">
                                <tr>
                                    <td className="font-bold text-blue-800 px-2 py-1 border">
                                        Model:
                                    </td>
                                    <td className="px-2 py-1 border">{ticket.model}</td>
                                    <td className="font-bold text-blue-800 px-2 py-1 border">
                                        Colour:
                                    </td>
                                    <td className="px-2 py-1 border">{ticket.colour}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold text-blue-800 px-2 py-1 border">
                                        Chassis Number:
                                    </td>
                                    <td className="px-2 py-1 border">{ticket.chassisNo}</td>
                                    <td className="font-bold text-blue-800 px-2 py-1 border">
                                        Engine Number:
                                    </td>
                                    <td className="px-2 py-1 border">{ticket.engineNo}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold text-blue-800 px-2 py-1 border">
                                        Created At:
                                    </td>
                                    <td className="px-2 py-1 border">
                                        {ticket.createdAt
                                            ? new Date(ticket.createdAt).toLocaleString()
                                            : ""}
                                    </td>
                                    <td className="font-bold text-blue-800 px-2 py-1 border">
                                        Showroom:
                                    </td>
                                    <td className="px-2 py-1 border">{ticket.location}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>


                    {/* Conditional Rendering of Allocation Details */}
                    {(allocationRoles.includes(user.role)) && (
                        <div className="h-full md:max-h-3xl lg:max-h-4xl p-2 bg-white rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold text-center text-blue-800 mb-4 cursor-pointer">Allocation Details</h2>
                            <table className="w-full table-fixed border-collapse">
                                <tbody className="text-gray-700">
                                    <tr>
                                        <td className="font-bold text-blue-800 px-2 py-1 border">
                                            Customer Name:
                                        </td>
                                        <td className="px-2 py-1 border">{ticket.nameCus}</td>
                                        <td className="font-bold text-blue-800 px-2 py-1 border">
                                            Booking Amount:
                                        </td>
                                        <td className="px-2 py-1 border">{ticket.bookingAmount}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-bold text-blue-800 px-2 py-1 border">
                                            Date of Booking:
                                        </td>
                                        <td className="px-2 py-1 border">
                                            {ticket.createdOn
                                                ? new Date(ticket.createdOn).toLocaleString()
                                                : ""}
                                        </td>
                                        <td className="font-bold text-blue-800 px-2 py-1 border">
                                            HP:
                                        </td>
                                        <td className="px-2 py-1 border">{ticket.hp}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-bold text-blue-800 px-2 py-1 border">
                                            Executive:
                                        </td>
                                        <td className="px-2 py-1 border">{ticket.executive}</td>
                                        <td className="font-bold text-blue-800 px-2 py-1 border">
                                            Sent for Issue Sale Letter:
                                        </td>
                                        <td className="px-2 py-1 border">
                                            <input
                                                type="checkbox"
                                                disabled={!(ticket.nameCus && PRIVILEGED_USER_ROLES.includes(user.role))}
                                                checked={ticket.sentForIssueSaleLetter}
                                                onChange={(e) => handleCheckboxChange(e.target.checked)}
                                                className="cursor-pointer"
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Conditional Rendering of Issue Sale Leter */}
                    {(saleLetterRoles.includes(user.role)) && (
                        <div className="h-full md:max-h-3xl lg:max-h-4xl p-2 bg-white rounded-lg shadow-lg">
                            <h2
                                className="text-2xl font-bold text-center text-blue-800 mb-4 cursor-pointer hover:bg-blue-800 hover:text-white py-2 px-4 rounded transition-all duration-300"
                                onClick={handleSaleLetterClick}
                            >
                                Issue Sale Letter
                            </h2>
                            <table className="w-full table-fixed border-collapse">
                                <tbody className="text-gray-700">
                                    <tr>
                                        <td className="font-bold text-blue-800 px-2 py-1 border">
                                            Date (Approved by accounts):
                                        </td>
                                        <td className="px-2 py-1 border">
                                            {ticket.approvedDate
                                                ? new Date(ticket.approvedDate).toLocaleString()
                                                : "Not Approved Yet."}
                                        </td>
                                        <td className="font-bold text-blue-800 px-2 py-1 border">
                                            Amount:
                                        </td>
                                        <td className="px-2 py-1 border">{ticket.issueAmount}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-bold text-blue-800 px-2 py-1 border">
                                            Cash or Finance:
                                        </td>
                                        <td className="px-2 py-1 border">{ticket.issueFinance}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Conditional Rendering of Passing Details */}
                    {(passingRoles.includes(user.role)) && (
                        <div className="h-full md:max-h-3xl lg:max-h-4xl p-2 bg-white rounded-lg shadow-lg">
                            <h2
                                className="text-2xl font-bold text-center text-blue-800 mb-4 cursor-pointer hover:bg-blue-800 hover:text-white py-2 px-4 rounded transition-all duration-300"
                                onClick={handlePassingClick}
                            >
                                Date of Passing
                            </h2>
                            <table className="w-full table-fixed border-collapse">
                                <tbody className="text-gray-700">
                                    <tr>
                                        <td className="font-bold text-blue-800 px-2 py-1 border">
                                            Date:
                                        </td>
                                        <td className="px-2 py-1 border">
                                            {ticket.passingDate
                                                ? new Date(ticket.passingDate)
                                                    .toISOString()
                                                    .split("T")[0]
                                                : ""}
                                        </td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Conditional Rendering of Registration Details */}
                    {(registrationRoles.includes(user.role)) && (
                        <div className="h-full md:max-h-3xl lg:max-h-4xl p-2 bg-white rounded-lg shadow-lg">
                            <h2
                                className="text-2xl font-bold text-center text-blue-800 mb-4 cursor-pointer hover:bg-blue-800 hover:text-white py-2 px-4 rounded transition-all duration-300"
                                onClick={handleRegistrationClick}
                            >
                                Registration Details
                            </h2>
                            <table className="w-full table-fixed border-collapse">
                                <tbody className="text-gray-700">
                                    <tr>
                                        <td className="font-bold text-blue-800 px-2 py-1 border">
                                            Date:
                                        </td>
                                        <td className="px-2 py-1 border">
                                            {ticket.registrationDate
                                                ? new Date(ticket.registrationDate)
                                                    .toISOString()
                                                    .split("T")[0]
                                                : ""}
                                        </td>
                                        <td className="font-bold text-blue-800 px-2 py-1 border">
                                            Vehicle number:
                                        </td>
                                        <td className="px-2 py-1 border">{ticket.vehicleNumber}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Conditional Rendering of Delivery Report */}
                    {(deliveryRoles.includes(user.role)) && (
                        <div className="h-full md:max-h-3xl lg:max-h-4xl p-2 bg-white rounded-lg shadow-lg">
                            <h2
                                className="text-2xl font-bold text-center text-blue-800 mb-4 cursor-pointer hover:bg-blue-800 hover:text-white py-2 px-4 rounded transition-all duration-300"
                                onClick={handleDeliveryClick}
                            >
                                Delivery Report
                            </h2>
                            <table className="w-full table-fixed border-collapse">
                                <tbody className="text-gray-700">
                                    <tr>
                                        {/* <td className="font-bold text-blue-800 px-2 py-1 border">
                                            Amount:
                                        </td>
                                        <td className="px-2 py-1 border">{ticket.deliveryAmount}</td> */}
                                        <td className="font-bold text-blue-800 px-2 py-1 border">Gate Pass Number:</td>
                                        <td className="px-2 py-1 border">{ticket.gatePassSerialNumber}</td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>
            </div>

            <div className="flex justify-center gap-2 py-4 border-t border-gray-300">
                {user.role === "9087-t1-vaek-123-riop" && (
                    <button
                        onClick={handleTransferStock}
                        className="px-6 py-2 text-white bg-teal-500 rounded hover:bg-teal-600 cursor-pointer transition-all duration-300 transform hover:scale-105"
                    >
                        Transfer Stock
                    </button>
                )}
            </div>

            {showTransferStock && (
                <>
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
                        <div className="relative w-full max-w-3xl mx-auto my-6">
                            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none max-h-[80vh] overflow-y-auto">

                                <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-slate-200">
                                    <h3 className="text-3xl font-semibold">Transfer Stock</h3>
                                    <button
                                        className="text-3xl text-red-500"
                                        onClick={() => setShowTransferStock(false)}
                                        aria-label="Close Modal"
                                    >
                                        &times;
                                    </button>
                                </div>
                                <div className="relative flex-auto p-5">
                                    {/* <h4 className="text-xl font-bold mb-2">Transfer History</h4>
                                    <ul className="list-disc list-inside mb-4">
                                        {dealerHistoryDetails.length > 0 ? (
                                            dealerHistoryDetails.map((entry, index) => (
                                                <li key={index}>
                                                    From <strong>{entry.from}</strong> to{" "}
                                                    <strong>{entry.to}</strong> on{" "}
                                                    {new Date(entry.timestamp).toLocaleString()}
                                                </li>
                                            ))
                                        ) : (
                                            <li>No transfer history.</li>
                                        )}
                                    </ul> */}

                                    <h4 className="text-xl font-bold mb-2">Transfer to Location</h4>
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded mb-4"
                                        value={location}
                                        onChange={(e) => {
                                            setLocation(e.target.value);
                                            console.log('Transfer location dropdown update:',e.target.value)
                                        }}
                                    >
                                        <option value="" disabled>Select location</option>
                                        <option value="Manpada">Manpada</option>
                                        <option value="Ovala">Ovala</option>
                                        <option value="Shreenagar">Shreenagar</option>
                                        <option value="Shahapur">Shahapur</option>
                                        <option value="Padgha">Padgha</option>
                                        <option value="Diva">Diva</option>
                                        <option value="Vasind">Vasind</option>
                                        <option value="Lokmanyanagar">Lokmanyanagar</option>
                                        <option value="Vashi">Vashi</option>
                                        <option value="Airoli">Airoli</option>
                                        <option value="Airoli EC">Airoli EC</option>
                                        <option value="Sanpada">Sanpada</option>
                                        <option value="Turbhe">Turbhe</option>
                                        <option value="Ghansoli">Ghansoli</option>
                                        <option value="Bigwing Thane">Bigwing Thane</option>
                                        <option value="Bigwing Miraroad">Bigwing Miraroad</option>
                                        <option value="Bigwing Surat">Bigwing Surat</option>
                                    </select>

                                    <div className="mt-4 flex justify-end">
                                        <button
                                            className="px-6 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors duration-300 transform hover:scale-105"
                                            onClick={submitTransferLocation}
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
                </>
            )}

            {allocateStock && (
                <CreateUpdateTicket setUpdateTicket={setAllocateStock} ticket={ticket} />
            )}
            {saleLetter && (
                <IssueSaleLetter setSaleLetter={setSaleLetter} ticket={ticket} />
            )}
            {datePassing && (
                <DatePassing setDatePassing={setDatePassing} ticket={ticket} />
            )}
            {registrationDetails && (
                <RegistrationDetails
                    setRegistrationDetails={setRegistrationDetails}
                    ticket={ticket}
                />
            )}
            {deliveryTicket && (
                <DeliveryReport
                    setDeliveryTicket={setDeliveryTicket}
                    ticket={ticket}
                />
            )}
        </>
    );
};

export default ViewTicketDetails;
