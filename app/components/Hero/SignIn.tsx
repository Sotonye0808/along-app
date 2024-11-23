import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { setTokens } from "../../utils/auth";
import { useAuth } from "../../contexts/AuthContext";
import axiosInstance from "../../utils/axiosConfig";

const SignIn = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const { setAuthState } = useAuth();

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

            const response = await axiosInstance.post('/login', requestBody);

            const finish = performance.now();

            console.log(`response time = , ${finish-start} ms`) // performance measurement
            const { data } = response;
            
            if (response.status === 200) {
                setMessage("Login successful! Redirecting...");
                
                // Store tokens and user data
                setTokens(data.accessToken, data.refreshToken);
                localStorage.setItem("userID", data.id);
                localStorage.setItem("name", data.name);
                
                // Update auth context
                setAuthState({ id: data.id, name: data.name });

                setTimeout(() => {
                    router.push("/");
                }, 2000);
            } else {
                setMessage(data.message || "Login failed. Please try again.");
            }
        } catch (error) {
            setMessage("An error occurred. Please try again.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-full p-1 bg-gray-100 flex flex-col gap-2 justify-start md:justify-center items-start">
            <p className="text-3xl font-semibold my-3">
                Sign in 
            </p>
            <form className="w-full flex flex-col gap-3 md:text-sm" onSubmit={handleSubmit}>
                <div className="w-full relative flex justify-center border rounded-md shadow-md px-4 py-2 text-gray-600 focus-within:outline-none focus-within:border-black">
                    <label htmlFor="login-email" className="absolute left-2 text-sm text-gray-700 font-semibold">✉</label>
                    <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="youremail@example.com"
                        autoComplete="email"
                        className="ml-6 w-full border-none focus:outline-none focus:border-none bg-transparent"
                    />
                </div>
                <div className="w-full relative flex justify-center border rounded-md shadow-md px-4 py-2 text-gray-600 focus-within:outline-none focus-within:border-black">
                    <label htmlFor="login-password" className="absolute left-2 text-sm text-gray-700 font-semibold">🔑</label>
                    <input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        className="ml-6 w-full border-none focus:outline-none focus:border-none bg-transparent"
                    />
                </div>
                <div className="w-full my-1 flex md:justify-between justify-center items-center">
                    <button type="submit" className="w-1/2 md:w-full bg-green-700 text-white py-2 rounded-lg hover:bg-gray-800" disabled={loading}>
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </div>
                <div className="w-full my-2 flex justify-evenly items-center gap-1 px-4 text-sm">
                    <hr className="w-full border border-gray-400" />
                    <span>OR</span>
                    <hr className="w-full border border-gray-400" />
                </div>
                <div id="providers" className="w-full flex justify-between gap-5">
                        <button type="button" className="w-4/6 bg-white border border-gray-300 shadow-md rounded-lg py-2 px-4 hover:bg-opacity-85">
                            <span className="text-gray-600">Google</span>
                        </button>
                        
                        <button type="button" className="w-4/6 bg-white border border-gray-300 shadow-md rounded-lg py-2 px-4 hover:bg-opacity-85">
                            <span className="text-gray-600">Apple</span>
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