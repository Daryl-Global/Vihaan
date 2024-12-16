import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import CreateUpdateTicket from "../../components/CreateUpdateTicket";
import { getUser } from '../../stores/userStore';
import stopImage from './Stop.png';

const CustomerMaster = () => {
    const user = getUser();
    const navigate = useNavigate();
    const [addhar, setAddhar] = useState("");
    const [cusName, setCusName] = useState("");
    const [addCus, setAddCus] = useState("");
    const [emailId, setEmailId] = useState("");
    const [mobileNumber, setMobileNumber] = useState(""); 
    const [customerLocation, setCustomerLocation] = useState(user.branch); 
    const [file, setFile] = useState(null);
    const [inputType, setInputType] = useState('single');
    const [actionType, setActionType] = useState('display');
    const [hp, setHp] = useState("");
    const [updateTicket, setUpdateTicket] = useState(false);
    const [status, setStatus] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [errors, setErrors] = useState({
        addhar: false,
        cusName: false,
        emailId: false,
        mobileNumber: false, 
    });
    const [interacted, setInteracted] = useState({
        addhar: false,
        cusName: false,
        emailId: false,
        mobileNumber: false, 
    });

    useEffect(() => {
        console.log('user global state obj:', user);
        const fetchCustomers = async () => {
            try {
                const response = await axios.get(`/api/user/customers?branch=${user.branch}`);
                setCustomers(response.data);
            } catch (error) {
                console.error('Failed to fetch customers', error).message;
            }
        };

        fetchCustomers();
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
            addhar: /^\d{12}$/,
            cusName: /^[A-Za-z ]+$/,
            emailId: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
            mobileNumber: /^\d{10}$/, 
        };

        const isFormValid =
            validationRegex.addhar.test(addhar) &&
            validationRegex.cusName.test(cusName) &&
            validationRegex.mobileNumber.test(mobileNumber);

        if (!isFormValid) {
            toast.error('Please fill in all fields correctly.');
            return;
        }

        if (inputType === 'bulk') {
            const jsonData = await handleFileUpload();
            if (!jsonData) return;

            try {
                const response = await axios.post(`${baseURL}/bulkcreateticket`, jsonData, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.status === 200) {
                    toast.success('Bulk tickets have been successfully created.');
                    navigate(`/user/${user.id}/tickets`);
                } else {
                    toast.error('An error occurred during bulk ticket creation.');
                }
            } catch (error) {
                console.error(error);
                toast.error('An error occurred while uploading the file: ' + error.message);
            }
        } else {
            const newComplaint = { cusName, addhar, addCus, emailId, mobileNumber, hp, customerLocation};
            try {
                const response = await axios.post(`${baseURL}/customermaster`, newComplaint, {
                    headers: { 'Content-Type': 'application/json' }
                });
                if (response.status === 200) {
                    toast.success('Your Customer Detail has been successfully created.');
                    
                        setCustomers([...customers, newComplaint]);
                    
                } else {
                    toast.error('An error occurred while creating your ticket.');
                    console.error(response);
                }
            } catch (error) {
                console.error(error.message);
                toast.error('An error occurred while creating your ticket: ' + error.message);
            }
        }

        setCusName("");
        setAddhar("");
        setAddCus("");
        setEmailId("");
        setMobileNumber(""); 
        setHp("");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "addhar" && !/^\d*$/.test(value)) {
            return;
        }

        if (name === "cusName" && !/^[A-Za-z ]*$/.test(value)) {
            return;
        }

        switch (name) {
            case 'addhar':
                setAddhar(value);
                break;
            case 'cusName':
                setCusName(value);
                break;
            case 'emailId':
                setEmailId(value);
                break;
            case 'mobileNumber':
                setMobileNumber(value);
                break;
            default:
                break;
        }

        const validationRegex = {
            addhar: /^\d{12}$/,
            cusName: /^[A-Za-z ]+$/,
            emailId: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
            mobileNumber: /^\d{10}$/, 
        };

        const isValid = validationRegex[name] ? validationRegex[name].test(value) : true;

        setErrors((prevErrors) => ({ ...prevErrors, [name]: !isValid }));
        setInteracted((prev) => ({ ...prev, [name]: true }));
    };

    const inputClasses = (field) => {
        const baseClasses = "block w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-offset-2 border-gray-300";
        const value = field === "addhar" ? addhar : field === "cusName" ? cusName : field === "emailId" ? emailId : mobileNumber;
        const isInteracted = interacted[field];
        let focusClasses = "focus:ring-blue-500"; 
        const validationRegex = {
            addhar: /^\d{12}$/,
            cusName: /^[A-Za-z ]+$/,
            emailId: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
            mobileNumber: /^\d{10}$/, 
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
                            Add Customer Details.
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {inputType === 'single' && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            required
                                            type="text"
                                            className={inputClasses("cusName")}
                                            placeholder="Customer Name."
                                            value={cusName}
                                            name="cusName"
                                            onChange={handleChange}
                                            autoComplete="name"
                                        />
                                        <input
                                            required
                                            type="text"
                                            className={inputClasses("addhar")}
                                            placeholder="Aadhaar."
                                            value={addhar}
                                            name="addhar"
                                            onChange={handleChange}
                                            autoComplete="aadhar"
                                        />
                                        <input
                                            type="email"
                                            className={inputClasses("emailId")}
                                            placeholder="Email ID"
                                            value={emailId}
                                            name="emailId"
                                            onChange={handleChange}
                                            autoComplete="email"
                                        />
                                        <input
                                            required
                                            type="text"
                                            className={inputClasses("mobileNumber")} 
                                            placeholder="Mobile Number"
                                            value={mobileNumber}
                                            name="mobileNumber"
                                            onChange={handleChange}
                                            autoComplete="tel"
                                        />
                                        
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <textarea
                                            required
                                            type="text"
                                            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Customer Address."
                                            value={addCus}
                                            onChange={(e) => setAddCus(e.target.value)}
                                            rows="4"
                                        />
                                    </div>
                                    {(user.role == 'admin' || user.role == 'owner') && 
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <select
                                            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={customerLocation}
                                            onChange={(e) => setCustomerLocation(e.target.value)}
                                        >
                                            <option value="" disabled>
                                                Select location.
                                            </option>
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
                                    </div>
                                    }
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
                                <h3 className="text-2xl font-semibold mb-4">Customer Details</h3>
                                <table className="min-w-full bg-white">
                                    <thead>
                                        <tr>
                                            <th className="py-2 px-4 border-b">Customer Name</th>
                                            <th className="py-2 px-4 border-b">Aadhaar</th>
                                            <th className="py-2 px-4 border-b">Email ID</th>
                                            <th className="py-2 px-4 border-b">Mobile Number</th>
                                            <th className="py-2 px-4 border-b">Address</th>
                                            {user.permissions.includes("all_access") && (
                                            <th className="py-2 px-4 border-b text-left">Branch</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="text-wrap">
                                        {customers.map((customer, index) => (
                                            <tr key={index}>
                                                <td className="py-2 px-4 border-b">{customer.cusName}</td>
                                                <td className="py-2 px-4 border-b">{customer.addhar}</td>
                                                <td className="py-2 px-4 border-b">{customer.emailId}</td>
                                                <td className="py-2 px-4 border-b">{customer.mobileNumber}</td>
                                                <td className="py-2 px-4 border-b">{customer.addCus}</td>
                                                {user.permissions.includes("all_access") && (
                                                <td className="py-2 px-4 border-b text-left">{customer.branch}</td>
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
                <CreateUpdateTicket setUpdateTicket={setUpdateTicket} ticket={{ cusName, addhar, emailId, mobileNumber, model, color, hp, addCus, customerLocation}} />
            )}
        </>
    );
};

export default CustomerMaster;