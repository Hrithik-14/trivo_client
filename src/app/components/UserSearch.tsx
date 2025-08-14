/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Search } from 'lucide-react';
import Link from 'next/link';

interface UserSearchProps {
    initialQuery?: string;
    role?: 'employee' | 'manager';
    onResults?: (users: User[]) => void;
}

export interface User {
    _id: string;
    name: string;
    role: 'admin' | 'employee' | 'manager';
    employeeCode: string;
}

const UserSearch: React.FC<UserSearchProps> = ({ initialQuery = '', role, onResults, }) => {
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchUsers = async (searchText: string) => {
        setLoading(true);
        try {
        const params = new URLSearchParams();
        if (searchText) params.append('query', searchText);
        if (role) params.append('role', role);

        const res = await api(`/search?${params.toString()}`);
        setResults(res.data.users || []);
        onResults?.(res.data.users || []);
        } catch (err) {
        console.error('Search error:', err);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
        if (query.trim() !== '') {
            fetchUsers(query);
        } else {
            setResults([]);
        }
        }, 300); 


        return () => clearTimeout(delayDebounce);
    }, [query, role]);

    return (
        <div className="w-fit  relative h-fit">
        
            <div className='flex items-center gap-3 border border-[#ddd] w-fit px-3 py-2 rounded-full bg-white'>
                <Search size={15} className="text-[#696969]" />
                <input
            type="text"
            placeholder="Search by name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-60 focus:outline-none"
            />
            
            </div>
        

        <div className=" absolute top-14 w-72 bg-white shadow-md z-10 rounded">
            {loading ? (
                <p className='space-y-2'>Loading...</p>
            ) : (
                results.length > 0 && (
                <ul className='space-y-2 p-2 border border-[#ddd]'>
                    {results.map((user) => (
                    <Link href={`/admin/profile/${user._id}`} key={user._id}>
                        <h2>{user.name}</h2>
                        <h2 className="text-xs font-semibold">{user.employeeCode}</h2>
                    </Link>
                    ))}
                </ul>
                )
            )}
        </div>
        </div>
    );
};

export default UserSearch;
