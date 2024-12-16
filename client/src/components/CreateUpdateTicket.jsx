import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PropTypes from "prop-types";
import { getUser } from "../stores/userStore";

const CreateUpdateTicket = ({ setUpdateTicket, ticket }) => {
  const user = getUser();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(ticket.issue || "");
  const [remarks, setRemarks] = useState(ticket.remarks || "");
  const [channel, setChannel] = useState(ticket.channel || "");
  const [status, setStatus] = useState(null);
  const [bookingAmount, setBookingAmount] = useState(ticket.bookingAmount || "");
  const [customers, setCustomers] = useState([]);
  const [nameCus, setNameCus] = useState(ticket.nameCus || "");
  const [addhar, setAddhar] = useState(ticket.addhar || "");
  const [addCus, setAddCus] = useState(ticket.addCus || "");
  const [executive, setExecutive] = useState(ticket.executive || "");
  const [hp, setHp] = useState(ticket.hp || "");
  const [model, setModel] = useState(ticket.model || "");
  const [variant, setVariant] = useState(ticket.variant || "");
  const [color, setColor] = useState(ticket.color || ticket.colour || "");
  const [chassisNo, setChassisNo] = useState("");
  const [engineNo, setEngineNo] = useState("");
  const [aadhaarOptions, setAadhaarOptions] = useState([]);
  const [availableTickets, setAvailableTickets] = useState([]);
  const [availableChassis, setAvailableChassis] = useState([]);
  const [availableEngine, setAvailableEngine] = useState([]);

  const fetchTicketDetails = async () => {
    try {
      if (!ticket.id || !user.id) {
        console.error("Ticket ID or User ID is missing");
        return;
      }
      console.log("Fetching stock details for ticket_id:", ticket.id);
      const res = await axios.get(`/api/user/ticket/${ticket.id}`);
      const ticketData = res.data.ticket;
      setStatus(ticketData.resolved);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch stock details.");
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [user.id, ticket.id]);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await axios.get(`/api/user/customers?branch=${user.branch}`);
                setCustomers(response.data);
            } catch (error) {
                console.error("Failed to fetch customers", error);
            }
        };

        fetchCustomers();
    }, []);

  const fetchOpenTickets = async () => {
    try {
      const response = await axios.post(`/api/user/tickets_by_status`, { status: 'open', user });
      if (response.data.status !== 200) {
        throw new Error(response.data.error || 'Failed to fetch stocks');
      }
      setAvailableTickets(response.data.tickets || []);
    } catch (error) {
      console.error("Failed to fetch open stocks", error);
      setAvailableTickets([]);
    }
  };

  useEffect(() => {
    fetchOpenTickets();
  }, [user.id]);

  const handleNameChange = (e) => {
    const selectedCustomer = customers.find(
      (customer) => customer.cusName === e.target.value
    );
    if (selectedCustomer) {
      setNameCus(selectedCustomer.cusName);
      setAddCus(selectedCustomer.addCus || "");
      setAadhaarOptions(
        customers
          .filter((customer) => customer.cusName === selectedCustomer.cusName)
          .map((c) => c.addhar)
      );
      setAddhar("");
      setBookingAmount("");
      setHp("");
      setExecutive("");
      setModel("");
      setVariant("");
      setColor("");
      setChassisNo("");
      setEngineNo("");
    } else {
      setNameCus("");
      setAddCus("");
      setAadhaarOptions([]);
      setAddhar("");
      setBookingAmount("");
      setHp("");
      setExecutive("");
      setModel("");
      setVariant("");
      setColor("");
      setChassisNo("");
      setEngineNo("");
    }
  };

  const handleAadhaarChange = async (e) => {
    const selectedAadhaar = e.target.value;
    setAddhar(selectedAadhaar);

    if (selectedAadhaar) {
        try {
            // Fetch bookings using Aadhaar
            const response = await axios.get(`/api/user/${user.id}/bookings/${selectedAadhaar}`);

            if (response.data) {
                // Check if response contains a booking
                const latestBooking = response.data;

                // Update state with booking details
                setAddCus(latestBooking.addCus || "");
                setBookingAmount(latestBooking.bookingAmount || "");
                setHp(latestBooking.hp || "");
                setExecutive(latestBooking.executive || "");
                setModel(latestBooking.model || "");
                setVariant(latestBooking.variant || "");
                setColor(latestBooking.color || latestBooking.colour || "");

                // Find matching tickets
                const normalizedModel = latestBooking.model.trim().toLowerCase();
                const normalizedVariant = latestBooking.variant.trim().toLowerCase();
                const normalizedColor = (latestBooking.color || latestBooking.colour)
                    .trim()
                    .toLowerCase();

                const matchingTickets = (availableTickets || []).filter(
                    (ticket) =>
                        ticket.model.trim().toLowerCase() === normalizedModel &&
                        ticket.variant.trim().toLowerCase() === normalizedVariant &&
                        (ticket.color?.trim().toLowerCase() === normalizedColor ||
                            ticket.colour?.trim().toLowerCase() === normalizedColor) &&
                        ticket.status === "open"
                );

                if (matchingTickets.length > 0) {
                    setAvailableChassis(matchingTickets.map((ticket) => ticket.chassisNo));
                    setAvailableEngine(matchingTickets.map((ticket) => ticket.engineNo));
                } else {
                    setAvailableChassis([]);
                    setAvailableEngine([]);
                    toast.error("No available stock found for this model, variant, and color.");
                }
            } else {
                toast.error("No booking data found for the selected Aadhaar.");
            }
        } catch (error) {
            console.error("Failed to fetch booking details", error);
            toast.error("Failed to fetch booking details.");
        }
    }
};

  const handleChassisChange = (e) => {
    const selectedChassis = e.target.value;
    setChassisNo(selectedChassis);

    const matchingIndex = availableChassis.indexOf(selectedChassis);
    if (matchingIndex !== -1) {
      const matchingEngineNo = availableEngine[matchingIndex];
      setEngineNo(matchingEngineNo);
    } else {
      setEngineNo("");
      toast.error("No matching engine number found for the selected chassis.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let finalTicketId = ticket.id;

    if (!finalTicketId) {
      const matchingTicket = availableTickets.find(
        (ticket) =>
          ticket.chassisNo === chassisNo && ticket.engineNo === engineNo
      );
      if (matchingTicket) {
        finalTicketId = matchingTicket.id;
      } else {
        console.error("Ticket ID is missing or no matching ticket found");
        toast.error("Ticket ID is missing or no matching ticket found.");
        return;
      }
    }

    const updatedComplaint = {
      issue: issue || "",
      channel: channel || "",
      remarks: remarks || "",
      createdOn: ticket.createdOn || new Date().toISOString(),
      resolved: false,
      priority: "low",
      ticket_id: finalTicketId,
      bookingAmount,
      nameCus,
      addhar,
      addCus,
      executive,
      hp,
      model,
      variant,
      color,
      chassisNo,
      engineNo,
      status: "allocated",
    };

    try {
      const response = await axios.patch(
        `/api/user/${user.id}/ticket/${finalTicketId}/update`,
        updatedComplaint,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = response.data;
      if (data.status === 200) {
        setStatus("success");
        toast.success("Your stock has been successfully updated.");
        navigate(`/user/${user.id}/tickets`);
      } else {
        setStatus("error");
        toast.error("An error occurred while updating the stock.");
      }
    } catch (error) {
      setStatus(error);
      toast.error("An error occurred while updating the stock.");
    }

    setIssue("");
    setChannel("");
    setRemarks("");
    setBookingAmount("");
    setNameCus("");
    setAddhar("");
    setAddCus("");
    setExecutive("");
    setHp("");
    setModel("");
    setVariant("");
    setColor("");
    setChassisNo("");
    setEngineNo("");
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this booking?"
    );
    if (!confirmed) return;

    try {
      const response = await axios.patch(
        `/api/user/${user.id}/updateticket`,
        {
          ticket_id: ticket.id,
          status: "open",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = response.data;
      if (data.status === 200) {
        setStatus("success");
        toast.success("Booking details have been cleared.");
        navigate(`/user/${user.id}/tickets`);
      } else {
        setStatus("error");
        toast.error("Failed to clear booking details.");
      }
    } catch (error) {
      setStatus(error);
      toast.error("An error occurred while clearing the booking.");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center m-4 overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
        <div className="relative w-auto max-w-3xl mx-auto my-6">
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            <div className="flex items-center justify-between gap-5 p-5 border-b border-solid rounded-t border-slate-200">
              <h3 className="text-3xl font-semibold">Allocation Details</h3>
              <button
                onClick={() => setUpdateTicket(false)}
                className="text-2xl text-red-500"
              >
                X
              </button>
            </div>
            <div className="max-w-md p-6 mx-auto bg-white rounded-lg shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <select
                    required
                    value={nameCus}
                    onChange={handleNameChange}
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Aadhaar</option>
                    {aadhaarOptions.map((aadhaar) => (
                      <option key={aadhaar} value={aadhaar}>
                        {aadhaar}
                      </option>
                    ))}
                  </select>
                  <input
                    required
                    type="text"
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Booking Amount"
                    value={bookingAmount}
                    onChange={(e) => setBookingAmount(e.target.value)}
                    autoComplete="bookingAmount"
                  />
                  <input
                    required
                    type="text"
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="HP"
                    value={hp}
                    onChange={(e) => setHp(e.target.value)}
                    autoComplete="hp"
                  />
                  <input
                    required
                    type="text"
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Executive"
                    value={executive}
                    onChange={(e) => setExecutive(e.target.value)}
                    autoComplete="executive"
                  />
                  <input
                    required
                    type="text"
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    autoComplete="model"
                    disabled
                  />
                  <input
                    required
                    type="text"
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Variant"
                    value={variant}
                    onChange={(e) => setVariant(e.target.value)}
                    autoComplete="variant"
                    disabled
                  />
                  <input
                    required
                    type="text"
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    autoComplete="color"
                    disabled
                  />
                  <select
                    required
                    value={chassisNo}
                    onChange={handleChassisChange}
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Chassis No</option>
                    {availableChassis.map((chassis) => (
                      <option key={chassis} value={chassis}>
                        {chassis}
                      </option>
                    ))}
                  </select>
                  <select
                    required
                    value={engineNo}
                    onChange={(e) => setEngineNo(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Engine No</option>
                    {availableEngine.map((engine) => (
                      <option key={engine} value={engine}>
                        {engine}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="w-40 px-8 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="w-40 px-8 py-2 ml-4 text-white bg-red-500 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed inset-0 z-40 opacity-60 bg-slate-900"></div>
    </>
  );
};

CreateUpdateTicket.propTypes = {
  setUpdateTicket: PropTypes.func.isRequired,
  ticket: PropTypes.shape({
    id: PropTypes.string.isRequired,
    issue: PropTypes.string,
    remarks: PropTypes.string,
    channel: PropTypes.string,
    bookingAmount: PropTypes.string,
    nameCus: PropTypes.string,
    addhar: PropTypes.string,
    executive: PropTypes.string,
    hp: PropTypes.string,
    model: PropTypes.string,
    variant: PropTypes.string,
    color: PropTypes.string,
    chassisNo: PropTypes.string,
    engineNo: PropTypes.string,
    createdOn: PropTypes.string,
    addCus: PropTypes.string,
  }).isRequired,
};

export default CreateUpdateTicket;
