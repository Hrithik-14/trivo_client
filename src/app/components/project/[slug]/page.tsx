/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { FC, useState, useEffect } from "react";
import { ChevronDown, User, Building2, Clock, Users } from "lucide-react";
import Image from "next/image";
import { differenceInDays, parseISO } from "date-fns";
import api from "@/app/api/axios";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";

interface Member {
  _id: string[];
  name: string;
  role: string;
  employeeCode: string;
  profileImage: string;
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

type Props = {
  role: string;
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

const ProjectDetail: FC<Props> = ({ role }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
const [memberData, setMemberData] = useState<{
  [key: string]: { tasks: any[]; reports: any[]; loading: boolean };
}>({});

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
const handleExpand = async (memberId: string) => {
  const isExpanded = expandedMemberId === memberId;

  // 🔽 Collapse if already expanded
  if (isExpanded) {
    setExpandedMemberId(null);
    return;
  }

 
  setExpandedMemberId(memberId);


  if (memberData[memberId]) return;

 
  setMemberData((prev) => ({
    ...prev,
    [memberId]: { tasks: [], reports: [], loading: true },
  }));

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No auth token found in localStorage");
    }

    const [tasksRes, reportsRes] = await Promise.all([
      api.get(`/project/${project._id}/user/${memberId}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      api.get(`/report/project/${project._id}/submittedBy/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    setMemberData((prev) => ({
      ...prev,
      [memberId]: {
        tasks: tasksRes.data?.data || [],
        reports: reportsRes.data?.reports || [],
        loading: false,
      },
    }));
  } catch (error: any) {
   
    if (error.response) {
      console.error(
        `API Error [${error.response.status}] for member ${memberId}:`,
        error.response.data
      );
    } else if (error.request) {
      console.error(`No response for member ${memberId}:`, error.request);
    } else {
      console.error("Unexpected Error:", error.message);
    }

  
    setMemberData((prev) => ({
      ...prev,
      [memberId]: { tasks: [], reports: [], loading: false },
    }));
  }
};



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
              src={project.managerId.profileImage || "/avatar.png"}
              alt="Avatar"
              fill
              className="rounded-full object-cover"
            />
          </div>
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
           <div className="flex flex-col gap-4">
      {project.members
        .filter((member: any) => member.role?.toLowerCase() !== "manager")
        .map((member: any) => {
          const isExpanded = expandedMemberId === member._id;
          const data = memberData[member._id]  || { tasks: [], reports: [], loading: true };;
          console.log("first",data)
          return (
            <div key={member._id}>
              {/* Member Header */}
              <div
                className="border border-[#ddd] p-3 rounded flex gap-3 items-center cursor-pointer"
                onClick={() => handleExpand(member._id)}
              >
                <div className="relative w-10 h-10">
                  <Image
                    src={member.profileImage || "/avatar.png"}
                    alt="Avatar"
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div>
                  <p>{member.name}</p>
                  <p className="text-xs text-gray-600">
                    {member.employeeCode}
                  </p>
                </div>
              </div>

              {/* Expanded Section */}
              {isExpanded && (
                <div className="bg-gray-50 w-full mt-2 p-3 rounded">
                  {data?.loading ? (
                    <p className="text-gray-500">Loading data...</p>
                  ) : (
<>
  {/* Tasks */}
  <h4 className="font-semibold mb-2">📄 Tasks</h4>
  {data?.tasks?.length ? (
    <table className="w-full border border-gray-200 rounded-lg overflow-hidden text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="text-left p-2 border-b">Title</th>
          <th className="text-left p-2 border-b">Status</th>
        </tr>
      </thead>
      <tbody>
        {data.tasks.map((task: any) => (
          <tr key={task._id} className="hover:bg-gray-50">
            <td className="p-2 border-b">{task.title}</td>
            <td className="p-2 border-b italic">{task.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <p className="text-sm text-gray-500">No tasks found</p>
  )}

  {/* Reports */}
 {/* Reports Table */}
<h4 className="font-semibold mt-4 mb-2">📊 Reports</h4>
{data?.reports?.length ? (
<table className="min-w-full border border-gray-300 rounded-lg overflow-hidden shadow-sm text-sm">
  <thead className="bg-gray-200 text-gray-700 uppercase text-xs tracking-wider">
    <tr>
      <th className="px-4 py-2 text-left border-b">Date</th>
      <th className="px-4 py-2 text-left border-b">Status</th>
      <th className="px-4 py-2 text-left border-b">Performance</th>
      <th className="px-4 py-2 text-left border-b">Completed Tasks</th>
      <th className="px-4 py-2 text-left border-b">Planned Tasks</th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    {data.reports.map((report: any, index: number) => (
      <tr
        key={report._id}
        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
      >
        <td className="px-4 py-2">
          {new Date(report.date).toLocaleDateString()}
        </td>
        <td className="px-4 py-2 capitalize">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              report.status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {report.status}
          </span>
        </td>
        <td className="px-4 py-2">{report.performance}</td>
        <td className="px-4 py-2">{report.completedTasks?.length || 0}</td>
        <td className="px-4 py-2">{report.plannedTasks?.length || 0}</td>
      </tr>
    ))}
  </tbody>
</table>

) : (
  <p className="text-sm text-gray-500">No reports found</p>
)}

</>

                  )}
                </div>
              )}
            </div>
          );
        })}
    </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
