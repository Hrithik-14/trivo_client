"use client";

<<<<<<< HEAD
import React, { useState, FC } from "react";
import { Rnd } from "react-rnd";
import { MessageCircle, X } from "lucide-react";
import MessengerFixed from "./MessengerFixed";
=======
import React, { useState, FC, useEffect } from "react";
import { Rnd } from "react-rnd";
import { MessageCircle, X } from "lucide-react";
import Messenger from "./Messenger";
import api from '@/app/api/axios';
>>>>>>> dfe7477912a8dfb92f3a894db5409725529e61f1

interface DraggableMessengerProps {
  role: "admin" | "manager" | "employee";
}

<<<<<<< HEAD
=======
interface Message {
  _id: string;
  content: string;
  createdAt: string;
  senderId: {
    _id: string;
    name: string;
    email: string;
    profileImage: string;
  };
  groupId?: string;
  readBy: string[];
}

>>>>>>> dfe7477912a8dfb92f3a894db5409725529e61f1
const SIDEBAR_WIDTH = 300;

const DraggableMessenger: FC<DraggableMessengerProps> = ({ role }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: SIDEBAR_WIDTH + 20, y: 20 });
<<<<<<< HEAD

  return (
    <>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed z-50 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 hover:scale-110"
=======
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    if (storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        setCurrentUserId(payload.id);
      } catch (error) {
        console.error("Failed to parse token", error);
      }
    }
  }, []);

  const checkUnreadMessages = async () => {
    if (!token || !currentUserId) return;

    try {
      const groupsRes = await api.get('/group/my', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const groups = groupsRes.data;
      let totalUnreadCount = 0;

      for (const group of groups) {
        try {
          const messagesRes = await api.get(`/group/${group._id}/messages`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const unreadCount = messagesRes.data.filter((message: Message) => 
            message.groupId === group._id && 
            message.senderId._id !== currentUserId && 
            !message.readBy.includes(currentUserId)
          ).length;

          totalUnreadCount += unreadCount;
        } catch (error) {
          console.error(`Failed to check messages for group ${group._id}`, error);
        }
      }

      setHasUnreadMessages(totalUnreadCount > 0);
    } catch (error) {
      console.error("Failed to check unread messages", error);
    }
  };

  useEffect(() => {
    if (token && currentUserId) {
      checkUnreadMessages();
      
      const interval = setInterval(checkUnreadMessages, 30000);
      return () => clearInterval(interval);
    }
  }, [token, currentUserId]);

  const handleToggleOpen = () => {
    setIsOpen((prev) => {
      const newIsOpen = !prev;
      if (newIsOpen) {
        setHasUnreadMessages(false);
      }
      return newIsOpen;
    });
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggleOpen}
        className="fixed z-50 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 hover:scale-110 "
>>>>>>> dfe7477912a8dfb92f3a894db5409725529e61f1
        style={{ right: 20, bottom: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
        title="Open Messenger"
      >
        <MessageCircle size={24} />
<<<<<<< HEAD
=======
        {hasUnreadMessages && !isOpen && (
          <div className="absolute -top-0 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse">
            <div className="w-full h-full bg-red-500 rounded-full animate-ping"></div>
          </div>
        )}
>>>>>>> dfe7477912a8dfb92f3a894db5409725529e61f1
      </button>

      {isOpen && (
        <Rnd
          size={{ width: 400, height: 500 }}
          position={position}
<<<<<<< HEAD
          bounds="window" // <-- restrict drag inside viewport
=======
          bounds="window"
>>>>>>> dfe7477912a8dfb92f3a894db5409725529e61f1
          onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
          enableResizing={false}
          dragHandleClassName="drag-handle"
          className="fixed z-50 bg-white rounded-lg shadow-2xl"
        >
          <div className="flex flex-col h-full">
            <div className="drag-handle bg-blue-500 text-white px-4 py-2 rounded-t-lg flex items-center justify-between">
              <h3 className="font-semibold text-sm">Messenger</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-blue-600 p-1 rounded"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
<<<<<<< HEAD
              <MessengerFixed role={role} />
=======
              <Messenger role={role} />
>>>>>>> dfe7477912a8dfb92f3a894db5409725529e61f1
            </div>
          </div>
        </Rnd>
      )}
<<<<<<< HEAD
    </>
  );
};

export default DraggableMessenger;
=======
    </div>
  );
};

export default DraggableMessenger;
>>>>>>> dfe7477912a8dfb92f3a894db5409725529e61f1
