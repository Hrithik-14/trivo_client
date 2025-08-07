/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { FC, useState, useEffect } from 'react';
import { X, Clock, Plus, FileText, CheckCircle, Info, Search, Calendar, User } from 'lucide-react';
import Select from 'react-select';
import api from '@/app/api/axios';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';

type ManagerOption = { value: string; label: string };

type ProjectFormData = {
  name: string;
  startDate: string;
  endDate: string;
  client: string;
  clientEmail: string;
  description: string;
  managerId: ManagerOption | null;
};

const AddProject: FC<{ onClose: () => void }> = ({ onClose }) => {
  const { register, handleSubmit, control, reset, formState: { errors, isValid, isSubmitting } } = useForm<ProjectFormData>({mode: 'onChange',});

  const [managerOptions, setManagerOptions] = useState<ManagerOption[]>([]);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await api.get('/managers');
        const options = res.data.map((manager: any) => ({
          value: manager._id,
          label: manager.name
        }));
        setManagerOptions(options);
        
      } catch (err) {
        console.error("Failed to fetch managers:", err);
      }
    };

    fetchManagers();
  }, []);

  const onSubmit = (data: ProjectFormData) => {
    const project = {
      ...data,
      managerId: data.managerId?.value,
    };

    api.post('/admin/addAdminProject', project)
    toast.success('Project created successfull')

    reset();
  };

  return (
    <div className='fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative shadow-2xl text-black">
        <div className='flex justify-between'>
          <h2 className='font-bold text-lg'>Add Project</h2>
          <button onClick={onClose} className='cursor-pointer'>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-3 mt-3'>
          <label className='flex flex-col gap-1'>
            <p className='text-xs font-semibold'>Project name</p>
            <input type="text" {...register("name", { required: "Project name is required" })}  placeholder='Enter project name' className='w-full h-[38px] border px-3 border-[#ddd] rounded' />
            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
          </label>
          <div className='flex gap-3'>
            <label className='flex flex-col gap-1 flex-1'>
              <p className='text-xs font-semibold'>Starting Date</p>
              <input type="date" {...register("startDate", { required: "Starting date is required" })} className='w-full border px-3 border-[#ddd] h-[38px] rounded' />
              {errors.startDate && <span className="text-red-500 text-xs">{errors.startDate.message}</span>}
            </label>
            <label className='flex flex-col gap-1 flex-1'>
              <p className='text-xs font-semibold'>Ending Date</p>
              <input type="date" {...register("endDate", { required: "Ending date is required" })} className='w-full border px-3 border-[#ddd] h-[38px] rounded' />
              {errors.endDate && <span className="text-red-500 text-xs">{errors.endDate.message}</span>}
            </label>
          </div>
          <div className='flex gap-3'>
            <label className='flex flex-col gap-1 flex-1'>
              <p className='text-xs font-semibold'>Client Name</p>
              <input type="text" {...register("client", { required: "Client name is required" })} placeholder='Client name' className='w-full border px-3 border-[#ddd] h-[38px] rounded' />
              {errors.client && <span className="text-red-500 text-xs">{errors.client.message}</span>}
            </label>
            <label className='flex flex-col gap-1 flex-1'>
              <p className='text-xs font-semibold'>Client Mail</p>
              <input type="email" {...register("clientEmail", { required: "Client mail id is required" })} placeholder='Client mail' className='w-full border px-3 border-[#ddd] h-[38px] rounded' />
              {errors.clientEmail && <span className="text-red-500 text-xs">{errors.clientEmail.message}</span>}
            </label>
          </div>
          <label className='flex flex-col gap-1'>
            <p className='text-xs font-semibold'>Add Manager</p>
            <Controller
              control={control}
              name="managerId"
              rules={{ required: "Manager is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={managerOptions}
                  placeholder='Select manager'
                  className='text-sm'
                  isClearable
                />
              )}
            />
            {errors.managerId && <span className="text-red-500 text-xs">{errors.managerId.message}</span>}
          </label>
          <label className='flex flex-col gap-1'>
            <p className='text-xs font-semibold'>Description</p>
            <input type="text" {...register("description", { required: "Project description is required" })} placeholder='Describe project' className='w-full h-[38px] border px-3 border-[#ddd] rounded' />
            {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
          </label>
          <div className='flex justify-end'>
            <button
              type="submit"
              disabled={!isValid}
              className={`px-4 py-2 rounded  text-white ${
                isValid ? "bg-[#22C55E] cursor-pointer" : "bg-gray-400 cursor-not-allowed"
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


const Projects: FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAdd = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

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
                        <h4 className='font-semibold'>15</h4>
                    </div>
                </div>

                <div className='bg-white px-5 h-18 flex items-center border border-[#ddd] rounded gap-5'>
                    <CheckCircle size={35} className='p-2 bg-[#DCFCE7] text-[#48BB78] rounded-full' />
                    <div>
                        <h2 className='text-[#696969] text-xs font-medium'>Ongoing Projects</h2>
                        <h4 className='font-semibold'>10</h4>
                    </div>
                </div>

                <div className='bg-white px-5 h-18 flex items-center border border-[#ddd] rounded gap-5'>
                    <Info size={35} className='p-2 bg-[#E9D5FF] text-[#A855F7] rounded-full' />
                    <div>
                        <h2 className='text-[#696969] text-xs font-medium'>Ongoing Projects</h2>
                        <h4 className='font-semibold'>25</h4>
                    </div>
                </div>
            </div>
            <div>
                <div className='flex items-center gap-3 border border-[#ddd] w-fit px-3 py-2 rounded-full bg-white'>
                    <Search size={15} className='text-[#696969]' />
                    <input type="text" placeholder='search project name...' className='w-60 focus:outline-none' />
                </div>
            </div>
            <div className='p-3 px-5 bg-white border border-[#ddd] rounded-md flex flex-col gap-3'>
                <div className='flex justify-between'>
                    <div>
                        <h2 className='text-xl font-semibold'>Company portal</h2>
                        <p className='text-sm text-[#696969]'>Building comprehensive dashboard</p>
                    </div>
                    <div className='p-2 text-xs bg-[#DBEAFE] h-fit px-4 rounded-full border border-[#93C5FD] text-[#3B82F6]'>
                        Ongoing
                    </div>
                </div>
                <div className='text-[#696969] flex gap-3'>
                    <Calendar size={15} />
                    <p className='text-xs'>Jan 15 2025 - Aug 30 2025</p>
                </div>
                <div className='text-[#696969] flex gap-3'>
                    <User size={15} />
                    <p className='text-xs'><span className='font-semibold'>Client : </span>InfoTech Solutions</p>
                </div>
                <div className='text-[#696969] flex gap-3 flex-col'>
                    <div className='font-semibold text-xs'>Team Members :</div>
                    <div className='ml-5'>
                        <div className='bg-[#EBEBEB] text-[#696969] text-[10px] px-2 rounded-full w-fit'>
                            Danish
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Projects;
