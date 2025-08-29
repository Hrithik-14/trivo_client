/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { FC, useState, useEffect } from 'react';
import { X, Clock, Plus, FileText, CheckCircle, Info, Calendar, User } from 'lucide-react';

import api from '@/app/api/axios';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
// import Link from 'next/link';
import ProjectSearch from '@/app/components/ProjectSearch';

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import ManagerProjectSearch from '@/app/components/ManagerProjectSearch';
import { AxiosError } from 'axios';
import Link from 'next/link';


type ManagerOption = { value: string; label: string };

const today = new Date();
today.setHours(0, 0, 0, 0); 

const projectSchema = z
  .object({
    name: z.string().min(1, "Project name is required"),
    startDate: z.string().refine((val) => {
      const start = new Date(val);
      return start >= today;
    }, "Start date cannot be in the past"),
    endDate: z.string(),
    client: z.string().min(1, "Client name is required"),
    clientEmail: z.string().email("Invalid email address"),
    managerId:z.object({
      value: z.string().min(1),
      label: z.string(),
    }).refine((data) => data.value && data.label, {
      message: "Manager is required",
      path: ["value"],
    }),
    description: z.string().min(1, "Project description is required"),
  })
  .refine((data) => {
    if (!data.startDate || !data.endDate) return true;
    return new Date(data.endDate) > new Date(data.startDate);
  }, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

type ProjectFormData = z.infer<typeof projectSchema>;

const AddProject: FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ProjectFormData>({
    mode: "onChange",
    resolver: zodResolver(projectSchema),
  });
  const startDate = watch("startDate");
  const today = new Date().toISOString().split("T")[0];

  const [managerOptions, setManagerOptions] = useState<ManagerOption[]>([]);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await api.get("/managersdeatil");
        const options = res.data.map((manager: any) => ({
          value: manager._id,
          label: manager.name,
        }));
        setManagerOptions(options);
      } catch (err) {
        console.error("Failed to fetch managers:", err);
      }
    };

    fetchManagers();
  }, []);

  const onSubmit = async (data: ProjectFormData) => {
    const project = {
      ...data,
      managerId: data.managerId?.value,
    };

    try {
      await api.post("/admin/addAdminProject", project);
      toast.success("Project created successfully");
      onClose();
      reset();
    } catch (err) {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data?.message || "Failed to create project");
      } else {
        toast.error("Failed to create project");
      }
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative shadow-2xl text-black">
        <div className="flex justify-between">
          <h2 className="font-bold text-lg">Add Project</h2>
          <button onClick={onClose} className="cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3 mt-3"
        >
          {/* Project Name */}
          <label className="flex flex-col gap-1">
            <p className="text-xs font-semibold">Project name</p>
            <input
              type="text"
              {...register("name")}
              placeholder="Enter project name"
              className="w-full h-[38px] border px-3 border-[#ddd] rounded"
            />
            {errors.name && (
              <span className="text-red-500 text-xs">
                {errors.name.message}
              </span>
            )}
          </label>

          {/* Dates */}
          <div className="flex gap-3">
            <label className="flex flex-col gap-1 flex-1">
              <p className="text-xs font-semibold">Starting Date</p>
              <input
                type="date"
                {...register("startDate",{
                  validate: value => value >= today || "Start date cannot be in the past"
                })}
                min={today}
                className="w-full border px-3 border-[#ddd] h-[38px] rounded"
              />
              {errors.startDate && (
                <span className="text-red-500 text-xs">
                  {errors.startDate.message}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-1 flex-1">
              <p className="text-xs font-semibold">Ending Date</p>
              <input
                type="date"
                {...register("endDate", {
                  validate: value => !startDate || value > startDate || "End date must be after start date"
                })}
                min={startDate || today}
                className="w-full border px-3 border-[#ddd] h-[38px] rounded"
              />
              {errors.endDate && (
                <span className="text-red-500 text-xs">
                  {errors.endDate.message}
                </span>
              )}
            </label>
          </div>

          {/* Client Info */}
          <div className="flex gap-3">
            <label className="flex flex-col gap-1 flex-1">
              <p className="text-xs font-semibold">Client Name</p>
              <input
                type="text"
                {...register("client")}
                placeholder="Client name"
                className="w-full border px-3 border-[#ddd] h-[38px] rounded"
              />
              {errors.client && (
                <span className="text-red-500 text-xs">
                  {errors.client.message}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-1 flex-1">
              <p className="text-xs font-semibold">Client Mail</p>
              <input
                type="email"
                {...register("clientEmail")}
                placeholder="Client mail"
                className="w-full border px-3 border-[#ddd] h-[38px] rounded"
              />
              {errors.clientEmail && (
                <span className="text-red-500 text-xs">
                  {errors.clientEmail.message}
                </span>
              )}
            </label>
          </div>

          {/* Manager */}
          <label className="flex flex-col gap-1">
            <p className="text-xs font-semibold">Add Manager</p>
            <Controller
              control={control}
              name="managerId"
              render={({ field }) => (
                <>
                  <ManagerProjectSearch
                    role="manager"
                    selectedUser={
                      field.value
                        ? {
                            _id: field.value.value,
                            name: field.value.label,
                            role: "manager",
                            employeeCode: "",
                          }
                        : null
                    }
                    onSelect={(user) =>
                      field.onChange({ value: user._id, label: user.name })
                    }
                  />
                  {errors.managerId && (
                    <span className="text-red-500 text-xs">
                      {errors.managerId.message}
                    </span>
                  )}
                </>
              )}
            />
          </label>

          {/* Description */}
          <label className="flex flex-col gap-1">
            <p className="text-xs font-semibold">Description</p>
            <input
              type="text"
              {...register("description")}
              placeholder="Describe project"
              className="w-full h-[38px] border px-3 border-[#ddd] rounded"
            />
            {errors.description && (
              <span className="text-red-500 text-xs">
                {errors.description.message}
              </span>
            )}
          </label>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={`px-4 py-2 rounded text-white ${
                isValid
                  ? "bg-[#22C55E] cursor-pointer"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Adding..." : "Add Project"}
            </button>
          </div>
        </form>
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
    }[];
    tasks: string[];
    client: string
    clientEmail: string
    status: string
}


const Projects: FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ projects, setProject ] = useState<Project[]>([])
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState({ ongoing: 0, completed: 0, total: 0 });
    const [reload, setReload] = useState(false);
    useEffect(() => {
        api.get<{ totalPages: number; project: Project[]; total: number, page: number, stats: {total: number, ongoing: number, completed: number} }>(`/admin/getAllProject?page=${page}&limit=2`)
        .then(res => {
          setProject(res.data.project); 
          setTotalPages(res.data.totalPages);
          setStats(res.data.stats)
          setLoading(false);
        })
        .catch(err => {console.error("Error in Fetching project:", err); setLoading(false);})
    }, [page, reload])

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

            <div>
                
                <ProjectSearch/>
            </div>

            {/* Render all projects */}
            <div className='flex flex-col gap-4'>
                {projects.map((project) => (
               
                   <Link href={`/admin/Project/${project._id}`} key={project._id} className='p-3 px-5 bg-white border border-[#ddd] rounded-md flex flex-col gap-3'>
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
