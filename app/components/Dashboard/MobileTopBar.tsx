import Link from "next/link";
import React from "react";
import Image from "next/image";

const Topbar = () => {
  return (
    <div className="p-2 w-full flex justify-end items-end gap-6 text-3xl">
      <Link href="/register">
        <Image
          src="/icons/notifications.svg"
          alt="search icon"
          width={20}
          height={20}
        />
      </Link>

      <Link href="/otp">
        <Image
          src="/icons/profile.svg"
          alt="search icon"
          width={20}
          height={20}
        />
      </Link>
    </div>
  );
};

export default Topbar;
