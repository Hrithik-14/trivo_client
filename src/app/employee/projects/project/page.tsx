'use client'

import React, { FC, useState, useEffect } from 'react';
import { Clock, FileText, CheckCircle, Info, Calendar, User} from 'lucide-react';
import api from '@/app/api/axios';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { useEmployeeAuthGuard } from '@/app/hooks/useEmployeeAuthGuard';


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
    client: string;
    clientEmail: string;
    status: string;
    isActive: boolean;
}

const Projects: FC = () => {
    const [ projects, setProject ] = useState<Project[]>([])
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState({ ongoing: 0, completed: 0, total: 0 });

    const user = useSelector((state: RootState) => state.user.user)
    const { loading } = useEmployeeAuthGuard()

    useEffect(() => {
        if (!user?.id || user?.id === 'null') {
        setProject([]);
        setTotalPages(0);
        setStats({ total: 0, ongoing: 0, completed: 0 });

        return;
    }

    api.get<{ totalPages: number; projects: Project[]; total: number, page: number, stats: {total: number, ongoing: number, completed: number} }>(`/allProject/member/${user?.id}?page=${page}&limit=5`)
        .then(res => {
            setProject(res.data.projects); 
            setTotalPages(res.data.totalPages);
            setStats(res.data.stats)
        })
        .catch(err => {console.error("Error in Fetching project:", err); })
    }, [page, user?.id])


    if (loading) return (
        <div className="h-full flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading details...</p>
            </div>
        </div>
    );

    return (
        <div className='flex flex-col gap-5'>
            
            <div className='bg-white w-full h-18 border border-[#ddd] rounded-md flex items-center px-5 justify-between'>
                <div className='flex items-center gap-3'>
                    <FileText size={30} className='p-2 bg-[#18A0FB] text-white rounded-md' />
                    <h2 className='text-2xl font-semibold'>All Projects</h2>
                </div>
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
                    <Link href={`/employee/projects/${project._id}`} key={project._id} className={`p-3 px-5 border  rounded-md flex flex-col gap-3 ${project.isActive === false ? 'bg-red-50 border-red-200' : 'bg-white border-[#ddd]'}`}>
                        <div className='flex justify-between'>
                            <div>
                                <h2 className='text-xl font-semibold'>{project.name}</h2>
                                <p className='text-sm text-[#696969]'>{project.description}</p>
                            </div>
                            <div className={`p-2 text-xs h-fit px-4 rounded-full border ${
                                project.status === 'Ongoing'
                                ? 'bg-[#DBEAFE] border-[#93C5FD] text-[#3B82F6]'
                                : 'bg-[#DCFCE7] border-[#86EFAC] text-[#22C55E]'
                            }`}>
                                {project.status === 'Ongoing' ? "Ongoing" : "Completed"}
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
                        
                    </Link>
                ))}
                { projects.length > 10 &&
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
                }
            </div>
        </div>
    );
};

export default Projects;