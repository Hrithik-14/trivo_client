/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { FC, useState, useEffect } from 'react';
import { X, Clock, Plus, FileText, CheckCircle, Info, Search, Calendar, User, UserPlus, Trash2, Zap, CheckSquare, Building, Target, AlertCircle, UserCheck, Folder, Users } from 'lucide-react';
import api from '@/app/api/axios';
import { useForm, Controller, useFieldArray  } from 'react-hook-form';
import toast from 'react-hot-toast';
import Link from 'next/link';

import ManagersUserSearch from '@/app/components/UsersManager';
import { useManangerAuthGuard } from '@/app/hooks/usemanagerAuthGuard';

type Projects = {
  _id: string;
  name: string;
  type: string
};

type Props = {
  selectedProject: Projects | null;
  onSelect: (project: Projects) => void;
  managerId: string; 
};

const ProjectSearch: FC<Props> = ({ selectedProject, onSelect, managerId }) => {
  const [projects, setProjects] = useState<Projects[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProjects = async (searchTerm = "") => {
    if (!managerId) {
      setProjects([]);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get(`/projectManagerSearch/${managerId}`, {
        params: { query: searchTerm },
      });
      
      setProjects(res.data || []);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (managerId) {
      fetchProjects();
    }
  }, [managerId]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    const timeoutId = setTimeout(() => {
      fetchProjects(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="border border-[#ddd] rounded w-full">
      <div className="flex items-center px-2 py-1 border-b border-[#eee]">
        <Search size={16} className="text-gray-500" />
        <input
          type="text"
          placeholder="Search projects..."
          value={query}
          onChange={handleSearchChange}
          className="flex-1 outline-none p-2 text-sm"
        />
      </div>

      <div className="max-h-40 overflow-y-auto">
        {loading ? (
          <p className="text-sm text-gray-500 p-2">Loading...</p>
        ) : projects.length > 0 ? (
          projects.map((project) => (
            <div
              key={project._id}
              onClick={() => onSelect(project)}
              className={`px-3 py-2 cursor-pointer text-sm hover:bg-gray-100 ${
                selectedProject?._id === project._id ? "bg-green-100" : ""
              }`}
            >
              {project.name}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 p-2">
            {query ? "No projects found" : ""}
          </p>
        )}
      </div>

      {selectedProject && (
        <div className="bg-gray-50 px-3 py-2 border-t border-[#eee] text-xs text-gray-600">
          Selected: {selectedProject.name}
        </div>
      )}
    </div>
  );
};

type Option = { value: string; label: string };

type Task = {
  title: string;
  description?: string;
};

type TaskAssignment = {
  employeeCode: Option | null;
  tasks: Task[];
};

type FormData = {
  projectId: Option | null;
  taskAssignments: TaskAssignment[];
};

const AddProject: FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      projectId: null,
      taskAssignments: [{ employeeCode: null, tasks: [{ title: "", description: "" }] }],
    },
  });

  const [selectedProject, setSelectedProject] = useState<Projects | null>(null);
  const [managerId, setManagerId] = useState<string | null>(null);
  const [selectedEmployeeIndex, setSelectedEmployeeIndex] = useState<number | null>(null);
  const [addedEmployees, setAddedEmployees] = useState<Set<string>>(new Set());

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setManagerId(parsed.id);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "taskAssignments",
  });

  const handleProjectSelect = (project: Projects) => {
    setSelectedProject(project);
    setValue("projectId", { value: project._id, label: project.name });
    setSelectedEmployeeIndex(0);
  };

  const onSubmit = async (data: FormData) => {
    if (!data.projectId) {
      toast.error("Please select a project");
      return;
    }

    if (data.taskAssignments.length === 0) {
      toast.error("Please add at least one task assignment");
      return;
    }

    const invalidAssignments = data.taskAssignments.some(
      (assignment) => !assignment.employeeCode || assignment.tasks.length === 0
    );

    if (invalidAssignments) {
      toast.error("Please fill in all employee and task details");
      return;
    }

    try {
      const projectId = data.projectId.value;

      const uniqueEmployees = new Set(
        data.taskAssignments.map((assignment) => assignment.employeeCode!.value)
      );

      for (const employeeCode of uniqueEmployees) {
        try {
          await api.post("/manager/addManagerProject", {
            projectId,
            employeeCode,
          });
          setAddedEmployees(prev => new Set(prev).add(employeeCode));
          onClose()
        } catch (error: any) {
          if (!error?.response?.data?.message?.includes("already")) {
            throw error;
          }
        }
      }

      const allTasks = data.taskAssignments.flatMap((assignment) =>
        assignment.tasks.map((task) => ({
          employeeCode: assignment.employeeCode!.value,
          title: task.title.trim(),
          description: task.description?.trim() || "",
        }))
      );

      await api.post("/manager/addTask", {
        projectId,
        assignments: allTasks,
      });

      const totalTasks = allTasks.length;
      toast.success(
        `Successfully assigned ${totalTasks} task${totalTasks > 1 ? 's' : ''} to ${uniqueEmployees.size} employee${uniqueEmployees.size > 1 ? 's' : ''}`
      );
      
      reset({
        projectId: data.projectId,
        taskAssignments: [{ employeeCode: null, tasks: [{ title: "", description: "" }] }],
      });
      setSelectedEmployeeIndex(0);
      
    } catch (error: any) {
      console.error("API error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to assign project and tasks"
      );
    }
  };

  const addNewAssignment = () => {
    append({ employeeCode: null, tasks: [{ title: "", description: "" }] });
    setSelectedEmployeeIndex(fields.length);
  };

  const removeAssignment = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      if (selectedEmployeeIndex === index) {
        setSelectedEmployeeIndex(null);
      } else if (selectedEmployeeIndex && selectedEmployeeIndex > index) {
        setSelectedEmployeeIndex(selectedEmployeeIndex - 1);
      }
    }
  };

  const addTaskToEmployee = (employeeIndex: number) => {
    const currentTasks = watch(`taskAssignments.${employeeIndex}.tasks`) || [];
    setValue(`taskAssignments.${employeeIndex}.tasks`, [
      ...currentTasks,
      { title: "", description: "" }
    ]);
  };

  const removeTaskFromEmployee = (employeeIndex: number, taskIndex: number) => {
    const currentTasks = watch(`taskAssignments.${employeeIndex}.tasks`) || [];
    if (currentTasks.length > 1) {
      const updatedTasks = currentTasks.filter((_, index) => index !== taskIndex);
      setValue(`taskAssignments.${employeeIndex}.tasks`, updatedTasks);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="relative bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 opacity-30"></div>
          <div className="relative flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Project Assign
              </h2>
              <p className="text-gray-600 mt-1">Add team members and tasks</p>
            </div>
            <button
              onClick={onClose}
              className="group p-2 rounded-xl hover:bg-gray-100/80 transition-all duration-200 hover:scale-105"
            >
              <X size={20} className="text-gray-500 group-hover:text-gray-700 transition-colors" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
            
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
              <label className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-xl shadow-lg">
                    <FileText size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Select Project</h3>
                    <p className="text-sm text-gray-600">Choose the project for task assignment</p>
                  </div>
                </div>
                {managerId && (
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                    <ProjectSearch
                      managerId={managerId}
                      selectedProject={selectedProject}
                      onSelect={handleProjectSelect}
                    />
                  </div>
                )}
                {errors.projectId && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    <AlertCircle size={16} />
                    <span className="text-sm">{errors.projectId.message}</span>
                  </div>
                )}
              </label>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                      <Users size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Team Members</h3>
                      <p className="text-sm text-gray-600">{fields.length} member{fields.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addNewAssignment}
                    className="group flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium"
                  >
                    <UserPlus size={16} />
                    Add Member
                  </button>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className={`group relative `}
                      onClick={() => setSelectedEmployeeIndex(index)}
                    >
                      <div className={`relative overflow-hidden rounded-2xl bg-blue-50 p-4`}>
                        
                        
                        <div className="relative">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg bg-blue-500 text-white`}>
                                <User size={16} />
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm text-gray-900">
                                  Member {index + 1}
                                </h4>
                                <p className="text-xs text-gray-500">Team assignment</p>
                              </div>
                            </div>
                            {fields.length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeAssignment(index);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>

                          <Controller
                            control={control}
                            name={`taskAssignments.${index}.employeeCode`}
                            rules={{ required: "Employee is required" }}
                            render={({ field }) => (
                              <div className="bg-white/80 rounded-xl p-3 border border-gray-200/50">
                                <ManagersUserSearch
                                  managerId={managerId!}
                                  selectedUser={
                                    field.value
                                      ? {
                                          _id: field.value.value,
                                          name: field.value.label,
                                          employeeCode: "",
                                        }
                                      : null
                                  }
                                  onSelect={(user) =>
                                    field.onChange({ value: user.employeeCode, label: user.name })
                                  }
                                />
                              </div>
                            )}
                          />

                          {errors.taskAssignments?.[index]?.employeeCode && (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg mt-2">
                              <AlertCircle size={14} />
                              <span className="text-xs">{errors.taskAssignments[index]?.employeeCode?.message}</span>
                            </div>
                          )}
 
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-3">
                {selectedEmployeeIndex !== null && selectedProject ? (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {watch(`taskAssignments.${selectedEmployeeIndex}.employeeCode`)?.label || 'Selected Member'}
                            </h3>
                            <p className="text-gray-600 flex items-center gap-2">
                              <Building size={16} />
                              {selectedProject.name}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => addTaskToEmployee(selectedEmployeeIndex)}
                          className="group flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium"
                        >
                          <Plus size={16} />
                          Add Task
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {(watch(`taskAssignments.${selectedEmployeeIndex}.tasks`) || []).map((task: Task, taskIndex: number) => (
                        <div key={`${selectedEmployeeIndex}-${taskIndex}`} className="group relative">
                          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                            
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl">
                                  <FileText size={18} className="text-purple-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">Task #{taskIndex + 1}</h4>
                              </div>
                              {(watch(`taskAssignments.${selectedEmployeeIndex}.tasks`) || []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeTaskFromEmployee(selectedEmployeeIndex, taskIndex)}
                                  className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>

                            <div className="space-y-4">
                              <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                  <Target size={16} />
                                  Task Title *
                                </label>
                                <input
                                  {...register(`taskAssignments.${selectedEmployeeIndex}.tasks.${taskIndex}.title`, {
                                    required: "Task title is required"
                                  })}
                                  key={`title-${selectedEmployeeIndex}-${taskIndex}`}
                                  type="text"
                                  placeholder="Enter task title..."
                                  className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 hover:border-gray-400"
                                />
                                {errors.taskAssignments?.[selectedEmployeeIndex]?.tasks?.[taskIndex]?.title && (
                                  <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg mt-2">
                                    <AlertCircle size={14} />
                                    <span className="text-xs">
                                      {errors.taskAssignments[selectedEmployeeIndex]?.tasks?.[taskIndex]?.title?.message}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : selectedEmployeeIndex === null && selectedProject ? (
                  <div className="flex items-center justify-center h-80">
                    <div className="text-center space-y-4">
                      <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                        <UserCheck size={40} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Select Team Member</h3>
                        <p className="text-gray-600 mt-1">Choose a team member from the left to manage their tasks</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-80">
                    <div className="text-center space-y-4">
                      <div className="p-4 bg-indigo-100 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                        <Folder size={40} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Select Project First</h3>
                        <p className="text-gray-600 mt-1">Choose a project above to start assigning tasks to team members</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modern Action Bar */}
            <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
              <div className="flex justify-end items-center">

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={!isValid || isSubmitting || !selectedProject}
                    className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      isValid && selectedProject && !isSubmitting
                        ? "bg-green-500  text-white shadow-lg "
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        Assigning Tasks...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Assign Tasks
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

type Project = {
    _id: string,
    name: string,
    description: string,
    startDate: Date,
    endDate: Date,
    managerId: string,
    members: {
      _id: string;
      name: string;
      role: string;
    }[];
    tasks: string[];
    client: string
    clientEmail: string
    status: string
}

const Projects: FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ projects, setProject ] = useState<Project[]>([])
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState({ ongoing: 0, completed: 0, total: 0 });
    const [reload, setReload] = useState(false);
    const [userId, setUserId] = useState(null)
    const { loading } = useManangerAuthGuard()
    
    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        const parsed = storedUser ? JSON.parse(storedUser) : null;
        setUserId(parsed.id); 
    }, [userId])

    useEffect(() => {
          if (!userId || userId === 'null') {
    setProject([]);
    setTotalPages(0);
    setStats({ total: 0, ongoing: 0, completed: 0 });
    
    return;
  }

        api.get<{ totalPages: number; projects: Project[]; total: number, page: number, stats: {total: number, ongoing: number, completed: number} }>(`/manager/${userId}/getProjectByManager?page=${page}&limit=2`)
        .then(res => {
          setProject(res.data.projects); 
          setTotalPages(res.data.totalPages);
          setStats(res.data.stats)
          
        })
        .catch(err => {console.error("Error in Fetching project:", err);})
    }, [page, reload, userId])

    const handleAdd = () => setIsModalOpen(true);
    const handleCloseModal = () => {setIsModalOpen(false); setReload(prev => !prev)};

    if (loading) return (
        <div className="h-full flex items-center justify-center">
            <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading project details...</p>
            </div>
        </div>
    );

    return (
        <div className='flex flex-col gap-5'>
            {isModalOpen && <AddProject onClose={handleCloseModal} />}
            
            <div className='bg-white w-full h-18 border border-[#ddd] rounded-md flex items-center px-5 justify-between'>
                <div className='flex items-center gap-3'>
                    <FileText size={30} className='p-2 bg-[#18A0FB] text-white rounded-md' />
                    <h2 className='text-2xl font-semibold'>All Projects</h2>
                </div>
                <button onClick={handleAdd} className='bg-[#22C55E] text-white px-4 cursor-pointer rounded py-2 flex items-center gap-3'>
                    <Plus size={15} />
                    Add Project
                </button>
            </div>

            <div className='grid grid-cols-3 gap-5'>
                <div className='bg-white px-5 h-18 flex items-center border border-[#ddd] rounded gap-5'>
                    <Clock size={35} className='p-2 bg-[#DBEAFE] text-[#2563EB] rounded-full' />
                    <div>
                        <h2 className='text-[#696969] text-xs font-medium'>Ongoing Projects</h2>
                        <h4 className='font-semibold'>
                            {stats.ongoing}
                        </h4>
                    </div>
                </div>

                <div className='bg-white px-5 h-18 flex items-center border border-[#ddd] rounded gap-5'>
                    <CheckCircle size={35} className='p-2 bg-[#DCFCE7] text-[#48BB78] rounded-full' />
                    <div>
                        <h2 className='text-[#696969] text-xs font-medium'>Completed Projects</h2>
                        <h4 className='font-semibold'>
                            {stats.completed}
                        </h4>
                    </div>
                </div>

                <div className='bg-white px-5 h-18 flex items-center border border-[#ddd] rounded gap-5'>
                    <Info size={35} className='p-2 bg-[#E9D5FF] text-[#A855F7] rounded-full' />
                    <div>
                        <h2 className='text-[#696969] text-xs font-medium'>Total Projects</h2>
                        <h4 className='font-semibold'>{stats.total}</h4>
                    </div>
                </div>
            </div>

            <div className='flex flex-col gap-4'>
                {projects.map((project) => (
                  <Link href={`/manager/project/${project._id}`} key={project._id} className='p-3 px-5 bg-white border border-[#ddd] rounded-md flex flex-col gap-3'>
                      <div className='flex justify-between'>
                          <div>
                              <h2 className='text-xl font-semibold'>{project.name}</h2>
                              <p className='text-sm text-[#696969]'>{project.description}</p>
                          </div>
                          <div className={`p-2 text-xs h-fit px-4 rounded-full border ${
                            project.status === 'ongoing'
                              ? 'bg-[#DBEAFE] border-[#93C5FD] text-[#3B82F6]'
                              : 'bg-[#DCFCE7] border-[#86EFAC] text-[#22C55E]'
                          }`}>
                            {project.status === 'ongoing' ? 'Ongoing' : 'Completed'}
                          </div>
                      </div>

                      <div className='text-[#696969] flex gap-3'>
                          <Calendar size={15} />
                          <p className='text-xs'>
                              {new Date(project.startDate).toDateString()} - {new Date(project.endDate).toDateString()}
                          </p>
                      </div>

                      <div className='text-[#696969] flex gap-3'>
                          <User size={15} />
                          <p className='text-xs'><span className='font-semibold'>Client: </span>{project.client}</p>
                      </div>

                      <div className='text-[#696969] flex gap-3 flex-col'>
                          <div className='font-semibold text-xs'>Team Members :</div>
                          <div className='ml-5 flex flex-wrap gap-2'>
                              {project.members.filter((member) => member._id !== project.managerId).map((member, index) => (
                                  <div key={index} className='bg-[#EBEBEB] text-[#696969] text-[10px] px-2 py-1 rounded-full w-fit'>
                                      {member.name}
                                  </div>
                              ))}
                          </div>
                      </div>
                      
                  </Link>
                ))}
            <div className="flex justify-center mt-4 gap-2">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(prev => prev - 1)}
                    className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                >
                    Prev
                </button>
                <span className="px-4 py-2">{page} / {totalPages}</span>
                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(prev => prev + 1)}
                    className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
            </div>
        </div>
    );
};

export default Projects;