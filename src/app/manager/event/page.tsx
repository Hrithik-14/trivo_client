"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import api from "@/app/api/axios";

interface Alert {
  _id?: string;
  forUsers?: string[];
  message: string;
  image?: string;
  name?: string;
  destination?: string;
}

const AlertCard: React.FC<{ alert: Alert }> = ({ alert }) => {
  return (
    <div className="rounded-lg w-full shadow-md border border-gray-200 p-6 mb-4 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center gap-4">
        {alert.image && (
          <div className="relative flex-shrink-0 w-20 h-20">
            <Image
              src={alert.image || '/avatar.png'}
              alt="Alert image"
              fill
              className="rounded-md object-cover"
            />
          </div>
        )}
        <div className="flex">
          <p className="font-semibold text-md text-gray-800 mb-3">
            {alert.message}
          </p>
        </div>
      </div>
    </div>
  );
};

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserId(parsedUser?.id || parsedUser?._id || "");
      } catch (e) {
        console.error("Invalid user object in localStorage", e);
      }
    }
  }, []);

useEffect(() => {
  if (!userId) return;

  const fetchAlerts = async () => {
    try {
      const res1 = await api.get<Alert[]>(`/alerts/${userId}`);
      const normalAlerts = res1.data ?? [];

      const res2 = await api.get<Alert[]>(`/alerts/birthday/today`);
      console.log(res2);
      
      const birthdayUsers = res2.data ?? [];
      

      const birthdayAlerts = birthdayUsers.map((user) => ({
        message: `🎉 Today is ${user.name}'s birthday!`,
        image: user.image || "/avatar.png",
        forUsers: [userId],
      }));

      const res3 = await api.get<Alert[]>(`/alerts/yearly/today`);
      const yearlyUsers = res3.data ?? [];
      const yearlyAlerts = yearlyUsers.map((user) => ({
        message: `🎊 Today is ${user.name}'s work anniversary!`,
        image: user.image || "/avatar.png",
        forUsers: [userId],
      }));

      const merged = [
        ...normalAlerts,
        ...birthdayAlerts,
        ...yearlyAlerts,
      ];

      setAlerts(merged);
    } catch (err) {
      console.error("Error fetching alerts", err);
    }
  };

  fetchAlerts();
}, [userId]);


  const userAlerts = alerts.filter(
    (alert) =>
      Array.isArray(alert.forUsers) &&
      alert.forUsers.some((u) => String(u) === String(userId))
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">  My Alerts</h2>
          <p className="text-gray-600">
            Stay updated with your personalized notifications
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {userAlerts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center col-span-3">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No alerts for you
              </h3>
              <p className="text-gray-500">
                You&apos;re all caught up! Check back later for new notifications.
              </p>
            </div>
          ) : (
            userAlerts.map((alert, idx) => (
              <AlertCard key={alert._id || idx} alert={alert} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Alerts;
