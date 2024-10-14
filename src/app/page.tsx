import React from "react";
import Home from "./components/Hero/page";
// disable eslint for unused vars for now to enable build and deploy
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Dashboard from "./components/Dashboard/page";

const App = () => {
	return (
		<div>
			<Home />
			{/* <Dashboard /> */}
		</div>
	);
};

export default App;
