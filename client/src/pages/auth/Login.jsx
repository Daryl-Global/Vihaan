import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserRoleContext } from "../../contexts/userRoleContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import bikeVideo from './bike-5491275-4574321.mp4';
import favicon from '../../../public/vihaan_honda_logo.png';
import { useUserStore } from "../../stores/userStore";

const Login = () => {

    const { setUser } = useUserStore();
    const { setUserRole } = useContext(UserRoleContext);

    const [obj, setObj] = useState({
        name: "",
        password: "",
    });
    const [errors, setErrors] = useState({
        name: false
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setObj((prev) => ({ ...prev, [name]: value }));

        const validationRegex = {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        };

        if (name === "email") {
            const emailValid = validationRegex.email.test(value);
            setErrors((prevErrors) => ({ ...prevErrors, email: !emailValid }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const res = await axios.post("/api/auth/login", obj, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await res.data;

            if (data.status === 200) {
                setUser({
                    id: data.id,
                    name: data.name,
                    role: data.role,
                    permissions: data.permissions,
                    branch: data.branch,
                });

                const sessionStartTime = new Date().toISOString();

                localStorage.setItem("sessionStartTime", sessionStartTime);
                localStorage.setItem("li", true);
                setUserRole(data.role);

                if ((data.role === "admin") || (data.role === "owner")) {
                    navigate(`/user/${data.id}/at_a_glance`);
                } else {
                    navigate(`/user/${data.id}/tickets`);
                }
            } else if (data.status === 403) {
                toast.error("User is already logged in on another device.");
            } else if (data.status === 404) {
                toast.error("Please check your name.");
            } else if (data.status === 401) {
                toast.error("Please check your email id and password.");
            } else if (data.status === 500) {
                toast.error("Internal Server Error.");
                console.error(data.error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const calculateSessionCountdown = () => {
        const sessionStartTime = localStorage.getItem("sessionStartTime");
        const sessionDuration = 3600 * 1000;

        if (sessionStartTime) {
            const startTime = new Date(sessionStartTime).getTime();
            const currentTime = new Date().getTime();
            const timePassed = currentTime - startTime;
            const timeLeft = sessionDuration - timePassed;

            if (timeLeft <= 0) {
                toast.error("Session expired!");
                localStorage.clear();
                navigate("/login");
            } else {
                const minutesLeft = Math.floor(timeLeft / 60000);
                const secondsLeft = Math.floor((timeLeft % 60000) / 1000);
            }
        }
    };

    useEffect(() => {
        const countdownInterval = setInterval(calculateSessionCountdown, 1000);
        return () => clearInterval(countdownInterval);
    }, []);

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

    const inputClasses = (field) => {
        const baseClasses = "block w-full px-5 py-3 text-base text-gray-800 placeholder-gray-500 transition duration-500 ease-in-out transform border rounded-lg bg-gray-100 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-offset-2";
        const value = obj[field];
        let focusClasses = "focus:ring-blue-500";

        const validationRegex = {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        };

        if (validationRegex[field]) {
            if (validationRegex[field].test(value)) {
                focusClasses = "focus:ring-green-500";
            } else if (value.length > 0) {
                focusClasses = "focus:ring-red-500";
            }
        }

        const errorClasses = errors[field] ? "border-red-500" : "border-transparent";

        return `${baseClasses} ${focusClasses} ${errorClasses}`;
    };

    return (
        <>
            <style>{keyframes}</style>
            <form onSubmit={handleSubmit} className="flex justify-center items-center h-screen bg-while">
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
                                                Login
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-2">
                                    <div>
                                        <label htmlFor="text" className="sr-only">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={obj.name}
                                            name="name"
                                            className={inputClasses("name")}
                                            placeholder="Enter your username"
                                            onChange={handleChange}
                                            autoComplete="username"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="password" className="sr-only">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            required
                                            value={obj.password}
                                            name="password"
                                            className={inputClasses("password")}
                                            placeholder="Enter your password"
                                            onChange={handleChange}
                                            autoComplete="current-password"
                                        />
                                    </div>
                                    <div className="flex flex-col mt-4 lg:space-y-2">
                                        <button
                                            type="submit"
                                            className="flex items-center justify-center w-full px-10 py-4 text-base font-medium text-center text-white transition duration-500 ease-in-out transform bg-vihaan-honda-red rounded-xl hover:bg-vihaan-honda-red-darker focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        >
                                            Login
                                        </button>
                                        <br />
                                        <span
                                        //     href="#"
                                        //     type="button"
                                        //     className="inline-flex justify-center py-4 text-base font-medium text-gray-500 focus:outline-none hover:text-gray-600 focus:text-red-600 sm:text-sm"
                                        >
                                            {/* Not signed up?
                                            <Link
                                                to="/register"
                                                style={{
                                                    color: "red",
                                                    marginLeft: "0.3em",
                                                    marginRight: "0.25em",
                                                }}
                                            >
                                                Signup
                                            </Link>
                                            here. */}
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

export default Login;
