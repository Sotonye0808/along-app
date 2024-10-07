import React from "react";

const SearchBar = () => {
	return (
		<div className="bg-white rounded-full shadow-md px-4 py-2 flex items-center">
			<input
				type="text"
				placeholder="Search"
				className="border-none focus:outline-none w-full"
			/>
		</div>
	);
};

export default SearchBar;
