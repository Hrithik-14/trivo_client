"use client";

import React, { FC, useState, useEffect } from "react";
import { ChevronDown, User, Building2, Clock, Users } from "lucide-react";
import Image from "next/image";
import { differenceInDays, parseISO } from "date-fns";
import api from "@/app/api/axios";
import { notFound, useParams } from "next/navigation";

interface Member {
    _id: string;
    name: string;
    role: string;
}

interface Manager {
    _id: string;
    name: string;
}

interface Project {
    _id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    managerId: Manager;
    members: Member[];
    client: string;
    clientEmail: string;
    status: "ongoing" | "completed" | "paused";
    isActive: boolean;
}

const calculateDuration = (start?: string, end?: string) => {
    if (!start || !end) return { months: 0, days: 0 };
    try {
        const startDate = parseISO(start);
        const endDate = parseISO(end);
        const totalDays = differenceInDays(endDate, startDate);
        const months = Math.floor(totalDays / 30);
        const days = totalDays % 30;
        return { months, days };
    } catch (error) {
        console.error("Invalid dates:", { start, end });
        return { months: 0, days: 0 };
    }
};

const ProjectDetail: FC = () => {
    const [project, setProject] = useState<Project | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isActive, setIsActive] = useState<boolean | null>(null);


    const params = useParams();
    const projectId = params.slug as string;

    useEffect(() => {
        const fetchProject = async () => {
        try {
            const response = await api.get(`/getProjectById/${projectId}`);
            const data: Project = response.data;
            setProject(data);
            setIsActive(data.isActive);
        } catch (error) {
            console.error("Error fetching project:", error);
        } finally {
            setLoading(false);
        }
        };

        fetchProject();
    }, [projectId]);

    const handleActiveChange = async (newStatus: boolean) => {
        try {
            await api.patch(`/toggleActive/${projectId}`, {
                isActive: newStatus,
            });
            setIsActive(newStatus);
        } catch (error) {
            console.error("Failed to toggle active status:", error);
        }
    };




    if (loading) return <p>Loading...</p>;
    if (!project) return notFound();

    const duration = calculateDuration(project.startDate, project.endDate);

    return (
        <div className="flex flex-col gap-5">
        <div className="bg-white border border-[#ddd] rounded py-2 px-6 flex justify-between items-center">
            <div className="p-3">
            <h2 className="text-xl font-bold">{project.name}</h2>
            <p className="text-gray-600 text-sm">{project.description}</p>
            </div>
            <div className="flex gap-3">
            <div
                className={`p-2 text-xs h-fit px-4 rounded-full border ${
                project.status === "ongoing"
                    ? "bg-[#DBEAFE] border-[#93C5FD] text-[#3B82F6]"
                    : "bg-[#DCFCE7] border-[#86EFAC] text-[#22C55E]"
                }`}
            >
                {project.status === "ongoing" ? "Ongoing" : "Completed"}
            </div>
            <div className="relative">
                <button
                onClick={() => setIsOpen(!isOpen)}
                className={`px-4 py-2 text-xs font-semibold rounded-full flex items-center gap-2 border ${
                    isActive
                    ? "bg-green-100 text-green-700 border-green-300"
                    : "bg-red-100 text-red-700 border-red-300"
                }`}
                >
                {isActive ? "Active" : "Inactive"} <ChevronDown size={16} />
                </button>

                {isOpen && (
                <ul className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded shadow z-10">
                    <li
                    className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                        handleActiveChange(true);
                        setIsOpen(false);
                    }}
                    >
                    Active
                    </li>
                    <li
                    className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                        handleActiveChange(false);
                        setIsOpen(false);
                    }}
                    >
                    Inactive
                    </li>
                </ul>
                )}
            </div>
            </div>
        </div>

        <div className="bg-white border border-[#ddd] rounded py-4 px-6">
            <div className="flex items-center gap-3">
            <User size={18} />
            <p className="font-semibold">Project Manager</p>
            </div>
            <div className="flex items-center gap-3 mt-2">
            <Image
                src="/avatar.png"
                alt="Avatar"
                width={35}
                height={35}
                className="rounded-full"
            />
            <p className="font-semibold">{project.managerId.name}</p>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
            <div className="bg-white border border-[#ddd] rounded p-4">
            <div className="flex items-center gap-2">
                <Building2 size={15} />
                <p className="font-semibold">Client</p>
            </div>
            <p className="text-lg">{project.client}</p>
            <p className="text-blue-500">{project.clientEmail}</p>
            </div>
            <div className="bg-white border border-[#ddd] rounded p-4">
            <div className="flex items-center gap-2">
                <Clock size={15} />
                <p className="font-semibold">Timeline</p>
            </div>
            <p className="text-sm">
                Start: {new Date(project.startDate).toLocaleDateString()}
            </p>
            <p className="text-sm">
                End: {new Date(project.endDate).toLocaleDateString()}
            </p>

            <p className="text-sm">
                Duration: {duration.months} months and {duration.days} days
            </p>
            </div>
        </div>

        <div className="bg-white border border-[#ddd] rounded p-6">
            <div className="flex items-center gap-3 mb-3">
            <Users size={18} />
            <p className="font-semibold">Team Members</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
            {project.members.map((member) => (
                <div
                key={member._id}
                className="border border-[#ddd] p-3 rounded flex gap-3 items-center"
                >
                <Image
                    src="/avatar.png"
                    alt="Avatar"
                    width={35}
                    height={35}
                    className="rounded-full"
                />
                <div>
                    <p>{member.name}</p>
                    <p className="text-xs text-gray-600">{member.role}</p>
                </div>
                </div>
            ))}
            </div>
        </div>
        </div>
    );
};

export default ProjectDetail;
