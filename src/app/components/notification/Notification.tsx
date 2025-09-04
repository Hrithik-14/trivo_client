"use client";

import React, { useEffect, useState } from "react";
import api from "@/app/api/axios";
import { Loader2, Bell, AlertCircle } from "lucide-react";
import { AxiosError } from "axios";

interface Notification {
  _id: string;
  senderId: {
    _id: string;
    name: string;
    email: string;
  };
  receiverId: string;
  type: string;
  action: string;
  entityId: string;
  description: string;
  isRead: boolean;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setError("User not found. Please log in again.");
        return;
      }

      const user = JSON.parse(storedUser);
      const userId = user._id || user.id;

      const res = await api.get(`/notification/${userId}`, {
        params: { page, limit: 5 },
      });

      setNotifications(res.data.notifications);
      setPagination(res.data.pagination);
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error: string }>;
      setError(axiosErr.response?.data?.error || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
  }, []);

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Bell className="w-5 h-5" /> Notifications
      </h2>

      {loading && (
        <div className="flex items-center gap-2 mt-4">
          <Loader2 className="animate-spin" />
          <span>Loading notifications...</span>
        </div>
      )}

      {error && (
        <p className="text-red-500 flex items-center gap-1 mt-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </p>
      )}

      {!loading && !error && notifications.length === 0 && (
        <p className="text-gray-500 mt-4">No notifications found</p>
      )}

      <ul className="mt-4 space-y-3">
        {notifications.map((n) => (
          <li
            key={n._id}
            className={`p-3 rounded-xl shadow-sm text-sm ${
              n.isRead ? "bg-gray-100" : "bg-blue-100"
            }`}
          >
            <p className="font-medium">{n.description} </p>
            <p className="text-xs text-gray-500">
             {n.senderId?.name} ({n.senderId?.email}) •{" "}
              {new Date(n.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => fetchNotifications(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => fetchNotifications(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
