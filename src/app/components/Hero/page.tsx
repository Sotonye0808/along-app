import React from "react";
import HeroNavbar from "./HeroNavbar";
import Main from "./Main";
import Form from "./Form";

const page = () => {
	return (
		<div>
			{/* Navbar */}
			<HeroNavbar />

			{/* Main Content */}
			<div className="md:grid grid-cols-2 gap-6 bg-gray-100 px-2">
				<div className="w-full hidden md:flex">
					{/* Main Section */}
					<Main />
				</div>

				{/* Form Section */}
				<div className="w-full flex justify-center md:px-12 md:items-center">
					<Form />
				</div>
			</div>
		</div>
	);
};

export default page;
