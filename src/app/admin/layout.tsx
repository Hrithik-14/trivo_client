'use client'

import React, { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"


export default function RootLayout({ children }: { children: React.ReactNode }) {
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
        alert('Logged out successfully!');
        window.location.href = '/auth/login';
    };
    

    if (role !== "admin") return children

    return (
        <>
            <header>
                <nav className="bg-white p-2 border-b border-b-[#dddddd] flex justify-between fixed w-full px-5">
                    <div>
                    <Image src="/Logo.png" alt="Logo image" width={100} height={35} />
                    </div>
                    <div className="flex items-center gap-4">
                    <Image
                        src="/avatar.png"
                        alt="Logo image"
                        width={40}
                        height={40}
                        className="rounded-full"
                    />
                    <h4 className="font-semibold uppercase tracking-[.1rem]">Admin</h4>
                    </div>
                </nav>
                </header>

                <div className="flex pt-13" style={{ height: "100vh" }}>
                <nav className="w-50 border-r border-r-[#dddddd] flex flex-col justify-between p-4 bg-white ">
                    <ul className="flex flex-col gap-1">
                    <Link
                        href={"/admin/dashboard"}
                        className={` w-fit py-2 px-4  rounded ${
                        pathname === "/admin/dashboard" ? "bg-black text-white" : ""
                        }`}
                    >
                        Dashboard
                    </Link>
                    <Link
                        href={"/admin/Project/projects"}
                        className={` w-fit py-2 px-4  rounded ${
                        pathname === "/admin/Project/projects" ? "bg-black text-white" : ""
                        }`}
                    >
                        Projects
                    </Link>
                    <Link
                        href={"/admin/managers/manager"}
                        className={` w-fit py-2 px-4  rounded ${
                        pathname === "/admin/managers/manager" ? "bg-black text-white" : ""
                        }`}
                    >
                        Managers
                    </Link>
                    <Link
                        href={"/admin/managers/dailyReport"}
                        className={` w-fit py-2 px-4  rounded ${
                        pathname === "/admin/managers/dailyReport" ? "bg-black text-white" : ""
                        }`}
                    >
                        Managers Report
                    </Link>
                    <Link
                        href={"/admin/employee"}
                        className={` w-fit py-2 px-4  rounded ${
                        pathname === "/admin/employee" ? "bg-black text-white" : ""
                        }`}
                    >
                        Employees
                    </Link>
                    <li className="w-fit py-2 px-4 rounded">Messenger</li>
                    <Link
                        href={"/admin/paylips"}
                        className={` w-fit py-2 px-4  rounded ${
                        pathname === "/admin/paylips" ? "bg-black text-white" : ""
                        }`}
                    >
                        Payslip
                    </Link>
                    <Link
                        href={"/admin/mail"}
                        className={` w-fit py-2 px-4  rounded ${
                        pathname === "/admin/mail" ? "bg-black text-white" : ""
                        }`}
                    >
                        Mail
                    </Link>
                    </ul>
                    <button onClick={logout} className="py-2 mx-2 border mb-2">
                    LogOut
                    </button>
                </nav>

                <main className="flex-1 p-6 overflow-auto bg-[#f3f3f3]">{children}</main>
            </div>
        </>
    )
}
