import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUser } from "../../stores/userStore";

export const UserTickets = () => {
    const user = getUser();
    const [userTickets, setUserTickets] = useState([]);
    const [filteredLocation, setLocationFilter] = useState("all");
    const [filteredModel, setModelFilter] = useState("all");
    const [filteredVariant, setVariantFilter] = useState("all");
    const [filteredStatus, setStatusFilter] = useState("all");
    const [chassisFilter, setChassisFilter] = useState('');
    const [engineFilter, setEngineFilter] = useState('');
    const [CustomerFilter, setCustomerFilter] = useState('');
    const [availableModels, setAvailableModels] = useState([]);
    const [availableVariants, setAvailableVariants] = useState([]);
    const [locations, setLocations] = useState([]);
    const [stockStatuses, setStockStatuses] = useState([]);
    const [availableCustomerNames, setAvailableCustomerNames] = useState([]);
    const [filteredCustomerName, setFilteredCustomerName] = useState("all");

    const [sessionTimeLeft, setSessionTimeLeft] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const getTicketExport = async (exportOption) => {
        try {
            let exportURL = "";


            if (exportOption === "export_all") {
                exportURL = `/api/admin/${user.id}/export_tickets`;
            } else if (exportOption === "export_my_tickets") {
                exportURL = `/api/admin/${user.id}/export_my_tickets`;
            } else {
                alert("Please select an export option!");
                return;
            }

            const res = await axios.get(exportURL, {
                responseType: "arraybuffer",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = exportOption === "export_all" ? `All_Stocks.xlsx` : `Dashboard_Stocks.xlsx`;
            link.click();
        } catch (error) {
            console.error('Error downloading the tickets:', error);
        }
    };

    const handleExportOptionClick = (option) => {
        setIsDropdownOpen(false);
        getTicketExport(option);
    };

    const startSessionCountdown = () => {
        const sessionStartTime = localStorage.getItem('sessionStartTime');
        const sessionDuration = 3600 * 1000;

        if (sessionStartTime) {
            const startTime = new Date(sessionStartTime).getTime();
            const currentTime = new Date().getTime();
            const timePassed = currentTime - startTime;
            const timeLeft = sessionDuration - timePassed;

            if (timeLeft <= 0) {
                alert("Session expired!");
                navigate("/login");
            } else {
                setSessionTimeLeft(timeLeft);
            }
        } else {
            console.error('No session start time found.');
        }
    };

    useEffect(() => {
        startSessionCountdown();
        const countdownInterval = setInterval(startSessionCountdown, 1000);
        return () => clearInterval(countdownInterval);
    }, [navigate]);

    useEffect(() => {

        const fetchTickets = async () => {
            try {

                const res = await axios.post(`/api/user/tickets`, {
                    user: user,
                    headers: {
                        "Content-Type": "application/json",
                    },
                })

                const data = await res.data;
                if (data.status === 200) {
                    setUserTickets(data.tickets);
                    const uniqueValues = data.tickets.reduce((acc, ticket) => {
                        acc.models.add(ticket.model);
                        acc.variants.add(ticket.variant);
                        acc.locations.add(ticket.location);
                        acc.statuses.add(ticket.status);
                        acc.customers.add(ticket.nameCus);
                        return acc;
                    }, { models: new Set(), variants: new Set(), locations: new Set(), statuses: new Set(), customers: new Set() });
                    
                    setAvailableModels(Array.from(uniqueValues.models));
                    setAvailableVariants(Array.from(uniqueValues.variants));
                    setLocations(Array.from(uniqueValues.locations));
                    setStockStatuses(Array.from(uniqueValues.statuses));
                    setAvailableCustomerNames(Array.from(uniqueValues.customers));
                } else if (data.status === 403) {
                    navigate("/unauthorized");
                } else {
                    navigate("/unauthorized");
                }
            } catch (error) {
                navigate("/unauthorized");
            }
        };

        fetchTickets();
    }, [navigate]);

    useEffect(() => {
        if (filteredModel === 'all') {
            // If 'All Models' is selected, reset variant filter
            setVariantFilter('all');
        } else {
            // Find the variants for the selected model
            const modelVariants = userTickets
                .filter(ticket => ticket.model === filteredModel)
                .map(ticket => ticket.variant);
            setAvailableVariants([...new Set(modelVariants)]); // Ensure uniqueness
        }
    }, [filteredModel, userTickets]);

    const handleTicketClick = (ticketId) => {
        navigate(`/user/${user.id}/ticket_details/${ticketId}`);
    };

    const initialFilteredTickets = userTickets.filter((ticket) => (user.role !== 'dealer' || ticket.status !== 'deliveredWithNumber'))

    const filteredTickets = initialFilteredTickets
        .filter((ticket) => (filteredLocation === "all" || ticket.location === filteredLocation))
        .filter((ticket) => (filteredModel === "all" || ticket.model === filteredModel))
        .filter((ticket) => (filteredVariant === "all" || ticket.variant === filteredVariant))
        .filter((ticket) => ticket.chassisNo.toLowerCase().includes(chassisFilter.toLowerCase()))
        .filter((ticket) => ticket.engineNo.toLowerCase().includes(engineFilter.toLowerCase()))
        // .filter((ticket) => ticket.namCus?.toLowerCase().includes(CustomerFilter.toLowerCase()))
        .filter((ticket) => (filteredStatus === "all" || ticket.status === filteredStatus))
        .filter((ticket) => {
            return (ticket.nameCus || "")
              .toLowerCase()
              .includes(CustomerFilter.toLowerCase());
          });
        

    const pascalToTitleCase = (str) => {
        return str.replace(/([A-Z])/g, ' $1') // Insert a space before each uppercase letter
                    .trim() // Remove any leading space
                    .replace(/^\w/, c => c.toUpperCase()); // Capitalize the first letter
    }

    const privilegedUser = ['admin', 'owner', 'dealer'].includes(user.role);

    return (
        <div>
            <div className="p-4 bg-gray-100">


                {privilegedUser && (
                    <div className="flex gap-4 mb-6 w-full">
                        <div className="flex-grow bg-orange-500 text-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold">Total Stock</h3>
                            <p className="text-4xl font-bold">{initialFilteredTickets.length}</p>
                        </div>
                        {user.role !== 'dealer' && (
                        <div className="flex-grow bg-teal-500 text-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold">{filteredLocation === "all" ? "Showrooms" : filteredLocation}</h3>
                            <p className="text-4xl font-bold">
                                {filteredTickets.filter((ticket) => ticket.location === filteredLocation).length}
                            </p>
                        </div>
                        )}
                        <div className="flex-grow bg-blue-500 text-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold">
                                {filteredVariant !== "all" ? filteredVariant : (filteredModel === "all" ? "Models" : filteredModel)}
                            </h3>
                            <p className="text-4xl font-bold">
                                {filteredTickets.filter((ticket) => ticket.model === filteredModel).length}
                            </p>
                        </div>
                        <div className="flex-grow bg-green-500 text-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold">{filteredStatus === "all" ? "All Stocks" : pascalToTitleCase(filteredStatus)}</h3>
                            <p className="text-4xl font-bold">
                                {filteredTickets.filter((ticket) => ticket.status === filteredStatus).length}
                            </p>
                        </div>
                    </div>
                )}

                {userTickets.length === 0 ? (
                    <p className="text-lg text-center">
                        {(((user.role === 'owner') || (user.role === 'admin')))
                            ? "No stock present in the inventory."
                            : "No pending items."}
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full bg-white rounded-lg shadow">
                            <thead>
                                <tr className="bg-teal-600 text-white">
                                    <th className="py-2 px-4">
                                        <h3 className="text-lg font-bold">Model</h3>
                                        <select
                                            className="w-full p-1 mt-1 text-teal-800 text-center rounded"
                                            value={filteredModel}
                                            onChange={(e) => {
                                                setModelFilter(e.target.value);
                                                setVariantFilter('all');
                                            }}
                                        >
                                            <option value="all">All Models</option>
                                            {availableModels.map((model) => (
                                                <option key={model} value={model}>
                                                    {model}
                                                </option>
                                            ))}
                                        </select>
                                    </th>
                                    <th className="py-2 px-4">
                                        <h3 className="text-lg font-bold">Variant</h3>
                                        <select
                                            className="w-full p-1 mt-1 text-teal-800 text-center rounded"
                                            value={filteredVariant}
                                            onChange={(e) => setVariantFilter(e.target.value)}
                                            disabled={filteredModel === 'all'}
                                        >
                                            <option value="all">All Variants</option>
                                            {availableVariants.map((variant) => (
                                                <option key={variant} value={variant}>
                                                    {variant}
                                                </option>
                                            ))}
                                        </select>
                                    </th>
                                    <th className="py-2 px-4">
                                        <h3 className="text-lg font-bold">Colour</h3>
                                    </th>
                                    <th className="py-2 px-4">
                                        <h3 className="text-lg font-bold">Chassis No</h3>
                                        <input
                                            type="text"
                                            placeholder="Search Chassis No"
                                            value={chassisFilter}
                                            onChange={(e) => setChassisFilter(e.target.value)}
                                            className="max-w-[180px] p-1 pl-2 mt-1 border rounded text-teal-800 text-center"
                                        />
                                    </th>
                                    <th className="py-2 px-4">
                                        <h3 className="text-lg font-bold">Engine No</h3>
                                        <input
                                            type="text"
                                            placeholder="Search Engine No"
                                            value={engineFilter}
                                            onChange={(e) => setEngineFilter(e.target.value)}
                                            className="max-w-[180px] p-1 pl-2 mt-1 border rounded text-teal-800 text-center"
                                        />
                                    </th>
                                    {user.branch === 'all' && (
                                        <th className="py-2 px-4">
                                            <h3 className="text-lg font-bold">Showroom</h3>
                                            <select
                                                className="w-full p-1 mt-1 text-teal-800 text-center rounded"
                                                value={filteredLocation}
                                                onChange={(e) => setLocationFilter(e.target.value)}
                                            >
                                                <option value="all">All Showrooms</option>
                                                {locations.map((location) => (
                                                    <option key={location} value={location}>
                                                        {location}
                                                    </option>
                                                ))}
                                            </select>
                                        </th>
                                    )}
                                    {privilegedUser && (
                                        <th className="py-2 px-4">
                                            <h3 className="text-lg font-bold">Status</h3>
                                            <select
                                                className="w-full p-1 mt-1 text-teal-800 text-center rounded"
                                                value={filteredStatus}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                            >
                                                <option value="all">All Statuses</option>
                                                {stockStatuses
                                                    .filter((status) => user.role !== 'dealer' || status !== 'deliveredWithNumber')  // Exclude 'deliveredWithNumber' for dealers
                                                    .map((status) => (
                                                    <option key={status} value={status}>
                                                        {pascalToTitleCase(status)}
                                                    </option>
                                                ))}
                                            </select>
                                        </th>
                                    )}


                                    <th className="py-2 px-4">
                                        <h3 className="text-lg font-bold">Customer Name</h3>
                                        <input
                                            type="text"
                                            placeholder="Search Customer Name"
                                            value={CustomerFilter}
                                            onChange={(e) => setCustomerFilter(e.target.value)}
                                            className="max-w-[180px] p-1 pl-2 mt-1 border rounded text-teal-800 text-center"
                                        />
                                    </th>
                                    <th className="py-2 px-4">
                                        <h3 className="text-lg font-bold">Stock Inward Date</h3>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTickets.map((ticket) => (
                                    <tr
                                        key={ticket.id}
                                        onClick={() => handleTicketClick(ticket.id)}
                                        className="hover:bg-gray-100 cursor-pointer border-b"
                                    >
                                        <td className="py-2 px-4 text-center">{ticket.model}</td>
                                        <td className="py-2 px-4 text-center">{ticket.variant}</td>
                                        <td className="py-2 px-4 text-center">{ticket.colour}</td>
                                        <td className="py-2 px-4 text-center">{ticket.chassisNo}</td>
                                        <td className="py-2 px-4 text-center">{ticket.engineNo}</td>
                                        {user.branch === 'all' && (
                                            <td className="py-2 px-4 text-center">{ticket.location}</td>
                                        )}
                                        {privilegedUser && (
                                            <td className="py-2 px-4 text-center">
                                                {pascalToTitleCase(ticket.status)}
                                            </td>
                                        )}
                                        <td className="py-2 px-4 text-center">{ticket.nameCus}</td>
                                        <td className="py-2 px-4 text-center">
                                            {new Date(ticket.createdAt).toLocaleDateString() +
                                                ' ' +
                                                new Date(ticket.createdAt).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true,
                                                })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserTickets;