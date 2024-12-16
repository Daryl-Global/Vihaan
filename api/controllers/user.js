// api/controller/user.js

const User = require("../models/userModel");
const Ticket = require("../models/ticketModel");
const Customer = require("../models/customerModel");
const Booking = require("../models/bookingModel");
const Vehicle = require("../models/vehicleModel");
const Executive = require('../models/executiveModel');
const Location = require('../models/locationModel');
const { v4: uuidv4 } = require("uuid");

const getUserDetails = async (req, res) => {
    try {
        const userId = req.body.userId;

        var user = null;
        user = await User.findOne({ userId });

        res.json({ 
            status: 200, 
            userDetails: {
                userName: user.name,
                userRole: user.role,
                userBranch: user.branch,
                userPermissions: user.permissions
            } });
    } catch (error) {
        res.json({ status: "error", error: error.message });
    }
}

const fetchTickets = async (req, res) => {
    try {
        const user = req.body.user;

        let filter = {};

        // Add branch or dealer-specific filters
        if (user.branch && user.branch !== 'all') {
            filter.location = { $regex: user.branch, $options: 'i' };
        }

        const privilegedUser = ['admin', 'owner', 'dealer'].includes(user.role);

        // Further filtering logic only applies for non privileged users
        if(!privilegedUser) {
            // Map permissions to status filters
            const permissionToStatusMap = {
                'upload_stock': ['open'],
                'allocation_details': ['open'],
                'issue_sale_letter': ['allocated'],
                'passing_details': ['soldButNotDelivered', 'deliveredWithoutNumber'],
                'registration_details': ['soldButNotDelivered', 'deliveredWithoutNumber'],
                'delivery_report': ['soldButNotDelivered'],
            };
        
            // Collect status filters based on user permissions
            const statusFilters = Object.entries(permissionToStatusMap)
                .filter(([permission]) => user.permissions.includes(permission))
                .flatMap(([, statuses]) => statuses); // Flatten the array of statuses
        
            if (statusFilters.length > 0) {
                filter.status = { $in: [...new Set(statusFilters)] }; // Use Set for uniqueness
            }

            // Mapping permissions to their corresponding null field checks
            const nullFieldMapping = {
                'passing_details': 'passingDate',
                'registration_details': 'registrationDate',
                'delivery_report': 'gatePassSerialNumber',
            };
            
            // Collect null field filters based on user permissions
            const nullFieldFilters = Object.keys(nullFieldMapping)
                .filter(permission => user.permissions.includes(permission))  // Check user permissions
                .map(permission => ({ [nullFieldMapping[permission]]: { $eq: null } }));  // Map to MongoDB query filter

            // If there are any null field conditions, add them to the filter
            if (nullFieldFilters.length > 0) {
                // Combine the null field checks with the existing filter using $and
                filter.$and = filter.$and ? [...filter.$and, ...nullFieldFilters] : nullFieldFilters;
            }

            // Separate 'sentForIssueSaleLetter' check for 'issue_sale_letter' permission 
            if (user.permissions.includes('issue_sale_letter')) {
                filter.sentForIssueSaleLetter = true;
            }

            // Separate 'passingDate' check for 'registration_details' permission 
            if (user.permissions.includes('registration_details')) {
                filter.passingDate = { $ne: null };
            }
        }

        // Fetch tickets based on the dynamically built filter
        const tickets = await Ticket.find(filter).sort({ updatedAt: -1, createdAt: -1 });;

        res.json({ status: 200, tickets });
    } catch (error) {
        res.json({ status: "error", error: error.message });
    }
};

const fetchTicketsByStatus = async (req, res) => {
    try {
        const user = req.body.user;
        const status = req.body.status;

        let filter = {};

        // Add branch or dealer-specific filters
        if (user.branch && user.branch !== 'all') {
            filter.location = { $regex: user.branch, $options: 'i' };
        }

        filter.status = status;

        // Fetch tickets based on the dynamically built filter
        const tickets = await Ticket.find(filter);

        res.json({ status: 200, tickets });
    } catch (error) {
        res.json({ status: "error", error: error.message });
    }
};

