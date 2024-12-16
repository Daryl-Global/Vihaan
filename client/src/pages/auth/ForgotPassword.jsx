import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import bikeVideo from './bike-5491275-4574321.mp4'; 
import favicon from '../../../public/vihaan_honda_logo.png'; 

const ForgotPassword = () => {
    const [name, setName] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleForgotPassword = async (event) => {
        event.preventDefault();

        if (!name || !newPassword || !confirmPassword) {
            toast.error("Please fill in all fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        try {
            const response = await axios.post(
                "/api/auth/reset-password",
                { name, newPassword },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = response.data;
            if (data.error) {
                toast.error(data.error);
            } else {
                toast.success("Password has been reset successfully. Please login.");
                setSubmitted(true);
            }
        } catch (error) {
            console.error("Error resetting password:", error);
            toast.error("Failed to reset password. Please try again later.");
        }
    };

    const keyframes = `
    @keyframes moveBike {
      0% {
        transform: translateX(-200px);
      }
      100% {
        transform: translateX(100vw);
      }
    }
  `;

    return (
        <>
            <style>{keyframes}</style>
            <form onSubmit={handleForgotPassword} className="flex justify-center items-center h-screen bg-white">
                <div className="relative px-4 py-12 mx-auto max-w-7xl sm:px-6 md:px-12 lg:px-24 lg:py-24">
                    <div className="absolute inset-0 overflow-hidden">
                        <video
                            className="bike"
                            style={{
                                position: "absolute",
                                width: "200px",
                                height: "auto",
                                animation: "moveBike 12s linear infinite",
                            }}
                            autoPlay
                            loop
                            muted
                            src={bikeVideo}
                            type="video/mp4"
                        ></video>
                    </div>
                    <div className="relative z-10 justify-center mx-auto text-left align-bottom transition-all transform bg-gray-300 rounded-lg sm:align-middle sm:max-w-2xl sm:w-full mt-12">
                        <div className="grid flex-wrap items-center justify-center grid-cols-1 mx-auto shadow-xl lg:grid-cols-2 rounded-xl">
                            <div className="w-full px-6 py-3">
                                <div>
                                    <div className="mt-3 text-left sm:mt-5">
                                        <div className="inline-flex items-center w-full">
                                            <h3 className="text-lg font-bold text-gray-800 leading-6 lg:text-5xl">
                                                Reset Password
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-2">
                                    <div>
                                        <label htmlFor="name" className="sr-only">
                                            Name
                                        </label>
                                        <input
                                            type="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="block w-full px-5 py-3 text-base text-neutral-600 placeholder-gray-300 transition duration-500 ease-in-out transform border rounded-lg bg-gray-50 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            placeholder="Enter your username"
                                            autoComplete="username"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="newPassword" className="sr-only">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="block w-full px-5 py-3 text-base text-neutral-600 placeholder-gray-300 transition duration-500 ease-in-out transform border rounded-lg bg-gray-50 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            placeholder="Enter new password"
                                            autoComplete="new-password"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="confirmPassword" className="sr-only">
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="block w-full px-5 py-3 text-base text-neutral-600 placeholder-gray-300 transition duration-500 ease-in-out transform border rounded-lg bg-gray-50 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            placeholder="Confirm new password"
                                            autoComplete="new-password"
                                        />
                                    </div>
                                    <div className="flex flex-col mt-4 lg:space-y-2">
                                        <button
                                            type="submit"
                                            className="flex items-center justify-center w-full px-10 py-4 text-base font-medium text-center text-white transition duration-500 ease-in-out transform bg-vihaan-honda-red rounded-xl hover:bg-vihaan-honda-red-darker focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        >
                                            Reset Password
                                        </button>
                                        {submitted && (
                                            <p className="text-green-500 mt-4">Your password has been reset. Please login with your new password.</p>
                                        )}
                                        <span className="inline-flex justify-center py-4 text-base font-medium text-gray-500 focus:outline-none hover:text-gray-600 focus:text-red-600 sm:text-sm">
                                            <Link
                                                to="/login"
                                                style={{
                                                    color: "red",
                                                    marginLeft: "0.3em",
                                                    marginRight: "0.25em",
                                                }}
                                            >
                                                Login
                                            </Link>
                                            here.
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="order-first lg:block hidden w-full">
                                <div
                                    className="flex items-center justify-center p-4 rounded-l-lg"
                                    style={{ height: '100%' }}
                                >
                                    <div
                                        className="rounded-full overflow-hidden bg-vihaan-honda-red"
                                        style={{
                                            width: '200px',
                                            height: '200px',
                                            padding: '10px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <img
                                            src={favicon}
                                            alt="Vihaan Honda"
                                            style={{ width: '100%', height: 'auto' }}
                                        />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-gray-800">By Vihaan Enterprises</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
};

export default ForgotPassword;