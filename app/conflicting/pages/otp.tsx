import React from "react";

import "../app/globals.css"; // so tailwind styles can take
import HeroNavbar from "../Hero/HeroNavbar";
import VerificationForm from "../Otp/Verification";
import Main from "../Otp/LegendOtp";

const OtpPage = () => {
  return (
    <div className="h-screen overflow-y-hidden p-1 flex flex-col justify-center items-center">
      <HeroNavbar />
      <div className="mx-0 my-auto md:grid grid-cols-2 gap-2 justify-center items-center justify-items-center h-full bg-gray-100 px-8">
        <div className="w-full h-full hidden md:flex">
          <Main />
        </div>
        <div className="w-full h-full flex justify-center md:px-16 md:items-center">
          <VerificationForm />
        </div>
      </div>
    </div>
  );
};

export default OtpPage;
