
"use client";

import React, { useState, useEffect, ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import toast from "react-hot-toast"
import { Bell } from "lucide-react"
import DraggableMessenger from "../components/messenger/DraggableMessenger"
import { RootState } from "../store"
import { useSelector } from "react-redux"




const LiveClock = () => {
  const [dates, setDates] = useState<string>("");
  const [times, setTimes] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      const hours = now.getHours() % 12 || 12;
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = now.getHours() >= 12 ? "PM" : "AM";
      
      const day = now.getDate().toString().padStart(2, "0");
      const month = (now.getMonth() + 1).toString().padStart(2, "0");
      const year = now.getFullYear();
      const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
      const formatted = `${hours}:${minutes} ${ampm} `;

      const formatedDate = ` ${day}/${month}/${year}, ${weekday}`;
      setTimes(formatted);
      setDates(formatedDate);
    };
    
    updateTime(); // run once immediately
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);
    

  return (
    <div className=" text-sm flex flex-col justify-end items-end rounded">
      <p>{times}</p>
      <p>{dates}</p>
    </div>
  );
};

interface MainContainerProps {
  children: ReactNode;
}

export default function RootLayout({ children }: MainContainerProps) {
    const pathname = usePathname();
    const user = useSelector((state: RootState) => state.user.user)
    

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully!');
        window.location.href = '/';
    };
    

    if (user?.role !== "manager") return children

  return (
    <>
      <header>
        <nav className="bg-white p-2 border-b border-b-[#dddddd] flex justify-between fixed w-full px-5 z-20">
          <div>
            <Image src="/Logo.png" alt="Logo image" width={100} height={35} />
          </div>
          <div className="flex items-center gap-6">
              <Link href="/manager/notification" className="cursor-pointer">
              <Bell size={18} />
            </Link>
            <LiveClock />
          </div>
        </nav>
      </header>

                <div className="flex pt-13 relative" style={{ height: "100vh" }}>

                <nav className="w-30 md:w-50 border-r border-r-[#dddddd] flex flex-col justify-between p-4 bg-white ">
                    <div className="flex flex-col">
                        <Link  href={"/manager/profile"} className="border-b border-[#ddd] mb-6">
                        <div className="flex items-center gap-3 p-3 rounded-lg">
                            <div className="w-14 h-14 rounded-full relative overflow-hidden ">
                                <Image src={user?.profileImage || '/avatar.png'} alt="" fill className="rounded-full object-cover" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-sm text-gray-800">
                                    {user?.name || 'MINHAJ'}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {user?.employeeCode || 'N/A'}
                                </span>
                            </div>
                        </div>
                        </Link>
                    <ul className="flex flex-col gap-1">
                    <Link
                        href={"/manager/dashboard"}
                        className={` w-full py-1 md:py-2 px-2 md:px-4 text-sm md:text-base rounded ${
                        pathname === "/manager/dashboard" ? "bg-black text-white" : ""
                        }`}
                    >
                        Dashboard
                    </Link>
                    <Link
                        href={"/manager/project/Project"}
                        className={` w-full py-1 md:py-2 px-2 md:px-4 text-sm md:text-base rounded ${
                        pathname === "/manager/project/Project" ? "bg-black text-white" : ""
                        }`}
                    >
                        Projects
                    </Link>
                    <Link
                        href={"/manager/dailyreport"}
                        className={` w-full py-1 md:py-2 px-2 md:px-4 text-sm md:text-base rounded ${
                        pathname === "/manager/dailyreport" ? "bg-black text-white" : ""
                        }`}
                    >
                        Daily Reports
                    </Link>
                    <Link
                        href={"/manager/attendance"}
                        className={` w-full py-1 md:py-2 px-2 md:px-4 text-sm md:text-base rounded ${
                        pathname === "/manager/attendance" ? "bg-black text-white" : ""
                        }`}
                    >
                        Attendance
                    </Link>
                    <Link
                        href={"/manager/employee"}
                        className={` w-full py-1 md:py-2 px-2 md:px-4 text-sm md:text-base rounded ${
                        pathname === "/manager/employee" ? "bg-black text-white" : ""
                        }`}
                    >
                        Employees
                    </Link>
                    <Link
                        href={"/manager/employeeReport"}
                        className={` w-full py-1 md:py-2 px-2 md:px-4 text-sm md:text-base rounded ${
                        pathname === "/manager/employeeReport" ? "bg-black text-white" : ""
                        }`}
                    >
                        Employee Reports
                    </Link>
                    </ul>
                </div>

                    <button onClick={logout} className="py-2 mx-2 text-sm md:text-base border mb-2">
                    LogOut
                    </button>
                </nav>

        <div>
          <DraggableMessenger role="manager" />
        </div>

        <main className="flex-1 p-6 overflow-auto bg-[#f3f3f3] scrollbar-thin">
          {children}
        </main>
      </div>
    </>
  );
}
