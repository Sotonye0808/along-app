"use client";
// disable eslint for unused vars for now to enable build and deploy
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useState } from "react";

const Main = () => {
	return (
		<div className="flex-1 flex flex-col gap-8 items-center justify-between px-12 py-4 mx-6  rounded-lg h-full overflow-y-clip">
			<div className="w-full h-full">
				<img className="object-contain w-full h-full"
					src="/otp-legend-svg.svg" 
					alt="Phone Image" />
			</div>
		</div>
	);
};

export default Main;
