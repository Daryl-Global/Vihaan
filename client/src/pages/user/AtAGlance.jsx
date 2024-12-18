import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import stopImage from './Stop.png';
import { getUser } from "../../stores/userStore";

export const AtAGlance = () => {
    const user = getUser();
    const [userTickets, setUserTickets] = useState([]);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [currentTotal, setCurrentTotal] = useState(0);
    const [selectedShowroom, setSelectedShowroom] = useState(null);
    const [selectedModel, setSelectedModel] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const navigate = useNavigate();

    const privilegedUser = ['admin', 'owner', 'dealer', 'upload_stock_user'].includes(user.role);

    useEffect(() => {
        if (!user) navigate("/login");
    });
    
    useEffect(() => {
        console.log('user global state obj:', user);
        if (privilegedUser) {
            const fetchTickets = async () => {
                try {
                    const res = await axios.post(`/api/user/tickets`, {
                        user: user,
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });

                    if (res.status === 200) {
                        setUserTickets(res.data.tickets);
                    } else {
                        navigate("/unauthorized");
                    }
                } catch (error) {
                    navigate("/unauthorized");
                }
            };

            fetchTickets();

            const interval = setInterval(() => {
                fetchTickets();
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [navigate]);

    useEffect(() => {
        if (isInitialLoad && userTickets.length > 0) {
            setCurrentTotal(userTickets.length);
            setIsInitialLoad(false);
        }
    }, [userTickets, isInitialLoad]);

    const locationData = userTickets.reduce((acc, ticket) => {
        const { location, model, variant, colour, status } = ticket;
    
        if (!acc[location]) {
            acc[location] = {
                total: 0,
                allocated: 0,
                open: 0,
                soldButNotDelivered: 0,
                deliveredWithoutNumber: 0,
                deliveredWithNumber: 0,
                models: []
            };
        }
        acc[location].total += 1;
    
        let modelObj = acc[location].models.find(m => m.model === model);
        if (!modelObj) {
            modelObj = {
                model,
                total: 0,
                allocated: 0,
                open: 0,
                soldButNotDelivered: 0,
                deliveredWithoutNumber: 0,
                deliveredWithNumber: 0,
                variants: []
            };
            acc[location].models.push(modelObj);
        }
        modelObj.total += 1;
    
        let variantObj = modelObj.variants.find(v => v.variant === variant);
        if (!variantObj) {
            variantObj = {
                variant,
                total: 0,
                allocated: 0,
                open: 0,
                soldButNotDelivered: 0,
                deliveredWithoutNumber: 0,
                deliveredWithNumber: 0,
                colours: []
            };
            modelObj.variants.push(variantObj);
        }
        variantObj.total += 1;
    
        let colourObj = variantObj.colours.find(c => c.colour === colour);
        if (!colourObj) {
            colourObj = {
                colour,
                total: 0,
                allocated: 0,
                open: 0,
                soldButNotDelivered: 0,
                deliveredWithoutNumber: 0,
                deliveredWithNumber: 0,
            };
            variantObj.colours.push(colourObj);
        }
        colourObj.total += 1;
    
        // Update counts based on status
        if (status === 'allocated') {
            acc[location].allocated += 1;
            modelObj.allocated += 1;
            variantObj.allocated += 1;
            colourObj.allocated += 1;
        } else if (status === 'open') {
            acc[location].open += 1;
            modelObj.open += 1;
            variantObj.open += 1;
            colourObj.open += 1;
        } else if (status === 'soldButNotDelivered') {
            acc[location].soldButNotDelivered += 1;
            modelObj.soldButNotDelivered += 1;
            variantObj.soldButNotDelivered += 1;
            colourObj.soldButNotDelivered += 1;
        } else if (status === 'deliveredWithoutNumber') {
            acc[location].deliveredWithoutNumber += 1;
            modelObj.deliveredWithoutNumber += 1;
            variantObj.deliveredWithoutNumber += 1;
            colourObj.deliveredWithoutNumber += 1;
        } else if (status === 'deliveredWithNumber') {
            acc[location].deliveredWithNumber += 1;
            modelObj.deliveredWithNumber += 1;
            variantObj.deliveredWithNumber += 1;
            colourObj.deliveredWithNumber += 1;
        }
    
        return acc;
    }, {});    
    
    const locationArray = Object.keys(locationData).map(location => ({
        showroom: location,
        ...locationData[location],
    }));

    return privilegedUser ? (
        <div className="bg-gradient-to-br from-blue-500 to-green-200 min-h-screen p-4">
            <div className="w-full max-w-8xl p-4 bg-white rounded-lg shadow-lg mx-auto">
                <div className="h-full p-4 bg-gray-100 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-center text-blue-800 mb-4">Stock Details</h2>
                    <div className="text-center mb-6">
                        <h3 className="text-lg font-semibold">Total Stock</h3>
                        <p className="text-4xl font-bold">{currentTotal}</p>
                    </div>
                    {!selectedShowroom ? (
                        <LocationDetailsTable 
                            showroomData={locationArray} 
                            handleShowroomClick={(showroom) => {
                                setSelectedShowroom(showroom);
                                setCurrentTotal(showroom.total);
                            }} 
                        />
                    ) : !selectedModel ? (
                        <ModelDetailsTable
                            modelData={selectedShowroom}
                            handleBackClick={() => {
                                setSelectedShowroom(null);
                                setCurrentTotal(userTickets.length);
                            }}
                            handleModelClick={(model) => {
                                setSelectedModel(model);
                                setCurrentTotal(model.total);
                            }}
                        />
                    ) : !selectedVariant ? (
                        <VariantDetailsTable
                            variantData={selectedModel}
                            handleBackClick={() => {
                                setSelectedModel(null);
                                setCurrentTotal(selectedShowroom.total);
                            }}
                            handleVariantClick={(variant) => {
                                setSelectedVariant(variant);
                                setCurrentTotal(variant.total);
                            }}
                        />
                    ) : (
                        <ColourDetailsTable
                            colourData={selectedVariant}
                            handleBackClick={() => {
                                setSelectedVariant(null);
                                setCurrentTotal(selectedModel.total);
                            }}
                        />
                    )}
                </div>
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
                    className="px-8 py-3 bg-indigo-500 text-white font-bold rounded-full shadow-md hover:bg-indigo-600 transition-colours duration-300"
                >
                    Take Me Home
                </button>
            </div>
        </div>
    );
};

const DataTable = ({ name, title, data, handleRowClick, handleBackClick, totals }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-center mb-4">{title}</h2>
            {handleBackClick && (
                <button onClick={handleBackClick} className="mb-4 p-2 bg-blue-500 text-white rounded-lg">Back</button>
            )}
            <table className="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b text-left">{name}</th>
                        <th className="py-2 px-4 border-b text-right">Total</th>
                        <th className="py-2 px-4 border-b text-right">Allocated</th>
                        <th className="py-2 px-4 border-b text-right">Open</th>
                        <th className="py-2 px-4 border-b text-right">Sold but not delivered</th>
                        <th className="py-2 px-4 border-b text-right">Delivered without number</th>
                        <th className="py-2 px-4 border-b text-right">Delivered with number</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index} onClick={() => handleRowClick(item)} className="cursor-pointer hover:bg-gray-100">
                            <td className="py-2 px-4 border-b text-left">{item.showroom || item.model || item.variant || item.colour}</td>
                            <td className="py-2 px-4 border-b text-right">{item.total}</td>
                            <td className="py-2 px-4 border-b text-right">{item.allocated}</td>
                            <td className="py-2 px-4 border-b text-right">{item.open}</td>
                            <td className="py-2 px-4 border-b text-right">{item.soldButNotDelivered}</td>
                            <td className="py-2 px-4 border-b text-right">{item.deliveredWithoutNumber}</td>
                            <td className="py-2 px-4 border-b text-right">{item.deliveredWithNumber}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td className="py-2 px-4 border-b font-semibold text-left">Total</td>
                        {Object.entries(totals).map(([key, value]) => (
                            <td key={key} className="py-2 px-4 border-b font-semibold text-right">
                                {value}
                            </td>
                        ))}
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

const LocationDetailsTable = ({ showroomData, handleShowroomClick }) => {
    const totals = {
        total: showroomData.reduce((sum, item) => sum + item.total, 0),
        allocated: showroomData.reduce((sum, item) => sum + item.allocated, 0),
        open: showroomData.reduce((sum, item) => sum + item.open, 0),
        soldButNotDelivered: showroomData.reduce((sum, item) => sum + item.soldButNotDelivered, 0),
        deliveredWithoutNumber: showroomData.reduce((sum, item) => sum + item.deliveredWithoutNumber, 0),
        deliveredWithNumber: showroomData.reduce((sum, item) => sum + item.deliveredWithNumber, 0),
    };

    return (
        <DataTable
            name='Showroom'
            title='Showroom Data'
            data={showroomData}
            handleRowClick={handleShowroomClick}
            totals={totals}
        />
    );
};

const ModelDetailsTable = ({ modelData, handleModelClick, handleBackClick }) => {
    const { models, showroom, ...rest } = modelData;  

    return (
        <DataTable
            name='Model'
            title={`Detailed Vehicle Models Data - ${showroom}`}
            data={models}
            handleRowClick={handleModelClick}
            handleBackClick={handleBackClick}
            totals={rest}
        />
    );
};

const VariantDetailsTable = ({ variantData, handleVariantClick, handleBackClick }) => {
    const { variants, model, ...rest } = variantData;

    return (
        <DataTable
            name='Variant'
            title={`Detailed Variant Data - ${model}`}
            data={variants}
            handleRowClick={handleVariantClick}
            handleBackClick={handleBackClick}
            totals={rest}
        />
    );
};

const ColourDetailsTable = ({ colourData, handleBackClick }) => {
    const { colours, variant, ...rest } = colourData;

    return (
        <DataTable
            name='Colour'
            title={`Detailed Colours Data - ${variant}`}
            data={colours}
            handleBackClick={handleBackClick}
            totals={rest}
        />
    );
};

export default AtAGlance;
