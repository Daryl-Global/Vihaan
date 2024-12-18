import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import CreateUpdateTicket from '../../components/CreateUpdateTicket';
import { getUser } from '../../stores/userStore';
import stopImage from './Stop.png';

const BookingMaster = () => {
    const user = getUser();
    const navigate = useNavigate();
    const [addhar, setAddhar] = useState('');
    const [cusName, setCusName] = useState('');
    const [addCus, setAddCus] = useState('');
    const [emailId, setEmailId] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [file, setFile] = useState(null);
    const [inputType, setInputType] = useState('single');
    const [actionType, setActionType] = useState('display');
    const [model, setModel] = useState('');
    const [variant, setVariant] = useState(''); 
    const [variantOptions, setVariantOptions] = useState([]); 
    const [colour, setColour] = useState('');
    const [hp, setHp] = useState('');
    const [bookingAmount, setBookingAmount] = useState('');
    const [bookingAmountPlaceholder, setBookingAmountPlaceholder] = useState('Select Vehicle Model, Variant and Colour');
    const [branch, setBranch] = useState(user.branch);
    const [executive, setExecutive] = useState('');
    const [updateTicket, setUpdateTicket] = useState(false);
    const [currentTicket, setCurrentTicket] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [executives, setExecutives] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [aadhaarOptions, setAadhaarOptions] = useState([]);
    const [colourOptions, setColourOptions] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [uniqueVehicleValues, setUniqueVehicleValues] = useState({
        models: new Set(),
        variants: {},
        colours: {}
    });

    // States for modal control and date selection
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchData = async () => {
        try {
            const [customersResponse, executivesResponse, bookingsResponse, vehiclesResponse] = await Promise.all([
                axios.get(`/api/user/customers?branch=${user.branch}`),
                axios.get(`/api/user/executives?branch=${user.branch}`),
                axios.get(`/api/user/bookings?branch=${user.branch}`),
                axios.get(`/api/user/vehicles`),
            ]);
            
            setCustomers(customersResponse.data);
            setExecutives(executivesResponse.data);
            setVehicles(vehiclesResponse.data);
            setBookings(bookingsResponse.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
            toast.error('Failed to fetch data');
        }
    };

    const handleExportBookingMaster = () => {
        // Filter bookings by date range
        const filteredBookings = bookings.filter((booking) => {
            const createdOnDate = new Date(booking.createdOn);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            if (start && createdOnDate < start) return false;
            if (end && createdOnDate > end) return false;
            return true;
        });

        if (!filteredBookings.length) {
            toast.error("No booking data available for the selected date range.");
            return;
        }

        const exportData = filteredBookings.map((booking) => ({
            CusName: booking.cusName || "",
            Addhar: booking.addhar || "",
            AddCus: booking.addCus || "",
            EmailId: booking.emailId || "",
            MobileNumber: booking.mobileNumber || "",
            Model: booking.model || "",
            Variant: booking.variant || "",
            Colour: booking.colour || "",
            HP: booking.hp || "",
            BookingAmount: booking.bookingAmount || "",
            BookingAmountPlaceholder: booking.bookingAmountPlaceholder || "",
            Executive: booking.executive || "",
            CreatedOn: booking.createdOn || "",
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "BookingMaster");

        XLSX.writeFile(workbook, "BookingMasterData.xlsx");
        toast.success("Booking master data exported successfully!");
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setUniqueVehicleValues(vehicles.reduce((acc, vehicle) => {
            acc.models.add(vehicle.model);
            if (!acc.variants[vehicle.model]) {
                acc.variants[vehicle.model] = new Set();
            }
            acc.variants[vehicle.model].add(vehicle.variant);
            if (!acc.colours[vehicle.model]) {
                acc.colours[vehicle.model] = {};
            }
            if (!acc.colours[vehicle.model][vehicle.variant]) {
                acc.colours[vehicle.model][vehicle.variant] = new Set();
            }
            acc.colours[vehicle.model][vehicle.variant].add(vehicle.colour);
            return acc;
        }, { models: new Set(), variants: {}, colours: {} }));

        console.log('vehicle data unique values: ', uniqueVehicleValues);
    }, [vehicles]);

    const handleModelChange = (e) => {
        const selectedModel = e.target.value;
        const filteredVehicles = vehicles.filter(vehicle => vehicle.model === selectedModel);

        setModel(selectedModel);
        setVariantOptions([...new Set(filteredVehicles.map(v => v.variant))]); 
        setVariant('');
        setColourOptions([]);
        setColour('');
        setBookingAmount('');
        setSelectedVehicle(null);
        setBookingAmountPlaceholder('Select Vehicle Model, Variant and Colour');
    };

    const handleVariantChange = (e) => {
        const selectedVariant = e.target.value;
        const filteredVehicles = vehicles.filter(vehicle => vehicle.model === model && vehicle.variant === selectedVariant);

        setVariant(selectedVariant);
        setColourOptions(filteredVehicles.map(v => v.colour));
        setColour('');
        setBookingAmount('');
        setSelectedVehicle(null);
        setBookingAmountPlaceholder('Select Vehicle Model, Variant and Colour');
    };

    const handleColourChange = (e) => {
        const selectedColour = e.target.value;
        setColour(selectedColour);

        const vehicle = vehicles.find(vehicle => vehicle.model === model && vehicle.variant === variant && vehicle.colour === selectedColour);
        if (vehicle) {
            setSelectedVehicle(vehicle);
            setBookingAmount('');
            setBookingAmountPlaceholder(`Minimum amount should be ${vehicle.priceLock ? vehicle.priceLock : 0}`);
        } else {
            setSelectedVehicle(null);
            setBookingAmount('');
            setBookingAmountPlaceholder('Select Vehicle Model, Variant and Colour');
        }
    };

    const handleNameChange = (e) => {
        const selectedCustomer = customers.find(customer => customer.cusName === e.target.value);
        if (selectedCustomer) {
            setCusName(selectedCustomer.cusName);
            setAadhaarOptions(customers.filter(customer => customer.cusName === selectedCustomer.cusName).map(c => c.addhar));
            setAddhar('');
            setAddCus('');
            setEmailId(selectedCustomer.emailId || '');
            setMobileNumber(selectedCustomer.mobileNumber || '');
        } else {
            setCusName('');
            setAadhaarOptions([]);
            setAddhar('');
            setAddCus('');
            setEmailId('');
            setMobileNumber('');
        }
    };

    const handleAadhaarChange = (e) => {
        const selectedAadhaar = e.target.value;
        const selectedCustomer = customers.find(customer => customer.addhar === selectedAadhaar);
        if (selectedCustomer) {
            setAddhar(selectedAadhaar);
            setAddCus(selectedCustomer.addCus || '');
            setEmailId(selectedCustomer.emailId || '');
            setMobileNumber(selectedCustomer.mobileNumber || '');
        } else {
            setAddhar('');
            setAddCus('');
            setEmailId('');
            setMobileNumber('');
        }
    };

    const handleExecutiveChange = (e) => {
        const selectedExecutive = executives.find(executive => executive.executiveName === e.target.value);
        if (selectedExecutive) {
            setExecutive(selectedExecutive.executiveName);
        } else {
            setExecutive('');
        }
    };

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
        };

        const isFormValid =
            validationRegex.addhar.test(addhar) &&
            validationRegex.cusName.test(cusName);

        if (!isFormValid) {
            toast.error('Please fill in all fields correctly.');
            return;
        }

        if (selectedVehicle && parseFloat(bookingAmount) < parseFloat(selectedVehicle.priceLock)) {
            toast.error(`Booking amount cannot be lower than ${selectedVehicle.priceLock}`);
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
            const newComplaint = { cusName, addhar, addCus, model, variant, colour, emailId, mobileNumber, hp, bookingAmount, executive, branch };
            try {
                const response = await axios.post(`${baseURL}/bookingmaster`, newComplaint, {
                    headers: { 'Content-Type': 'application/json' }
                });
                if (response.status === 200) {
                    toast.success('Your Booking Detail has been successfully created.');
                    setBookings([...bookings, newComplaint]);
                } else {
                    toast.error('An error occurred while creating your Booking.');
                }
            } catch (error) {
                console.error('Error in booking creation:', error.response || error.message);
                toast.error('An error occurred while creating your ticket: ' + error.message);
            }
        }

        setCusName('');
        setAddhar('');
        setAddCus('');
        setEmailId('');
        setMobileNumber('');
        setModel('');
        setVariant('');
        setColour('');
        setHp('');
        setBookingAmount('');
        setBookingAmountPlaceholder('');
        setExecutive('');
        setSelectedVehicle(null);
    };

    const handleAllocationClick = () => {
        const newAllocationTicket = {
            id: '',
            issue: '',
            remarks: '',
            classification: '',
            channel: '',
            bookingAmount: '',
            nameCus: '',
            addhar: '',
            addCus: '',
            executive: '',
            hp: '',
            createdOn: new Date().toISOString(),
        };
        setCurrentTicket(newAllocationTicket);
        setUpdateTicket(true);
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleDownloadClick = () => {
        handleExportBookingMaster();
        closeModal();
    };

    return (
        <>
            {user.permissions.includes("booking_details") || user.permissions.includes("all_access") ? (
                <div className="flex flex-col items-center pt-10 lg:pt-20 min-h-screen">
                    <div className="w-full max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
                        <div className="flex justify-end mb-6 space-x-4">

                            <button
                                onClick={openModal}
                                className="
                                    px-6 
                                    py-2 
                                    bg-green-500 
                                    text-white 
                                    rounded 
                                    shadow 
                                    transform 
                                    transition 
                                    duration-300 
                                    hover:bg-green-600 
                                    hover:scale-105 
                                    hover:shadow-lg
                                "
                            >
                                Export Booking Master
                            </button>
                            
                            <button
                                onClick={handleAllocationClick}
                                className="
                                    px-6 
                                    py-2 
                                    bg-blue-500 
                                    text-white 
                                    rounded 
                                    shadow 
                                    transform 
                                    transition 
                                    duration-300 
                                    hover:bg-blue-600 
                                    hover:scale-105 
                                    hover:shadow-lg
                                "
                            >
                                Allocation
                            </button>
                        </div>

                        <h2 className="text-3xl font-bold text-center mb-8">
                            Add Booking Details
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {inputType === 'single' && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <select
                                            required
                                            value={cusName}
                                            onChange={handleNameChange}
                                            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                        >
                                            <option value="">Select a Customer</option>
                                            {customers.map((customer) => (
                                                <option key={customer.id} value={customer.cusName}>
                                                    {customer.cusName}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            required
                                            value={addhar}
                                            onChange={handleAadhaarChange}
                                            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                        >
                                            <option value="">Select Aadhaar</option>
                                            {aadhaarOptions.map((aadhaar) => (
                                                <option key={aadhaar} value={aadhaar}>
                                                    {aadhaar}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            required
                                            value={model}
                                            onChange={handleModelChange}
                                            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                        >
                                            <option value="">Select Vehicle Model</option>
                                            {Array.from(uniqueVehicleValues.models).map((m) => (
                                                <option key={m} value={m}>
                                                    {m}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            required
                                            value={variant}
                                            onChange={handleVariantChange}
                                            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                        >
                                            <option value="">Select Vehicle Variant</option>
                                            {model && Array.from(uniqueVehicleValues.variants[model] || []).map((v) => (
                                                <option key={v} value={v}>
                                                    {v}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            required
                                            value={colour}
                                            onChange={handleColourChange}
                                            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                        >
                                            <option value="">Select Vehicle Colour</option>
                                            {model && variant ? (
                                                Array.from(uniqueVehicleValues.colours[model]?.[variant] || []).length > 0 ? (
                                                    Array.from(uniqueVehicleValues.colours[model][variant]).map((c) => (
                                                        <option key={c} value={c}>
                                                            {c}
                                                        </option>
                                                    ))
                                                ) : (
                                                    <div className="text-gray-500 text-sm py-2 px-4">
                                                        No colours available for the selected model and variant.
                                                    </div>
                                                )
                                            ) : (
                                                <div className="text-gray-500 text-sm py-2 px-4">
                                                    Please select a model and variant to see available colours.
                                                </div>
                                            )}
                                        </select>
                                        <select
                                            required
                                            value={hp}
                                            onChange={(e) => setHp(e.target.value)}
                                            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                        >
                                            <option value="">Select HP</option>
                                            <option value="Bajaj Finance Limited">Bajaj Finance Limited</option>
                                            <option value="Capital First Ltd">Capital First Ltd</option>
                                            <option value="Family Credit Bank (L&T)">Family Credit Bank (L&T)</option>
                                            <option value="Kotak Prime Bank">Kotak Prime Bank</option>
                                            <option value="HDFC">HDFC</option>
                                            <option value="ICICI">ICICI</option>
                                            <option value="Tata Capital Financial Services Ltd">Tata Capital Financial Services Ltd</option>
                                            <option value="Aditya Birla Finance Ltd">Aditya Birla Finance Lt.</option>
                                            <option value="Mahindra & Mahindra Financial Services Limited">Mahindra & Mahindra Financial Services Limited</option>
                                            <option value="Cash">Cash</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <input
                                            required
                                            disabled={!(model && variant && colour)}
                                            type="number"
                                            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                            placeholder={bookingAmountPlaceholder}
                                            value={bookingAmount}
                                            name="bookingAmount"
                                            onChange={(e) => setBookingAmount(e.target.value)}
                                            min={selectedVehicle ? selectedVehicle.priceLock : 0}
                                        />
                                        <select
                                            required
                                            value={executive}
                                            onChange={handleExecutiveChange}
                                            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                        >
                                            <option value="">Select a Executive</option>
                                            {executives.map((ex) => (
                                                <option key={ex.id} value={ex.executiveName}>
                                                    {ex.executiveName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}

                            {inputType === 'bulk' && (
                                <div>
                                    <input
                                        type="file"
                                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                        onChange={handleFileChange}
                                        className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                    />
                                </div>
                            )}

                            <div className="flex justify-center">
                                <button
                                    type="submit"
                                    className="
                                        px-8 
                                        py-2 
                                        bg-red-500 
                                        text-white 
                                        rounded 
                                        hover:bg-red-600 
                                        transition 
                                        duration-200 
                                        transform 
                                        hover:scale-105 
                                        shadow 
                                        hover:shadow-lg 
                                        w-40
                                    "
                                >
                                    Submit
                                </button>
                                <select
                                    value={actionType}
                                    onChange={(e) => setActionType(e.target.value)}
                                    className="
                                        ml-4 
                                        px-4 
                                        py-2 
                                        border 
                                        border-gray-300 
                                        rounded 
                                        focus:outline-none 
                                        focus:ring-2 
                                        focus:ring-blue-500 
                                        transition 
                                        duration-200
                                    "
                                >
                                    <option value="display">Don't Display on Page</option>
                                    <option value="navigate">Display on Page</option>
                                </select>
                            </div>
                        </form>

                        {actionType === 'navigate' && (
                            <div className="mt-8">
                                <h3 className="text-2xl font-semibold mb-4">Booking Details</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white border">
                                        <thead>
                                            <tr>
                                                <th className="py-2 px-4 border-b">Customer Name</th>
                                                <th className="py-2 px-4 border-b">Aadhaar</th>
                                                <th className="py-2 px-4 border-b">Address</th>
                                                <th className="py-2 px-4 border-b">Model</th>
                                                <th className="py-2 px-4 border-b">Variant</th>
                                                <th className="py-2 px-4 border-b">Colour</th>
                                                <th className="py-2 px-4 border-b">Booking Amount</th>
                                                <th className="py-2 px-4 border-b">Executive</th>
                                                {user.permissions.includes("all_access") && (
                                                    <th className="py-2 px-4 border-b text-left">Branch</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookings.map((booking, index) => (
                                                <tr key={index} className="hover:bg-gray-100 transition duration-200">
                                                    <td className="py-2 px-4 border-b">{booking.cusName}</td>
                                                    <td className="py-2 px-4 border-b">{booking.addhar}</td>
                                                    <td className="py-2 px-4 border-b">{booking.addCus}</td>
                                                    <td className="py-2 px-4 border-b">{booking.model}</td>
                                                    <td className="py-2 px-4 border-b">{booking.variant}</td>
                                                    <td className="py-2 px-4 border-b">{booking.colour}</td>
                                                    <td className="py-2 px-4 border-b">{booking.bookingAmount}</td>
                                                    <td className="py-2 px-4 border-b">{booking.executive}</td>
                                                    {user.permissions.includes("all_access") && (
                                                        <td className="py-2 px-4 border-b text-left">{booking.branch}</td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
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

            {updateTicket && currentTicket && (
                <CreateUpdateTicket setUpdateTicket={setUpdateTicket} ticket={currentTicket} />
            )}

            {/* Modal for date selection */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Select Date Range for Export</h2>
                        <div className="flex flex-col space-y-4">
                            <div className="flex flex-col">
                                <label className="font-semibold mb-1">From Date:</label>
                                <input 
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="border border-gray-300 px-2 py-1 rounded"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="font-semibold mb-1">To Date:</label>
                                <input 
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="border border-gray-300 px-2 py-1 rounded"
                                />
                            </div>
                            <div className="flex justify-end space-x-2 mt-4">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDownloadClick}
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                    Download
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BookingMaster;
