// "use client";

// import React, { useEffect, useState } from "react";
// import api from "@/app/api/axios";

// interface Notification {
//   _id: string;
//   senderId: { name: string; email: string };
//   type: string;
//   action: string;
//   entityId: string;
//   description: string;
//   createdAt: string;
// }

// const Notifications: React.FC = () => {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   useEffect(() => {
//     const fetchNotifications = async () => {
//       try {
//         // Read user object from localStorage
//         const user = localStorage.getItem("user");
//         if (!user) {
//           console.error("No user found in localStorage");
//           return;
//         }

//         const parsedUser = JSON.parse(user);
//         const userId = parsedUser.id; // 👈 use `id` from stored object

//         // Call backend API
//         const res = await api.get(
//           `/notification/${userId}`, // adjust baseURL
//           {
//             headers: {
//               Authorization: `Bearer ${parsedUser.token}`, // 👈 send token if needed
//             },
//           }
//         );

//         setNotifications(res.data.notifications || []);
//       } catch (err) {
//         console.error("Error fetching notifications:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchNotifications();
//   }, []);

//   if (loading) {
//     return <p className="text-gray-600">Loading notifications...</p>;
//   }

//   return (
//     <div className="p-4 max-w-lg ">
//       <h2 className="text-xl font-semibold mb-4 ">Notifications</h2>

//       {notifications.length === 0 ? (
//         <p className="text-gray-500">No notifications found.</p>
//       ) : (
//         <ul className="space-y-3">
//           {notifications.map((notif) => (
//             <li
//               key={notif._id}
//               className="border p-3 rounded-lg shadow-sm bg-white"
//             >
//               <p className="text-sm text-gray-700">
//                 <span className="font-medium">{notif.senderId?.name}</span>{" "}
//                 {notif.action} <span className="font-medium">{notif.type}</span>
//               </p>
//               <p className="text-gray-600 text-xs mt-1">{notif.description}</p>
//               <p className="text-gray-400 text-xs mt-1">
//                 {new Date(notif.createdAt).toLocaleString()}
//               </p>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default Notifications;

"use client";

import React, { useEffect, useState } from "react";
import { Bell, User, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/app/api/axios";

interface Notification {
  _id: string;
  senderId: { name: string; email: string };
  type: string;
  action: string;
  entityId: string;
  description: string;
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
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNotifications = async (page = 1) => {
    try {
      const user = localStorage.getItem("user");
      if (!user) {
        console.error("No user found in localStorage");
        return;
      }

      const parsedUser = JSON.parse(user);
      const userId = parsedUser.id;

      const res = await api.get(
        `/notification/${userId}?page=${page}&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${parsedUser.token}`,
          },
        }
      );

      setNotifications(res.data.notifications || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        <span className="ml-3 text-gray-600 font-medium">Loading notifications...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-100 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Bell className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
            {pagination && (
              <p className="text-sm text-gray-500 mt-1">
                {pagination.total} total notifications
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-3 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">You're all caught up! No new notifications to show.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className="group bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors duration-200 border border-transparent hover:border-gray-200"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 p-2 bg-white rounded-full shadow-sm group-hover:shadow-md transition-shadow duration-200">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-900 text-sm">
                        {notif.senderId?.name}
                      </span>
                      <span className="text-gray-600 text-sm">
                        {notif.action}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {notif.type}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                      {notif.description}
                    </p>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(notif.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="border-t border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchNotifications(pagination.page - 1)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors duration-200"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                Page {pagination.page}
              </span>
              <span className="text-sm text-gray-500">of</span>
              <span className="text-sm font-medium text-gray-900">
                {pagination.totalPages}
              </span>
            </div>
            
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchNotifications(pagination.page + 1)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors duration-200"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;