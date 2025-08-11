'use client'

import React, { useState, useEffect, ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import toast from "react-hot-toast"
import { Bell } from "lucide-react"



const LiveClock = () => {
    const [dates, setDates] = useState<string>('');
    const [times, setTimes] = useState<string>('');

    useEffect(() => {
        const updateTime = () => {
        const now = new Date();

        const hours = now.getHours() % 12 || 12;
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const ampm = now.getHours() >= 12 ? 'PM' : 'AM';

        const day = now.getDate().toString().padStart(2, '0');
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const year = now.getFullYear();
        const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });

        const formatted = `${hours}:${minutes}:${seconds} ${ampm} `
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
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const parsed = storedUser ? JSON.parse(storedUser) : null;
        setRole(parsed?.role || null);
        console.log(storedUser);
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully!');
        window.location.href = '/auth/login';
    };
    

    if (role !== "employee") return children

    return (
        <>
            <header>
                <nav className="bg-white p-2 border-b border-b-[#dddddd] flex justify-between fixed w-full px-5">
                    <div>
                    <Image src="/Logo.png" alt="Logo image" width={100} height={35} />
                    </div>
                    <div className="flex items-center gap-6">
                        <Bell size={18} />
                        <LiveClock />
                    </div>
                </nav>
                </header>

                <div className="flex pt-13" style={{ height: "100vh" }}>
                <nav className="w-30 md:w-50 border-r border-r-[#dddddd] flex flex-col justify-between p-4 bg-white ">
                    <ul className="flex flex-col gap-1">
                    <Link
                        href={"/employee/dashboard"}
                        className={` w-fit py-1 md:py-2 px-2 md:px-4 text-sm md:text-base rounded ${
                        pathname === "/employee/dashboard" ? "bg-black text-white" : ""
                        }`}
                    >
                        Dashboard
                    </Link>
                    <Link
                        href={""}
                        className={` w-fit py-1 md:py-2 px-2 md:px-4 text-sm md:text-base rounded ${
                        pathname === "" ? "bg-black text-white" : ""
                        }`}
                    >
                        Projects
                    </Link>
                    <Link
                        href={""}
                        className={` w-fit py-1 md:py-2 px-2 md:px-4 text-sm md:text-base rounded ${
                        pathname === "" ? "bg-black text-white" : ""
                        }`}
                    >
                        Daily Reports
                    </Link>
                    <Link
                        href={""}
                        className={` w-fit py-1 md:py-2 px-2 md:px-4 text-sm md:text-base rounded ${
                        pathname === "" ? "bg-black text-white" : ""
                        }`}
                    >
                        Attendance
                    </Link>
                    <Link
                        href={""}
                        className={` w-fit py-1 md:py-2 px-2 md:px-4 text-sm md:text-base rounded ${
                        pathname === "" ? "bg-black text-white" : ""
                        }`}
                    >
                        Messenger
                    </Link>
                    
                    </ul>
                    <button onClick={logout} className="py-2 mx-2 text-sm md:text-base border mb-2">
                    LogOut
                    </button>
                </nav>

                <main className="flex-1 p-6 overflow-auto bg-[#f3f3f3] scrollbar-thin">{children}</main>
            </div>
        </>
    )
}
