import React from "react";

const Form = () => {
	return (
		<div className="p-12 bg-white rounded-md shadow-md flex flex-col items-start space-y-6">
			{/* info text */}
			<p className="text-sm text-gray-600 mb-6">
				By signing up, you are consenting to receive product, service and events
				updates from us. You can unsubscribe at any time.
			</p>

			{/* Full Name Field */}
			<div className="w-full">
				<label className="text-gray-700 font-semibold">Full name</label>
				<input
					type="text"
					placeholder="Zion Ayokanmi Alasa"
					className="mt-2 w-full border rounded-full px-4 py-2 text-gray-600 focus:outline-none focus:border-black"
				/>
				{/* include the verification icon -- don't have that */}
			</div>

			{/* email address field */}
			<div className="w-full">
				<label className="text-gray-700 font-semibold">Email address</label>
				<input
					type="email"
					placeholder="zionalasa@gmail.com"
					className="mt-2 w-full border rounded-full px-4 py-2 text-gray-600 focus:outline-none focus:border-black"
				/>
			</div>

			{/* phone number field */}
			<div className="w-full">
				<label className="text-gray-700 font-semibold">Phone number</label>
				<input
					type="tel"
					placeholder="+234 8478374980"
					className="mt-2 w-full border rounded-full px-4 py-2 text-gray-600 focus:outline-none focus:border-black"
				/>
			</div>

			{/* password field */}
			<div className="w-full">
				<label className="text-gray-700 font-semibold">Password</label>
				<input
					type="password"
					placeholder="Enter your password"
					className="mt-2 w-full border rounded-full px-4 py-2 text-gray-600 focus:outline-none focus:border-black"
				/>
			</div>

			{/* create account button */}
			<button className="w-full bg-black text-white py-3 rounded-full hover:bg-gray-800">
				Create account
			</button>

			{/* sign up with google */}
			<div className="text-center w-full">
				<span className="text-gray-600">Or</span>
				<button className="ml-2 bg-white border border-gray-300 rounded-full px-6 py-2 hover:bg-gray-100">
					<span className="text-gray-600">Sign up with Google</span>
				</button>
			</div>
		</div>
	);
};

export default Form;
