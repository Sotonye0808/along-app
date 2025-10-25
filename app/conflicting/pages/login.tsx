import React from "react";
import "../app/globals.css"; // so tailwind styles can take effect
import HeroNavbar from "../Hero/HeroNavbar";
import Main from "../Hero/LegendSignIn";
import SignIn from "../Hero/SignIn";
import { AuthProvider } from "../contexts/AuthContext";

const LoginPage = () => {
  return (
    <AuthProvider>
      <div className="h-screen overflow-y-hidden p-1 flex flex-col items-center">
        <HeroNavbar />
        <div className="grid grid-rows-3 md:grid-rows-none md:grid-cols-2 gap-2 justify-center items-center h-full w-full bg-gray-100 px-8">
          <div className="w-full md:h-full flex items-center">
            <Main />
          </div>
          <div className="row-span-2 w-full h-full flex justify-start md:justify-center md:px-12 items-center">
            <SignIn />
          </div>
        </div>
      </div>
    </AuthProvider>
  );
};

export default LoginPage;
