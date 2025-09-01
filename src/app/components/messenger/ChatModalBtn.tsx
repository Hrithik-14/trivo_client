"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { Rnd } from "react-rnd";
import Messenger from "./Messenger"; // Adjust import path as needed

interface Contact {
  _id: string;
  name: string;
  employeeCode: string;
  profileImage?: string;
}

interface ChatModalButtonProps {
  user: Contact;
  role: "admin" | "manager" | "employee";
  buttonText?: string;
  buttonClassName?: string;
  children?: React.ReactNode; // Allow custom button content
}

const ChatModalButton: React.FC<ChatModalButtonProps> = ({ 
  user, 
  role, 
  buttonText = "Chat", 
  buttonClassName = "px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition-colors",
  children 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [position, setPosition] = useState({ x: 300, y: 100 });
  const [messengerKey, setMessengerKey] = useState(0);

  // Reset messenger when modal opens to ensure fresh state
  useEffect(() => {
    if (isModalOpen) {
      setMessengerKey(prev => prev + 1);
    }
  }, [isModalOpen]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={handleOpenModal}
        className={buttonClassName}
        title={`Chat with ${user.name}`}
      >
        {children || (
          <>
            <MessageCircle size={16} className="inline mr-1" />
            {buttonText}
          </>
        )}
      </button>

      {/* Chat Modal */}
      {isModalOpen && (
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
            <div className="drag-handle bg-blue-500 text-white px-4 py-2 rounded-t-lg flex items-center justify-between cursor-move">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <MessageCircle size={16} />
                Chat with {user.name}
              </h3>
              <button
                onClick={handleCloseModal}
                className="hover:bg-blue-600 p-1 rounded transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatModalMessenger 
                key={messengerKey}
                role={role} 
                initialContact={user}
              />
            </div>
          </div>
        </Rnd>
      )}
    </>
  );
};

// Modified Messenger component specifically for the modal
interface ChatModalMessengerProps {
  role: "admin" | "manager" | "employee";
  initialContact: Contact;
}

const ChatModalMessenger: React.FC<ChatModalMessengerProps> = ({ role, initialContact }) => {
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

  // Auto-select the initial contact when component mounts
  useEffect(() => {
    if (token && currentUserId && initialContact) {
      // Add a small delay to ensure Messenger component is fully initialized
      const timer = setTimeout(() => {
        // Trigger contact selection in the Messenger component
        // This would need to be implemented in your Messenger component
        // You might need to pass initialContact as a prop to Messenger
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [token, currentUserId, initialContact]);

  return (
    <MessengerWithInitialContact 
      role={role} 
      initialContact={initialContact}
    />
  );
};

// Simple wrapper that uses your existing Messenger component
const MessengerWithInitialContact: React.FC<MessengerWithInitialContactProps> = ({ role, initialContact }) => {
  return (
    <div className="chat-modal-wrapper" data-initial-contact={initialContact?._id}>
      <Messenger role={role} />
    </div>
  );
};

interface MessengerWithInitialContactProps {
  role: "admin" | "manager" | "employee";
  initialContact?: Contact;
}

export default ChatModalButton;