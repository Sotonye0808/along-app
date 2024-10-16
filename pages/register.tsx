import React from "react";
import "../app/globals.css" // so tailwind styles can take effect
import HeroNavbar from "../app/components/Hero/HeroNavbar";
import Main from "../app/components/Hero/Main";
import Form from "../app/components/Hero/Form";

const RegisterPage = () => {
  return (
    <div>
      <HeroNavbar />
      <div className="md:grid grid-cols-2 gap-6 bg-gray-100 px-2">
        <div className="w-full hidden md:flex">
          <Main />
        </div>
        <div className="w-full flex justify-center md:px-12 md:items-center">
          <Form />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
