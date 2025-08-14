/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { FC, useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
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
import toast from "react-hot-toast";

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
  _id: number;
  date: string;
  effectiveHours: string;
  status: string;
  tasksCompleted: number;
  perfomance: boolean;
  nextDayPlanned: boolean;
  statusColor: string;
}

interface Project {
  name: string;
  _id: string;
}

interface Task {
  title: string;
  _id: string;
}

const CreateDailyReport: FC<{ onClose: () => void }> = ({ onClose }) => {
  const user = localStorage.getItem("user");
  const parsedUser = user ? JSON.parse(user) : null;
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
      const storedUser = localStorage.getItem('user')
      const parsed = storedUser ? JSON.parse(storedUser) : null
      setUserId(parsed?.id ?? null)
    }, [])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DailyReportForm>({
    defaultValues: {
      employeeId: parsedUser?.employeeCode,
      currentProject: "",
      projectStatus: "",
      startTime: "",
      endTime: "",
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

  const selectedProjectId = useWatch({
    control,
    name: "currentProject",
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(
          `/getProjectByEmployee/${parsedUser?.id}`
        );
        setProjects(response.data.projects || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProject();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      const fetchTasks = async () => {
        try {
          const response = await api.get(
            `/project/${selectedProjectId}/user/${parsedUser?.id}/tasks`
          );
          setTasks(response.data.data || []);
          console.log(response.data.data);
        } catch (error) {
          console.error("Error fetching tasks:", error);
          setTasks([]);
        }
      };
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [selectedProjectId]);

  const onSubmit = async (data: DailyReportForm) => {
    try {
      const token = parsedUser?.token;
      if (!token) throw new Error("No authentication token found");

      await api.post(
        `report/addReport/${parsedUser?.id}`,
        { ...data, projectId: selectedProjectId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Daily report submitted successfully!");
      onClose();
    } catch (error: any) {
      console.error("Error submitting daily report:", error);
      toast.error(error.response?.data?.message);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Daily Report</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-6">
            {/* Employee ID and Project */}
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Current Project
                </label>
                <select
                  {...register("currentProject", {
                    required: "Current project is required",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                >
                  <option value="" disabled>
                    Select a project...
                  </option>
                  {projects.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Working Hours */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <Clock className="text-green-600 mr-2" size={20} />
                <h3 className="text-lg font-medium text-gray-800">
                  Working Hours
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {/* Completed Tasks Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Tasks Completed Today
                  </label>
                  {completedTasks.map((field, index) => (
                    <div key={field.id} className="mb-2">
                      <select
                        {...register(`completedTasks.${index}.value`, {
                          required: "Please select a completed task",
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          {tasks.length === 0
                            ? "No pending tasks available"
                            : "Select a task..."}
                        </option>
                        {tasks.map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.title}
                          </option>
                        ))}
                      </select>
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

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Planned Tasks for Tomorrow
                  </label>
                  {plannedTasks.map((field, index) => (
                    <div key={field.id} className="mb-2">
                      <select
                        {...register(`plannedTasks.${index}.value`, {
                          required: "Please select a planned task",
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          {tasks.length === 0
                            ? "No pending tasks available"
                            : "Select a task..."}
                        </option>
                        {tasks.map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.title}
                          </option>
                        ))}
                      </select>
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
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Performance & Feedback
                </h3>
                <textarea
                  {...register("perfomance", {
                    required: "Key achievements are required",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none h-24"
                />
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Challenges & Support
                </h3>
                <textarea
                  {...register("challenges")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none h-20 mb-4"
                />
                <textarea
                  {...register("supportNeeded")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none h-20"
                />
              </div>
            </div>
          </div>

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
  const user = localStorage.getItem("user");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reload, setReload] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const parsedUser = user ? JSON.parse(user) : null;
  const token = parsedUser?.token;
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
  }, [reload]);


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
    <div className="min-h-screen ">
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
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div
              key={report._id}
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
                          {report.effectiveHours} hours
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
