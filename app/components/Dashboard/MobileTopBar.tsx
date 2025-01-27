import Link from "next/link";
import React from "react";
import Image from "next/image";

const Topbar = () => {
  return (
    <div className="p-2 w-full flex justify-end items-end gap-6 text-3xl">
      <Link href="/register">
        <Image
          src="/icons/notifications.svg"
          alt="notifications icon"
          width={24}
          height={24}
        />
      </Link>

      <Link href="/otp">
        <Image
          src="/icons/profile.svg"
          alt="profile icon"
          width={24}
          height={24}
        />
      </Link>
    </div>
  );
};

export default Topbar;
