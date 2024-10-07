import React from "react";

const Navbar = () => {
	return (
		<nav className="flex justify-between items-center p-6 bg-white shadow-md">
			{/* along logo */}
			<div className="text-xl font-semibold">
				along<span className="text-sm">TM</span>
			</div>

			{/* nav links */}
			<div className="flex space-x-6 text-gray-600">
				<a href="#" className="hover:text-black">
					Products
				</a>
				<a href="#" className="hover:text-black">
					About
				</a>
				<a href="#" className="hover:text-black">
					Documentation
				</a>
			</div>

			{/* right section */}
			<div className="flex items-center space-x-4">
				<a href="#" className="text-gray-600 hover:text-black">
					Contact
				</a>
				<button className="bg-black text-white py-2 px-4 rounded-full hover:bg-gray-800">
					Book a demo
				</button>
				<div className="text-gray-950">🌐</div>{" "}
				{/* replace with actual globe icon */}
			</div>
		</nav>
	);
};

export default Navbar;
