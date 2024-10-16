import React from "react";

const SuggestionsPanel = () => {
	const suggestions = [
		{ name: "Kubwa", posts: "1.26k posts" },
		{ name: "Maitama", posts: "1.26k posts" },
		{ name: "Jabi Mall", posts: "1.26k posts" },
		{ name: "Idu Railway Station", posts: "1.26k posts" },
	];

	return (
		<div className="p-4 bg-transparent rounded-md w-full">
			<h2 className="font-semibold mb-4 text-2xl">Suggestions</h2>
			<ul className="space-y-4 py-2">
				{suggestions.map((item) => (
					<li
						key={item.name}
						className="flex justify-between text-gray-700 flex-col"
					>
						<span className="text-gray-950">{item.name}</span>
						<span className="text-gray-500 mb-4">{item.posts}</span>
						<hr className="border-gray-300" />
					</li>
				))}
			</ul>
		</div>
	);
};

export default SuggestionsPanel;
