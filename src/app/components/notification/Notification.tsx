// "use client";
// import React, { useEffect, useState } from "react";
// import api from "@/app/api/axios"; // your axios instance
// import { Loader2 } from "lucide-react";

// interface Notification {
//   _id: string;
//   senderId: {
//     _id: string;
//     name: string;
//     email: string;
//   };
//   type: string;
//   action: string;
//   entityId: string;
//   createdAt: string;
// }

// interface Pagination {
//   page: number;
//   limit: number;
//   total: number;
//   totalPages: number;
// }

// const Notifications: React.FC<{ userId: string }> = ({ userId }) => {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [pagination, setPagination] = useState<Pagination | null>(null);
//   const [loading, setLoading] = useState(false);

//   const fetchNotifications = async (page = 1, limit = 5) => {
//     try {
//       setLoading(true);
//       const res = await api.get(`/notifications/${userId}`, {
//         params: { page, limit },
//       });
//       setNotifications(res.data.notifications);
//       setPagination(res.data.pagination);
//     } catch (error) {
//       console.error("Error fetching notifications:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (userId) fetchNotifications();
//   }, [userId]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center p-4">
//         <Loader2 className="animate-spin" />
//         <span className="ml-2">Loading notifications...</span>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 space-y-4">
//       <h2 className="text-xl font-semibold">Notifications</h2>

//       {notifications.length === 0 ? (
//         <p className="text-gray-500">No notifications</p>
//       ) : (
//         <ul className="space-y-3">
//           {notifications.map((n) => (
//             <li
//               key={n._id}
//               className="p-3 border rounded-lg shadow-sm bg-white"
//             >
//               <p className="font-medium">{n.senderId?.name || "Unknown User"}</p>
//               <p className="text-sm text-gray-600">
//                 {n.type} - {n.action}
//               </p>
//               <p className="text-xs text-gray-400">
//                 {new Date(n.createdAt).toLocaleString()}
//               </p>
//             </li>
//           ))}
//         </ul>
//       )}

//       {/* Pagination */}
//       {pagination && pagination.totalPages > 1 && (
//         <div className="flex justify-between items-center mt-4">
//           <button
//             className="px-3 py-1 border rounded disabled:opacity-50"
//             disabled={pagination.page === 1}
//             onClick={() => fetchNotifications(pagination.page - 1)}
//           >
//             Prev
//           </button>
//           <span>
//             Page {pagination.page} of {pagination.totalPages}
//           </span>
//           <button
//             className="px-3 py-1 border rounded disabled:opacity-50"
//             disabled={pagination.page === pagination.totalPages}
//             onClick={() => fetchNotifications(pagination.page + 1)}
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Notifications;

// "use client";

// import React, { useEffect, useState } from "react";
// import api from "@/app/api/axios"; // your axios instance
// import { Loader2, Bell, AlertCircle } from "lucide-react";

// interface Notification {
//   _id: string;
//   message: string;
//   createdAt: string;
//   senderId?: {
//     name: string;
//     email: string;
//   };
// }

// interface Pagination {
//   page: number;
//   limit: number;
//   total: number;
//   totalPages: number;
// }

// const Notifications: React.FC<{ userId: string }> = ({ userId }) => {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [pagination, setPagination] = useState<Pagination | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string>("");

//   const fetchNotifications = async (page: number = 1) => {
//     try {
//       setLoading(true);
//       setError("");

//       const res = await api.get(`/notification/${userId}`, {
//         params: { page, limit: 5 },
//       });

//       setNotifications(res.data.notifications);
//       setPagination(res.data.pagination);
//     } catch (err: any) {
//       setError(err.response?.data?.error || "Failed to load notifications");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (userId) fetchNotifications(1);
//   }, [userId]);

//   return (
//     <div className="p-4 max-w-md mx-auto">
//       <h2 className="text-xl font-bold flex items-center gap-2">
//         <Bell className="w-5 h-5" /> Notifications
//       </h2>

//       {loading && <Loader2 className="animate-spin mt-4" />}
//       {error && (
//         <p className="text-red-500 flex items-center gap-1 mt-2">
//           <AlertCircle className="w-4 h-4" /> {error}
//         </p>
//       )}

//       {!loading && !error && notifications.length === 0 && (
//         <p className="text-gray-500 mt-4">No notifications found</p>
//       )}

//       <ul className="mt-4 space-y-3">
//         {notifications.map((n) => (
//           <li
//             key={n._id}
//             className="bg-gray-100 p-3 rounded-xl shadow-sm text-sm"
//           >
//             <p>{n.message}</p>
//             <p className="text-xs text-gray-500">
//               From: {n.senderId?.name || "System"} •{" "}
//               {new Date(n.createdAt).toLocaleString()}
//             </p>
//           </li>
//         ))}
//       </ul>

//       {/* Pagination controls */}
//       {pagination && pagination.totalPages > 1 && (
//         <div className="flex justify-between items-center mt-4">
//           <button
//             onClick={() => fetchNotifications(pagination.page - 1)}
//             disabled={pagination.page === 1}
//             className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
//           >
//             Previous
//           </button>
//           <span className="text-sm">
//             Page {pagination.page} of {pagination.totalPages}
//           </span>
//           <button
//             onClick={() => fetchNotifications(pagination.page + 1)}
//             disabled={pagination.page === pagination.totalPages}
//             className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Notifications;
"use client";

import React, { useEffect, useState } from "react";
import api from "@/app/api/axios";
import { Loader2, Bell, AlertCircle } from "lucide-react";

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
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load notifications");
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
