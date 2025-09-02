
// "use client";
// import React, { useEffect, useState } from "react";
// import api from "@/app/api/axios";

// interface Alert {
//   _id: string;
//   forUsers?: string[]; 
//   message: string;
// }

// const Alerts: React.FC = () => {
//   const [alerts, setAlerts] = useState<Alert[]>([]);
//   const [userId, setUserId] = useState<string>("");

//   useEffect(() => {
  
//     const storedUser = localStorage.getItem("user");
//     if (storedUser) {
//       try {
//         const parsedUser = JSON.parse(storedUser);
//         setUserId(parsedUser?.id || parsedUser?._id || ""); 
//       } catch (e) {
//         console.error("Invalid user object in localStorage", e);
//       }
//     }
//   }, []);

//   useEffect(() => {
//     if (!userId) return;

//     const fetchAlerts = async () => {
//       try {
//         const res = await api.get(`/alerts/${userId}`);

       
//         const data = res.data?.alerts ?? res.data;

//         // Ensure always an array
//         const safeData = Array.isArray(data) ? data : [data];
//         setAlerts(safeData);
//       } catch (err) {
//         console.error("Error fetching alerts", err);
//       }
//     };

//     fetchAlerts();
//   }, [userId]);


//   const userAlerts = alerts.filter(
//     (alert) => Array.isArray(alert.forUsers) && alert.forUsers.includes(userId)
//   );

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">📢 My Alerts</h2>

//       {userAlerts.length === 0 ? (
//         <p>No alerts for you.</p>
//       ) : (
//         userAlerts.map((alert) => (
//           <div
//             key={alert._id}
//             className="border rounded-lg shadow p-4 mb-4 bg-white"
//           >
//             <p className="font-semibold text-lg">{alert.message}</p>
//           </div>
//         ))
//       )}
//     </div>
//   );
// };

// export default Alerts;


// "use client";
// import React, { useEffect, useState } from "react";
// import { Bell, AlertCircle, Loader2 } from "lucide-react";
// import api from "@/app/api/axios";

// interface Alert {
//   _id: string;
//   forUsers?: string[];
//   message: string;
// }

// const Alerts: React.FC = () => {
//   const [alerts, setAlerts] = useState<Alert[]>([]);
//   const [userId, setUserId] = useState<string>("");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // ✅ Get user from localStorage
//     const storedUser = localStorage.getItem("user");
//     if (storedUser) {
//       try {
//         const parsedUser = JSON.parse(storedUser);
//         setUserId(parsedUser?.id || parsedUser?._id || "");
//       } catch (e) {
//         console.error("Invalid user object in localStorage", e);
//       }
//     }
//   }, []);

//   useEffect(() => {
//     if (!userId) return;

//     const fetchAlerts = async () => {
//       try {
//         const res = await api.get(`/alerts/${userId}`);
//         const data = res.data?.alerts ?? res.data;

//         // Ensure always array
//         const safeData = Array.isArray(data) ? data : [data];
//         setAlerts(safeData);
//       } catch (err) {
//         console.error("Error fetching alerts", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAlerts();
//   }, [userId]);

//   const userAlerts = alerts.filter(
//     (alert) => Array.isArray(alert.forUsers) && alert.forUsers.includes(userId)
//   );

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-6">
//         <div className="max-w-4xl mx-auto">
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
//             <div className="flex items-center justify-center space-x-3">
//               <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
//               <span className="text-gray-600 font-medium">Loading alerts...</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex items-center space-x-3 mb-2">
//             <div className="p-2 bg-blue-600 rounded-lg">
//               <Bell className="w-6 h-6 text-white" />
//             </div>
//             <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
//           </div>
//           <p className="text-gray-600">
//             Stay updated with your latest alerts and important information
//           </p>
//         </div>

