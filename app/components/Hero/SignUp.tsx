import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const registerEndpoint = "https://along-backend.onrender.com/register";

const Form = () => {
    const [userName, setUserName] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        const requestBody = {
            userName,
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
        };

        try {
            const start = performance.now();

            const response = await fetch(registerEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            const finish = performance.now();

            console.log(`response time = , ${finish-start} ms`) // performance measurement
            console.log(data) //debugging log

            if (response.ok) {
                setMessage(data.message || "Registration successful! Redirecting...");
                setTimeout(() => {
                    router.push("/");
                }, 5000);
            } else {
                setMessage(data.error || "Registration failed. Please try again.");
            }
        } catch (error) {
            setMessage("An error occurred. Please try again.");
            console.error(error)
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="m-4 p-1 bg-gray-100 flex flex-col gap-8 items-start">
            <p className="text-sm text-gray-600 my-8 md:text-xs">
                By signing up, you are consenting to receive product, service and events
                updates from us. You can unsubscribe at any time.
            </p>
            <form className="w-full flex flex-col gap-4 md:text-sm" onSubmit={handleSubmit}>
                <div className="w-full">
                    <label htmlFor="register-email" className="text-gray-700 font-semibold">Username</label>
                    <input
                        id="register-email"
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Enter your Username"
                        autoComplete="username"
                        className="mt-2 w-full border rounded-full shadow-md px-4 py-2 text-gray-600 focus:outline-none focus:border-black"
                    />
                </div>
                <div className="w-full">
                    <label htmlFor="register-firstname" className="text-gray-700 font-semibold">First name</label>
                    <input
                        id="register-firstname"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter your First name"
                        autoComplete="on"
                        className="mt-2 w-full border rounded-full shadow-md px-4 py-2 text-gray-600 focus:outline-none focus:border-black"
                    />
                </div>
                <div className="w-full">
                    <label htmlFor="register-lastname" className="text-gray-700 font-semibold">Last name</label>
                    <input
                        id="register-lastname"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter your Last name"
                        autoComplete="on"
                        className="mt-2 w-full border rounded-full shadow-md px-4 py-2 text-gray-600 focus:outline-none focus:border-black"
                    />
                </div>
                <div className="w-full">
                    <label htmlFor="register-email" className="text-gray-700 font-semibold">Email address</label>
                    <input
                        id="register-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your Email address"
                        autoComplete="email"
                        className="mt-2 w-full border rounded-full shadow-md px-4 py-2 text-gray-600 focus:outline-none focus:border-black"
                    />
                </div>
                <div className="w-full">
                    <label htmlFor="register-password" className="text-gray-700 font-semibold">Password</label>
                    <input
                        id="register-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your Password"
                        autoComplete="new-password"
                        className="mt-2 w-full border rounded-full shadow-md px-4 py-2 text-gray-600 focus:outline-none focus:border-black"
                    />
                </div>
                <div className="w-full">
                    <label htmlFor="register-confirmpass" className="text-gray-700 font-semibold">Confirm Password</label>
                    <input
                        id="register-confirmpass"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        className="mt-2 w-full border rounded-full shadow-md px-4 py-2 text-gray-600 focus:outline-none focus:border-black"
                    />
                </div>
                <div className="w-full pt-8 flex justify-between items-center">
                    <button type="submit" className="w-4/6 bg-black text-white py-2 rounded-full hover:bg-gray-800" disabled={loading}>
                        {loading ? "Creating account..." : "Create account"}
                    </button>
                    <span className="text-gray-600 mx-4">Or</span>
                    <button type="button" className="bg-white border border-gray-300 shadow-md rounded-full py-2 px-4 hover:bg-gray-100">
                        <span className="text-gray-600">G</span>
                    </button>
                </div>
                {message && <p className={`mt-4 ${message.toLowerCase().includes('successful') ? 'text-green-600': 'text-red-600'} `}>{message}</p>}
                <p className="text-gray-600 mt-4">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-500 hover:underline">
                        Sign In
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default Form;