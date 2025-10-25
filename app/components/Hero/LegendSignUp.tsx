"use client";
// disable eslint for unused vars for now to enable build and deploy
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useState } from "react";

const Main = () => {
	return (
		<div className="flex-1 flex flex-col gap-8 items-center justify-between px-12 py-4 mx-6 bg-gradient-to-b from-gray-400 to-gray-800 rounded-lg h-[75%] overflow-y-hidden">
			<div className="h-1 w-2/3 bg-gray-200 rounded-r-3xl rounded-l-3xl mt-2 mb-6">
				<div className="h-full w-2/3 bg-gray-800 rounded-r-3xl text-gray-400">.</div>
			</div>
			<h1 className="text-xs text-gray-300 text-center font-semibold">
				Decrease the time spent on locating the next stop or destination with
				our search feature.
			</h1>
			<div className="w-2/3 h-[150%]">
				<img className="object-contain w-full h-full"
					src="/iphone-mockup.png" 
					alt="Phone Image" />
			</div>
		</div>
	);
};

export default Main;
