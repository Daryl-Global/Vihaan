import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import CreateUpdateTicket from "../../components/CreateUpdateTicket";
import DropdownCheckboxes from '../../components/DropdownCheckboxes';
import { getUser } from '../../stores/userStore';
import stopImage from './Stop.png';

const VehicleMaster = () => {
    const user = getUser();
    const navigate = useNavigate();
    const [model, setModel] = useState("");
    const [variant, setVariant] = useState("");
    const [colour, setColour] = useState("");
    const [priceLock, setPriceLock] = useState("");
    const [file, setFile] = useState(null);
    const [inputType, setInputType] = useState('single');
    const [actionType, setActionType] = useState('display');
    const [updateTicket, setUpdateTicket] = useState(false);
    const [status, setStatus] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [uniqueVehicleValues, setUniqueVehicleValues] = useState({
        models: new Set(),
        variants: {},
        colours: {}
    });
    const [errors, setErrors] = useState({
        model: false,
        colour: false,
    });
    const [interacted, setInteracted] = useState({
        model: false,
        colour: false,
    });
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const response = await axios.get(`/api/user/vehicles`);
                console.log('getvehicles response:', response);
                setVehicles(response.data);
                
            } catch (error) {
                console.error('Failed to fetch vehicles', error);
            }
        };

        fetchVehicles();
    }, []);

    useEffect(() => {
        setUniqueVehicleValues(vehicles.reduce((acc, vehicle) => {
            acc.models.add(vehicle.model);
            
            // Ensure variants are stored in a map against the model
            if (!acc.variants[vehicle.model]) {
                acc.variants[vehicle.model] = new Set();
            }
            acc.variants[vehicle.model].add(vehicle.variant);
            
            // Ensure colours are stored in a map against the model and variant
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

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const validExtensions = ['xlsx', 'xls', 'csv'];
            const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
            if (!validExtensions.includes(fileExtension)) {
                toast.error('Invalid file type. Please upload a valid Excel or CSV file.');
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleFileUpload = async () => {
        if (!file) {
            toast.error('Please select a file first.');
            return;
        }
    
        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
            const transformedData = jsonData.map(item => ({
                model: item.Model,
                variant: item.Variant,
                colour: item.Colour,
                priceLock: item.PriceLock || null,
            }));
    
            console.log('Transformed Data:', transformedData);
    
            const response = await axios.post(`/api/user/${user.id}/vehicle/bulk-upload`, {
                userId: user.id,
                vehicles: transformedData,
            }, {
                headers: { 'Content-Type': 'application/json' },
            });
    
            if (response.status === 200) {
                const { vehiclesAdded, duplicatesFound, errors } = response.data;
    
                toast.success(`${vehiclesAdded} vehicles uploaded successfully.`);
                toast.info(`${duplicatesFound} duplicates ignored.`);
    
                if (errors.length > 0) {
                    console.error("Errors during upload:", errors);
                    toast.warn("Some issues occurred. Check console for details.");
                }
            } else {
                toast.error('Bulk upload failed.');
            }
        } catch (error) {
            console.error('Error uploading file:', error.response?.data || error.message);
            toast.error('An error occurred while uploading: ' + (error.response?.data?.message || error.message));
        }
    };


    const handleExportTemplate = () => {
        const templateData = [
            { Model: '', Variant: '', Colour: '', PriceLock: '' },
        ];

        const worksheet = XLSX.utils.json_to_sheet(templateData);

        const headers = ['Model', 'Variant', 'Colour', 'PriceLock'];
        XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Vehicle Template');

        XLSX.writeFile(workbook, 'Vehicle_Template.xlsx');
    };

    

    const handleSubmit = async (event) => {
        event.preventDefault();
        const baseURL = `/api/user/${user.id}`;

        const isFormValid =
            model.length > 0 &&
            variant.length > 0;

        if (!isFormValid) {
            toast.error('Please fill in all fields correctly.');
            return;
        }

        if (inputType === 'bulk') {
            const jsonData = await handleFileUpload();
            if (!jsonData) return;

            try {
                const response = await axios.post(`${baseURL}/bulkcreatevehicle`, jsonData, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.status === 200) {
                    toast.success('Bulk tickets have been successfully created.');
                    setVehicles([...vehicles, ...jsonData]);
                } else {
                    toast.error('An error occurred during bulk ticket creation.');
                }
            } catch (error) {
                console.error(error);
                toast.error('An error occurred while uploading the file: ' + error.message);
            }
        } else {
            const vehicleData = { userId: user.id, model, variant, colour, priceLock };

            try {
                let response;
                if (isEditMode) {
                    response = await axios.put(`${baseURL}/vehiclemaster`, vehicleData, {
                        headers: { 'Content-Type': 'application/json' }
                    });
                } else {
                    response = await axios.post(`${baseURL}/vehiclemaster`, vehicleData, {
                        headers: { 'Content-Type': 'application/json' }
                    });
                }

                if (response.status === 200) {
                    toast.success(isEditMode ? 'Vehicle details have been successfully updated.' : 'Vehicle has been successfully created.');
                    if (isEditMode) {
                        setVehicles(vehicles.map(v => {
                            const isModelMatch = v.model === model;
                            const isVariantMatch = v.variant === variant;
                            const isColourMatch = vehicleData.colour.length === 0 || vehicleData.colour.includes(v.colour);
                            return (isModelMatch && isVariantMatch && isColourMatch)
                                ? { ...v, priceLock: vehicleData.priceLock }
                                : v;
                        }));
                    } else {
                        setVehicles([...vehicles, vehicleData]);
                    }
                } else {
                    toast.error(isEditMode ? 'An error occurred while updating vehicle details.' : 'An error occurred while creating the vehicle.');
                }
            } catch (error) {
                console.error(error.message);
                toast.error('An error occurred: ' + error.message);
            }
        }

        setModel("");
        setVariant("");
        setColour("");
        setPriceLock("");
    };

    const inputClasses = (field) => {
        const baseClasses = "block w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-offset-2 border-gray-300";
        const value = field === "model" ? model : field === "variant" ? variant : colour;
        const isInteracted = interacted[field];
        let focusClasses = "focus:ring-blue-500";

        if (isInteracted && value.length > 0) {
            focusClasses = "focus:ring-green-500";
        } else if (isInteracted && value.length === 0) {
            focusClasses = "focus:ring-red-500";
        }

        const errorClasses = isInteracted ? (errors[field] ? "border-red-500" : "border-green-500") : "";

        return `${baseClasses} ${focusClasses} ${errorClasses}`;
    };

    return (
        <>
            {user.permissions.includes("vehicle_master") || user.permissions.includes("all_access") ? (
            <div className="flex flex-col items-center pt-10 lg:pt-20 min-h-screen">
            <div className="w-full max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
                <h2 className="text-3xl font-bold text-center mb-8">Vehicle Master</h2>
                <div className="mb-4 flex items-center justify-between">
    <div className="flex items-center">
        <label htmlFor="inputType" className="mr-2">Upload Type:</label>
        <select
            id="inputType"
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={inputType}
            onChange={(e) => setInputType(e.target.value)}
        >
            <option value="single">Single</option>
            <option value="bulk">Bulk</option>
        </select>
    </div>

    <div className="flex items-center justify-center">
        <label className="inline-flex items-center">
            <input
                type="checkbox"
                className="form-checkbox"
                checked={isEditMode}
                onChange={() => setIsEditMode(!isEditMode)}
            />
            <span className="ml-2">Switch to {isEditMode ? 'Create Vehicle' : 'Edit Vehicle'}</span>
        </label>
    </div>

    <div>
        <button
            onClick={handleExportTemplate}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
            Export Template
        </button>
    </div>
</div>

                {inputType === 'bulk' && (
                    <div className="mb-6">
                        <input
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileChange}
                        />
                        <button
                            onClick={handleFileUpload}
                            className="px-4 py-2 mt-4 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Upload File
                        </button>
                    </div>
                )}

                {inputType === 'single' && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {isEditMode ? (
                                            <>
                                                <select
                                                    required
                                                    value={model}
                                                    onChange={(e) => setModel(e.target.value)}
                                                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">Select a Model</option>
                                                    {Array.from(uniqueVehicleValues.models).map((model) => (
                                                        <option key={model} value={model}>
                                                            {model}
                                                        </option>
                                                    ))}
                                                </select>
                                                
                                                <select
                                                    required
                                                    value={variant}
                                                    onChange={(e) => setVariant(e.target.value)}
                                                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">Select a Variant</option>
                                                    {model && Array.from(uniqueVehicleValues.variants[model] || []).map((variant) => (
                                                        <option key={variant} value={variant}>
                                                            {variant}
                                                        </option>
                                                    ))}
                                                </select>

                                                {/* Refer for UI goal: https://readymadeui.com/tailwind/component/dropdown-with-checkbox */}
                                                <DropdownCheckboxes
                                                    vehicles={uniqueVehicleValues}
                                                    model={model}
                                                    variant={variant}
                                                    colour={colour}
                                                    setColour={setColour}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <input
                                                    required
                                                    type="text"
                                                    className={inputClasses("model")}
                                                    placeholder="Model"
                                                    value={model}
                                                    name="model"
                                                    onChange={(e) => setModel(e.target.value)}
                                                    autoComplete="model"
                                                />
                                                
                                                <input
                                                    required
                                                    type="text"
                                                    className={inputClasses("variant")}
                                                    placeholder="Variant"
                                                    value={variant}
                                                    name="variant"
                                                    onChange={(e) => setVariant(e.target.value)}
                                                    autoComplete="variant"
                                                />

                                                <input
                                                    required
                                                    type="text"
                                                    className={inputClasses("colour")}
                                                    placeholder="Colour"
                                                    value={colour}
                                                    name="colour"
                                                    onChange={(e) => setColour(e.target.value)}
                                                    autoComplete="colour"
                                                />
                                            </>
                                        )}
                                        <input
                                            
                                            type="text"
                                            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Price Lock"
                                            value={priceLock}
                                            name="priceLock"
                                            onChange={(e) => setPriceLock(e.target.value)}
                                            autoComplete="priceLock"
                                        />
                                    </div>
                            
                         

                           

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
                )}

                {actionType === 'navigate' && (
                    <div className="mt-8">
                        <h3 className="text-2xl font-semibold mb-4">Vehicle Details</h3>
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 border-b">Model</th>
                                    <th className="py-2 px-4 border-b">Variant</th>
                                    <th className="py-2 px-4 border-b">Colour</th>
                                    <th className="py-2 px-4 border-b">Price Lock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehicles.map((vehicle, index) => (
                                    <tr key={index}>
                                        <td className="py-2 px-4 border-b">{vehicle.model}</td>
                                        <td className="py-2 px-4 border-b">{vehicle.variant}</td>
                                        <td className="py-2 px-4 border-b">{vehicle.colour}</td>
                                        <td className="py-2 px-4 border-b">{vehicle.priceLock}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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

            {updateTicket && (
                <CreateUpdateTicket setUpdateTicket={setUpdateTicket} ticket={{ model, variant, colour, priceLock }} />
            )}
        </>
    );
};

export default VehicleMaster;
