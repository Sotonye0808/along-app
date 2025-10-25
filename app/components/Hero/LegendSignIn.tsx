"use client";
// disable eslint for unused vars for now to enable build and deploy
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useState } from "react";

const Main = () => {
	return (
		<div className="h-full w-full flex-1 flex items-center justify-center p-2 mx-6 rounded-lg">
			<div className="h-full w-full">
				<img className="object-contain w-full h-full"
					src="/signin-legend.png" 
					alt="Phone Image" />
			</div>
		</div>
	);
};

export default Main;
