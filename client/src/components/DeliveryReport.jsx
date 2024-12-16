import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jsPDF } from "jspdf";
import { getUser } from "../stores/userStore";
import { useUpdateTicket } from '../hooks/useUpdateTicket';

const DeliveryReport = ({ setDeliveryTicket, ticket }) => {

  const user = getUser();
  const updateTicket = useUpdateTicket();
  const { user_id } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState(ticket.status);
  const [colour, setcolour] = useState(ticket.colour);
  const [deliveryAmount, setdeliveryAmount] = useState(ticket.deliveryAmount);
  const [currentGatePassSerialNumber, setGatePassSerialNumber] = useState(ticket.gatePassSerialNumber);
  const [nameCus, setnameCus] = useState(ticket.nameCus);

  const locationPrefixes = {
    "Manpada": "M",
    "Ovala": "O",
    "Shreenagar": "SR",
    "Shahapur": "S",
    "Padgha": "P",
    "Diva": "D",
    "Vasind": "V",
    "Lokmanyanagar": "L",
    "Vashi": "VS",
    "Airoli": "A",
    "Airoli EC": "AEC",
    "Sanpada": "SP",
    "Turbhe": "T",
    "Ghansoli": "G",
    "Bigwing Thane": "BWT",
    "Bigwing Miraroad": "BWM",
    "Bigwing Surat": "BWS"
  };

  // Utility to calculate the current tax year based on Indian convention (April to March)
  const getCurrentTaxYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const startOfCurrentFinancialYear = new Date(year, 3, 1); // April 1st of the current year
    const startOfNextFinancialYear = new Date(year + 1, 3, 1); // April 1st of the next year

    if (today >= startOfCurrentFinancialYear && today < startOfNextFinancialYear) {
      return `${year % 100}-${(year + 1) % 100}`; // Example: "24-25"
    } else {
      return `${(year - 1) % 100}-${year % 100}`; // Example: "23-24"
    }
  };


  // Effect to set the initial serial number if not set
  useEffect(() => {
    if (ticket.gatePassSerialNumber) {
      setGatePassSerialNumber(ticket.gatePassSerialNumber);
    } else {
      // Function to fetch the previous gate pass serial number
      const fetchPreviousGatePass = async () => {
        try {
          const response = await axios.get(`/api/user/latest-gate-pass/${ticket.location}`);

          if (response.data.success) {
            const currentTaxYear = getCurrentTaxYear(); // Dynamic year based on current date

            if (response.data.serialNumber) {
              const [locationPrefix, previousTaxYear, previousSerial] = response.data.serialNumber.split('/');

              let nextSerialNumber;
              if (previousTaxYear === currentTaxYear) {
                // Same financial year, increment the serial number
                const previousSerialNumber = parseInt(previousSerial);
                nextSerialNumber = previousSerialNumber + 1;
              } else {
                // New financial year, start the serial number from 1
                nextSerialNumber = 1;
              }

              // Keep the same location prefix and form the new gate pass serial number
              setGatePassSerialNumber(`${locationPrefix}/${currentTaxYear}/${String(nextSerialNumber).padStart(4, '0')}`);
            } else {
              // No previous gate pass for this location, generate a new gate pass number
              const locationPrefix = locationPrefixes[Object.keys(locationPrefixes).find(prefix => new RegExp(prefix, 'i').test(ticket.location))] || "UNKNOWN";
              setGatePassSerialNumber(`${locationPrefix}/${currentTaxYear}/${String(1).padStart(4, '0')}`);
            }
          } else {
            console.error("Failed to fetch the serial number");
          }
        } catch (error) {
          console.error("Error fetching the previous gate pass:", error.response);
        }
      };

      fetchPreviousGatePass();
    }
  }, [ticket]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    handleGenerateGatePass();

    console.log("Update initiated");
    const updatedTicket = {
      ...ticket,
      gatePassSerialNumber: currentGatePassSerialNumber,
      status: (
        ticket.passingDate && ticket.registrationDate && ticket.vehicleNumber
          ? 'deliveredWithNumber'
          : 'deliveredWithoutNumber'
      )
    };

    await updateTicket(ticket.id, updatedTicket, user.id);
  };

  const handleGenerateGatePass = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const date = `${day}/${month}/${year}`;

    // Define positions
    const marginLeft = 10;
    const centerX = doc.internal.pageSize.width / 4;
    const rightAlign = doc.internal.pageSize.width / 2 - marginLeft;

    // Adjust font sizes and line placements for larger page size
    const fontSizeTitle = 15;
    const fontSizeSubtitle = 12;
    const fontSizeRegular = 10;
    const fontSizeSmall = 8;

    const drawCopy = (copyType, offsetX) => {
      // Top-left corner text
      doc.setFontSize(fontSizeSmall);
      doc.setFont('helvetica', 'normal');
      doc.text(`${copyType} Copy`, offsetX + marginLeft, 7);

      if (copyType === 'Store') {
        doc.text(`Generated by: ${user.name}`, offsetX + marginLeft, 14);
      }

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(fontSizeTitle);
      doc.text('VIHAAN HONDA', offsetX + centerX, 20, { align: 'center' });

      // Subtitle
      doc.setFontSize(fontSizeSubtitle);
      doc.text('GATE PASS', offsetX + centerX, 30, { align: 'center' });

      // Serial Number and Date
      doc.setFontSize(fontSizeRegular);
      doc.text(`No:`, offsetX + marginLeft, 40);
      doc.setTextColor(255, 0, 0);
      doc.text(`${currentGatePassSerialNumber}`, offsetX + marginLeft + 10, 40);
      doc.setTextColor(0, 0, 0);
      doc.text(`Date:`, offsetX + centerX + 20, 40);
      doc.text(`${date}`, offsetX + centerX + 30, 40);

      // Customer Details
      doc.setFontSize(fontSizeRegular);
      doc.text('Name of Customer:', offsetX + marginLeft, 50);
      doc.text(nameCus, offsetX + marginLeft + 35, 50);

      // Address
      doc.text('Address:', offsetX + marginLeft, 57);
      const addressLines = doc.splitTextToSize(ticket.addCus, 100);
      doc.text(addressLines, offsetX + marginLeft + 20, 57);

      // Chassis No and Engine No
      doc.text('Chassis No.:', offsetX + marginLeft, 72);
      doc.text(ticket.chassisNo, offsetX + marginLeft + 25, 72);
      doc.text('Engine No.:', offsetX + centerX, 72);
      doc.text(ticket.engineNo, offsetX + centerX + 20, 72);

      // Model
      doc.text('Model:', offsetX + marginLeft, 82);
      doc.text(ticket.model, offsetX + marginLeft + 15, 82);

      // Color
      doc.text('Colour:', offsetX + marginLeft, 92);
      doc.text(ticket.colour, offsetX + marginLeft + 15, 92);

      // Confirmation Text
      doc.setFontSize(fontSizeSmall);
      doc.text(
        'Received the above mentioned vehicle in good order and condition with all related accessories and documents of the vehicle.',
        offsetX + marginLeft,
        102,
        { maxWidth: 130 }
      );

      // Signatures
      doc.setFontSize(fontSizeRegular);
      doc.text("Customer's Sign", offsetX + marginLeft, 125);
      doc.text("Accounts Sign", offsetX + centerX, 125, { align: 'center' });
      doc.text("Authorised Sign", offsetX + rightAlign, 125, { align: 'right' });
    };

    // Draw Customer Copy on the left
    drawCopy('Customer', 0);

    // Draw Store Copy on the right
    drawCopy('Store', doc.internal.pageSize.width / 2);

    // Draw a dotted line down the middle of the page
    doc.setLineWidth(0.5);
    doc.setLineDash([2, 2], 0);
    doc.line(doc.internal.pageSize.width / 2, 0, doc.internal.pageSize.width / 2, doc.internal.pageSize.height);

    doc.save(`Gate Pass - ${currentGatePassSerialNumber}.pdf`);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center m-4 overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
        <div className="relative w-auto max-w-3xl mx-auto my-6">
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            <div className="flex items-center justify-between gap-5 p-5 border-b border-solid rounded-t border-slate-200">
              <h3 className="text-3xl font-semibold">Delivery Report</h3>
              <button
                onClick={() => setDeliveryTicket(false)}
                className="text-2xl text-red-500"
              >
                X
              </button>
            </div>
            <div className="max-w-md p-6 mx-auto bg-white rounded-lg shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    required
                    type="text"
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Gate Pass"
                    value={ticket.gatePassSerialNumber}
                    onChange={(e) => setgatePass(e.target.value)}
                    autoComplete="gatePassSerialNumber"
                  />
                </div>
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="w-40 px-8 py-2 ml-4 text-white bg-green-500 rounded hover:bg-green-600"
                  >
                    Generate Gate Pass
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

export default DeliveryReport;
