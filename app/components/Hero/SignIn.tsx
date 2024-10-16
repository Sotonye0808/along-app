import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const loginEndpoint = "https://along-backend.onrender.com/login";

const SignIn = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        const requestBody = {
            email,
            password,
        };

        try {
            const start = performance.now();

            const response = await fetch(loginEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();const finish = performance.now();

            console.log(`response time = , ${finish-start} ms`) // performance measurement
            console.log(data) //debugging log

            if (response.ok) {
                setMessage("Login successful! Redirecting...");
                // Store response values in local storage or state
                localStorage.setItem("id", data.id);
                localStorage.setItem("name", data.name);
                localStorage.setItem("accessToken", data.accessToken);
                localStorage.setItem("refreshToken", data.refreshToken);

                setTimeout(() => {
                    router.push("/");
                }, 5000);
            } else {
                setMessage(data.message || "Login failed. Please try again.");
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
                Sign in with an opened account.
            </p>
            <form className="w-full flex flex-col gap-4 md:text-sm" onSubmit={handleSubmit}>
                <div className="w-full">
                    <label className="text-gray-700 font-semibold">Email address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="youremail@example.com"
                        className="mt-2 w-full border rounded-full shadow-md px-4 py-2 text-gray-600 focus:outline-none focus:border-black"
                    />
                </div>
                <div className="w-full">
                    <label className="text-gray-700 font-semibold">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="mt-2 w-full border rounded-full shadow-md px-4 py-2 text-gray-600 focus:outline-none focus:border-black"
                    />
                </div>
                <div className="w-full pt-8 flex justify-between items-center">
                    <button type="submit" className="w-4/6 bg-black text-white py-2 rounded-full hover:bg-gray-800" disabled={loading}>
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                    <span className="text-gray-600 mx-4">Or</span>
                    <button className="bg-white border border-gray-300 shadow-md rounded-full py-2 px-4 hover:bg-gray-100">
                        <span className="text-gray-600">G</span>
                    </button>
                </div>
                {message && <p className={`mt-4 ${message.toLowerCase().includes('successful') ? 'text-green-600': 'text-red-600'} `}>{message}</p>}
                <p className="text-gray-600 mt-4">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="text-blue-500 hover:underline">
                        Sign Up
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default SignIn;