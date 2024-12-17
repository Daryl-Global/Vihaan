import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import scrollTopImage from './vihaan_honda_logo.png';
import * as XLSX from 'xlsx';
import { useUserStore, getUser } from "../stores/userStore";

const Navbar = () => {
    const user = getUser();
    const { clearUser } = useUserStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isMastersDropdownOpen, setIsMastersDropdownOpen] = useState(false);
    const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
    const userDropdownRef = useRef(null);
    const mastersDropdownRef = useRef(null);
    const exportDropdownRef = useRef(null);

    const [sessionTimeLeft, setSessionTimeLeft] = useState(null);

    const privilegedUser = ['admin', 'owner', 'dealer', 'upload_stock_user'].includes(user.role);

    const pagePermissions = {
        addItems: ['upload_stock'],
        masters: ['customer_master', 'booking_details', 'customer_master', 'vehicle_master', 'executive_master', 'location_master'],
        bookingMaster: ['booking_details'],
        customerMaster: ['customer_master'],
        vehicleMaster: ['vehicle_master'],
        executiveMaster: ['executive_master'],
        locationMaster: ['location_master'],
    };  // 'all_access' implicitly assumed
    
    const hasAccess = user && Object.fromEntries(
        Object.entries(pagePermissions).map(([key, permissions]) => [
            key,
            user.permissions.includes('all_access') || permissions.some(permission => user.permissions.includes(permission)),
        ])
    );

    const getTicketExport = async () => {
        try {
            const res = await axios.get(`/api/admin/${user.id}/export_tickets`, {
                responseType: "arraybuffer",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = `Tickets_All_Durations.xlsx`;
            link.click();
        } catch (error) {
            console.error('Error downloading the tickets:', error);
        }
    };


    const getTicketperExport = async () => {
        try {
            const res = await axios.get(`/api/admin/${user.id}/export_per_tickets`, {
                responseType: "arraybuffer",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = `Status.xlsx`;
            link.click();
        } catch (error) {
            console.error('Error downloading the tickets:', error);
        }
    };




    const startSessionCountdown = () => {
        const sessionStartTime = localStorage.getItem('sessionStartTime');
        const sessionDuration = 3600 * 1000; // 1 hour

        if (sessionStartTime) {
            const startTime = new Date(sessionStartTime).getTime();
            const currentTime = new Date().getTime();
            const timePassed = currentTime - startTime;
            const timeLeft = sessionDuration - timePassed;

            if (timeLeft <= 0) {
                alert("Session expired!");
                handleLogout();
            } else {
                setSessionTimeLeft(timeLeft);
            }
        } else {
            console.error('No session start time found.');
        }
    };

    const handleLogout = () => {
        clearUser();
        fetch("/api/auth/logout");
        localStorage.removeItem("role");
        localStorage.removeItem("li");
        localStorage.removeItem("uid");
        localStorage.removeItem("user.name");
        localStorage.removeItem("sessionStartTime"); // Clear session start time on logout
        navigate("/login");
    };

    useEffect(() => {
        if (!user) navigate("/login");
    });

    useEffect(() => {
        startSessionCountdown();
        const countdownInterval = setInterval(startSessionCountdown, 1000);
        return () => clearInterval(countdownInterval);
    }, []);

    const getLinkClassName = (path) => {
        const baseClasses = "mr-5 hover:text-gray-900 text-white font-bold cursor-pointer";
        const activeClasses = "bg-vihaan-honda-red-darker rounded px-2 py-1";

        return location.pathname === path
            ? `${baseClasses} ${activeClasses}`
            : baseClasses;
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setIsUserDropdownOpen(false);
            }
            if (mastersDropdownRef.current && !mastersDropdownRef.current.contains(event.target)) {
                setIsMastersDropdownOpen(false);
            }
            if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
                setIsExportDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <nav className="bg-vihaan-honda-red text-gray-600 body-font shadow-lg bg-slate-50 fixed w-full top-0 z-50">
            <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center justify-between">
                <div
                    className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0 cursor-pointer"
                    onClick={() => {
                        navigate(`/user/${user.id}/tickets`);
                    }}
                >
                    <img src={scrollTopImage} alt="Scroll Top" className="w-30 h-12" />
                </div>

                {location.pathname === "/" ? (
                    <div>
                        {localStorage.getItem("li") ? (
                            <nav className="flex gap-5">
                                <button
                                    onClick={() => {
                                        navigate(`/user/${user.id}/tickets`);
                                    }}
                                    className="inline-flex items-end bg-blue-200 border-0 py-1 px-3 focus:outline-none hover:bg-slate-100 rounded text-base mt-4 md:mt-0"
                                >
                                    Show Tickets
                                    <svg className="svg-icon w-4 h-4 ml-1 flex-shrink-0" viewBox="0 0 20 20">
                                        <path d="M0 4.5A1.5 1.5 0 0 1 1.5 3h13A1.5 1.5 0 0 1 16 4.5V6a.5.5 0 0 1-.5.5 1.5 1.5 0 0 0 0 3 .5.5 0 0 1 .5.5v1.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 11.5V10a.5.5 0 0 1 .5-.5 1.5 1.5 0 1 0 0-3A.5.5 0 0 1 0 6V4.5ZM1.5 4a.5.5 0 0 0-.5.5v1.05a2.5 2.5 0 0 1 0 4.9v1.05a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-1.05a2.5 2.5 0 0 1 0-4.9V4.5a.5.5 0 0 0-.5-.5h-13Z" />
                                    </svg>
                                </button>

                                {user.name && (
                                    <div className="relative" ref={userDropdownRef}>
                                        <button
                                            onClick={() => {
                                                setIsUserDropdownOpen(!isUserDropdownOpen);
                                                setIsMastersDropdownOpen(false);
                                            }}
                                            className="text-white font-bold flex items-center focus:outline-none"
                                        >
                                            Welcome, {user.name}
                                            {sessionTimeLeft !== null && (
                                                <span className="ml-2 text-sm text-gray-100">
                                                    {`(${Math.floor((sessionTimeLeft % 3600000) / 60000)
                                                        .toString()
                                                        .padStart(2, '0')}:
                                                    ${Math.floor((sessionTimeLeft % 60000) / 1000)
                                                            .toString()
                                                            .padStart(2, '0')})`}
                                                </span>
                                            )}
                                            <svg
                                                className={`w-4 h-4 ml-1 transition-transform ${isUserDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                                                fill="none"
                                                stroke="currentColor"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </button>
                                        {isUserDropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                                                <button
                                                    onClick={handleLogout}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                                >
                                                    Logout
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </nav>
                        ) : (
                            <nav className="flex gap-5">
                                <button
                                    onClick={() => navigate(`/login`)}
                                    className="inline-flex items-center bg-green-300 border-0 py-1 px-3 focus:outline-none hover:bg-slate-100 rounded text-base mt-4 md:mt-0"
                                >
                                    Login
                                    <svg
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        className="svg-icon w-4 h-4 ml-1 flex-shrink-0"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M5 12h14M12 5l7 7-7 7"></path>
                                    </svg>
                                </button>
                                <button
                                    onClick={() => navigate(`/register`)}
                                    className="inline-flex items-center bg-cyan-100 border-0 py-1 px-3 focus:outline-none hover:bg-slate-100 rounded text-base mt-4 md:mt-0"
                                >
                                    Sign Up
                                    <svg className="svg-icon w-4 h-4 ml-1 flex-shrink-0" viewBox="0 0 20 20">
                                        <path d="M15.573,11.624c0.568-0.478,0.947-1.219,0.947-2.019c0-1.37-1.108-2.569-2.371-2.569s-2.371,1.2-2.371,2.569c0,0.8,0.379,1.542,0.946,2.019c-0.253,0.089-0.496,0.2-0.728,0.332c-0.743-0.898-1.745-1.573-2.891-1.911c0.877-0.61,1.486-1.666,1.486-2.812c0-1.79-1.479-3.359-3.162-3.359S4.269,5.443,4.269,7.233c0,1.146,0.608,2.202,1.486,2.812c-2.454,0.725-4.252,2.998-4.252,5.685c0,0.218,0.178,0.396,0.395,0.396h16.203c0.218,0,0.396-0.178,0.396-0.396C18.497,13.831,17.273,12.216,15.573,11.624 M12.568,9.605c0-0.822,0.689-1.779,1.581-1.779s1.58,0.957,1.58,1.779s-0.688,1.779-1.58,1.779S12.568,10.427,12.568,9.605 M5.06,7.233c0-1.213,1.014-2.569,2.371-2.569c1.358,0,2.371,1.355,2.371,2.569S8.789,9.802,7.431,9.802C6.073,9.802,5.06,8.447,5.06,7.233 M2.309,15.335c0.202-2.649,2.423-4.742,5.122-4.742s4.921,2.093,5.122,4.742H2.309z M13.346,15.335c-0.067-0.997-0.382-1.928-0.882-2.732c0.502-0.271,1.075-0.429,1.686-0.429c1.307,0,2.558,0.784,3.355,2.152H13.346z" />
                                    </svg>
                                </button>
                            </nav>
                        )}
                    </div>
                ) : (user ? (
                    <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center">
                        {privilegedUser && (
                            <Link to={`/user/${user.id}/at_a_glance`}>
                                <span className={getLinkClassName(`/user/${user.id}/at_a_glance`)}>
                                    At a Glance
                                </span>
                            </Link>
                        )}

                        {hasAccess.addItems && (
                            <Link to={`/user/${user.id}/create_ticket`}>
                                <span className={getLinkClassName(`/user/${user.id}/create_ticket`)}>
                                    Add Items
                                </span>
                            </Link>
                        )}

                        {/* Masters Dropdown */}
                        {hasAccess.masters && (
                            <div className="relative" ref={mastersDropdownRef}>
                                <button
                                    onClick={() => {
                                        setIsMastersDropdownOpen(!isMastersDropdownOpen);
                                        setIsUserDropdownOpen(false); 
                                    }}
                                    className="mr-5 hover:text-gray-900 text-white font-bold cursor-pointer flex items-center"
                                >
                                    Masters
                                    <svg
                                        className={`w-4 h-4 ml-2 transition-transform duration-300 ${isMastersDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </button>
                                {isMastersDropdownOpen && (
                                    <div className="absolute bg-vihaan-honda-red border border-white shadow-lg rounded-md mt-1 p-2 z-20">
                                        {hasAccess.customerMaster && (
                                            <Link to={`/user/${user.id}/customer_master`}>
                                                <div className={`${getLinkClassName(`/user/${user.id}/customer_master`)} -mr-0 py-2 px-4`}>
                                                    Customer Master
                                                </div>
                                            </Link>
                                        )}
                                        {hasAccess.bookingMaster && (
                                            <Link to={`/user/${user.id}/booking_master`}>
                                                <div className={`${getLinkClassName(`/user/${user.id}/booking_master`)} -mr-0 py-2 px-4 border-t border-white`}>
                                                    Booking Master
                                                </div>
                                            </Link>
                                        )}
                                        {hasAccess.vehicleMaster && (
                                            <Link to={`/user/${user.id}/vehicle_master`}>
                                                <div className={`${getLinkClassName(`/user/${user.id}/vehicle_master`)} -mr-0 py-2 px-4 border-t border-white`}>
                                                    Vehicle Master
                                                </div>
                                            </Link>
                                        )}
                                        {hasAccess.executiveMaster && (
                                            <Link to={`/user/${user.id}/executive_master`}>
                                                <div className={`${getLinkClassName(`/user/${user.id}/executive_master`)} -mr-0 py-2 px-4 border-t border-white`}>
                                                    Executive Master
                                                </div>
                                            </Link>
                                        )}
                                        {hasAccess.locationMaster && (
                                            <Link to={`/user/${user.id}/location_master`}>
                                                <div className={`${getLinkClassName(`/user/${user.id}/location_master`)} -mr-0 py-2 px-4 border-t border-white`}>
                                                    Location Master
                                                </div>
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <Link to={`/user/${user.id}/tickets`}>
                            <span className={getLinkClassName(`/user/${user.id}/tickets`)}>
                                Inventory
                            </span>
                        </Link>
                        {user.role !== "2069-t2-prlo-456-fiok" && (
                            
                            <div className="relative" ref={exportDropdownRef}>
                            <button
                                onClick={() => {
                                    setIsExportDropdownOpen(!isExportDropdownOpen);
                                    setIsMastersDropdownOpen(false);
                                }}
                                className="mr-5 text-white font-bold flex items-center cursor-pointer hover:text-gray-300"
                            >
                                Export
                                <svg className={`w-4 h-4 ml-2 transition-transform ${isExportDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24">
                                    <path d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>
                            {isExportDropdownOpen && (
                                <div className="absolute bg-white text-gray-900 shadow-md rounded-md mt-1 z-20">
                                {hasAccess.customerMaster && (
                                    <button
                                        onClick={getTicketExport}
                                        className="block px-4 py-2 hover:bg-gray-200 cursor-pointer w-full text-left border-t border-gray-300"
                                    >
                                        Export All Tickets
                                    </button>
                                )}
                                    
                                    <button
                                        onClick={getTicketperExport}
                                        className="block px-4 py-2 hover:bg-gray-200 cursor-pointer w-full text-left border-t border-gray-300"
                                    >
                                        Export Status
                                    </button>
                                    </div>
                            )}
                        </div>
                        )}

                        {user.name && (
                            <div className="relative" ref={userDropdownRef}>
                                <button
                                    onClick={() => {
                                        setIsUserDropdownOpen(!isUserDropdownOpen);
                                        setIsMastersDropdownOpen(false);
                                    }}
                                    className="mr-5 hover:text-gray-900 text-white font-bold cursor-pointer flex items-center"
                                >
                                    Welcome, {user.name}
                                    {sessionTimeLeft !== null && (
                                        <span className="ml-2 text-m text-gray-100">
                                            {`(${Math.floor((sessionTimeLeft % 3600000) / 60000)
                                                .toString()
                                                .padStart(2, '0')}:
                                            ${Math.floor((sessionTimeLeft % 60000) / 1000)
                                                    .toString()
                                                    .padStart(2, '0')})`}
                                        </span>
                                    )}
                                    <svg
                                        className={`w-4 h-4 ml-1 transition-transform ${isUserDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </button>
                                {isUserDropdownOpen && (
                                    <div className="absolute bg-vihaan-honda-red text-white font-bold border border-white shadow-lg rounded-md mt-1 p-2 z-20">
                                        <button
                                            onClick={handleLogout}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </nav>
                ) : (
                    <div />
                ))}
            </div>
        </nav>
    );
};

export default Navbar;