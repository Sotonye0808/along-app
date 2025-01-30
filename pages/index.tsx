import React from "react";
import "../app/globals.css"; // so tailwind styles can take effect
import ShareRoute from "../app/components/Dashboard/ShareRoute";
import SearchBar from "../app/components/Dashboard/SearchBar";
import Navbar from "../app/components/Dashboard/Navbar";
import MainPanel from "../app/components/Dashboard/MainPanel";
import SuggestionsPanel from "../app/components/Dashboard/SuggestionsPanel";
import Topbar from "../app/components/Dashboard/MobileTopBar";

const Dashboard = () => {
	return (
		<div className="flex bg-gray-100">
			{/* Sidebar Navigation */}
			<div>
				<Navbar />
			</div>

			{/* Main Content */}
			<div className="flex-1 p-1">
				{/* Top Bar */}
				<div className="flex md:hidden">
					<ShareRoute />
					<Topbar />
				</div>
				<div className="hidden md:flex justify-between items-center mb-6">
					<ShareRoute />
					<SearchBar />
				</div>

				{/* Main Panel */}
				<div className="flex">
					<div className="md:w-4/6 py-3 pb-20 md:pb-3 flex flex-col md:h-[85vh] h-[82.5vh] overflow-y-auto">
						<div className="md:mr-4">
							<MainPanel />
						</div>
						<div className="md:mr-4">
							<MainPanel />
						</div>
						<div className="md:mr-4">
							<MainPanel />
						</div>
						<div className="md:mr-4">
							<MainPanel />
						</div>
					</div>
					<div className="hidden md:flex w-2/6">
						<SuggestionsPanel />
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
