"use client";

import React, { useCallback, useEffect, useState } from "react";
import api from "@/app/api/axios";
import { Loader2, Bell, Clock, User } from "lucide-react";
import { AxiosError } from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

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
  const user = useSelector((state: RootState) => state.user.user)


  const fetchNotifications = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(`/notification/${user?.id}`, {
        params: { page, limit: 12 },
      });

      setNotifications(res.data.notifications);
      setPagination(res.data.pagination);
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error: string }>;
      setError(axiosErr.response?.data?.error || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [user?.id])

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

    const handleMarkAsRead = useCallback(async () => {
    try {
      await api.patch(`/notification/user/${user?.id}/read-all`)
      fetchNotifications(pagination?.page || 1)
    } catch (err) {
      const axiosErr = err as AxiosError<{ error: string }>;
      setError(axiosErr.response?.data?.error || "Failed to load notifications");
    }
  }, [user?.id, fetchNotifications, pagination?.page])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className=" mx-auto p-6">
        <div className="bg-white  border border-[#ddd] rounded-md  mb-6">
          <div className="p-4 flex justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500 rounded-md shadow-lg">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-white">
                  Notifications
                </h1>
              </div>
            </div>
            <button onClick={handleMarkAsRead} className="py-2 px-4 border border-green-200 rounded font-semibold bg-green-100 cursor-pointer">
              Mark as read
            </button>
          </div>
        </div>

        {loading && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-8">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="animate-spin w-6 h-6 text-blue-500" />
              <span className="text-gray-600 font-medium">Loading notifications...</span>
            </div>
          </div>
        )}


        {!loading && !error && notifications.length === 0 && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-12 text-center">
            <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Bell className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No notifications yet</h3>
            <p className="text-gray-500">When you have new notifications, they&apos;ll appear here.</p>
          </div>
        )}

        {notifications.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`group relative overflow-hidden rounded-lg border ${
                  notification.isRead
                    ? "bg-[#f2f2f2] border-gray-300"
                    : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50  ring-1 ring-blue-500/10"
                }`}
              >
                <div className="py-2 px-4">
                  <div className="mb-4">
                    <p className="text-gray-800 font-medium leading-relaxed line-clamp-3">
                      {notification.description}
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-white rounded-lg">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">
                        {notification.senderId?.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {notification.senderId?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(notification.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
            <div className="flex justify-between items-center">
              <button
                onClick={() => fetchNotifications(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:from-gray-50 disabled:to-gray-50 disabled:text-gray-400 text-gray-700 font-medium rounded-xl transition-all duration-200 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                Previous
              </button>
              
              <div className="flex items-end gap-2">
                <span className="  text-black font-semibold text-2xl">
                  {pagination.page}
                </span>
                <span className="text-gray-500 font-medium">/ {pagination.totalPages}</span>
              </div>
              
              <button
                onClick={() => fetchNotifications(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:from-gray-50 disabled:to-gray-50 disabled:text-gray-400 text-gray-700 font-medium rounded-xl transition-all duration-200 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
