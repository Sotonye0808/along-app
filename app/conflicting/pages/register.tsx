import React from "react";
import "../app/globals.css"; // so tailwind styles can take effect
import HeroNavbar from "../Hero/HeroNavbar";
import Main from "../Hero/LegendSignUp";
import Form from "../Hero/SignUp";

const RegisterPage = () => {
  return (
    <div className="h-screen p-1 flex flex-col items-center">
      <HeroNavbar />
      <div className="md:grid grid-cols-2 gap-2 justify-center items-center w-full h-full bg-gray-100 px-8">
        <div className="w-full h-[90%] hidden md:flex">
          <Main />
        </div>
        <div className="w-full h-full flex justify-center md:px-12 md:items-center">
          <Form />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
