import { useState, useEffect, useRef } from "react";

const DropdownCheckboxes = ({ vehicles, model, variant, colour, setColour }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Handle outside click to close the dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Reset colours when model or variant changes
    useEffect(() => {
        setColour([]);  // Reset colours whenever the model or variant changes
    }, [model, variant, setColour]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center bg-gray-200 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
            >
                {colour.length > 0 ? `Selected Colours: ${colour.join(", ")}` : "Selected Colours: None (Same as All)"}
                <svg
                    className={`w-3 h-3  transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                    style={{ marginRight: '-12px' }}
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 18 18"
                >
                    <path d="M15 7l-5 5-5-5"></path>
                </svg>

            </button>

            {isOpen && (
                <div className="absolute mt-2 w-64 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto z-10">
                    <div className="p-2">
                        {model && variant ? (
                            Array.from(vehicles.colours[model]?.[variant] || []).length > 0 ? (
                                Array.from(vehicles.colours[model][variant]).map((vehicleColour) => (
                                    <label key={vehicleColour} className="flex items-center space-x-2 py-1">
                                        <input
                                            type="checkbox"
                                            value={vehicleColour}
                                            checked={colour.includes(vehicleColour)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setColour([...colour, vehicleColour]);
                                                } else {
                                                    setColour(colour.filter(c => c !== vehicleColour));
                                                }
                                            }}
                                            className="form-checkbox h-4 w-4 text-blue-600"
                                        />
                                        <span>{vehicleColour}</span>
                                    </label>
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
                    </div>
                </div>
            )}

        </div>
    );
};

export default DropdownCheckboxes;
