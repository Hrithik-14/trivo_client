/* eslint-disable react-hooks/rules-of-hooks */
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
  Swords,
  Rows4,
  Columns4,
  Rows,
  Columns,
} from "lucide-react";
import api from "@/app/api/axios";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { RootState } from '@/app/store'
import { useSelector } from "react-redux";
import { useEmployeeAuthGuard } from "@/app/hooks/useEmployeeAuthGuard";
// import { useEmployeeAuthGuard } from "@/app/hooks/useEmployeeAuthGuard";

interface DailyReportForm {
  employeeId: string;
  currentProject: string;
  projectStatus: string;
  startTime: string;
  endTime: string;
  effectiveHours: string;
  completedTasks: { value: string }[];
  plannedTasks: { value: string }[];
  performance: string;
  challenges: string;
  supportNeeded: string;
}

interface Report {
  _id: number;
  date: string;
  effectiveHours: string;
  status: string;
  completedTasks: Task[];
  performance: string;
  plannedTasks: Task[];
  statusColor: string;
  challenges: string;
  submitttedBy: string;
  submittedDetails?: string;
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
  const user = useSelector((state: RootState) => state.user.user)
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);


  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<DailyReportForm>({
    defaultValues: {
      employeeId: user?.employeeCode,
      currentProject: "",
      projectStatus: "",
      startTime: "",
      endTime: "",
      completedTasks: [{ value: "" }],
      plannedTasks: [{ value: "" }],
      performance: "",
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
          `/getProjectByEmployee/${user?.id}`
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
            `/project/${selectedProjectId}/user/${user?.id}/tasks`
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
      const token = user?.token;
      if (!token) throw new Error("No authentication token found");

      await api.post(
        `report/addReport/${user?.id}`,
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto scrollbar-thin">
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
                {errors.currentProject && (
                  <span className="text-red-500 text-xs">
                    {errors.currentProject.message}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
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
                  {errors.startTime && (
                    <span className="text-red-500 text-xs">
                      {errors.startTime.message}
                    </span>
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
                    <span className="text-red-500 text-xs">
                      {errors.endTime.message}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <CheckSquare className="text-purple-600 mr-2" size={20} />
                <h3 className="text-lg font-medium text-gray-800">
                  Tasks & Activities
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      {errors.completedTasks && (
                        <span className="text-red-500 text-xs">
                          {errors.completedTasks.message}
                        </span>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Performance & Feedback
                </h3>
                <textarea
                  placeholder="key acheivemnets"
                  {...register("performance", {
                    required: "Key achievements are required",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none h-24"
                />
                {errors.performance && (
                <span className="text-red-500 text-xs">
                  {errors.performance.message}
                </span>
              )}
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Challenges & Support
                </h3>
                <textarea
                  placeholder="Challenges faced"
                  {...register("challenges")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none h-10 mb-4 scrollbar-thin"
                />
                <textarea
                  placeholder="support needed"
                  {...register("supportNeeded")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none h-10 scrollbar-thin overflow-auto"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end p-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className={`px-6 py-2 rounded-md text-white font-medium ${
                isSubmitting || !isValid
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DailyReport: FC = () => {
  const user = useSelector((state: RootState) => state.user.user)
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reload, setReload] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [load, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedReportId, setExpandedReportId] = useState<number | null>(null);
  const [showStyle, setShowStyle] = useState(true)
  const { loading } = useEmployeeAuthGuard()



  if (!user?.token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Authentication Required</h2>
          <p className="text-gray-600 mt-2">Please log in to view your reports.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await api.get(`/report/getReportsByEmployee/${user?.id}`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        
        if (response.data && response.data.report) {
          const uniqueStatuses = Array.from(
            new Set(response.data.report.map((report: Report) => report.status))
          ) as string[];
          setStatuses(uniqueStatuses);
        }
      } catch (error) {
        console.error("Failed to fetch statuses", error);
        setError("Failed to load report statuses");
      }
    };

    if (user?.id && user?.token) {
      fetchStatuses();
    }
  }, [user?.id, user?.token]);

  useEffect(() => {
    const fetchReports = async () => {
      if (!user?.id || !user?.token) return;

      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(
          `/report/getReportsByEmployee/${user.id}`,{ headers: { Authorization: `Bearer ${user?.token}` } }
          
        );
        
        if (response.data && response.data.report) {
          setReports(response.data.report);
        } else {
          setReports([]);
        }
      } catch (error) {
        console.error("Failed to fetch reports:", error);
        setError("Failed to load reports. Please try again.");
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [reload, user?.id, user?.token]);

  const handleAdd = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setReload((prev) => !prev);
  };

  const toggleExpand = (id: number) => {
    setExpandedReportId(expandedReportId === id ? null : id);
  };

  const filteredReports = reports.filter((report) => {
    const matchesStatus =
      statusFilter === "All Status" || report.status === statusFilter;

    return matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {isModalOpen && <CreateDailyReport onClose={handleCloseModal} />}
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">My Daily Reports</h1>
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

      <div className="mx-auto py-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="bg-[#eaeaea] p-1 rounded-xl inline-flex">
          <button
            onClick={() => setShowStyle(false)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              !showStyle 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Columns className="w-4 h-4" />
            <span className="font-medium text-sm">Grid</span>
          </button>
          <button
            onClick={() => setShowStyle(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              showStyle 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Rows className="w-4 h-4" />
            <span className="font-medium text-sm">Rows</span>
          </button>
        </div>
        </div>

        <div className={` ${showStyle === true ? 'flex flex-col gap-5' : 'grid grid-cols-2 gap-5'}`}>
          {filteredReports.map((report) => (
            <div
              key={report._id}
              className={`${report.status === 'rejected' ? 'bg-[#fddbdb]' : 'bg-white'} rounded-lg border h-fit border-gray-200 hover:shadow-md transition-shadow `}
            >
              <div
                className="p-6 cursor-pointer"
                onClick={() => toggleExpand(report._id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Report - {new Date(report.date).toLocaleDateString()}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {report.effectiveHours} hours
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            report.status === 'pending' ? 'bg-yellow-100 border border-yellow-300 text-yellow-500' : report.status === 'accepted' ? 'bg-green-100 border border-green-300 text-green-500' : 'bg-red-100 border border-red-300 text-red-500'
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div 
                      className={`transform transition-transform duration-200 ${
                        expandedReportId === report._id ? 'rotate-180' : ''
                      }`}
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {expandedReportId === report._id && (
                  <div className="mt-4 space-y-2 border-t border-[#ddd] pt-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
                        {report.completedTasks?.length || 0} tasks completed
                      </div>
                      <div className="text-xs ml-10 list-disc text-[#696969]">
                        {report.completedTasks?.map((t) => (
                          <li key={t._id}>{t.title}</li>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Target className="w-4 h-4 mr-2 text-green-500" />
                      Key achievements: {report.performance || "No achievements logged"}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                      Next day planned: {report.plannedTasks ? "Planned" : "Not planned"}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Swords className="w-4 h-4 mr-2 text-red-500" />
                      Challenges Faced: {report.challenges ? report.challenges : 'No challenges'}
                    </div>
                    
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>

        {filteredReports.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== "All Status"
                ? "Try adjusting your search or filter criteria."
                : "Start by creating your first daily report."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyReport;