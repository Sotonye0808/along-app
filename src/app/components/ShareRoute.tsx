import React from "react";

const ShareRoute = () => {
	return (
		<div className="p-2 bg-white rounded-xl border flex items-center justify-between w-3/5 mr-4">
			<div className="flex items-center">
				<div className="w-9 h-8 rounded-full bg-gray-300 ml-2"></div>
				<input
					type="text"
					placeholder="Share a route..."
					className="rounded-full py-2 px-4 w-full focus:outline-none focus:border-green-500"
				/>
			</div>
			<button className="mr-2 bg-green-700 text-white px-4 py-2 rounded-md">
				Post
			</button>
		</div>
	);
};

export default ShareRoute;
