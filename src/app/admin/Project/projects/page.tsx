"use client"

import React, { FC, useState } from 'react';
import { X, Clock, Plus, FileText, CheckCircle, Info, Search, Calendar, User } from 'lucide-react';
import Select, { SingleValue } from 'react-select';

type ManagerOption = { value: string; label: string };

const managerOptions: ManagerOption[] = [
    { value: 'john', label: 'John Doe' },
    { value: 'jane', label: 'Jane Smith' },
    { value: 'alice', label: 'Alice Johnson' },
    { value: 'bob', label: 'Bob Williams' },
];

const AddProject: FC<{ onClose: () => void }> = ({ onClose }) => {
    const [selectedManager, setSelectedManager] = useState<ManagerOption | null>(null);

    const handleManagerChange = (option: SingleValue<ManagerOption>) => {
        setSelectedManager(option);
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
                <form action="" className='flex flex-col gap-3 mt-3'>
                    <label className='flex flex-col gap-1'>
                        <p className='text-xs font-semibold'>Project name</p>
                        <input type="text" placeholder='Enter project name' className='w-full h-[38px] border px-3 border-[#ddd] rounded' />
                    </label>
                    <div className='flex gap-3'>
                        <label className='flex flex-col gap-1 flex-1'>
                            <p className='text-xs font-semibold'>Starting Date</p>
                            <input type="date" className='w-full border px-3 border-[#ddd] h-[38px] rounded' />
                        </label>
                        <label className='flex flex-col gap-1 flex-1'>
                            <p className='text-xs font-semibold'>Ending Date</p>
                            <input type="date" className='w-full border px-3 border-[#ddd] h-[38px] rounded' />
                        </label>
                    </div>
                    <label className='flex flex-col gap-1'>
                        <p className='text-xs font-semibold'>Add manager</p>
                        <Select
                            options={managerOptions}
                            value={selectedManager}
                            onChange={handleManagerChange}
                            placeholder='Select manager'
                            className='text-sm'
                            isClearable
                        />
                    </label>
                    <label className='flex flex-col gap-1'>
                        <p className='text-xs font-semibold'>Description</p>
                        <input type="text" placeholder='Describe project' className='w-full h-[38px] border px-3 border-[#ddd] rounded' />
                    </label>
                    <div className='flex justify-end'>
                        <button className='bg-[#22C55E] text-white px-4 py-2 rounded cursor-pointer'>
                            Add Project
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
