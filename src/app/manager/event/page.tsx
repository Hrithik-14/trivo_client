
"use client";
import React, { useEffect, useState } from "react";
import api from "@/app/api/axios";

interface Alert {
  _id: string;
  forUsers?: string[]; // make optional to avoid runtime crash
  message: string;
}

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    // ✅ Get user object from localStorage
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
        const res = await api.get(`/alerts/${userId}`);

        // ✅ If your controller returns { success, alerts: [...] }
        const data = res.data?.alerts ?? res.data;

        // Ensure always an array
        const safeData = Array.isArray(data) ? data : [data];
        setAlerts(safeData);
      } catch (err) {
        console.error("Error fetching alerts", err);
      }
    };

    fetchAlerts();
  }, [userId]);

  // ✅ Safe filter: check if forUsers is an array before using includes
  const userAlerts = alerts.filter(
    (alert) => Array.isArray(alert.forUsers) && alert.forUsers.includes(userId)
  );

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">📢 My Alerts</h2>

      {userAlerts.length === 0 ? (
        <p>No alerts for you.</p>
      ) : (
        userAlerts.map((alert) => (
          <div
            key={alert._id}
            className="border rounded-lg shadow p-4 mb-4 bg-white"
          >
            <p className="font-semibold text-lg">{alert.message}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Alerts;
