/* eslint-disable @next/next/no-img-element */
import React from "react";

const Page = () => {
  return (
    <div className="flex">
      <div className="bg-white rounded-sm shadow-sm p-8 w-[420px] m-8">
        {/* Profile Image */}
        <div className="flex gap-5">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
              alt="Minhaj"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 pt-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Minhaj</h1>
            <p className="text-xl text-blue-500 font-medium mb-8">
              Frontend Developer
            </p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-semibold">Employee code:</span>
            <span className="text-gray-900 font-medium">TRIV00778-0001</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-semibold">Joined Date:</span>
            <span className="text-gray-900 font-medium">March 15, 2022</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-semibold">Last Payslips:</span>
            <span className="text-gray-900 font-medium">June 31, 2025</span>
          </div>
        </div>
      </div>
      {/* personel details */}

      <div className="bg-white rounded-sm shadow-sm p-8 w-[420px] m-8">

      </div>
    </div>
  );
};

export default Page;
