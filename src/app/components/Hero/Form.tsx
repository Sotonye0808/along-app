import React from "react";

const Form = () => {
	return (
		<div className="m-4 p-1 bg-gray-100 flex flex-col gap-8 items-start">
			{/* info text */}
			<p className="text-sm text-gray-600 my-8 md:text-xs">
				By signing up, you are consenting to receive product, service and events
				updates from us. You can unsubscribe at any time.
			</p>

			<form className="w-full flex flex-col gap-4 md:text-sm">
				{/* Full Name Field */}
				<div className="w-full">
					<label className="text-gray-700 font-semibold">Full name</label>
					<input
						type="text"
						placeholder="Zion Ayokanmi Alasa"
						className="mt-2 w-full border rounded-full shadow-md px-4 py-2 text-gray-600 focus:outline-none focus:border-black"
					/>
					{/* include the verification icon -- don't have that */}
				</div>
				{/* email address field */}
				<div className="w-full">
					<label className="text-gray-700 font-semibold">Email address</label>
					<input
						type="email"
						placeholder="zionalasa@gmail.com"
						className="mt-2 w-full border rounded-full shadow-md px-4 py-2 text-gray-600 focus:outline-none focus:border-black"
					/>
				</div>
				{/* phone number field */}
				<div className="w-full">
					<label className="text-gray-700 font-semibold">Phone number</label>
					<input
						type="tel"
						placeholder="+234 8478374980"
						className="mt-2 w-full border rounded-full shadow-md px-4 py-2 text-gray-600 focus:outline-none focus:border-black"
					/>
				</div>
				{/* password field */}
				<div className="w-full">
					<label className="text-gray-700 font-semibold">Password</label>
					<input
						type="password"
						placeholder="Enter your password"
						className="mt-2 w-full border rounded-full shadow-md px-4 py-2 text-gray-600 focus:outline-none focus:border-black"
					/>
				</div>
				<div className="w-full pt-8 flex justify-between items-center">
					{/* create account button */}
					<button className="w-4/6 bg-black text-white py-2 rounded-full hover:bg-gray-800">
						Create account
					</button>
					{/* sign up with google */}
					<span className="text-gray-600 mx-4">Or</span>
					<button className="bg-white border border-gray-300 shadow-md rounded-full py-2 px-4 hover:bg-gray-100">
						<span className="text-gray-600">G</span>
					</button>
				</div>
			</form>
		</div>
	);
};

export default Form;
