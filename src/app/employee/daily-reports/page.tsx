/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { FC, useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  CheckSquare,
  Award,
  AlertCircle,
  X,
  Plus,
  Clock,
  Calendar,
  Search,
  Filter,
  CheckCircle,
  Target,
} from "lucide-react";
import api from "@/app/api/axios";
import { useParams } from "next/navigation";

interface DailyReportForm {
  employeeId: string;
  currentProject: string;
  projectStatus: string;
  startTime: string;
  endTime: string;
  effectiveHours: string;
  completedTasks: { value: string }[];
  plannedTasks: { value: string }[];
  perfomance: string;
  challenges: string;
  supportNeeded: string;
}

interface Report {
  id: number;
  date: string; // Adjust to Date if the API returns a Date object
  hours: number;
  status: string;
  tasksCompleted: number;
  perfomance: boolean;
  nextDayPlanned: boolean;
  statusColor: string;
}

// import { FC } from "react";
// import { useForm, useFieldArray } from "react-hook-form";
// import { useParams } from "react-router-dom";
// import { X, Clock, CheckSquare, Award, AlertCircle, Plus } from "lucide-react";
// import api from "../api"; // Assuming this is your configured axios instance
// import toast from "react-toastify"; // Uncomment if using a toast library

// Define the form data type
interface DailyReportForm {
  employeeId: string;
  currentProject: string;
  projectStatus: string;
  startTime: string;
  endTime: string;
  effectiveHours: string;
  completedTasks: { value: string }[];
  plannedTasks: { value: string }[];
  perfomance: string;
  challenges: string;
  supportNeeded: string;
}

interface Project {
  name: string;
  _id: string;
}

