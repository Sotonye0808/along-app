import React from "react";
import Link from "next/link";

const SignIn = () => {
    return (
        <div className="m-4 p-1 bg-gray-100 flex flex-col gap-8 items-start">
            <p className="text-sm text-gray-600 my-8 md:text-xs">
                Sign in with an opened account.
            </p>
            <form className="w-full flex flex-col gap-4 md:text-sm">
                <div className="w-full">
                    <label className="text-gray-700 font-semibold">Email address</label>
                    <input
                        type="email"
                        placeholder="youremail@example.com"
                        className="mt-2 w-full border rounded-full shadow-md px-4 py-2 text-gray-600 focus:outline-none focus:border-black"
                    />
                </div>
                <div className="w-full">
                    <label className="text-gray-700 font-semibold">Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        className="mt-2 w-full border rounded-full shadow-md px-4 py-2 text-gray-600 focus:outline-none focus:border-black"
                    />
                </div>
                <div className="w-full pt-8 flex justify-between items-center">
                    <button
                        type="submit"
                        className="w-4/6 bg-black text-white py-2 rounded-full hover:bg-gray-800">
                        Sign In
                    </button>
                    <span className="text-gray-600 mx-4">Or</span>
                    <button className="bg-white border border-gray-300 shadow-md rounded-full py-2 px-4 hover:bg-gray-100">
                        <span className="text-gray-600">G</span>
                    </button>
                </div>
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