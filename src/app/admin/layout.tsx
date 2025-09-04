"use client";

import React, { useState, useEffect, ReactNode, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import DraggableMessenger from "../components/messenger/DraggableMessenger";
import { Bell } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import api from "../api/axios";
import { clearUser } from "../store/userSlice";
import { useDispatch } from "react-redux";


interface MainContainerProps {
  children: ReactNode;
}


export interface Notification {
  id: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}



export default function RootLayout({ children }: MainContainerProps) {
  const pathname = usePathname();
  const router = useRouter()
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.user.user)
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

const checkUnreadNotifications = useCallback(async () => {
  if (!user?.id) return;

  try {
    const res = await api.get(`/notification/${user.id}`, { params: { page: 1, limit: 50 } });
    const notifications = res.data.notifications;

    const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;
    setUnreadNotificationCount(unreadCount);
  } catch (error) {
    console.error("Failed to fetch notifications", error);
  }
}, [user?.id])

useEffect(() => {
  if (user?.id) {
    checkUnreadNotifications();
    const interval = setInterval(checkUnreadNotifications, 30000);
    return () => clearInterval(interval);
  }
}, [user?.id, checkUnreadNotifications]);


  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(clearUser());

    sessionStorage.setItem("logoutMessage", "Logged out successfully!");
    router.push('/')
  };

  if (user?.role !== "admin") return children;

  return (
    <>
      <header>
        <nav className="bg-white p-2 border-b border-b-[#dddddd] flex justify-between fixed w-full px-5 z-50">
          <div>
            <Image src="/Logo.png" alt="Logo image" width={100} height={35} />
          </div>
          <div className="flex items-center gap-6">
            <Link href="/admin/notification" className="relative">
              <Bell size={22} className="cursor-pointer" />
              {unreadNotificationCount > 0 && (
                <div className="absolute -top-2 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white">{unreadNotificationCount}</span>
                </div>
              )}
            </Link>
            <div>
              <Image
              src="/avatar.png"
              alt="Logo image"
              width={40}
              height={40}
              className="rounded-full"
            />
            </div>
            <h4 className="font-semibold uppercase tracking-[.1rem]">Admin</h4>
          </div>
        </nav>
      </header>

      <div className="flex pt-13 relative" style={{ height: "100vh" }}>
        <nav className="w-30 md:w-50 border-r border-r-[#dddddd] flex flex-col justify-between p-4 bg-white ">
          <ul className="flex flex-col gap-1">
            <Link
              href={"/admin/dashboard"}
              className={` w-full py-1 md:py-2 px-2 md:px-4 text-sm md:text-base rounded ${
                pathname === "/admin/dashboard" ? "bg-black text-white" : ""
              }`}
            >
              Dashboard
            </Link>
            <Link
              href={"/admin/Project/projects"}
              className={` w-full py-1 md:py-2 px-2 md:px-4 text-sm md:text-base rounded ${
                pathname === "/admin/Project/projects"
                  ? "bg-black text-white"
                  : ""
              }`}
            >
              Projects
            </Link>
            <Link
              href={"/admin/managers/manager"}
              className={` w-full py-1 md:py-2 px-2 md:px-4 text-sm md:text-base rounded ${
                pathname === "/admin/managers/manager"
                  ? "bg-black text-white"
                  : ""
              }`}
            >
              Managers
            </Link>
            <Link
              href={"/admin/managers/dailyReport"}
              className={` w-full py-1 md:py-2 px-2 md:px-4 text-sm md:text-base rounded ${
                pathname === "/admin/managers/dailyReport"
                  ? "bg-black text-white"
                  : ""
              }`}
            >
              Managers Report
            </Link>
            <Link
              href={"/admin/employee"}
              className={` w-full py-1 md:py-2 px-2 md:px-4 text-sm md:text-base rounded ${
                pathname === "/admin/employee" ? "bg-black text-white" : ""
              }`}
            >
              Employees
            </Link>
            <Link
              href={"/admin/todays-leave"}
              className={` w-full py-1 md:py-2 px-2 md:px-4 text-sm md:text-base rounded ${
                pathname === "/admin/todays-leave" ? "bg-black text-white" : ""
              }`}
            >
              Leave Status
            </Link>
            <Link
              href={"/admin/paylips"}
              className={` w-full py-1 md:py-2 px-2 md:px-4 text-sm md:text-base rounded ${
                pathname === "/admin/paylips" ? "bg-black text-white" : ""
              }`}
            >
              Payslip
            </Link>
            <Link
              href={"/admin/mail"}
              className={` w-full py-1 md:py-2 px-2 md:px-4 text-sm md:text-base rounded ${
                pathname === "/admin/mail" ? "bg-black text-white" : ""
              }`}
            >
              Mail
            </Link>
          </ul>
          <button
            onClick={logout}
            className="py-2 mx-2 text-sm md:text-base border mb-2"
          >
            LogOut
          </button>
        </nav>
        <div>
          <DraggableMessenger role="admin" />
        </div>
        <main className="flex-1 p-6 overflow-auto bg-[#f3f3f3] scrollbar-thin">
          {children}
        </main>
      </div>
    </>
  );
}
