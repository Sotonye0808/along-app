import React from "react";
import ShareRoute from "./components/ShareRoute";
import SearchBar from "./components/SearchBar";
import Navbar from "./components/Navbar";
import MainPanel from "./components/MainPanel";
import SuggestionsPanel from "./components/SuggestionsPanel";

const App = () => {
	return (
		<div className="flex">
			{/* Sidebar Navigation */}
			<Navbar />

			{/* Main Content */}
			<div className="flex-1 p-6 bg-gray-100">
				{/* Top Bar */}
				<div className="flex justify-between items-center mb-6">
					<ShareRoute />
					<SearchBar />
				</div>

				{/* Main Panel */}
				<div className="flex">
					<div className="w-4/6 mr-4">
						<MainPanel />
					</div>
					<div className="w-2/6">
						<SuggestionsPanel />
					</div>
				</div>
			</div>
		</div>
	);
};

export default App;
