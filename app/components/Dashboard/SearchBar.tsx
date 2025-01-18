import React from "react";
import Image from "next/image";

const SearchBar = () => {
	return (
		<div className="bg-white rounded-xl border px-4 py-2 flex items-center w-2/5">
			<span className="mr-1">
				{" "}
				<Image
					src="/icons/search.svg"
					alt="search icon"
					width={16}
					height={16}
				/>
			</span>
			<input
				type="text"
				placeholder="Search"
				className="border-none focus:outline-none w-full py-2"
			/>
		</div>
	);
};

export default SearchBar;
