import React, { useState, useEffect, useRef } from "react";
import api from "../api/axios";

interface Manager {
  _id: string;
  name: string;
  employeeCode: string;
}

interface ManagerSearchDropdownProps {
  value: string;
  onChange: (managerId: string) => void;
  placeholder?: string;
}

const ManagerSearchDropdown: React.FC<ManagerSearchDropdownProps> = ({ value, onChange, placeholder }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      return;
    }
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("query", query);
        params.append("role", "manager");
        const res = await api(`/search?${params.toString()}`);
        setResults(res.data.users || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(fetchUsers, 300); // debounce 300ms
    return () => clearTimeout(debounceTimeout);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get selected user name for input display
  const selectedUser = results.find((user) => user._id === value);

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        className="border p-2 px-3 rounded-lg w-full border-[#ddd] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        placeholder={placeholder || "Search manager by name or email"}
        value={selectedUser ? selectedUser.name : query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
          if (value) onChange(""); // Clear selected manager if user types
        }}
        onFocus={() => setShowDropdown(true)}
      />
      {showDropdown && (
        <ul className="absolute z-10 max-h-60 overflow-y-auto bg-white border border-gray-300 rounded mt-1 w-full shadow-lg">
          {loading ? (
            <li className="p-2 text-gray-500">Loading...</li>
          ) : results.length === 0 ? (
            <li className="p-2 text-gray-500">No results found</li>
          ) : (
            results.map((user) => (
              <li
                key={user._id}
                className="cursor-pointer p-2 hover:bg-blue-100"
                onClick={() => {
                  onChange(user._id);
                  setQuery(user.name);
                  setShowDropdown(false);
                }}
              >
                {user.name} ({user.employeeCode})
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default ManagerSearchDropdown;