const createTicket = async (req, res) => {
    try {
        const { user_id } = req.params;
        const newId = uuidv4();

        if (user_id !== req.userId) {
            return res.sendStatus(403);
        }
        const {
            colour,
            variant,
            model,
            engineNo,
            chassisNo,
            resolved,
            priority,
            location,
            assignedDealer,
            status
        } = req.body;


        const ticket = new Ticket({
            id: newId,
            byUser: user_id,
            colour,
            variant,
            model,
            engineNo,
            chassisNo,
            resolved,
            priority,
            location,
            assignedDealer,
            status
        });

        await ticket.save();

        res.json({ status: 200 });
    } catch (error) {
        res.status(500).json({ status: "error", error: "Failed to create ticket" });
    }
};

const BookingMaster = async (req, res) => {
    try {
        const { user_id } = req.params;
        const newId = uuidv4();

        if (user_id !== req.userId) {
            return res.sendStatus(403);
        }

        const {
            cusName,
            addhar,
            addCus,
            bookingAmount,
            executive,
            hp,
            model,
            colour,
            variant,
            emailId,
            mobileNumber,
            branch,
            createdOn,
        } = req.body;

        if (!cusName || !addhar || !model || !colour) {
            return res.status(400).json({ error: "Missing required fields" });
        }


        const vehicle = await Vehicle.findOne({ model: model, variant: variant, colour: colour });
        if (!vehicle) {
            console.error(`No matching vehicle found for model: ${model}, variant: ${variant} and colour: ${colour}`);
            return res.status(400).json({ error: "No matching vehicle found" });
        }


        if (parseFloat(bookingAmount) < parseFloat(vehicle.priceLock)) {
            return res.status(400).json({ error: `Booking amount must be at least ${vehicle.priceLock}` });
        }

        const booking = new Booking({
            id: newId,
            byUser: user_id,
            cusName,
            addhar,
            addCus,
            bookingAmount,
            executive,
            hp,
            model,
            colour,
            variant,
            emailId,
            mobileNumber,
            branch,
            createdOn,
        });

        await booking.save();
        res.json({ status: 200 });
    } catch (error) {
        console.error("Error in BookingMaster:", error.message);
        console.error(error.stack);
        res.status(500).json({ status: "error", error: "Failed to create booking" });
    }
};

const VehicleMaster = async (req, res) => {
    try {
        const newId = uuidv4();
        
        const { userId, model, colour, variant, priceLock, createdOn } = req.body;

        const existingVehicle = await Vehicle.findOne({ model, colour, variant });
        if (existingVehicle) {
            return res.status(400).json({ status: "error", error: "Vehicle already exists in VehicleMaster." });
        }

        const vehicle = new Vehicle({
            id: newId,
            byUser: userId,
            model,
            colour,
            variant,
            priceLock,
            createdOn,
        });

        await vehicle.save();

        res.json({ status: 200, message: 'Vehicle added successfully.' });
    } catch (error) {
        res.status(500).json({ status: "error", error: "Failed to create vehicle, ", error });
    }
};

