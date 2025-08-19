"use client";

import { Calendar, ChevronDown, ChevronRight, FileText, ThumbsDown, ThumbsUp } from "lucide-react";
import React, { FC, useState, useEffect } from "react";
import api from "@/app/api/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface Task {
  _id: string;
  title: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Project {
  _id: string;
  name: string;
}

interface Report {
  _id: string;
  date: string; // ISO string from Date
  submittedBy: User;
  submittedTo: User;
  projectId: Project;
  completedTasks: Task[];
  plannedTasks: Task[];
  descriptions: string;
  startTime: string;
  endTime: string;
  effectiveHours: string;
  performance: string;
  challenges: string;
  supportNeeded: string;
  status: "pending" | "accepted" | "rejected";
}

const ManagerReport: FC = () => {
  const [isExpand, setIsExpand] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/report/my?page=${page}&limit=10`);
        setReports(res.data.reports);
        setTotalPages(res.data.totalPages);
      } catch (err: any) {
        console.error("Error fetching reports:", err);
        toast.error(err.response?.data?.message || "Failed to fetch reports");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [page]);

  const handleApprove = async (id: string) => {
    try {
      const res = await api.patch(`/reports/${id}/status`, { status: "accepted" });
      setReports((prev) =>
        prev.map((report) =>
          report._id === id ? { ...report, status: "accepted" } : report
        )
      );
      toast.success("Report approved successfully");
    } catch (err: any) {
      console.error("Error approving report:", err);
      toast.error(err.response?.data?.message || "Failed to approve report");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await api.patch(`/reports/${id}/status`, { status: "rejected" });
      setReports((prev) =>
        prev.map((report) =>
          report._id === id ? { ...report, status: "rejected" } : report
        )
      );
      toast.success("Report rejected successfully");
    } catch (err: any) {
      console.error("Error rejecting report:", err);
      toast.error(err.response?.data?.message || "Failed to reject report");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white border border-[#ddd] p-4 rounded flex gap-3 items-center">
        <FileText size={35} className="p-2 rounded bg-blue-500 text-white" />
        <p className="text-xl font-semibold">Employees Daily Report</p>
      </div>

      <div className="flex flex-col gap-2">
        {reports.map((report) => (
          <div key={report._id} className="border border-[#ddd] p-5 rounded bg-white">
            <div className="flex justify-between">
              <div className="flex gap-3">
                <Calendar size={30} className="p-2 bg-blue-500 text-white rounded" />
                <p className="font-medium text-lg">
                  Daily Report - {report.submittedBy.name} ({report.projectId.name})
                </p>
              </div>
              <div className="flex gap-3">
                <div
                  className={`p-2 text-xs rounded-full border ${
                    report.status === "accepted"
                      ? "bg-green-100 text-green-500 border-green-300"
                      : report.status === "rejected"
                      ? "bg-red-100 text-red-500 border-red-300"
                      : "bg-yellow-100 text-yellow-500 border-yellow-300"
                  }`}
                >
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </div>
                <button onClick={() => setIsExpand(isExpand === report._id ? null : report._id)}>
                  {isExpand === report._id ? (
                    <ChevronDown className="text-[#696969] transition-transform duration-300" />
                  ) : (
                    <ChevronRight className="text-[#696969] transition-transform duration-300" />
                  )}
                </button>
              </div>
            </div>
            {isExpand === report._id && (
              <div className="mt-6 border p-4 rounded border-[#ddd] flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="text-sm font-semibold text-[#696969]">Description:</h2>
                  <p className="ml-10">{report.descriptions || "No description provided"}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-sm font-semibold text-[#696969]">Date:</h2>
                  <p className="ml-10">{format(new Date(report.date), "PPP")}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-sm font-semibold text-[#696969]">Time:</h2>
                  <p className="ml-10">
                    {report.startTime} - {report.endTime} ({report.effectiveHours} hours)
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-sm font-semibold text-[#696969]">Completed Tasks:</h2>
                  <ul className="ml-10 list-disc">
                    {report.completedTasks.length > 0 ? (
                      report.completedTasks.map((task) => (
                        <li key={task._id} className="text-sm">{task.title}</li>
                      ))
                    ) : (
                      <li className="text-sm">No tasks completed</li>
                    )}
                  </ul>
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-sm font-semibold text-[#696969]">Planned Tasks:</h2>
                  <ul className="ml-10 list-disc">
                    {report.plannedTasks.length > 0 ? (
                      report.plannedTasks.map((task) => (
                        <li key={task._id} className="text-sm">{task.title}</li>
                      ))
                    ) : (
                      <li className="text-sm">No tasks planned</li>
                    )}
                  </ul>
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-sm font-semibold text-[#696969]">Performance:</h2>
                  <p className="ml-10">{report.performance || "No performance details provided"}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-sm font-semibold text-[#696969]">Challenges:</h2>
                  <p className="ml-10">{report.challenges || "No challenges reported"}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-sm font-semibold text-[#696969]">Support Needed:</h2>
                  <p className="ml-10">{report.supportNeeded || "No support needed"}</p>
                </div>
              </div>
            )}
            {report.status === "pending" && (
              <div className="flex mt-2 justify-end gap-5">
                <button
                  onClick={() => handleApprove(report._id)}
                  className="flex items-center gap-3 p-2 px-8 bg-green-500 text-white rounded"
                >
                  <ThumbsUp size={15} className="mt-1" /> Approve
                </button>
                <button
                  onClick={() => handleReject(report._id)}
                  className="flex items-center gap-3 p-2 px-8 bg-red-500 text-white rounded"
                >
                  <ThumbsDown size={15} className="mt-1" /> Reject
                </button>
              </div>
            )}
          </div>
        ))}
        {reports.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No reports found
          </div>
        )}
      </div>

      <div className="flex justify-center mt-4 gap-2">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-4 py-2">{page} / {totalPages}</span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ManagerReport;