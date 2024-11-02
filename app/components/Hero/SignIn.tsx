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
        <div className="m-4 p-1 bg-gray-100 flex flex-col gap-8 items-start">
            <p className="text-sm text-gray-600 my-8 md:text-xs">
                Sign in with an opened account.
            </p>
            <form className="w-full flex flex-col gap-4 md:text-sm" onSubmit={handleSubmit}>
                <div className="w-full">
                    <label htmlFor="login-email" className="text-gray-700 font-semibold">Email address</label>
                    <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="youremail@example.com"
                        autoComplete="email"
                        className="mt-2 w-full border rounded-full shadow-md px-4 py-2 text-gray-600 focus:outline-none focus:border-black"
                    />
                </div>
                <div className="w-full">
                    <label htmlFor="login-password" className="text-gray-700 font-semibold">Password</label>
                    <input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        className="mt-2 w-full border rounded-full shadow-md px-4 py-2 text-gray-600 focus:outline-none focus:border-black"
                    />
                </div>
                <div className="w-full pt-8 flex justify-between items-center">
                    <button type="submit" className="w-4/6 bg-black text-white py-2 rounded-full hover:bg-gray-800" disabled={loading}>
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                    <span className="text-gray-600 mx-4">Or</span>
                    <button type="button" className="bg-white border border-gray-300 shadow-md rounded-full py-2 px-4 hover:bg-gray-100">
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