const VehicleMasterBulk = async (req, res) => {
    try {
        const { userId, vehicles } = req.body;

        const bulkOps = vehicles.map(vehicle => ({
            updateOne: {
                filter: { model: vehicle.model, colour: vehicle.colour, variant: vehicle.variant },
                update: {
                    $setOnInsert: {
                        id: uuidv4(),
                        byUser: userId,
                        model: vehicle.model,
                        colour: vehicle.colour,
                        variant: vehicle.variant,
                        priceLock: vehicle.priceLock,
                        createdOn: vehicle.createdOn || new Date(),
                    }
                },
                upsert: true  // Insert the vehicle only if it doesn't already exist
            }
        }));

        const result = await Vehicle.bulkWrite(bulkOps);

        res.json({
            status: 200,
            message: 'Vehicles added successfully.',
            vehiclesAdded: result.upsertedCount,
            vehiclesNotAdded: vehicles.length - result.upsertedCount
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to add vehicles.", details: error.message });
    }
};


const CustomerMaster = async (req, res) => {
    try {
        const { user_id } = req.params;
        const newId = uuidv4();

        if (user_id !== req.userId) {
            return res.sendStatus(403);
        }
        const {

            cusName,
            addCus,
            addhar,
            hp,
            createdOn,
            emailId,
            mobileNumber,
            customerLocation
        } = req.body;

        const branch = customerLocation


        const customer = new Customer({
            id: newId,
            byUser: user_id,
            cusName,
            addCus,
            addhar,
            hp,
            createdOn,
            emailId,
            mobileNumber,
            branch
        });

        await customer.save();

        res.json({ status: 200 });
    } catch (error) {
        res.status(500).json({ status: "error", error: "Failed to create Executive master due to error:", error });
    }
};


const ExecutiveMaster = async (req, res) => {
    try {
        const { user_id } = req.params;
        const newId = uuidv4();

        if (user_id !== req.userId) {
            return res.sendStatus(403); 
        }

        const { executiveName, phone, executiveBranch } = req.body;

        if (!executiveName || !phone || !executiveBranch) {
            return res.status(400).json({ error: "Missing required fields: executiveName and phone" });
        }

        const newExecutive = new Executive({
            id: newId,
            byUser: user_id,
            executiveName,  
            phone,
            branch: executiveBranch
        });

        await newExecutive.save();

        res.json({ status: 200, message: "Executive created successfully" });
    } catch (error) {
        console.error("Error in ExecutiveMaster route:", error.message);  
        res.status(500).json({ status: "error", error: error.message });
    }
};

const LocationMaster = async (req, res) => {
    try {
        const { user_id } = req.params;  
        const newId = uuidv4();  

        if (user_id !== req.userId) {
            return res.sendStatus(403);  
        }

        const { locationName } = req.body;

        if (!locationName) {
            return res.status(400).json({ error: "Missing required field: locationName" });
        }

        const newLocation = new Location({
            id: newId,
            byUser: user_id,
            locationName,  
        });

        await newLocation.save();  

        res.json({ status: 200, message: "Location has been successfully created." });
    } catch (error) {
        console.error("Error in LocationMaster route:", error.message);
        res.status(500).json({ status: "error", error: error.message });
    }
};

const updateVehicleStock = async (req, res) => {
    try {
        const { stock_id } = req.params;
    
        const updatedVehicleStock = await Ticket.findOneAndUpdate(
            { id: stock_id },
            req.body,
            { new: true }
        );

        if (!updatedVehicleStock) {
            return res
                .status(404)
                .json({ status: "error", error: "Stock not found" });
        }

        return res.json({ status: 200 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", error: "Failed to update ticket" });
    }
    
}

const updateTicket = async (req, res) => {
    try {
        const { user_id } = req.params;

        if (user_id !== req.userId) {
            return res.sendStatus(403);
        }

        const {
            bookingAmount,
            companyName,
            email,
            phoneNumber,
            landlineNumber,
            department,
            issue,
            classification,
            channel,
            remarks,
            resolved,
            priority,
            assignedDealer,
            nameCus,
            executive,
            hp,
            createdOn,
            ticket_id,
            addCus,
            status
        } = req.body;


        const existingTicket = await Ticket.findOneAndUpdate(
            { id: ticket_id },
            {
                bookingAmount,
                companyName,
                email,
                phoneNumber,
                landlineNumber,
                department,
                issue,
                classification,
                channel,
                remarks,
                resolved,
                priority,
                assignedDealer,
                nameCus,
                executive,
                hp,
                createdOn,
                addCus,
                status
            },
            { new: true }
        );

        if (!existingTicket) {
            return res
                .status(404)
                .json({ status: "error", error: "Ticket not found" });
        }

        res.json({ status: 200 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", error: "Failed to update ticket" });
    }
};

const saleLetter = async (req, res) => {
    try {
        const { user_id } = req.params;

        if (user_id !== req.userId) {
            return res.sendStatus(403); // Forbidden if user ID doesn't match
        }

        const {
            deliveryAmount,
            companyName,
            email,
            phoneNumber,
            landlineNumber,
            department,
            issue,
            classification,
            channel,
            remarks,
            resolved,
            priority,
            assignedDealer,
            nameCus,
            executive,
            hp,
            createdOn,
            ticket_id,
            issueFinance,
            issueAmount,
            isApproved,
            approvedDate,
            status
        } = req.body;

        // Assuming Ticket is your Mongoose model
        const existingTicket = await Ticket.findOneAndUpdate(
            { id: ticket_id }, // Assuming 'byUser' is the unique identifier for a ticket
            {
                deliveryAmount,
                companyName,
                email,
                phoneNumber,
                landlineNumber,
                department,
                issue,
                classification,
                channel,
                remarks,
                resolved,
                priority,
                assignedDealer,
                nameCus,
                executive,
                hp,
                createdOn,
                issueFinance,
                issueAmount,
                isApproved,
                approvedDate,
                status
            },
            { new: true } // Return the updated document
        );

        if (!existingTicket) {
            return res
                .status(404)
                .json({ status: "error", error: "Ticket not found" });
        }

        res.json({ status: 200 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", error: "Failed to update ticket" });
    }
};

const deliveryTicket = async (req, res) => {
    try {
        const { user_id } = req.params;

        if (user_id !== req.userId) {
            return res.sendStatus(403); // Forbidden if user ID doesn't match
        }

        const {
            deliveryAmount,
            gatePass,
            companyName,
            email,
            phoneNumber,
            landlineNumber,
            department,
            issue,
            classification,
            channel,
            remarks,
            resolved,
            priority,
            assignedDealer,
            ticket_id,
        } = req.body;

        // Assuming Ticket is your Mongoose model
        const existingTicket = await Ticket.findOneAndUpdate(
            { id: ticket_id }, // Assuming 'byUser' is the unique identifier for a ticket
            {
                deliveryAmount,
                gatePass,
                companyName,
                email,
                phoneNumber,
                landlineNumber,
                department,
                issue,
                classification,
                channel,
                remarks,
                resolved,
                priority,
                assignedDealer,
            },
            { new: true } // Return the updated document
        );

        if (!existingTicket) {
            return res
                .status(404)
                .json({ status: "error", error: "Ticket not found" });
        }

        res.json({ status: 200 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", error: "Failed to update ticket" });
    }
};

const datePassing = async (req, res) => {
    try {
        const { user_id } = req.params;

        if (user_id !== req.userId) {
            return res.sendStatus(403); // Forbidden if user ID doesn't match
        }

        const {
            ticket_id,
            passingDate,
        } = req.body;

        // Assuming Ticket is your Mongoose model
        const existingTicket = await Ticket.findOneAndUpdate(
            { id: ticket_id }, // Assuming 'byUser' is the unique identifier for a ticket
            {
                passingDate,
            },
            { new: true } // Return the updated document
        );

        if (!existingTicket) {
            return res
                .status(404)
                .json({ status: "error", error: "Ticket not found" });
        }

        res.json({ status: 200 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", error: "Failed to update ticket" });
    }
};

const registrationDetails = async (req, res) => {
    try {
        const { user_id } = req.params;

        if (user_id !== req.userId) {
            return res.sendStatus(403); // Forbidden if user ID doesn't match
        }

        const {
            ticket_id,
            registrationDate,
            vehicleNumber,
        } = req.body;

        // Assuming Ticket is your Mongoose model
        const existingTicket = await Ticket.findOneAndUpdate(
            { id: ticket_id }, // Assuming 'byUser' is the unique identifier for a ticket
            {
                registrationDate,
                vehicleNumber,
            },
            { new: true } // Return the updated document
        );

        if (!existingTicket) {
            return res
                .status(404)
                .json({ status: "error", error: "Ticket not found" });
        }

        res.json({ status: 200 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", error: "Failed to update ticket" });
    }
};

const createBulkTickets = async (req, res) => {
    try {
        
        const tickets = [];
        const vehiclesToAdd = [];

        for (const ticketData of req.body) {
            const { model, colour, variant } = ticketData;

            const existingVehicle = await Vehicle.findOne({ model, colour, variant });
            if (!existingVehicle) {
                
                vehiclesToAdd.push({
                    id: uuidv4(),
                    byUser: ticketData.userId,
                    model,
                    colour,
                    variant,
                    priceLock: ticketData.priceLock || null,
                    createdOn: new Date()
                });
            }

            tickets.push({
                id: uuidv4(),
                colour: ticketData.colour,
                variant: ticketData.variant,
                model: ticketData.model,
                engineNo: ticketData.engineNo,
                chassisNo: ticketData.chassisNo,
                // assignedDealer: ticketData.assignedDealer,
                location: ticketData.location,
                status: ticketData.status,
                byUser: ticketData.userId
            });
        }

        if (vehiclesToAdd.length > 0) {
            await Vehicle.insertMany(vehiclesToAdd);
        }

        await Ticket.insertMany(tickets);

        res.json({ status: 200, message: 'Bulk tickets and vehicles have been successfully created.' });
    } catch (error) {
        console.error("Error creating bulk tickets and vehicles:", error);
        res.status(500).json({ status: "error", error: "Failed to create bulk tickets and vehicles: " + error.message });
    }
};


const fetchSingleTicket = async (req, res) => {
    try {

        const { user_id } = req.params;
        if (user_id !== req.userId) {
            return res.sendStatus(403);
        }


        const { ticket_id } = req.params;
        const ticket = await Ticket.findOne({ id: ticket_id });
        res.json({ status: 200, ticket });
    } catch (err) {
        console.log(err);
    }
};

const updateTicketStatus = async (req, res) => {
    try {

        const { user_id } = req.params;
        if (user_id !== req.userId) {
            return res.sendStatus(403);
        }


        const { ticket_id } = req.params;
        const filter = { id: ticket_id };
        const update = { resolved: req.body.resolved };
        const doc = await Ticket.findOneAndUpdate(filter, update, {
            new: true,
        });
        res.json({ status: 200 });
    } catch (err) {
        console.log(err);
    }
};

const addMessage = async (req, res) => {
    const { user_id } = req.params;
    const { ticket_id } = req.params;
    const { userRole, textMessage } = req.body;

    if (user_id !== req.userId) {
        return res.sendStatus(403);
    }

    const updatedTicket = await Ticket.findOneAndUpdate(
        { id: ticket_id },
        {
            $push: {
                logs: {
                    timestamp: Date.now(),
                    userRole: userRole,
                    message: textMessage,
                },
            },
        },
        { new: true }
    );

    res.json({ status: 200 });
};

const getCustomers = async (req, res) => {
    const branch = req.query.branch;
    let customers = null;
    try {
        if(branch && branch !== 'all') {
            customers = await Customer.find({branch});
        } else {
            customers = await Customer.find();
        }
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch customers', error });
    }
};

const getExecutives = async (req, res) => {
    const branch = req.query.branch;
    let executives = null;
    try {
        if(branch && branch !== 'all') {
            executives = await Executive.find({branch});
        } else {
            executives = await Executive.find();
        }
        res.status(200).json(executives);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch executive', error });
    }
};

const getLocation = async (req, res) => {
    try {
        const location = await Location.find();
        res.status(200).json(location);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch location', error });
    }
};

const getBookings = async (req, res) => {
    const branch = req.query.branch;
    let bookings = null;
    try {
        if(branch && branch !== 'all') {
            bookings = await Booking.find({branch});
        } else {
            bookings = await Booking.find();
        }
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch bookings', error });
    }
};

const getVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find();
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch vehicles', error });
    }
};

const updateVehicle = async (req, res) => {
    try {
            const { userId, model, variant, colour, priceLock } = req.body;

            let query = { model, variant, byUser: userId };
            if (Array.isArray(colour) && colour.length > 0) {
                query.colour = { $in: colour };
            }
            
            const updatedVehicle = await Vehicle.updateMany(
                query,
                { priceLock },
                { new: true }
            );

        if (!updatedVehicle) {
            return res.status(404).json({ status: "error", error: "Vehicle not found" });
        }

        res.json({ status: 200, vehicle: updatedVehicle });
    } catch (error) {
        console.error("Failed to update vehicle:", error);
        res.status(500).json({ status: "error", error: "Failed to update vehicle" });
    }
};

const assignDealerToTicket = async (req, res) => {
    try {
        const { user_id, ticket_id } = req.params;
        const { dealerId } = req.body;

        if (user_id !== req.userId) {
            return res.status(403).json({ status: "error", error: "Unauthorized access." });
        }

        const ticket = await Ticket.findOne({ id: ticket_id });
        if (!ticket) {
            return res.status(404).json({ status: "error", error: "Ticket not found." });
        }

        const currentDealerId = ticket.assignedDealer;

        if (currentDealerId === dealerId) {
            return res.status(400).json({ status: "error", error: "Dealer is already assigned to this ticket." });
        }

        const updatedTicket = await Ticket.findOneAndUpdate(
            { id: ticket_id },
            {
                assignedDealer: dealerId,
                $push: {
                    dealerHistory: {
                        fromDealerId: currentDealerId || null,
                        toDealerId: dealerId,
                        timestamp: new Date(),
                    },
                },
            },
            { new: true }
        );

        if (!updatedTicket) {
            return res.status(404).json({ status: "error", error: "Failed to assign dealer." });
        }

        res.json({ status: 200, message: "Dealer assigned successfully.", ticket: updatedTicket });
    } catch (error) {
        console.error("Failed to assign dealer:", error);
        res.status(500).json({ status: "error", error: "Failed to assign dealer." });
    }
};






const getLatestGatePassSerialNumber = async (req, res) => {
    try {
        const { location } = req.params;
        // Find the latest gate pass for the given location, ignoring empty or null gatePassSerialNumbers
        const previousGatePass = await Ticket
            .findOne({
                location,
                gatePassSerialNumber: { $ne: "" } // Exclude empty gatePassSerialNumbers
            })
            .sort({
                gatePassSerialNumber: -1 // Sorting based on the serial number as a string
            })
            .exec();

        if (previousGatePass && previousGatePass.gatePassSerialNumber) {
            res.status(200).json({
                success: true,
                serialNumber: previousGatePass.gatePassSerialNumber
            });
        } else {
            // No previous gate pass found or all have empty gatePassSerialNumber
            res.status(200).json({
                success: true,
                serialNumber: null
            });
        }

    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching gate pass serial number", error });
    }
}

const updateGatePassSerialNumber = async (req, res) => {
    try {
        const {
            
            ticket_id,
            colour,
            nameCus,
            deliveryAmount,
            gatePassSerialNumber,
            status
        } = req.body;

        // Assuming Ticket is your Mongoose model
        const existingTicket = await Ticket.findOneAndUpdate(
            { id: ticket_id }, // Assuming 'byUser' is the unique identifier for a ticket
            {
                colour,
                nameCus,
                deliveryAmount,
                gatePassSerialNumber,
                status
            },
            { new: true } // Return the updated document
        );

        if (!existingTicket) {
            return res
                .status(404)
                .json({ status: "error", error: "Ticket not found" });
        }

        res.json({ status: 200 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", error: "Failed to update ticket" });
    }
}

const getBookingByAadhaar = async (req, res) => {
    try {
        const { aadhaar } = req.params;

        const latestBooking = await Booking.findOne({ addhar: aadhaar }).sort({ createdOn: -1 });

        if (!latestBooking) {
            return res.status(404).json({ message: "No booking found for the given Aadhaar." });
        }

        res.status(200).json(latestBooking);
    } catch (error) {
        console.error("Error fetching latest booking:", error);
        res.status(500).json({ message: "Server error", error });
    }
};


const getOpenTickets = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: "Status is required" });
        }

        const tickets = await Ticket.find({ status: status }); 

        if (!tickets || tickets.length === 0) {
            return res.status(404).json({ message: "No tickets found." });
        }

        return res.status(200).json({ tickets });
    } catch (error) {
        console.error("Error fetching tickets:", error);
        return res.status(500).json({ error: "Failed to fetch tickets" });
    }
};


module.exports = {
    fetchTickets,
    fetchTicketsByStatus,
    createTicket,
    updateTicket,
    updateVehicleStock,
    CustomerMaster,
    ExecutiveMaster,
    LocationMaster,
    BookingMaster,
    VehicleMaster,
    VehicleMasterBulk,
    updateVehicle,
    createBulkTickets,
    fetchSingleTicket,
    updateTicketStatus,
    addMessage,
    deliveryTicket,
    getExecutives,
    getLocation,
    getCustomers,
    getBookings,
    getVehicles,
    saleLetter,
    datePassing,
    registrationDetails,
    assignDealerToTicket,
    getLatestGatePassSerialNumber,
    updateGatePassSerialNumber,
    getBookingByAadhaar,
    getOpenTickets,
};