//         {/* Alerts Container */}
//         <div className="space-y-4">
//           {userAlerts.length === 0 ? (
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
//               <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
//                 <Bell className="w-8 h-8 text-gray-400" />
//               </div>
//               <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                 No notifications yet
//               </h3>
//               <p className="text-gray-500">
//                 You're all caught up! New alerts will appear here when available.
//               </p>
//             </div>
//           ) : (
//             <>
//               {/* Alert Count */}
//               <div className="flex items-center justify-between mb-6">
//                 <div className="flex items-center space-x-2">
//                   <span className="text-sm font-medium text-gray-700">
//                     {userAlerts.length}{" "}
//                     {userAlerts.length === 1 ? "notification" : "notifications"}
//                   </span>
//                   <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
//                 </div>
//               </div>

//               {/* Alert Cards */}
//               {userAlerts.map((alert, index) => (
//                 <div
//                   key={alert._id}
//                   className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all duration-300 overflow-hidden"
//                   style={{
//                     animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
//                   }}
//                 >
//                   <div className="p-6">
//                     <div className="flex items-start space-x-4">
//                       <div className="flex-shrink-0 mt-1">
//                         <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
//                           <AlertCircle className="w-5 h-5 text-blue-600" />
//                         </div>
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <p className="text-gray-900 text-base leading-relaxed font-medium">
//                           {alert.message}
//                         </p>
//                         <div className="mt-3 flex items-center space-x-2">
//                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                             New
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//                 </div>
//               ))}
//             </>
//           )}
//         </div>

//         {/* Footer */}
//         {userAlerts.length > 0 && (
//           <div className="mt-8 text-center">
//             <div className="inline-flex items-center px-4 py-2 text-sm text-gray-500 bg-white rounded-lg border border-gray-200">
//               <Bell className="w-4 h-4 mr-2" />
//               All notifications loaded
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Custom animations */}
//       <style jsx>{`
//         @keyframes fadeInUp {
//           from {
//             opacity: 0;
//             transform: translateY(20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Alerts;


"use client";
import React, { useEffect, useState } from "react";
import { Bell, AlertCircle, Gift, Loader2 } from "lucide-react";
import api from "@/app/api/axios";

interface Alert {
  _id: string;
  forUsers?: string[];
  message: string;
}

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);

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
        const res = await api.get(`/alerts/${userId}`);
        const data = res.data?.alerts ?? res.data;
        const safeData = Array.isArray(data) ? data : [data];
        setAlerts(safeData);
      } catch (err) {
        console.error("Error fetching alerts", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [userId]);


  const birthdayAlerts = alerts.filter((a) =>
    a.message.toLowerCase().includes("birthday")
  );

  const otherAlerts = alerts.filter(
    (a) => !a.message.toLowerCase().includes("birthday")
  );

  const userAlerts = alerts.filter(
    (alert) => Array.isArray(alert.forUsers) && alert.forUsers.includes(userId)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            {/* <div className="p-2 bg-blue-600 rounded-lg">
              <Bell className="w-6 h-6 text-white" />
            </div> */}
            <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          </div>
          <p className="text-gray-600">
            Stay updated with your latest alerts and important information
          </p>
        </div>

        {/* 🎂 Birthday Alerts Section */}
        {birthdayAlerts.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-pink-600 mb-4 flex items-center">
              <Gift className="w-5 h-5 mr-2 text-pink-600" />
              Birthday Alerts
            </h2>
            <div className="space-y-4">
              {birthdayAlerts.map((alert) => (
                <div
                  key={alert._id}
                  className="bg-pink-100 border border-pink-200 rounded-xl p-5 shadow-sm"
                >
                  <p className="text-pink-800 font-medium">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🔔 Other Alerts Section */}
        <div className="space-y-4">
          {otherAlerts.length === 0 && birthdayAlerts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-500">
                You're all caught up! New alerts will appear here when available.
              </p>
            </div>
          ) : (
            otherAlerts.map((alert, index) => (
              <div
                key={alert._id}
                className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all duration-300 overflow-hidden"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                }}
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 text-base leading-relaxed font-medium">
                        {alert.message}
                      </p>
                      <div className="mt-3 flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          New
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Alerts;
