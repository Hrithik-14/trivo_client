"use client";

import React, { FC, useState, useEffect } from "react";
import { Search } from "lucide-react";
import api from "@/app/api/axios";

type User = {
  _id: string;
  name: string;
  employeeCode: string;
};

type Props = {
  selectedUser: User | null;
  onSelect: (user: User) => void;
  managerId: string;
};

const ManagersUserSearch: FC<Props> = ({ selectedUser, onSelect, managerId }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUsers = async (searchTerm = "") => {
    if (!managerId) {
      setUsers([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/${managerId}/searchUsers`, {
        params: { query: searchTerm },
      });
      setUsers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };



  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    const timeoutId = setTimeout(() => {
      fetchUsers(value);
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="border border-[#ddd] rounded w-full">
      <div className="flex items-center px-2 py-1 border-b border-[#eee]">
        <Search size={16} className="text-gray-500" />
        <input
          type="text"
          placeholder="Search employees..."
          value={query}
          onChange={handleSearchChange}
          className="flex-1 outline-none p-2 text-sm"
        />
      </div>

      <div className="max-h-40 overflow-y-auto">
        {loading ? (
          <p className="text-sm text-gray-500 p-2">Loading...</p>
        ) : users.length > 0 ? (
          users.map((user) => (
            <div
              key={user._id}
              onClick={() => onSelect(user)}
              className={`px-3 py-2 cursor-pointer text-sm hover:bg-gray-100 ${
                selectedUser?._id === user._id ? "" : "bg-green-100"
              }`}
            >
              {user.name} ({user.employeeCode})
            </div>
          ))
        ) : (
          <p className={`text-sm text-gray-500 ${query ? 'py-2' : ''}`}>
            {query ? "No users found" : ""}
          </p>
        )}
      </div>

      {selectedUser && (
        <div className="bg-gray-50 px-3 py-2 border-t border-[#eee] text-xs text-gray-600">
          Selected: {selectedUser.name}
        </div>
      )}
    </div>
  );
};

export default ManagersUserSearch;
