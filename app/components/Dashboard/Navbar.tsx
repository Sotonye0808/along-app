import Link from "next/link";
import React from "react";

const Navbar = () => {
	return (
		<div className="p-2 text-ellipsis">
			<nav className="text-center h-screen flex flex-col gap-6 justify-center items-center text-ellipsis">
				<Link href="/login" className="text-xs">
					Login
				</Link>
				<Link href="/register" className="text-xs">
					Register
				</Link>
			</nav>
		</div>
	);
};

export default Navbar;
