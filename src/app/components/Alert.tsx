import React, { useEffect, useState } from "react";

import { Dialog } from "@headlessui/react"; // for modal
import api from "../api/axios";

interface Alert {
  _id: string;
  message: string;
  createdAt: string;
  forUsers: string[];
}

interface Props {
  userId: string; // pass the logged-in user's ID
}

const AlertsModal: React.FC<Props> = ({ userId }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch alerts for this user
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.get(`/alerts/${userId}`);
        setAlerts(res.data || []);
      } catch (err) {
        console.error("❌ Failed to fetch alerts:", err);
      }
    };

    fetchAlerts();
  }, [userId]);

  return (
    <div>
      {/* Button to open modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        Alerts
        {alerts.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-xs text-white rounded-full w-5 h-5 flex items-center justify-center">
            {alerts.length}
          </span>
        )}
      </button>

      {/* Modal */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6">
            <Dialog.Title className="text-lg font-semibold mb-4">🔔 Alerts</Dialog.Title>

            {alerts.length === 0 ? (
              <p className="text-gray-500">No new alerts 🎉</p>
            ) : (
              <ul className="space-y-3">
                {alerts.map((alert) => (
                  <li
                    key={alert._id}
                    className="bg-gray-100 p-3 rounded-lg shadow-sm"
                  >
                    {alert.message}
                    <p className="text-xs text-gray-400">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg"
            >
              Close
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default AlertsModal;
