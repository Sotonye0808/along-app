import React from "react";

const SearchBar = () => {
	return (
		<div className="bg-white rounded-lg shadow-md px-4 py-2 flex items-center w-2/5">
			<span>icon </span>
			<input
				type="text"
				placeholder="Search"
				className="border-none focus:outline-none w-full py-2"
			/>
		</div>
	);
};

export default SearchBar;
