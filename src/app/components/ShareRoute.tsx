import React from "react";

const ShareRoute = () => {
	return (
		<div className="p-4 bg-white rounded-md shadow-md flex items-center justify-between">
			<div className="flex items-center">
				<div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
				<input
					type="text"
					placeholder="Share a route..."
					className="border border-gray-300 rounded-full py-2 px-4 w-full focus:outline-none focus:border-green-500"
				/>
			</div>
			<button className="ml-4 bg-green-500 text-white px-4 py-2 rounded-full">
				Post
			</button>
		</div>
	);
};

export default ShareRoute;
