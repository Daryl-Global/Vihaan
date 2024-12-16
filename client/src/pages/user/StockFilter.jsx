import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

export const StockFilter = () => {
    const { user_id } = useParams();
    const [userTickets, setUserTickets] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState("all");
    const [selectedFilter1, setSelectedFilter1] = useState("all");
    const [availableModels, setAvailableModels] = useState([]);
    const [locations, setLocations] = useState([]);
    const [recentProducts, setRecentProducts] = useState([]);
    const navigate = useNavigate();
    const role = localStorage.getItem("role");

    const getRole = () => {
        switch (role) {
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
            default:
                return "";
        }
    };

    const getDisplayName = () => {
        switch (selectedFilter) {
            case "thanestock":
                return "Thane Stock";
            case "vashistock":
                return "Vashi Stock";
            case "ghansolistock":
                return "Ghansoli Stock";
            case "airolistock":
                return "Airoli Stock";
            default:
                return "All Stock";
        }
    };

    const calculateTimeDifference = (createdAt) => {
        const currentDate = new Date();
        const ticketDate = new Date(createdAt);
        const timeDifference = currentDate.getTime() - ticketDate.getTime();
        const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        return daysDifference;
    };

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const res = await axios.get(`/api/${getRole()}/${user_id}/tickets`, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const data = await res.data;
                if (data.status === 200) {
                    setUserTickets(data.tickets);
                    const models = Array.from(
                        new Set(data.tickets.map((ticket) => ticket.model))
                    );
                    setAvailableModels(models);

                    const locs = Array.from(
                        new Set(data.tickets.map((ticket) => ticket.location))
                    );
                    setLocations(locs);

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
    }, [user_id, navigate]);

    const handleTicketClick = (ticketId) => {
        navigate(`/user/${user_id}/ticket_details/${ticketId}`);
    };

    const sortedTickets = userTickets.sort((a, b) => {
        if (a.resolved === b.resolved) {
            return new Date(a.createdAt) - new Date(b.createdAt);
        }
        return a.resolved ? 1 : -1;
    });

    const filteredTickets = sortedTickets
        .filter((ticket) => {
            if (selectedFilter === "all") return true;
            switch (selectedFilter) {
                case "thanestock":
                    return ticket.location === "Thane";
                case "vashistock":
                    return ticket.location === "Vashi";
                case "ghansolistock":
                    return ticket.location === "Ghansoli";
                case "airolistock":
                    return ticket.location === "Airoli";
                default:
                    return true;
            }
        })
        .filter((ticket) => {
            if (selectedFilter1 === "all") return true;
            return ticket.model === selectedFilter1;
        });

    // Prepare datasets for models and locations
    const modelsData = availableModels.map(model => filteredTickets.filter(ticket => ticket.model === model).length);
    const locationsData = locations.map(location => filteredTickets.filter(ticket => ticket.location === location).length);

    const chartData = {
        labels: [...availableModels, ...locations],
        datasets: [
            {
                label: 'Stock by Model',
                data: modelsData,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
            },
            {
                label: 'Stock by Location',
                data: locationsData,
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
            }
        ]
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <header className="bg-white shadow p-4 mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            </header>
            <main className="container mx-auto">
                {(role === "9087-t1-vaek-123-riop" || role === "7003-t6-laek-303-jiop") && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-orange-500 text-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold">Total Stock</h3>
                            <p className="text-4xl font-bold">{userTickets.length}</p>
                        </div>
                        <div className="bg-teal-500 text-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold">{getDisplayName()}</h3>
                            <p className="text-4xl font-bold">
                                {filteredTickets.filter((ticket) => ticket.location === getDisplayName().split(" ")[0]).length}
                            </p>
                        </div>
                        <div className="bg-blue-500 text-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold">{selectedFilter1}</h3>
                            <p className="text-4xl font-bold">
                                {filteredTickets.filter((ticket) => ticket.model === selectedFilter1).length}
                            </p>
                        </div>
                        <div className="bg-green-500 text-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold">Stock Sold</h3>
                            <p className="text-4xl font-bold">
                                {filteredTickets.filter((ticket) => ticket.resolved).length}
                            </p>
                        </div>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Stock by Model & Location</h2>
                        <Bar data={chartData} />
                    </div>

                </div>
                <div className="grid grid-cols-12 gap-4 mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800 col-span-12">Inventory</h2>
                    {role !== "2069-t2-prlo-456-fiok" && (
                        <select
                            className="col-span-6 md:col-span-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                            value={selectedFilter1}
                            onChange={(e) => setSelectedFilter1(e.target.value)}
                        >
                            <option value="all">All Models</option>
                            {availableModels.map((model) => (
                                <option key={model} value={model}>
                                    {model}
                                </option>
                            ))}
                        </select>
                    )}
                    <select
                        className="col-span-6 md:col-span-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={selectedFilter}
                        onChange={(e) => setSelectedFilter(e.target.value)}
                    >
                        <option value="all">All Stock</option>
                        <option value="thanestock">Thane Stock</option>
                        <option value="vashistock">Vashi Stock</option>
                        <option value="ghansolistock">Ghansoli Stock</option>
                        <option value="airolistock">Airoli Stock</option>
                    </select>
                </div>

                {userTickets.length === 0 ? (
                    <p className="text-lg text-center text-gray-600">
                        {role === "9087-t1-vaek-123-riop"
                            ? "No one has created any tickets, what a surprise! Either the systems are working really well, or not at all!"
                            : role === "2069-t2-prlo-456-fiok"
                                ? "You have not been assigned any tickets yet"
                                : "You have not created any tickets yet."}
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg shadow">
                            <thead>
                                <tr className="bg-teal-600 text-white">
                                    <th className="px-4 py-2">Model</th>
                                    <th className="px-4 py-2">Colour</th>
                                    <th className="px-4 py-2">Chassis No</th>
                                    <th className="px-4 py-2">Engine No</th>
                                    <th className="px-4 py-2">Showroom</th>
                                    <th className="px-4 py-2">Stock Inward Date</th>
                                    <th className="px-4 py-2">Customer Name</th>
                                    <th className="px-4 py-2">Booking Amount</th>
                                    <th className="px-4 py-2">Date of Allotment</th>
                                    <th className="px-4 py-2">Delivery</th>
                                    <th className="px-4 py-2">Date of Passing</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTickets.map((ticket) => (
                                    <tr
                                        key={ticket.id}
                                        className="border-b hover:bg-gray-100 cursor-pointer"
                                        onClick={() => handleTicketClick(ticket.id)}
                                    >
                                        <td className="px-4 py-2">{ticket.model}</td>
                                        <td className="px-4 py-2">{ticket.colour}</td>
                                        <td className="px-4 py-2">{ticket.chassisNo}</td>
                                        <td className="px-4 py-2">{ticket.engineNo}</td>
                                        <td className="px-4 py-2">{ticket.location}</td>
                                        <td className="px-4 py-2">
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-2">{ticket.nameCus}</td>
                                        <td className="px-4 py-2">{ticket.bookingAmount}</td>
                                        <td className="px-4 py-2">{ticket.SaleDate}</td>
                                        <td className="px-4 py-2">{ticket.deliveryAmount}</td>
                                        <td className="px-4 py-2">{ticket.datePassing}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
};

export default StockFilter;