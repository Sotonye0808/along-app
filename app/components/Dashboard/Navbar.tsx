import Link from "next/link";
import React from "react";
import Image from "next/image";

const Navbar = () => {
	return (
		<div className="md:p-2 text-ellipsis">
			<nav className="fixed bottom-0 w-full bg-gray-200 py-4 px-4 text-center text-3xl flex gap-6 justify-between items-center text-ellipsis md:flex-col md:px-0 md:py-0 md:justify-center md:w-fit md:h-screen md:static md:bg-transparent">
				<Link href="/" className="">
					{" "}
					<Image
						src="/icons/feeds.svg"
						alt="feeds icon"
						width={32}
						height={32}
					/>
				</Link>
				<Link href="/login" className="">
					<Image
						src="/icons/explore.svg"
						alt="explore icon"
						width={32}
						height={32}
					/>
				</Link>
				<Link href="/register" className="hidden md:inline">
					<Image
						src="/icons/notifications.svg"
						alt="notifications icon"
						width={32}
						height={32}
					/>
				</Link>

				<Link href="/otp" className="">
					<Image
						src="/icons/bookmarks.svg"
						alt="bookmarks icon"
						width={32}
						height={32}
					/>
				</Link>
				<Link href="/otp" className="">
					<Image
						src="/icons/marketplace.svg"
						alt="marketplace icon"
						width={32}
						height={32}
					/>
				</Link>
				<Link href="/otp" className="hidden md:inline">
					<Image
						src="/icons/profile.svg"
						alt="profile icon"
						width={32}
						height={32}
					/>
				</Link>
			</nav>
		</div>
	);
};

export default Navbar;
