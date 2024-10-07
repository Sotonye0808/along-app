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
			<div className="flex bg-gray-100 h-screen">
				{/* Main Section */}
				<Main />

				{/* Form Section */}
				<div className="flex-1 flex items-center justify-center p-12">
					<Form />
				</div>
			</div>
		</div>
	);
};

export default page;
