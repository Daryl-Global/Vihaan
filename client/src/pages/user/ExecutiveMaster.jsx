import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import CreateUpdateTicket from "../../components/CreateUpdateTicket";
import { getUser } from '../../stores/userStore';
import stopImage from './Stop.png';

const ExecutiveMaster = () => {
    const user = getUser();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [inputType, setInputType] = useState('single');
    const [actionType, setActionType] = useState('display');
    const [updateTicket, setUpdateTicket] = useState(false);
    const [status, setStatus] = useState(null);
    const [executives, setExecutives] = useState([]);
    const [executiveName, setExecutiveName] = useState("");  
    const [phone, setPhone] = useState("");
    const [executiveBranch, setExecutiveBranch] = useState(user.branch);
    const [errors, setErrors] = useState({
        executiveName: false,
        phone: false,
    });
    const [interacted, setInteracted] = useState({
        executiveName: false,
        phone: false,
    });

    useEffect(() => {
        console.log('user global state obj:', user);
        const fetchExecutives = async () => {
            try {
                const response = await axios.get(`/api/user/executives?branch=${user.branch}`);
                setExecutives(response.data);
            } catch (error) {
                console.error('Failed to fetch executives', error.message);
            }
        };

        fetchExecutives();
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
            executiveName: /^[A-Za-z ]+$/,
            phone: /^\d{10}$/, 
        };

        const isFormValid =
            validationRegex.executiveName.test(executiveName) &&
            validationRegex.phone.test(phone);

        if (!isFormValid) {
            toast.error('Please fill in all fields correctly.');
            return;
        }

        const newExecutive = { executiveName, phone, executiveBranch };

        try {
            const response = await axios.post(`${baseURL}/executivemaster`, newExecutive, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.status === 200) {
                toast.success('Your Executive Detail has been successfully created.');
                setExecutives([...executives, newExecutive]);  
            } else {
                toast.error('An error occurred while creating the entry.');
            }
        } catch (error) {
            console.error(error.message);
            toast.error('An error occurred while submitting the data: ' + error.message);
        }

        setExecutiveName("");
        setPhone("");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        switch (name) {
            case 'executiveName':
                setExecutiveName(value);
                break;
            case 'phone':
                setPhone(value);
                break;
            default:
                break;
        }

        const validationRegex = {
            executiveName: /^[A-Za-z ]+$/,
            phone: /^\d{10}$/, 
        };

        const isValid = validationRegex[name] ? validationRegex[name].test(value) : true;

        setErrors((prevErrors) => ({ ...prevErrors, [name]: !isValid }));
        setInteracted((prev) => ({ ...prev, [name]: true }));
    };

    const inputClasses = (field) => {
        const baseClasses = "block w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-offset-2 border-gray-300";
        const value = field === "executiveName" ? executiveName : phone;
        const isInteracted = interacted[field];
        let focusClasses = "focus:ring-blue-500"; 
        const validationRegex = {
            executiveName: /^[A-Za-z ]+$/,
            phone: /^\d{10}$/, 
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
            {user.permissions.includes("executive_master") || user.permissions.includes("all_access") ? (    
            <div className="flex flex-col items-center pt-10 lg:pt-20 min-h-screen">
                {status === "error" ? (
                    <div className="text-red-500">
                        You are not authorized to access this page.
                    </div>
                ) : (
                    <div className="w-full max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
                        <h2 className="text-3xl font-bold text-center mb-8">
                            Add Executive Details.
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {inputType === 'single' && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            required
                                            type="text"
                                            className={inputClasses("executiveName")}
                                            placeholder="Executive Name"
                                            value={executiveName}
                                            name="executiveName"
                                            onChange={handleChange}
                                            autoComplete="executiveName"
                                        />
                                        <input
                                            required
                                            type="text"
                                            className={inputClasses("phone")}
                                            placeholder="Phone"
                                            value={phone}
                                            name="phone"
                                            onChange={handleChange}
                                            autoComplete="phone"
                                        />
                                        {(user.role == 'admin' || user.role == 'owner') && 
                                        <select
                                            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={executiveBranch}
                                            onChange={(e) => setExecutiveBranch(e.target.value)}
                                        >
                                            <option value="" disabled>
                                                Select location.
                                            </option>
                                            <option value="manpada">Manpada</option>
                                            <option value="ovala">Ovala</option>
                                            <option value="shreenagar">Shreenagar</option>
                                            <option value="shahapur">Shahapur</option>
                                            <option value="padgha">Padgha</option>
                                            <option value="diva">Diva</option>
                                            <option value="vasind">Vasind</option>
                                            <option value="lokmanyanagar">Lokmanyanagar</option>
                                            <option value="vashi">Vashi</option>
                                            <option value="airoli">Airoli</option>
                                            <option value="airoli EC">Airoli EC</option>
                                            <option value="sanpada">Sanpada</option>
                                            <option value="turbhe">Turbhe</option>
                                            <option value="ghansoli">Ghansoli</option>
                                            <option value="bigwing Thane">Bigwing Thane</option>
                                            <option value="gigwing Miraroad">Bigwing Miraroad</option>
                                            <option value="bigwing Surat">Bigwing Surat</option>
                                        </select>
                                        }
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
                            <h3 className="text-2xl font-semibold mb-4">Executive Details</h3>
                                <table className="min-w-full bg-white">
                                    <thead>
                                        <tr>
                                            <th className="py-2 px-4 border-b text-left">Executive Name</th> 
                                            <th className="py-2 px-4 border-b text-left">Phone</th>
                                            {user.permissions.includes("all_access") && (
                                            <th className="py-2 px-4 border-b text-left">Branch</th>
                                            )}
                                        </tr>
                                    </thead>
                            <tbody className="text-wrap">
                                {executives.map((executiveItem, index) => (
                                <tr key={index}>
                                    <td className="py-2 px-4 border-b text-left">{executiveItem.executiveName}</td>
                                    <td className="py-2 px-4 border-b text-left">{executiveItem.phone}</td>
                                    {user.permissions.includes("all_access") && (
                                    <td className="py-2 px-4 border-b text-left">{executiveItem.branch}</td>
                                    )}
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

            {updateTicket && (
                <CreateUpdateTicket setUpdateTicket={setUpdateTicket} ticket={{ executiveName, phone }} />
            )}
        </>
    );
};

export default ExecutiveMaster;
