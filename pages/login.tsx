import React from "react";
import "../app/globals.css"; // so tailwind styles can take effect
import HeroNavbar from "../app/components/Hero/HeroNavbar";
import Main from "../app/components/Hero/LegendSignIn";
import SignIn from "../app/components/Hero/SignIn";
import { AuthProvider } from '../app/contexts/AuthContext';


const LoginPage = () => {
  return (
    <AuthProvider>
    <div>
      <HeroNavbar />
      <div className="md:grid grid-cols-2 gap-2 justify-center items-center h-full bg-gray-100 px-8">
        <div className="w-full h-full hidden md:flex">
          <Main />
        </div>
        <div className="w-full flex justify-center md:px-8 md:items-center">
          <SignIn />
        </div>
      </div>
    </div>
    </AuthProvider>
  );
};

export default LoginPage;
