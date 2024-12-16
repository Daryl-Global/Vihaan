import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import { getUser } from '../../stores/userStore';
import stopImage from './Stop.png';

const LocationMaster = () => {
    const user = getUser();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [inputType, setInputType] = useState('single');
    const [actionType, setActionType] = useState('display');
    const [status, setStatus] = useState(null);
    const [locations, setLocations] = useState([]);  
    const [locationName, setLocationName] = useState("");  
    const [errors, setErrors] = useState({
        locationName: false,
    });
    const [interacted, setInteracted] = useState({
        locationName: false,
    });

    useEffect(() => {
        console.log('user global state obj:', user);
        const fetchLocations = async () => {  
            try {
                const response = await axios.get(`/api/user/locations`);
                setLocations(response.data);  
            } catch (error) {
                console.error('Failed to fetch locations', error);
            }
        };

        fetchLocations();
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleFileUpload = async () => {
        if (!file) {
            toast.error('Please select a file first.');
            return null;
        }

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            console.log(json);
            toast.success('File successfully processed. Data logged to console.');
            return json;
        } catch (error) {
            toast.error('Error processing the file: ' + error.message);
            console.error(error.message);
            return null;
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const baseURL = `/api/user/${user.id}`;

        
        const validationRegex = {
            locationName: /^[A-Za-z ]+$/,  
        };

        const isFormValid = validationRegex.locationName.test(locationName);

        if (!isFormValid) {
            toast.error('Please enter a valid location name.');
            return;
        }

        const newLocation = { locationName };  

        try {
            const response = await axios.post(`${baseURL}/locationmaster`, newLocation, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.status === 200) {
                toast.success('Your Location Detail has been successfully created.');
                setLocations([...locations, newLocation]);  
            } else {
                toast.error('An error occurred while creating the entry.');
            }
        } catch (error) {
            console.error(error.message);
            toast.error('An error occurred while submitting the data: ' + error.message);
        }

        setLocationName("");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'locationName') {
            setLocationName(value);
        }

        const validationRegex = {
            locationName: /^[A-Za-z ]+$/,  
        };

        const isValid = validationRegex[name] ? validationRegex[name].test(value) : true;

        setErrors((prevErrors) => ({ ...prevErrors, [name]: !isValid }));
        setInteracted((prev) => ({ ...prev, [name]: true }));
    };

    const inputClasses = (field) => {
        const baseClasses = "block w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-offset-2 border-gray-300";
        const value = field === "locationName" ? locationName : "";
        const isInteracted = interacted[field];
        let focusClasses = "focus:ring-blue-500"; 
        const validationRegex = {
            locationName: /^[A-Za-z ]+$/,  
        };

        if (isInteracted && validationRegex[field]) {
            if (validationRegex[field].test(value)) {
                focusClasses = "focus:ring-green-500";
            } else if (value.length > 0) {
                focusClasses = "focus:ring-red-500";
            }
        }

        const errorClasses = isInteracted ? (errors[field] ? "border-red-500" : "border-green-500") : "";

        return `${baseClasses} ${focusClasses} ${errorClasses}`;
    };

    return (
        <>
            {user.permissions.includes("customer_master") || user.permissions.includes("all_access") ? (    
            <div className="flex flex-col items-center pt-10 lg:pt-20 min-h-screen">
                {status === "error" ? (
                    <div className="text-red-500">
                        You are not authorized to access this page.
                    </div>
                ) : (
                    <div className="w-full max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
                        <h2 className="text-3xl font-bold text-center mb-8">
                            Add Location Details.
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {inputType === 'single' && (
                                <>
                                    <div className="grid grid-cols-1 gap-4">
                                        <input
                                            required
                                            type="text"
                                            className={inputClasses("locationName")}
                                            placeholder="Location Name"
                                            value={locationName}
                                            name="locationName"
                                            onChange={handleChange}
                                            autoComplete="locationName"
                                        />
                                    </div>
                                </>
                            )}

                            {inputType === 'bulk' && (
                                <div>
                                    <input
                                        type="file"
                                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            )}

                            <div className="flex justify-center">
                                <button
                                    type="submit"
                                    className="px-8 py-2 bg-vihaan-honda-red text-white rounded hover:bg-vihaan-honda-red-darker w-40"
                                >
                                    Submit
                                </button>
                                <select
                                    value={actionType}
                                    onChange={(e) => setActionType(e.target.value)}
                                    className="ml-4 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="display">Don't Display on Page</option>
                                    <option value="navigate">Display on Page</option>
                                </select>
                            </div>
                        </form>

                        {actionType === 'navigate' && (
                            <div className="mt-8">
                                <h3 className="text-2xl font-semibold mb-4">Location Details</h3>
                                <table className="min-w-full bg-white">
                                    <thead>
                                        <tr>
                                            <th className="py-2 px-4 border-b text-left">Location Name</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-wrap">
                                        {locations.map((locationItem, index) => (
                                            <tr key={index}>
                                                <td className="py-2 px-4 border-b text-left">{locationItem.locationName}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 overflow-hidden">
                    <div className="relative bg-white p-10 rounded-3xl shadow-2xl max-w-lg text-center transform transition-transform hover:scale-105 duration-500">

                        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                            <img
                                src={stopImage}
                                alt="Stop"
                                className="h-24 w-24 object-contain animate-bounce"
                            />
                        </div>

                        <h2 className="text-4xl font-extrabold text-red-500 mb-4">
                            Stop Right There!
                        </h2>
                        <p className="text-gray-600 text-lg mb-6">
                            It seems like you've entered a section that's not meant for you. Let's get you back on track!
                        </p>
                        <button
                            onClick={() => navigate(`/user/${user.id}/tickets`)}
                            className="px-8 py-3 bg-indigo-500 text-white font-bold rounded-full shadow-md hover:bg-indigo-600 transition-colors duration-300"
                        >
                            Take Me Home
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default LocationMaster;
