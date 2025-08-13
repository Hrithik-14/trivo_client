"use client";

import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Search } from "lucide-react";
import Link from "next/link";

interface Project {
    _id: string;
    name: string;
}

const ProjectSearch: React.FC = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchProjects = async (searchText: string) => {
        setLoading(true);
        try {
        const params = new URLSearchParams();
        if (searchText) params.append("query", searchText);

        const res = await api.get(`/projectSearch?${params.toString()}`);
        setResults(res.data.projects || []);
        } catch (err) {
        console.error("Search error:", err);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
        if (query.trim() !== "") {
            fetchProjects(query);
        } else {
            setResults([]);
        }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [query]);

    return (
        <div className="w-fit relative h-fit">
        <div className="flex items-center gap-3 border border-[#ddd] w-fit px-3 py-2 rounded-full bg-white">
            <Search size={15} className="text-[#696969]" />
            <input
            type="text"
            placeholder="Search projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-60 focus:outline-none"
            />
        </div>

        <div className="absolute top-14 w-72 bg-white shadow-md z-10 rounded">
            {loading ? (
            <p className="p-3">Loading...</p>
            ) : (
            results.length > 0 && (
                <ul className="space-y-2 p-2 border border-[#ddd]">
                {results.map((project) => (
                    <Link href={`/admin/Project/${project._id}`} key={project._id}>
                    <div className="hover:bg-gray-100 px-2 py-1 cursor-pointer  border-b border-[#ddd]">
                        <h2 className="truncate overflow-hidden whitespace-nowrap">{project.name}</h2>
                    </div>
                    </Link>
                ))}
                </ul>
            )
            )}
        </div>
        </div>
    );
};

export default ProjectSearch;
