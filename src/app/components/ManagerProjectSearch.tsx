'use client';
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Search } from 'lucide-react';

export interface User {
  _id: string;
  name: string;
  role: 'admin' | 'employee' | 'manager';
  employeeCode: string;
}

interface UserSearchProps {
  initialQuery?: string;
  role?: 'employee' | 'manager';
  onSelect?: (user: User) => void;
  selectedUser?: User | null;
}

const ManagerProjectSearch: React.FC<UserSearchProps> = ({ initialQuery = '', role, onSelect, selectedUser, }) => {
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [suppressSearch, setSuppressSearch] = useState(false);

    const fetchUsers = async (searchText: string) => {
        setLoading(true);
        try {
        const params = new URLSearchParams();
        if (searchText) params.append('query', searchText);
        if (role) params.append('role', role);

        const res = await api(`/search?${params.toString()}`);
        setResults(res.data.users || []);
        } catch (err) {
        console.error('Search error:', err);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {

    if (selectedUser && query === selectedUser.name) {
        setShowDropdown(false);
        return;
    }

        if (query.trim() !== '') {
            fetchUsers(query);
            setShowDropdown(true);
        } else {
            setResults([]);
            setShowDropdown(false);
        }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [query, role, selectedUser]);

    const handleSelect = (user: User) => {
        onSelect?.(user);
        setQuery(user.name);
        setSuppressSearch(true);
        setShowDropdown(false);
        setTimeout(() => setSuppressSearch(false), 500);
    };

    return (
        <div className="relative w-full">
        <div className="flex items-center gap-2 border border-[#ddd] px-3 py-2 rounded bg-white">
            <Search size={15} className="text-[#696969]" />
            <input
            type="text"
            placeholder="Search manager"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full focus:outline-none text-sm"
            onFocus={() => query && setShowDropdown(true)}
            />
        </div>

        {showDropdown && (
            <div className="absolute z-10 w-full bg-white border border-gray-200 shadow-md mt-1 rounded max-h-52 overflow-y-auto">
            {loading ? (
                <p className="p-2 text-sm">Loading...</p>
            ) : results.length === 0 ? (
                <p className="p-2 text-sm text-gray-500">No results found</p>
            ) : (
                <ul>
                {results.map((user) => (
                    <li
                    key={user._id}
                    onClick={() => handleSelect(user)}
                    className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.employeeCode}</div>
                    </li>
                ))}
                </ul>
            )}
            </div>
        )}
        </div>
    );
};

export default ManagerProjectSearch;
