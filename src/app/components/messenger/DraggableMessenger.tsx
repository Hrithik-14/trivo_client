/* eslint-disable react-hooks/exhaustive-deps */
"use client";


import React, { useState, FC, useEffect } from "react";
import { Rnd } from "react-rnd";
import { MessageCircle, X } from "lucide-react";
import Messenger from "./Messenger";
import api from '@/app/api/axios';
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import ClientPortal from "../project/ClientPortal";

interface DraggableMessengerProps {
  role: "admin" | "manager" | "employee";
}


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

const SIDEBAR_WIDTH = 300;

const DraggableMessenger: FC<DraggableMessengerProps> = ({ role }) => {
  const [isOpen, setIsOpen] = useState(false);
  const width = 500;
  const height = 600;
  const [position, setPosition] = useState<{ x: number; y: number } | undefined>(undefined);
  const [unreadChatCount, setUnreadChatCount] = useState(0);  const [currentUserId, setCurrentUserId] = useState<string>("");
  const user = useSelector((state: RootState) => state.user.user)


  useEffect(() => {
    if (isOpen) {
      setPosition({
        x: (window.innerWidth - width) / 2,
        y: (window.innerHeight - height) / 2,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    

    if (user) {
      try {
        setCurrentUserId(user?.id);
      } catch (error) {
        console.error("Failed to parse token", error);
      }
    }
  }, []);

const checkUnreadMessages = async () => {
  if (!user?.token || !currentUserId) return;

  try {
    const groupsRes = await api.get('/group/my', {
      headers: { Authorization: `Bearer ${user?.token}` }
    });

    const groups = groupsRes.data;
    const unreadChats = new Set<string>();

    for (const group of groups) {
      try {
        const messagesRes = await api.get(`/group/${group._id}/messages`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });

        const hasUnread = messagesRes.data.some((message: Message) =>
          message.groupId === group._id &&
          message.senderId._id !== currentUserId &&
          !message.readBy.includes(currentUserId)
        );

        if (hasUnread) {
          unreadChats.add(group._id);
        }
      } catch (error) {
        console.error(`Failed to check messages for group ${group._id}`, error);
      }
    }

    const conversationsRes = await api.get('/chat/conversations', {
      headers: { Authorization: `Bearer ${user?.token}` }
    });

    const conversations = conversationsRes.data;

    for (const conv of conversations) {
      try {
        const messagesRes = await api.get(`/chat/${conv._id}/messages`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });

        const hasUnread = messagesRes.data.some((message: Message) =>
          message.senderId._id !== currentUserId &&
          !message.readBy.includes(currentUserId)
        );

        if (hasUnread) {
          unreadChats.add(conv._id);
        }
      } catch (error) {
        console.error(`Failed to check personal messages for user ${conv._id}`, error);
      }
    }

    setUnreadChatCount(unreadChats.size);
    console.log("Unread chats:", unreadChats.size);

  } catch (error) {
    console.error("Failed to check unread messages", error);
  }
};


  useEffect(() => {
    if (user?.token && currentUserId) {
      checkUnreadMessages();
      
      const interval = setInterval(checkUnreadMessages, 15000);
      return () => clearInterval(interval);
    }
  }, [user?.token, currentUserId]);

  const handleToggleOpen = () => {
    setIsOpen((prev) => {
      const newIsOpen = !prev;
      return newIsOpen;
    });
  };

  return (
    <div>
      <button
        onClick={handleToggleOpen}
        className="fixed z-50 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 hover:scale-110 "

        style={{ right: 20, bottom: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
        title="Open Messenger"
      >
        <MessageCircle size={24} />

        {unreadChatCount > 0 && !isOpen && (
          <div className="absolute -top-0 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white">
            <div className="w-full h-full bg-red-500 rounded-full animate-ping"></div>
            <span className="absolute -top-[1px] z-50 right-[5px] text-xs">{unreadChatCount}</span>
          </div>
        )}
      </button>

      {isOpen && (
        <ClientPortal>
          <Rnd
            size={{ width: 500, height: 600 }}
            position={position}
            bounds="window"
            onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
            enableResizing={false}
            dragHandleClassName="drag-handle"
            className="fixed z-50 bg-white rounded-lg shadow-2xl"
          >
            <div className="flex flex-col h-full">
              <div className="drag-handle bg-blue-400 text-white px-4 py-2 rounded-t-lg flex items-center justify-between">
                <h3 className="font-semibold text-sm">Messenger</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-blue-600 p-1 rounded"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">

                <Messenger role={role} />
              </div>
            </div>
          </Rnd>
        </ClientPortal>
      )}

    </div>
  ); 
};

export default DraggableMessenger;
