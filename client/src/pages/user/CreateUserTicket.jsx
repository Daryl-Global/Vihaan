import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import Autocomplete from '../../components/Autocomplete';
import { getUser } from '../../stores/userStore';
import stopImage from './Stop.png';

const CreateUserTicket = () => {
    const user = getUser();
    const navigate = useNavigate();
    const [colour, setColour] = useState("");
    const [variant, setVariant] = useState("");
    const [model, setModel] = useState("");
    const [engineNo, setEngineNo] = useState("");
    const [chassisNo, setChassisNo] = useState("");
    const [file, setFile] = useState(null);
    const [inputType, setInputType] = useState('single');
    const [location, setLocation] = useState("");
    const [showCustomLocation, setShowCustomLocation] = useState(false);
    const [dealerId, setDealerId] = useState("");
    const [dealerName, setDealerName] = useState("");
    const [dealerInfo, setDealerInfo] = useState([]);
    const [vehicles, setVehicles] = useState([]); 
    const baseURL = `/api/user/${user.id}`;
    
    useEffect(() => {
        const fetchDealers = async () => {
            try {
                const res = await axios.get(`/api/admin/${user.id}/dealers`);
                const data = res.data;
                if (res.status === 200) {
                    const dealerList = data.dealers;
                    const dealerInfoScope = dealerList.map((dealer) => [dealer.name, dealer.userId]);
                    setDealerInfo(dealerInfoScope);
                }
            } catch (err) {
                console.error(err);
            }
        };

        const fetchVehicles = async () => {
            try {
                const response = await axios.get(`/api/user/vehicles`);
                setVehicles(response.data);
            } catch (error) {
                console.error('Failed to fetch vehicles', error);
            }
        };

        fetchDealers();
        fetchVehicles(); 
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
    
            // const normalizeName = (name) => name.toString().toLowerCase().trim();
    
            // const dealerMap = Object.fromEntries(
            //     dealerInfo.map(([name, id]) => [normalizeName(name), id])
            // );
    
            const jsonWithIds = json.map(row => {
                // const assignedDealerName = normalizeName(row['assignedDealer'] || row['Assigned Dealer'] || '');
                // const assignedDealerId = dealerMap[assignedDealerName];
    
                return {
                    colour: row['colour'] || row['Colour'] || '',
                    variant: row['variant'] || row['Variant'] || '',
                    model: row['model'] || row['Model'] || '',
                    engineNo: row['engineNo'] || row['Engine No'] || row['engine number'] || '',
                    chassisNo: row['chassisNo'] || row['Chassis No'] || row['chassis number'] || '',
                    // assignedDealer: assignedDealerId,
                    location: row['location'] || row['Location'] || '',
                    status: 'open',
                    userId: user.id,
                    isApproved: false,
                };
            });
    
            // const unmatchedDealers = json.filter(row => {
            //     const assignedDealerName = normalizeName(row['assignedDealer'] || row['Assigned Dealer'] || '');
            //     return !dealerMap[assignedDealerName];
            // });
    
            // if (unmatchedDealers.length > 0) {
            //     const dealerNames = unmatchedDealers.map(row => row['assignedDealer'] || row['Assigned Dealer']).join(', ');
            //     toast.error(`The following dealer names do not match any registered dealer: ${dealerNames}`);
            //     return null;
            // }
    
            return jsonWithIds;
        } catch (error) {
            toast.error('Error processing the file: ' + error.message);
            return null;
        }
    };

    const bulkUpdateVehicleMaster = async (ticketJson) => {
        
        const vehiclesToAdd = [];

            for (const item of ticketJson) {
                const vehicleExists = vehicles.some(
                    (vehicle) => 
                        vehicle.model === item.model && 
                        vehicle.colour === item.colour && 
                        vehicle.variant === item.variant
                );
                
                if (!vehicleExists) {
                    vehiclesToAdd.push({
                        model: item.model,
                        colour: item.colour,
                        variant: item.variant
                    });
                }
            }

            if (vehiclesToAdd.length > 0) {
                try {
                    const response = await axios.post(`${baseURL}/vehiclemaster/bulk`, { userId: user.id, vehicles: vehiclesToAdd }, {
                        headers: { 'Content-Type': 'application/json' },
                    });
                    console.log(`Successfully added ${response.data.vehiclesAdded} vehicles to Vehicle Master`);
                    console.log(`Did not add ${response.data.vehiclesNotAdded} vehicles as they already exist in Vehicle Master`);
                    const successMessage = response.data.vehiclesAdded > 0 ? `${response.data.vehiclesAdded} vehicles added successfully to Vehicle Master.` : '';
                    const failureMessage = response.data.vehiclesNotAdded > 0 ? `${response.data.vehiclesNotAdded} vehicles not added as they were already present in Vehicle Master.` : '';
                    toast.success(`${successMessage} ${failureMessage}`);

                } catch (error) {
                    console.error("Failed to save vehicles:", error.response?.data || error.message);
                }
            }
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (inputType === 'bulk') {
            const jsonData = await handleFileUpload();
            if (!jsonData) return;

            bulkUpdateVehicleMaster(jsonData);
            
            try {
                const response = await axios.post(`${baseURL}/bulkcreateticket`, jsonData, {
                    headers: { 'Content-Type': 'application/json' },
                });

                if (response.status === 200) {
                    
                    toast.success('Bulk tickets have been created successfully.'    );
                    navigate(`/user/${user.id}/tickets`);
                } else {
                    toast.error('An error occurred during bulk ticket creation.');
                }
            } catch (error) {
                console.error('Error creating bulk tickets:', error.message);
                toast.error('An error occurred while uploading the file: ' + error.message);
            }
        } else {
            const newComplaint = { variant, colour, model, chassisNo, engineNo, location, assignedDealer: dealerId, status: 'open', isApproved: false };

            try {
                const vehicleExists = vehicles.some(
                    (vehicle) => 
                        vehicle.model === model && 
                        vehicle.colour === colour && 
                        vehicle.variant === variant
                );

                if (!vehicleExists) {
                    const vehicleData = { userId: user.id, model, colour, variant };
                    await axios.post(`${baseURL}/vehiclemaster`, vehicleData, {
                        headers: { 'Content-Type': 'application/json' },
                    });
                    toast.success('Vehicle added to Vehicle Master');
                } else {
                    toast.success('Vehicle not added as it was already present in Vehicle Master');
                }

                const response = await axios.post(`${baseURL}/createticket`, newComplaint, {
                    headers: { 'Content-Type': 'application/json' }
                });

                if (response.status === 200) {
                    toast.success('Your ticket has been successfully created.');
                    navigate(`/user/${user.id}/tickets`);
                } else {
                    toast.error('An error occurred while creating your ticket.');
                }
            } catch (error) {
                toast.error('An error occurred while creating your ticket: ' + error.message);
            }
        }

        
        setColour("");
        setVariant("");
        setModel("");
        setChassisNo("");
        setEngineNo("");
        setLocation("");
        setDealerId("");
        setDealerName("");
    };

    const handleInputChange = (value) => {
        setDealerId(value[1]);
        setDealerName(value[0]);
    };

    return (
        user.permissions.includes("upload_stock") || user.permissions.includes("all_access") ? (
            <div className="flex flex-col items-center pt-10 lg:pt-20 min-h-screen">
                <div className="w-full max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
                    <h2 className="text-3xl font-bold text-center mb-8">
                        Add Details of Bikes.
                    </h2>
                    <div className="mb-4">
                        <label htmlFor="inputType">Add Details:</label>
                        <select
                            id="inputType"
                            className="ml-2 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={inputType}
                            onChange={(e) => setInputType(e.target.value)}
                        >
                            <option value="single">Single</option>
                            <option value="bulk">Bulk</option>
                        </select>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {inputType === 'single' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    required
                                    type="text"
                                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Colour"
                                    value={colour}
                                    onChange={(e) => setColour(e.target.value)}
                                />
                                <input
                                    required
                                    type="text"
                                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Variant"
                                    value={variant}
                                    onChange={(e) => setVariant(e.target.value)}
                                />
                                <input
                                    required
                                    type="text"
                                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Model"
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                />
                                <input
                                    required
                                    type="text"
                                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Chassis No"
                                    value={chassisNo}
                                    onChange={(e) => setChassisNo(e.target.value)}
                                />
                                <input
                                    required
                                    type="text"
                                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Engine No"
                                    value={engineNo}
                                    onChange={(e) => setEngineNo(e.target.value)}
                                />
                                <Autocomplete
                                    suggestions={dealerInfo}
                                    setDealerId={handleInputChange}
                                />
                                {!showCustomLocation ? (
                                    <select
                                        className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={location}
                                        onChange={(e) => {
                                            const selectedLocation = e.target.value;
                                            if (selectedLocation === 'Other') {
                                                setShowCustomLocation(true);
                                                setLocation('');
                                            } else {
                                                setLocation(selectedLocation);
                                            }
                                        }}
                                    >
                                        <option value="" disabled>Select location.</option>
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
                                ) : (
                                    <input
                                        type="text"
                                        className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter custom location"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        onBlur={() => {
                                            if (location === '') {
                                                setShowCustomLocation(false);
                                            }
                                        }}
                                    />
                                )}
                            </div>
                        )}

                        {inputType === 'bulk' && (
                            <div>
                                <input
                                    type="file"
                                    accept="
                                        .csv, 
                                        application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, 
                                        application/vnd.ms-excel,
                                        application/vnd.oasis.opendocument.spreadsheet"
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
                        </div>
                    </form>
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
        )
    );
};

export default CreateUserTicket;
