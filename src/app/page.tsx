import React from "react";
import ShareRoute from "./components/ShareRoute";
import SearchBar from "./components/SearchBar";
import Navbar from "./components/Navbar";
import MainPanel from "./components/MainPanel";
import SuggestionsPanel from "./components/SuggestionsPanel";

const App = () => {
	return (
		<div className="flex bg-gray-100">
			{/* Sidebar Navigation */}
			<div className="bg-transparent">
				<Navbar />
			</div>

			{/* Main Content */}
			<div className="flex-1 p-6">
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
