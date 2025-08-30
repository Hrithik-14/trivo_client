/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { FC, useState, useEffect } from "react";
import { ChevronDown, User, Building2, Clock, Users, Plus,  UserPlus, Trash2, Zap, CheckSquare, Building, Target, AlertCircle, UserCheck, Folder, X, FileText } from "lucide-react";
import Image from "next/image";
import { differenceInDays, parseISO } from "date-fns";
import api from "@/app/api/axios";
import { notFound } from "next/navigation";
import Link from "next/link";
import mongoose from 'mongoose'


interface User {
  _id: mongoose.Types.ObjectId;
  name: string;
  profileImage: string;
  employeeCode: string;
}

interface Member {
  _id: string;
  name: string;
  employeeCode: string;
  profileImage: string;
  isActive:boolean
  user: User
}

interface Manager {
  _id: string;
  name: string;
  profileImage: string;
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

interface Contact {
    _id: string;
    name: string;
    email: string;
    employeeCode: string;
    createdBy: string;
    createdAt: string;
    profileImage?: string;
}

type Props = {
  role?: string;
  slug: string;
};

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

const SIDEBAR_WIDTH = 300

const ProjectDetail: FC<Props> = ({ role, slug }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState<boolean | null>(null);

  const projectId = slug;

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

  if (loading)
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  if (!project) return notFound();

  const duration = calculateDuration(project.startDate, project.endDate);

  return (
    <div className="flex flex-col gap-5">
      {role === "admin" && (
        <div className="w-full flex justify-end">
          <Link
            href={`/admin/Project/edit/${project._id}`}
            className="py-2 px-6 border rounded"
          >
            Edit Project
          </Link>
        </div>
      )}
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
          {role === "admin" ? (
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
          ) : (
            <div
              className={`p-2 text-xs h-fit px-4 rounded-full border ${
                isActive === true
                  ? "bg-[#DCFCE7] border-[#86EFAC] text-[#22C55E]"
                  : "bg-red-100 border-red-300 text-red-400"
              }`}
            >
              {isActive === true ? "Active" : "Inactive"}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-[#ddd] rounded py-4 px-6">
        <div className="flex items-center gap-3">
          <User size={18} />
          <p className="font-semibold">Project Manager</p>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="relative w-10 h-10">
            <Image
              src={project.managerId?.profileImage || "/avatar.png"}
              alt="Avatar"
              fill
              className="rounded-full object-cover"
            />
          </div>
          {/* {console.log(project)} */}
          <p className="font-semibold">{project.managerId?.name}</p>
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
        <div className="flex flex-col gap-4">
          {project.members && project.members.length > 0 ? (
            project.members
              .filter((member) => member._id !== project.managerId?._id && member.isActive === true)
              .map((member) => (
                <div
                  key={member._id}
                  className="border border-[#ddd] p-3 rounded flex gap-3 items-center"
                >
                  <div className="relative w-10 h-10">
                    {/* {console.log(member.user)} */}
                    <Image
                      src={member.user?.profileImage|| "/avatar.png"}
                      alt="Avatar"
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <p>{member.user?.name}</p>
                    <p className="text-xs text-gray-600">
                      {member.user?.employeeCode}
                    </p>
                  </div>
                </div>
              ))
          ) : (
            <p>No team members assigned.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;