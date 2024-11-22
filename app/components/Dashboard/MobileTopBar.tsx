import Link from "next/link";
import React from "react";

const Topbar = () => {
	return (
		<div  className="p-2 w-full flex justify-end items-end gap-6 text-3xl">
				<Link href="/register">
				🔔
				</Link>
				
				<Link href="/otp">
					👤
				</Link>
		</div>
	);
};

export default Topbar;
