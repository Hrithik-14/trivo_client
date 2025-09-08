"use client";

import React, { useState, useEffect, ReactNode, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import DraggableMessenger from "../components/messenger/DraggableMessenger";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import api from "../api/axios";
import { clearUser } from "../store/userSlice";

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

    updateTime();
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

export interface Notification {
  id: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export default function RootLayout({ children }: MainContainerProps) {
  const pathname = usePathname();

  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const checkUnreadNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const res = await api.get(`/notification/${user.id}`, {
        params: { page: 1, limit: 50 },
      });
      const notifications = res.data.notifications;

      const unreadCount = notifications.filter(
        (n: Notification) => !n.isRead
      ).length;
      setUnreadNotificationCount(unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  }, [user?.id]);

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
    router.push("/");
  };

  if (user?.role !== "employee") return children;

  return (
    <>
      <header>
        <nav className="bg-white p-2 border-b border-b-[#dddddd] flex justify-between fixed w-full px-5 z-20">
          <div>
            <Image src="/Logo.png" alt="Logo image" width={100} height={35} />
          </div>
          <div className="flex items-center gap-6">
            <Link href="/employee/notification" className="cursor-pointer relative">
              <Bell size={22} className="cursor-pointer relative" />
              {unreadNotificationCount > 0 && (
                <div className="absolute -top-2 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white">
                    {unreadNotificationCount}
                  </span>
                </div>
              )}
            </Link>
            <LiveClock />
          </div>
        </nav>
      </header>

      <div className="flex pt-13 relative" style={{ height: "100vh" }}>
        <nav className="w-30 md:w-50 border-r border-r-[#dddddd] flex flex-col justify-between p-4 bg-white ">
          <div className="flex flex-col">
            <Link
              href={"/employee/profile"}
              className="border-b border-[#ddd] mb-6"
            >
              <div className="flex items-center gap-3 p-3 rounded-lg">
                <div className="w-14 h-14 rounded-full relative overflow-hidden bg-gray-200 flex-shrink-0">
                  <Image
                    src={user?.profileImage || "/avatar.png"}
                    alt=""
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-gray-800">
                    {user?.name || "MINHAJ"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {user?.employeeCode || "N/A"}
                  </span>
                </div>
              </div>
            </Link>
            <ul className="flex flex-col gap-1">
              <Link
                href={"/employee/dashboard"}
                className={` w-full py-1 md:py-2 px-2 md:px-4 text-sm md:text-base rounded ${
                  pathname === "/employee/dashboard"
                    ? "bg-black text-white"
                    : ""
                }`}
              >
                Dashboard
              </Link>
              <Link
                href={"/employee/projects/project"}
                className={` w-full py-1 md:py-2 px-2 md:px-4 text-sm md:text-base rounded ${
                  pathname === "/employee/projects/project"
                    ? "bg-black text-white"
                    : ""
                }`}
              >
                Projects
              </Link>
              <Link
                href={"/employee/daily-reports"}
                className={` w-full py-1 md:py-2 px-2 md:px-4 text-sm md:text-base rounded ${
                  pathname === "/employee/daily-reports"
                    ? "bg-black text-white"
                    : ""
                }`}
              >
                Daily Reports
              </Link>
              <Link
                href={"/employee/attendance"}
                className={` w-full py-1 md:py-2 px-2 md:px-4 text-sm md:text-base rounded ${
                  pathname === "/employee/attendance"
                    ? "bg-black text-white"
                    : ""
                }`}
              >
                Attendance
              </Link>
              <Link
                href={"/employee/events"}
                className={` w-full py-1 md:py-2 px-2 md:px-4 text-sm md:text-base rounded ${
                  pathname === "/employee/events" ? "bg-black text-white" : ""
                }`}
              >
                Event
              </Link>
            </ul>
          </div>

          <button
            onClick={logout}
            className="py-2 mx-2 text-sm md:text-base border mb-2"
          >
            LogOut
          </button>
        </nav>

        <div>
          <DraggableMessenger role="employee" />
        </div>

        <main className="flex-1 p-6 overflow-auto bg-[#f3f3f3] scrollbar-thin">
          {children}
        </main>
      </div>
    </>
  );
}
