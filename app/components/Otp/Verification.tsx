import React, { useState } from "react";

const VerificationForm = () => {

    const recepientEmail = 'zionalasa@gmail.com';
    const recepientNumber = '09167456723';
    const [code, setCode] = useState(['', '', '', '', '', '']);

    return (
        <div className="flex flex-col gap-4 justify-center items-start">
            <h2 className="font-semibold text-lg">Enter Verification Code</h2>
            <p className="text-sm text-gray-700">We have just sent a verification code to {recepientEmail} and {recepientNumber}.</p>

            <div className="w-full flex justify-between">
                {code.map((_, index) => (
                    <input key={index} value={code[index]} type="text" placeholder="0" className="bg-gray-200 rounded-lg py-6 px-2 w-12 text-xl font-semibold text-center" maxLength={1} onChange={(e) => {
                        const newCode = [...code];
                        const value = e.target.value;
                        if (/^\d?$/.test(value)) {
                            newCode[index] = value;
                            setCode(newCode);
                        }
                    }} />
                ))}
            </div>

            <p className="text-xs font-semibold text-green-500">Send me the code again</p>
            <p className="text-xs font-semibold text-green-500">Change phone number</p>

            <button className="bg-green-700 w-full p-2 rounded-md text-sm text-white hover:opacity-85 cursor-pointer" type="button">Verify</button>
        </div>
    );
};

export default VerificationForm;