const CreateDailyReport: FC<{ onClose: () => void }> = ({ onClose }) => {
  const { id } = useParams<{ id: string }>(); // Type the id parameter
  const user = localStorage.getItem("user");
  const parsedUser = user ? JSON.parse(user) : null; // Parse user from localStorage
  // console.log(parsedUser);
  const [projects, setProjects] = useState<Project | []>([]);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DailyReportForm>({
    defaultValues: {
      employeeId: parsedUser?.employeeCode, // Set employeeId from user data
      currentProject: "",
      projectStatus: "",
      startTime: "",
      endTime: "",
      effectiveHours: "30",
      completedTasks: [{ value: "" }],
      plannedTasks: [{ value: "" }],
      perfomance: "",
      challenges: "",
      supportNeeded: "",
    },
  });

  const { fields: completedTasks, append: appendCompleted } = useFieldArray({
    control,
    name: "completedTasks",
  });

  const { fields: plannedTasks, append: appendPlanned } = useFieldArray({
    control,
    name: "plannedTasks",
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(
          `/getProjectByEmployee/${parsedUser?.id}`
        );
        setProjects(response.data.projects);
      } catch (error) {
        console.log("error is :", error);
      }
    };
    fetchProject();
  }, []);

  const onSubmit = async (data: DailyReportForm) => {
    console.log(data);

    try {
      const token = parsedUser?.token; // Assume token is stored in user object
      if (!token) throw new Error("No authentication token found");

      // Make API call to submit the daily report
      const response = await api.post(
        `report/addReport/${parsedUser?.id}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Handle successful response
      console.log("Daily report submitted successfully:", response.data);
      // toast.success("Daily report submitted successfully!"); // Uncomment if using toast
      alert("Daily report submitted successfully!");
      onClose(); // Close the form
    } catch (error) {
      console.error("Error submitting daily report:", error);
      // toast.error("Failed to submit daily report. Please try again."); // Uncomment if using toast
      alert("Failed to submit daily report. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Daily Report</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Employee ID
                </label>
                <input
                  {...register("employeeId", {
                    required: "Employee ID is required",
                  })}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none cursor-not-allowed text-gray-500"
                />
                {errors.employeeId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.employeeId.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Current Project
                </label>
                <select
                  {...register("currentProject", {
                    required: "Current project is required",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none "
                >
                  {projects.map((item: any) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                {errors.currentProject && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.currentProject.message}
                  </p>
                )}
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Project Status
                </label>
                <select
                  {...register("projectStatus", { required: "Project status is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                {errors.projectStatus && (
                  <p className="text-red-500 text-sm mt-1">{errors.projectStatus.message}</p>
                )}
              </div> */}
            </div>

            {/* Working Hours */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <Clock className="text-green-600 mr-2" size={20} />
                <h3 className="text-lg font-medium text-gray-800">
                  Working Hours
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    {...register("startTime", {
                      required: "Start time is required",
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  {errors.startTime && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.startTime.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    {...register("endTime", {
                      required: "End time is required",
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  {errors.endTime && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.endTime.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Break Time
                  </label>
                  <input
                    type="number"
                    {...register("effectiveHours", {
                      required: "Break time is required",
                      min: {
                        value: 0,
                        message: "Break time cannot be negative",
                      },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  {errors.effectiveHours && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.effectiveHours.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Tasks */}
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <CheckSquare className="text-purple-600 mr-2" size={20} />
                <h3 className="text-lg font-medium text-gray-800">
                  Tasks & Activities
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Completed Tasks */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Tasks Completed Today
                  </label>
                  {completedTasks.map((field, index) => (
                    <div key={field.id} className="mb-2">
                      <textarea
                        {...register(`completedTasks.${index}.value`, {
                          required: "Task description is required",
                        })}
                        placeholder="Describe completed task..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none h-20"
                      />
                      {errors.completedTasks?.[index]?.value && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.completedTasks[index].value.message}
                        </p>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => appendCompleted({ value: "" })}
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center"
                  >
                    <Plus size={16} className="mr-1" /> Add Task
                  </button>
                </div>

                {/* Planned Tasks */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Planned Tasks for Tomorrow
                  </label>
                  {plannedTasks.map((field, index) => (
                    <div key={field.id} className="mb-2">
                      <select
                        {...register(`plannedTasks.${index}.value`, {
                          required: "Task description is required",
                        })}
                        // placeholder="Describe  task..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none h-20"
                      >
                        <option value="">hyefjdhufjd</option>
                      </select>
                      {errors.plannedTasks?.[index]?.value && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.plannedTasks[index].value.message}
                        </p>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => appendPlanned({ value: "" })}
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center"
                  >
                    <Plus size={16} className="mr-1" /> Add Task
                  </button>
                </div>
              </div>
            </div>

            {/* Performance & Challenges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <Award className="text-yellow-600 mr-2" size={20} />
                  <h3 className="text-lg font-medium text-gray-800">
                    Performance & Feedback
                  </h3>
                </div>
                <textarea
                  {...register("perfomance", {
                    required: "Key achievements are required",
                  })}
                  placeholder="Describe your key achievements..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none h-24"
                />
                {errors.perfomance && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.perfomance.message}
                  </p>
                )}
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <AlertCircle className="text-red-600 mr-2" size={20} />
                  <h3 className="text-lg font-medium text-gray-800">
                    Challenges & Support
                  </h3>
                </div>
                <textarea
                  {...register("challenges")}
                  placeholder="Describe any challenges..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none h-20 mb-4"
                />
                <textarea
                  {...register("supportNeeded")}
                  placeholder="What support do you need?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none h-20"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 rounded-md font-medium transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DailyReport: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reload, setReload] = useState(false);
  const user = localStorage.getItem("user");
  const [reports, setReports] = useState<Report[]>([]);
  const parsedUser = user ? JSON.parse(user) : null; // Parse user from localStorage
  const token = parsedUser?.token; // Assume token is stored in user object
  if (!token) throw new Error("No authentication token found");
  useEffect(() => {
    const fetchreports = async () => {
      try {
        const response = await api.get(
          `/report/getReportsByEmployee/${parsedUser?.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReports(response.data.report);
        console.log(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchreports();
  }, []);

  // const reports = [
  //   {
  //     id: 1,
  //     date: "22/07/2025",
  //     hours: 7,
  //     status: "Submitted",
  //     tasksCompleted: 3,
  //     perfomance: true,
  //     nextDayPlanned: true,
  //     statusColor: "bg-blue-100 text-blue-800",
  //   },
  //   {
  //     id: 2,
  //     date: "21/07/2025",
  //     hours: 6.5,
  //     status: "Approved",
  //     tasksCompleted: 3,
  //     perfomance: true,
  //     nextDayPlanned: true,
  //     statusColor: "bg-green-100 text-green-800",
  //   },
  //   {
  //     id: 3,
  //     date: "20/07/2025",
  //     hours: 8,
  //     status: "Pending",
  //     tasksCompleted: 4,
  //     perfomance: true,
  //     nextDayPlanned: true,
  //     statusColor: "bg-yellow-100 text-yellow-800",
  //   },
  //   {
  //     id: 4,
  //     date: "19/07/2025",
  //     hours: 7.5,
  //     status: "Approved",
  //     tasksCompleted: 2,
  //     perfomance: true,
  //     nextDayPlanned: true,
  //     statusColor: "bg-green-100 text-green-800",
  //   },
  // ];
  const handleAdd = () => setIsModalOpen(true);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setReload((prev) => !prev);
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.status.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All Status" || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {isModalOpen && <CreateDailyReport onClose={handleCloseModal} />}
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                My Daily Reports
              </h1>
            </div>
            <button
              onClick={handleAdd}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className=" flex items-center gap-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <Search className=" ml-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full  pr-4 py-2 focus:outline-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>Submitted</option>
              <option>Approved</option>
              <option>Pending</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Report - {report.date.slice(0, 10)}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {report.hours} hours
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${report.statusColor}`}
                        >
                          {report.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>

                {/* Report Details */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
                    {report.tasksCompleted} tasks completed
                  </div>
                  {report.perfomance && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Target className="w-4 h-4 mr-2 text-green-500" />
                      Key achievements logged
                    </div>
                  )}
                  {report.nextDayPlanned && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                      Next day planned
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No reports found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyReport;

// function useState(arg0: string): [any, any] {
//     throw new Error('Function not implemented.');
// }
