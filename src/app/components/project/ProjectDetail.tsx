/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { FC, useState, useEffect } from "react";
import { ChevronDown, User, Building2, Clock, Users, Plus,  UserPlus, Trash2, Zap, CheckSquare, Building, Target, AlertCircle, UserCheck, Folder, X, FileText } from "lucide-react";
import Image from "next/image";
import { differenceInDays, parseISO } from "date-fns";
import api from "@/app/api/axios";
import { notFound } from "next/navigation";
import Link from "next/link";
import Messenger from "../messenger/Messenger";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { Rnd } from "react-rnd";
import { useFieldArray, useForm, useController, Controller } from "react-hook-form";
import toast from 'react-hot-toast';
import ManagersUserSearch from '@/app/components/UsersManager';



type Projects = {
  _id: string;
  name: string;
  type: string
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

const AddProject: FC<{ onClose: () => void; projectId: string; projectName: string }> = ({ onClose, projectId, projectName }) => {
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

    const [selectedProject, setSelectedProject] = useState<Projects | null>({
        _id: projectId,
        name: projectName,
        type: "project"
    });
  const [selectedEmployeeIndex, setSelectedEmployeeIndex] = useState<number | null>(null);
  const [addedEmployees, setAddedEmployees] = useState<Set<string>>(new Set());
  const user = useSelector((state: RootState) => state.user.user)
  
  const managerId = user?.id



  const { fields, append, remove } = useFieldArray({
    control,
    name: "taskAssignments",
  });

    useEffect(() => {
    setSelectedProject({
      _id: projectId,
      name: projectName,
      type: "project"
    });
    setValue("projectId", { value: projectId, label: projectName });
  }, [projectId, projectName, setValue]);




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
                Team Member
              </h2>
            </div>
            <button
              onClick={onClose}
              className="group p-2 rounded-xl hover:bg-gray-100/80 transition-all duration-200 hover:scale-105"
            >
              <X size={20} className="text-gray-500 group-hover:text-gray-700 transition-colors" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-120px)] scrollbar-thin">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">

            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
              <label className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-xl shadow-lg">
                    <FileText size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{projectName}</h3>
                    
                  </div>
                </div>
                
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

            <div>
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







interface Member {
    _id: string;
    name: string;
    role: string;
    employeeCode: string;
    profileImage: string;
    email?: string;
}

interface Manager {
    _id: string;
    name: string;
    profileImage: string;
    email?: string;
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [project, setProject] = useState<Project | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isActive, setIsActive] = useState<boolean | null>(null);
    const user = useSelector((state: RootState) => state.user.user)
    const [position, setPosition] = useState({ x: SIDEBAR_WIDTH + 20, y: 20 });
    const [reload, setReload] = useState(false);
    const [showMessenger, setShowMessenger] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

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
    }, [projectId, reload]);

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

    const handleOpenChat = (member: Member) => {
        const contact: Contact = {
            _id: member._id,
            name: member.name,
            email: member.email || '',
            employeeCode: member.employeeCode,
            createdBy: '',
            createdAt: new Date().toISOString(),
            profileImage: member.profileImage
        };
        
        setSelectedContact(contact);
        setShowMessenger(true);
    };

    const handleOpenManagerChat = () => {
        const contact: Contact = {
            _id: project!.managerId._id,
            name: project!.managerId.name,
            email: project!.managerId.email || '',
            employeeCode: '',
            createdBy: '',
            createdAt: new Date().toISOString(),
            profileImage: project!.managerId.profileImage
        };
        
        setSelectedContact(contact);
        setShowMessenger(true);
    };

    const handleAdd = () => setIsModalOpen(true);
    const handleCloseModal = () => {setIsModalOpen(false); setReload((prev) => !prev)};

    if (loading) return (
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
        <>
            <div className="flex flex-col gap-5 bg-white p-5 px-8">
                {isModalOpen && <AddProject onClose={handleCloseModal} projectId={project._id} projectName={project.name} />}
                {role === 'admin' ? (
                    <div className="w-full flex justify-end">
                        <Link href={`/admin/Project/edit/${project._id}`} className="py-2 px-6 border rounded hover:bg-gray-50">
                            Edit Project
                        </Link>
                    </div>
                ) : (
                    role === 'manager' ? (
                    <div className="w-full flex justify-end">
                        <button onClick={handleAdd} className='bg-[#22C55E] text-white px-6 cursor-pointer rounded py-3 flex items-center gap-3 w-fit'>
                            <Plus size={15} />
                            Add Members
                        </button>
                    </div>
                    ) : (
                        <></>
                    )
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
                        {role === 'admin' ? (
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
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10">
                                <Image
                                    src={project.managerId.profileImage || '/avatar.png'}
                                    alt="Avatar"
                                    fill
                                    className="rounded-full object-cover"
                                />
                            </div>
                            <p className="font-semibold">{project.managerId.name}</p>
                        </div>
                            { !(user?.id === project.managerId._id) && (
                                <button
                                onClick={handleOpenManagerChat}
                                className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                                Message
                            </button>
                            )}
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
                        {project.members.filter((member) => member.role.toLowerCase() !== "manager").map((member) => (
                            <div
                                key={member._id}
                                className="border border-[#ddd] p-3 rounded flex justify-between items-center"
                            >
                                <div className="flex gap-3 items-center">
                                    <div className="relative w-10 h-10">
                                        <Image
                                            src={member.profileImage || '/avatar.png'}
                                            alt="Avatar"
                                            fill
                                            className="rounded-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <p>{member.name}</p>
                                        <p className="text-xs text-gray-600">{member.employeeCode}</p>
                                    </div>
                                </div>
                                { !(user?.id === member._id) && (
                                    <button
                                    onClick={() => handleOpenChat(member)}
                                    className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                >
                                    Message
                                </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showMessenger && selectedContact && (
                <Rnd
                    size={{ width: 500, height: 600 }}
                    position={position}
                    bounds="window"
                    onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
                    enableResizing={false}
                    dragHandleClassName="drag-handle"
                    className="fixed z-50 bg-white rounded-lg shadow-2xl"
                >
                    <div className="bg-white rounded-lg shadow-2xl w-[500px] h-[600px] flex flex-col">
                        <div className="drag-handle bg-blue-400 text-white px-4 py-2 rounded-t-lg flex items-center justify-between">
                            <h3 className="font-semibold">
                                Messenger
                            </h3>
                            <button
                                onClick={() => {
                                    setShowMessenger(false);
                                    setSelectedContact(null);
                                }}
                                className="text-white hover:bg-blue-600 p-1 rounded"
                            >
                                <Plus className="rotate-45" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <Messenger 
                                role={role as "admin" | "manager" | "employee"} 
                                initialContact={selectedContact}
                            />
                        </div>
                    </div>
                </Rnd>
            )}
        </>
    );
};

export default ProjectDetail;