const Ticket = require("../models/ticketModel");
const UserData = require("../models/userModel");
const Booking = require("../models/bookingModel");
const Vehicle = require("../models/vehicleModel");
const XLSX = require('xlsx');

const fetchTickets = async (req, res) => {
    try {
        const { user_id } = req.params;

        if (user_id !== req.userId) {
            return res.sendStatus(403);
        }

        // Fetch all users tickets from the database
        const tickets = await Ticket.find();
        res.json({ status: 200, tickets });
    } catch (error) {
        res.json({ status: "error", error: "Failed to fetch tickets, reason: " + error.message });
    }
};

const getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find();
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


const exportMyTickets = async (req, res) => {
    try {
        const { user_id } = req.params;

        if (user_id !== req.userId) {
            return res.sendStatus(403);
        }
        const headers = ["model", "colour", "chassisNo", "engineNo", "assignedDealer"];

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([headers]);

        XLSX.utils.book_append_sheet(workbook, worksheet, "Bulk_Upload_Template");

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

        res.setHeader('Content-Disposition', 'attachment; filename=Bulk_Upload_Template.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        return res.status(200).send(excelBuffer);
    } catch (err) {
        console.error('Error exporting Bulk Upload Template:', err);
        return res.status(500).json({ error: err.message });
    }
};


const exportTickets = async (req, res) => {
    try {
        const { user_id } = req.params;
        if (user_id !== req.userId) {
            return res.sendStatus(403);
        }

        const tickets = await Ticket.find().lean();

        if (!tickets.length) {
            return res.status(404).json({ error: "No tickets found" });
        }
        const bookings = await Booking.find().lean();
        if (!bookings.length) {
            return res.status(404).json({ error: "No bookings found" });
        }
        const vehicles = await Vehicle.find().lean();
        if (!vehicles.length) {
            return res.status(404).json({ error: "No vehicle found" });
        }

        const stockData = tickets.map(ticket => ({
            Model: ticket.model,
            Color: ticket.colour,
            ChassisNumber: ticket.chassisNo,
            EngineNumber: ticket.engineNo,
            Dealer: ticket.assignedDealer,
            StockInwardDate: ticket.createdAt,    
            DeliveryDate: ticket.deliveryAmount,  
            CustomerName: ticket.nameCus,
            Amount: ticket.bookingAmount,
            PaymentStatus: ticket.issueAmount,    
            DateOfPassing: ticket.passingDate,
            IssueSaleLetterDate: ticket.saleLetterDate,
            FinalStatus: ticket.finalStatus,
            DateOfAllotment: ticket.SaleDate
        }));

        const allotmentData = tickets.map(ticket => ({
            Model: ticket.model,
            Color: ticket.colour,
            ChassisNumber: ticket.chassisNo,
            EngineNumber: ticket.engineNo,
            Dealer: ticket.assignedDealer,
            AllotmentDate: ticket.createdOn, 
            CustomerName: ticket.nameCus,
        }));

        const bookingData = bookings.map(booking => ({
            DateOfBooking: booking.createdOn,     
            Aadhar: booking.addhar,                
            CustomerName: booking.cusName,   
            Model: booking.model,                 
            Color: booking.color,   
            BookingAmount: booking.bookingAmount, 
            Executive: booking.executive,
            Status: booking.status                
        }));


        const vehicleData = vehicles.map(vehicle => ({
            Model: vehicle.model,                 
            Color: vehicle.color,   
            variant: vehicle.variant, 
            priceLock: vehicle.priceLock,   
        }));

        
        const workbook = XLSX.utils.book_new();

        const stockWorksheet = XLSX.utils.json_to_sheet(stockData);
        XLSX.utils.book_append_sheet(workbook, stockWorksheet, "Stock");

        const bookingWorksheet = XLSX.utils.json_to_sheet(bookingData);
        XLSX.utils.book_append_sheet(workbook, bookingWorksheet, "Booking");

        const vehicleWorksheet = XLSX.utils.json_to_sheet(vehicleData);
        XLSX.utils.book_append_sheet(workbook, vehicleWorksheet, "Vehicle");

        const allotmentWorksheet = XLSX.utils.json_to_sheet(allotmentData);
        XLSX.utils.book_append_sheet(workbook, allotmentWorksheet, "Allotment");

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

        res.setHeader('Content-Disposition', 'attachment; filename=Tickets_All_MultiSheet.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.status(200).send(excelBuffer);

    } catch (err) {
        console.error('Error exporting Stocks:', err);
        res.status(500).json({ error: err.message });
    }
};

const fetchDealers = async (req, res) => {
    try {
        const { user_id } = req.params;

        if (user_id !== req.userId) {
            return res.sendStatus(403);
        }

        // Fetch all users tickets from the database
        const dealers = await UserData.find({ role: "dealer" });
        res.json({ status: 200, dealers });
    } catch (error) {
        res.json({ status: "error", error: "Failed to fetch dealers" });
    }
};

const assignRole = async (req, res) => {
    const { user_id } = req.params;

    if (user_id !== req.userId) {
        return res.sendStatus(403);
    }
    // Find user who matches the email address and set to dealer
    const user = await UserData.findOneAndUpdate(
        { email: req.body.email },
        { role: "dealer" },
        { new: true }
    );
    if (!user) {
        return res.json({ status: 501, text: "User not found" });
    }
    return res.json({ status: 200 });
};

const setDealer = async (req, res) => {
    const { user_id } = req.params;
    const { ticket_id } = req.params;
    if (user_id !== req.userId) {
        return res.sendStatus(403);
    }

    const ticket = await Ticket.findOneAndUpdate(
        { id: ticket_id },
        { assignedDealer: req.body.dealerId },
        { new: true }
    );
    if (!ticket) {
        return res.json({ status: 501, text: "Error in assigning dealer" });
    }
    return res.json({ status: 200 });
};

const acceptTicket = async (req, res) => {
    const { user_id } = req.params;
    const { ticket_id } = req.params;
    if (user_id !== req.userId) {
        return res.sendStatus(403);
    }

    const ticket = await Ticket.findOneAndUpdate(
        { id: ticket_id },
        { accepted: 1 },
        { new: true }
    );

    if (!ticket) {
        return res.json({ status: 501, text: "Error in accepting the ticket." });
    }
    return res.json({ status: 200 });
};

const setPriority = async (req, res) => {
    const { user_id } = req.params;
    const { ticket_id } = req.params;
    const { priority } = req.body;
    if (user_id !== req.userId) {
        return res.sendStatus(403);
    }

    const ticket = await Ticket.findOneAndUpdate(
        { id: ticket_id },
        { priority: priority },
        { new: true }
    );

    if (!ticket) {
        return res.json({ status: 501, text: "Error in setting priority." });
    }
    return res.json({ status: 200 });
};

const setProblem = async (req, res) => {
    const { user_id } = req.params;
    const { ticket_id } = req.params;
    const { Problem } = req.body;
    if (user_id !== req.userId) {
        return res.sendStatus(403);
    }

    const ticket = await Ticket.findOneAndUpdate(
        { id: ticket_id },
        { Problem: Problem },
        { new: true }
    );

    if (!ticket) {
        return res.json({ status: 501, text: "Error in setting Problem." });
    }
    return res.json({ status: 200 });
};

const setServiceType = async (req, res) => {
    const { user_id } = req.params;
    const { ticket_id } = req.params;
    const { ServiceType } = req.body;
    if (user_id !== req.userId) {
        return res.sendStatus(403);
    }

    const ticket = await Ticket.findOneAndUpdate(
        { id: ticket_id },
        { ServiceType: ServiceType },
        { new: true }
    );

    if (!ticket) {
        return res.json({ status: 501, text: "Error in setting ServiceType." });
    }
    return res.json({ status: 200 });
};

const setAMC = async (req, res) => {
    const { user_id } = req.params;
    const { ticket_id } = req.params;
    const { AMC } = req.body;
    if (user_id !== req.userId) {
        return res.sendStatus(403);
    }

    const ticket = await Ticket.findOneAndUpdate(
        { id: ticket_id },
        { AMC: AMC },
        { new: true }
    );

    if (!ticket) {
        return res.json({ status: 501, text: "Error in setting AMC." });
    }
    return res.json({ status: 200 });
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

const deleteTicket = async (req, res) => {
    const { user_id, ticket_id } = req.params;
    if (user_id !== req.userId) {
        return res.sendStatus(403);
    }

    const ticket = await Ticket.findOneAndDelete({ id: ticket_id });

    if (!ticket) {
        res.json({ status: 401 });
    }
    res.json({ status: 200 });
};

module.exports = {
    fetchTickets,
    exportTickets,
    exportMyTickets,
    fetchDealers,
    assignRole,
    setDealer,
    acceptTicket,
    setPriority,
    setProblem,
    setServiceType,
    setAMC,
    addMessage,
    deleteTicket,
    getBookings,
    getVehicles,
};