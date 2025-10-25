"use client";
import React, { useState } from "react";
import Link from "next/link";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="w-full z-40 flex justify-between items-center py-4 px-6 bg-white shadow-md relative">
            {/* along logo */}
            <div className="text-xl font-bold">
                <Link href="/">along<sub className="text-sm font-medium">TM</sub></Link>
            </div>

            {/* hamburger menu button */}
            <div className="md:hidden">
                <button onClick={toggleMenu} className="text-gray-600 hover:text-black">
                    {/* Hamburger icon */}
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 6h16M4 12h16m-7 6h7"
                        ></path>
                    </svg>
                </button>
            </div>

            {/* nav links */}
            <div className={`absolute top-12 left-0 flex-col bg-white w-full py-4 justify-center text-gray-600 text-xs font-semibold md:static md:w-full md:bg-transparent md:flex-row md:flex md:gap-4 md:justify-around md:items-center ${isOpen ? 'flex' : 'hidden'}`}>
				{/* left wing */}
                <div className="flex flex-col md:gap-4 md:flex-row md:justify-around lg:gap-6">
					<a href="#" className="hover:text-white py-4 px-2 hover:bg-black w-full md:hover:text-black md:hover:bg-transparent">
						Products
					</a>
					<a href="#" className="hover:text-white py-4 px-2 hover:bg-black w-full md:hover:text-black md:hover:bg-transparent">
						About
					</a>
					<a href="#" className="hover:text-white py-4 px-2 hover:bg-black w-full md:hover:text-black md:hover:bg-transparent">
						Documentation
					</a>
				</div>
				{/*right wing */}
                <div className="flex flex-col md:gap-4 md:flex-row md:items-center md:justify-around lg:gap-6">
					<a href="#" className="hover:text-white py-4 px-2 hover:bg-black w-full md:hover:text-black md:hover:bg-transparent md:p-0 md:w-fit">
						Contact
					</a>
					<button type="button" className="m-3 bg-black text-white p-1 px-4 rounded-full hover:bg-gray-800 md:m-0">
						Book a demo
					</button>
					<div className="text-gray-950 mx-auto md:mx-0">🌐</div>
				</div>
				{/*replace with actual globe icon */}
            </div>
        </nav>
    );
};

export default Navbar;