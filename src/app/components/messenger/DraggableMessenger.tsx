"use client";

import React, { useState, FC } from "react";
import { Rnd } from "react-rnd";
import { MessageCircle, X } from "lucide-react";
import MessengerFixed from "./MessengerFixed";

interface DraggableMessengerProps {
  role: "admin" | "manager" | "employee";
}

const SIDEBAR_WIDTH = 300;

const DraggableMessenger: FC<DraggableMessengerProps> = ({ role }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: SIDEBAR_WIDTH + 20, y: 20 });

  return (
    <>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed z-50 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 hover:scale-110"
        style={{ right: 20, bottom: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
        title="Open Messenger"
      >
        <MessageCircle size={24} />
      </button>

      {isOpen && (
        <Rnd
          size={{ width: 400, height: 500 }}
          position={position}
          bounds="window" // <-- restrict drag inside viewport
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
              <MessengerFixed role={role} />
            </div>
          </div>
        </Rnd>
      )}
    </>
  );
};

export default DraggableMessenger;
