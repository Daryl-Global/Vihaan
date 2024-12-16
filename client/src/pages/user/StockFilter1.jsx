import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export const StockFilter1 = () => {
    const { user_id } = useParams();
    const [userTickets, setUserTickets] = useState([]);
    const [availableModels, setAvailableModels] = useState([]);
    const [locations, setLocations] = useState([]);
    const [colors, setColors] = useState([]);
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

                    const cols = Array.from(
                        new Set(data.tickets.map((ticket) => ticket.colour))
                    );
                    setColors(cols);

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

    const modelLocationColorCounts = {};
    availableModels.forEach(model => {
        modelLocationColorCounts[model] = {};
        locations.forEach(location => {
            modelLocationColorCounts[model][location] = {};
            colors.forEach(color => {
                modelLocationColorCounts[model][location][color] = userTickets.filter(ticket => ticket.model === model && ticket.location === location && ticket.colour === color).length;
            });
        });
    });

    return (
        <div className="bg-gradient-to-br from-blue-500 to-green-200 min-h-screen p-4">
            <div className="w-full max-w-8xl p-4 bg-white rounded-lg shadow-lg mx-auto">
                <div className="h-full p-4 bg-gray-100 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-center text-blue-800 mb-4">Stock Details</h2>
                    {availableModels.map(model => (
                        <div key={model} className="mb-6">
                            <h3 className="text-xl font-bold text-blue-600 mb-2">{model}</h3>
                            <table className="min-w-full bg-white border border-gray-300">
                                <thead>
                                    <tr>
                                        <th className="py-2 px-4 border-b text-left">Location</th>
                                        {colors.map(color => (
                                            <th key={color} className="py-2 px-4 border-b text-center">{color}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {locations.map(location => (
                                        <tr key={location}>
                                            <td className="py-2 px-4 border-b">{location}</td>
                                            {colors.map(color => (
                                                <td key={color} className="py-2 px-4 border-b text-center">
                                                    {modelLocationColorCounts[model][location][color]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StockFilter1;