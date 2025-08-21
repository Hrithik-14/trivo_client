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
  Trash2,
} from "lucide-react";
import api from "@/app/api/axios";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { RootState } from '@/app/store'
import { useSelector } from "react-redux";
import { useEmployeeAuthGuard } from "@/app/hooks/useEmployeeAuthGuard";
import { motion } from "framer-motion";

interface DailyReportForm {
  employeeId: string;
  currentProject: string;
  projectStatus: string;
  startTime: string;
  endTime: string;
  completedTasks: { value: string }[];
  plannedTasks: { value: string }[];
  performance: string;
  challenges: string;
  supportNeeded: string;
  date: string
}

interface MultipleDailyReportsForm {
  reports: DailyReportForm[];
}

interface Project {
  name: string;
  _id: string;
}

interface Task {
  title: string;
  _id: string;
}

interface Report { _id: number; date: Date; effectiveHours: string; status: string; completedTasks: Task[]; performance: string; plannedTasks: Task[]; statusColor: string; challenges: string; submitttedBy: string; submittedDetails?: string; }

const CreateDailyReport: FC<{ onClose: () => void }> = ({ onClose }) => {
  const user = useSelector((state: RootState) => state.user.user);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<{ [key: number]: Task[] }>({});

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<MultipleDailyReportsForm>({
    defaultValues: {
      reports: [
        {
          employeeId: user?.employeeCode || "",
          currentProject: "",
          projectStatus: "",
          startTime: "",
          endTime: "",
          completedTasks: [{ value: "" }],
          plannedTasks: [{ value: "" }],
          performance: "",
          challenges: "",
          supportNeeded: "",
          date: new Date().toISOString().split("T")[0],
        },
      ],
    },
  });

  const { fields: reportFields, append: appendReport, remove: removeReport } = useFieldArray({
    control,
    name: "reports",
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/getProjectByEmployee/${user?.id}`);
        setProjects(response.data.projects || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProject();
  }, [user?.id]);

  const handleProjectChange = async (projectId: string, index: number) => {
    if (!projectId) return setTasks((prev) => ({ ...prev, [index]: [] }));
    try {
      const response = await api.get(
        `/project/${projectId}/user/${user?.id}/tasks`
      );
      setTasks((prev) => ({ ...prev, [index]: response.data.data || [] }));
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks((prev) => ({ ...prev, [index]: [] }));
    }
  };

  const onSubmit = async (data: MultipleDailyReportsForm) => {
    try {
      const token = user?.token;
      if (!token) throw new Error("No authentication token found");

      const reportsToSubmit = data.reports.map(report => ({
      currentProject: report.currentProject,
      startTime: report.startTime,
      endTime: report.endTime,
      completedTasks: report.completedTasks
        .filter(task => task.value !== "")
        .map(task => task.value),
      plannedTasks: report.plannedTasks
        .filter(task => task.value !== "")
        .map(task => task.value),
      performance: report.performance || "",
      challenges: report.challenges || "",
      supportNeeded: report.supportNeeded || "",
      date: report.date
    }))
        await api.post(
          `report/addReport/${user?.id}`,
          reportsToSubmit,
          { headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } }
        );
      

      toast.success("All daily reports submitted successfully!");
      onClose();
    } catch (error: any) {
      console.error("Error submitting daily report:", error);
      toast.error(error.response?.data?.message || "Failed to submit report");
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Create Daily Report</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-8">
            {reportFields.map((report, index) => (
              <div key={report.id} className="border border-gray-200 rounded-xl p-6 bg-gray-50 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-xl text-gray-800">Daily Report #{index + 1}</h3>
                  </div>
                  {reportFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeReport(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-2 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Employee ID
                      </label>
                      <input
                        {...register(`reports.${index}.employeeId`)}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Current Project
                      </label>
                      <select
                        {...register(`reports.${index}.currentProject`, {
                          required: "Project is required",
                          onChange: (e) => handleProjectChange(e.target.value, index),
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">Select a project...</option>
                        {projects.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      {errors.reports?.[index]?.currentProject && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle size={16} className="mr-1" />
                          {errors.reports[index]?.currentProject?.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                      <input 
                      type="date"
                      {...register(`reports.${index}.date`)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        {...register(`reports.${index}.startTime`, { required: "Start time is required" })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      {errors.reports?.[index]?.startTime && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle size={16} className="mr-1" />
                          {errors.reports[index]?.startTime?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        {...register(`reports.${index}.endTime`, { required: "End time is required" })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      {errors.reports?.[index]?.endTime && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle size={16} className="mr-1" />
                          {errors.reports[index]?.endTime?.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tasks Completed
                      </label>
                      <TaskFieldArray
                        control={control}
                        tasks={tasks[index] || []}
                        name={`reports.${index}.completedTasks`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Planned Tasks
                      </label>
                      <TaskFieldArray
                        control={control}
                        tasks={tasks[index] || []}
                        name={`reports.${index}.plannedTasks`}
                      />
                    </div>
                  </div>

                  <div className="space-y-6 flex gap-5 ">
                    <div className="w-full h-[100%] ">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Performance & Key Achievements
                      </label>
                      <textarea
                        {...register(`reports.${index}.performance`)}
                        placeholder="Describe your key achievements"
                        rows={3}
                        className="w-full px-4 py-3 min-h-57 border h-full border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      />
                    </div>

                    <div className="w-full">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Challenges Faced
                        </label>
                        <textarea
                          {...register(`reports.${index}.challenges`)}
                          placeholder="Describe any challenges..."
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Support Needed
                        </label>
                        <textarea
                          {...register(`reports.${index}.supportNeeded`)}
                          placeholder="Describe any support you need"
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div>
              <button
                type="button"
                onClick={() =>
                  appendReport({
                    employeeId: user?.employeeCode || "",
                    currentProject: "",
                    projectStatus: "",
                    startTime: "",
                    endTime: "",
                    completedTasks: [{ value: "" }],
                    plannedTasks: [{ value: "" }],
                    performance: "",
                    challenges: "",
                    supportNeeded: "",
                    date: new Date().toISOString().split("T")[0],
                  })
                }
                className="inline-flex items-center px-6 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 rounded-lg font-medium transition-colors border border-blue-200"
              >
                <Plus size={20} className="mr-2" />
                Add Another Report
              </button>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 flex items-center space-x-2"
              >
                <span>Submit Reports</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};


interface TaskFieldArrayProps {
  control: any;
  tasks: Task[];
  name: string;
}

const TaskFieldArray: FC<TaskFieldArrayProps> = ({ control, tasks, name }) => {
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <div className="space-y-3">
      {fields.map((field, idx) => (
        <div key={field.id} className="flex items-center space-x-2">
          <select
            {...control.register(`${name}.${idx}.value`, { required: true })}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            defaultValue=""
          >
            <option value="" disabled>
              {tasks.length === 0 ? "No tasks available" : "Select a task..."}
            </option>
            {tasks.map((t) => (
              <option key={t._id} value={t._id}>
                {t.title}
              </option>
            ))}
          </select>
          {fields.length > 1 && (
            <button
              type="button"
              onClick={() => remove(idx)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-2 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => append({ value: "" })}
        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
      >
        <Plus size={16} className="mr-1" />
        Add Task
      </button>
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
            <motion.button
              onClick={() => setShowStyle(false)}
              animate={{
                backgroundColor: !showStyle ? "#fff" : "#eaeaea",
                color: !showStyle ? "#2563eb" : "#4b5563",
                scale: !showStyle ? 1.05 : 1,
                boxShadow: !showStyle ? "0 2px 6px rgba(0,0,0,0.15)" : "none",
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg"
            >
              <Columns className="w-4 h-4" />
              <span className="font-medium text-sm">Grid</span>
            </motion.button>

            <motion.button
              onClick={() => setShowStyle(true)}
              animate={{
                backgroundColor: showStyle ? "#fff" : "#eaeaea",
                color: showStyle ? "#2563eb" : "#4b5563",
                scale: showStyle ? 1.05 : 1,
                boxShadow: showStyle ? "0 2px 6px rgba(0,0,0,0.15)" : "none",
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg"
            >
              <Rows className="w-4 h-4" />
              <span className="font-medium text-sm">Rows</span>
            </motion.button>
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