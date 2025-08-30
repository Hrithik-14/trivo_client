/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { FC, useState, useEffect } from 'react';
import { X, Clock, Plus, FileText, CheckCircle, Info, Search, Calendar, User } from 'lucide-react';
import api from '@/app/api/axios';
import { useForm, Controller, useFieldArray  } from 'react-hook-form';

import Link from 'next/link';


import { useManangerAuthGuard } from '@/app/hooks/usemanagerAuthGuard';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';

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
  if (!query.trim()) {
    setProjects([]); 
    return;
  }

  const timeoutId = setTimeout(() => {
    fetchProjects(query);
  }, 300);

  return () => clearTimeout(timeoutId);
}, [query, managerId]);

  return (
    <div className="border border-[#ddd] rounded w-full h-fit">
      <div className="flex items-center px-2 py-1 border-b border-[#eee]">
        <Search size={16} className="text-gray-500" />
        <input
          type="text"
          placeholder="Search projects..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
          <p className={`text-sm text-gray-500 ${query && 'p-2'}`}>
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
    
    const [ projects, setProject ] = useState<Project[]>([])
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState({ ongoing: 0, completed: 0, total: 0 });
    const [reload, setReload] = useState(false);
    const { loading } = useManangerAuthGuard()
    const user = useSelector((state: RootState) => state.user.user)

    


    useEffect(() => {
          if (!user?.id || user?.id === 'null') {
    setProject([]);
    setTotalPages(0);
    setStats({ total: 0, ongoing: 0, completed: 0 });
    
    return;
  }

        api.get<{ totalPages: number; projects: Project[]; total: number, page: number, stats: {total: number, ongoing: number, completed: number} }>(`/manager/${user?.id}/getProjectByManager?page=${page}&limit=2`)
        .then(res => {
          setProject(res.data.projects); 
          setTotalPages(res.data.totalPages);
          setStats(res.data.stats)
          
        })
        .catch(err => {console.error("Error in Fetching project:", err);})
    }, [page, reload, user?.id])



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