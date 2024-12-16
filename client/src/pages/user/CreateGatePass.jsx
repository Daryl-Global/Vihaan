import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jsPDF } from 'jspdf';

const CreateGatePass = () => {
    const { user_id } = useParams();
    const navigate = useNavigate();
    const [cusName, setCusName] = useState("");
    const [addCus, setAddCus] = useState("");
    const [chassisNo, setChassisNo] = useState("");
    const [engineNo, setEngineNo] = useState("");
    const [model, setModel] = useState("");
    const [color, setColor] = useState("");
    const [userName, setUserName] = useState("");

    useEffect(() => {
        const storedUserName = localStorage.getItem("userName");
        if (storedUserName) {
            setUserName(storedUserName);
        }
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        // Validate form fields (you can expand this validation logic)
        if (!cusName || !addCus || !chassisNo || !engineNo || !model || !color || !userName) {
            toast.error('Please fill in all fields.');
            return;
        }
    
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });
    
        // Auto-generate Serial Number and Date
        const serialNumber = `${Math.floor(10000 + Math.random() * 90000)}`; // 5-digit serial number
    
        // Format Date as DD/MM/YYYY
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
    
        // Helper function to draw a copy of the gate pass
        const drawCopy = (copyType, offsetX) => {
            // Top-left corner text
            doc.setFontSize(fontSizeSmall);
            doc.setFont('helvetica', 'normal');
            doc.text(`${copyType} Copy`, offsetX + marginLeft, 7);
    
            if (copyType === 'Store') {
                doc.text(`User: ${userName}`, offsetX + marginLeft, 14);
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
            doc.text(`${serialNumber}`, offsetX + marginLeft + 10, 40);
            doc.setTextColor(0, 0, 0);
            doc.text(`Date:`, offsetX + centerX + 20, 40);
            doc.text(`${date}`, offsetX + centerX + 30, 40);
    
            // Customer Details
            doc.setFontSize(fontSizeRegular);
            doc.text('Name of Customer:', offsetX + marginLeft, 50);
            doc.text(`${cusName}`, offsetX + marginLeft + 35, 50);
    
            // Address
            doc.text('Address:', offsetX + marginLeft, 57);
            const addressLines = doc.splitTextToSize(addCus, 100);
            doc.text(addressLines, offsetX + marginLeft + 20, 57);
    
            // Chassis No and Engine No
            doc.text('Chassis No.:', offsetX + marginLeft, 72);
            doc.text(`${chassisNo}`, offsetX + marginLeft + 25, 72);
            doc.text('Engine No.:', offsetX + centerX, 72);
            doc.text(`${engineNo}`, offsetX + centerX + 20, 72);
    
            // Model
            doc.text('Model:', offsetX + marginLeft, 82);
            doc.text(`${model}`, offsetX + marginLeft + 15, 82);
    
            // Color
            doc.text('Color:', offsetX + marginLeft, 92);
            doc.text(`${color}`, offsetX + marginLeft + 15, 92);
    
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
    
        // Save the PDF
        doc.save(`Gate Pass - ${serialNumber}.pdf`);
    };
    

    const handleChange = (e) => {
        const { name, value } = e.target;

        switch (name) {
            case 'cusName':
                setCusName(value);
                break;
            case 'addCus':
                setAddCus(value);
                break;
            case 'chassisNo':
                setChassisNo(value);
                break;
            case 'engineNo':
                setEngineNo(value);
                break;
            case 'model':
                setModel(value);
                break;
            case 'color':
                setColor(value);
                break;
            default:
                break;
        }
    };

    return (
        <div className="flex flex-col items-center pt-10 lg:pt-20 min-h-screen">
            <div className="w-full max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
                <h2 className="text-3xl font-bold text-center mb-8">
                    Create Gate Pass
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            required
                            type="text"
                            className="block w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-offset-2 border-gray-300"
                            placeholder="Customer Name"
                            value={cusName}
                            name="cusName"
                            onChange={handleChange}
                            autoComplete="name"
                        />
                        <input
                            required
                            type="text"
                            className="block w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-offset-2 border-gray-300"
                            placeholder="Chassis No"
                            value={chassisNo}
                            name="chassisNo"
                            onChange={handleChange}
                        />
                        <input
                            required
                            type="text"
                            className="block w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-offset-2 border-gray-300"
                            placeholder="Engine No"
                            value={engineNo}
                            name="engineNo"
                            onChange={handleChange}
                        />
                        <input
                            required
                            type="text"
                            className="block w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-offset-2 border-gray-300"
                            placeholder="Model"
                            value={model}
                            name="model"
                            onChange={handleChange}
                        />
                        <input
                            required
                            type="text"
                            className="block w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-offset-2 border-gray-300"
                            placeholder="Color"
                            value={color}
                            name="color"
                            onChange={handleChange}
                        />
                    </div>
                    <textarea
                        required
                        className="block w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-offset-2 border-gray-300"
                        placeholder="Customer Address"
                        value={addCus}
                        name="addCus"
                        onChange={handleChange}
                        rows="4"
                    />

                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="px-8 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                        >
                            Generate PDF
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGatePass;