"use client"

import React, { FC, useState } from 'react'
import { ChevronDown, User, Building2, Clock, Users } from 'lucide-react';
import Image from 'next/image';
import { parse, differenceInDays } from 'date-fns';


const project = {
    name: "Company portal",
    description: "build responsive",
    startDate: "15/01/2025",
    endDate: "30/06/2025",
    mangerId: "Kuku",
    members: ["danish", "rushaid", "faisal"],
    client: "TechSolutions",
    clientEmail: "techsolution@ts.com"
}

const calculateDuration = (start: string, end: string) => {
    const startDate = parse(start, 'dd/MM/yyyy', new Date());
    const endDate = parse(end, 'dd/MM/yyyy', new Date());

    const totalDays = differenceInDays(endDate, startDate);
    const months = Math.floor(totalDays / 30);
    const days = totalDays % 30;

    return { months, days };
};

const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
];

const ProjectDetail: FC = () => {


    const [ status, setStatus ] = useState<"active" | "inactive">('active')
    const [ isOpen, setIsOpen ] = useState(false)

    const duration = calculateDuration(project.startDate, project.endDate);

    return (
        <div className='flex flex-col gap-5'>
            { /* Project name */ }
            <div className='bg-white h-25 border border-[#ddd] rounded py-2 px-6 flex items-center justify-between'> 
                <div>
                    <h2 className='text-2xl font-bold'>{project.name}</h2>
                    <p className='text-[#696969] font-medium'>{project.description}</p>
                </div>
                <div className='flex gap-4'>
                    <div className='bg-[#DBEAFE] p-2 text-xs w-fit  font-semibold border border-[#BFDBFE] text-[#2C5282] rounded-full'>
                        Ongoing
                    </div>
                    <div className="relative">
                    <button
                        className={`px-4 py-2 text-xs font-semibold border rounded-full flex items-center gap-3 ${
                        status === 'active'
                            ? 'bg-green-100 text-green-700 border-green-300'
                            : 'bg-red-100 text-red-700 border-red-300'
                        }`}
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)} <ChevronDown size={15} />
                    </button>

                    {isOpen && (
                        <ul className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded shadow z-10">
                        {statusOptions.map((option) => (
                            <li
                            key={option.value}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => {
                                setStatus(option.value as 'active' | 'inactive');
                                setIsOpen(false);
                            }}
                            >
                            {option.label}
                            </li>
                        ))}
                        </ul>
                    )}
                    </div>
                </div>
            </div>

            {/* Project manager */}
            <div className='bg-white h-25 border border-[#ddd] rounded py-2 px-6 flex flex-col justify-center gap-3'>
                <div className='flex gap-3 items-center'>
                    <User size={18} />
                    <p className='font-semibold'>Project Maanger</p>
                </div>
                <div className='flex gap-3 items-center'>
                    <Image src="/avatar.png" alt="Logo image" width={35} height={35} className='rounded-full' />
                    <div className='font-semibold'>
                        {project.mangerId}
                    </div>
                </div>
            </div>

            {/* Client & Timeline */}
            <div className='grid grid-cols-2 gap-5'>
                <div className='bg-white border border-[#ddd] rounded h-25 py-2 px-6 flex justify-center flex-col gap-0.5'>
                    <div className='flex  gap-2 items-center'>
                        <Building2 size={15}/>
                        <p className='font-semibold text-sm'>Client</p>
                    </div>
                    <p className='text-lg font-medium'>{project.client}</p>
                    <p className='text-blue-500'>{project.clientEmail}</p>
                </div>
                <div className='bg-white border border-[#ddd] rounded h-25 py-2 px-6 flex flex-col justify-center gap-0.5'>
                    <div className='flex gap-3 items-center'>
                        <Clock size={15} />
                        <p className='font-bold text-sm'>Timeline</p>
                    </div>
                    <div className='flex items-center gap-2 text-sm'>
                        <span className='font-semibold text-xs'>Starting Date: </span> {project.startDate}
                    </div>
                    <div className='flex items-center gap-2 text-sm'>
                        <span className='font-semibold text-xs'>Ending Date: </span> {project.endDate}
                    </div>
                    <div className='flex items-center gap-2 text-sm'>
                        <span className='font-semibold text-xs'>Duration: </span> {duration.months} months and {duration.days} days
                    </div>
                </div>
            </div>

            {/* Team memebers */}
            <div className='bg-white border border-[#ddd] p-6 rounded'>
                <div className='flex gap-3 items-center'>
                    <Users size={20} />
                    <p className='font-semibold'>Team Members</p>
                </div>
                <div className='grid grid-cols-3'>
                    <div className='border border-[#ddd] mt-2 p-3 border-l-3 rounded flex items-center gap-3'>
                        <Image src="/avatar.png" alt="Logo image" width={35} height={35} className='rounded-full' />
                        <div>
                            <p>Danish</p>
                            <p className='text-xs'>Frontend Developer</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default ProjectDetail