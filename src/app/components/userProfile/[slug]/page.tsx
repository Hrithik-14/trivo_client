/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import api from '@/app/api/axios'
import { AlarmClock, ArrowLeft, Briefcase, Calendar, ChevronDown, ChevronRight, CircleCheckBig, Clock, File, Info, Mail, Map, Phone, TicketCheck, TrendingDown, TrendingUp, User  } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { FC, useEffect, useState } from 'react'


type User = {
    _id: string,
    name: string,
    profileImage: string,
    email: string,
    street: string,
    city: string,
    state: string,
    phoneNumber: string,
    role: string,
    employeeCode: string,
    createdAt: Date,
    pincode: number,
    designation: string,
    isActive: boolean
}

type Attendance = {
    _id: string;
    present: number;
    leave: number;
    late: number;
    halfday: number;
    attendacePercentage: number;
    totlaEffectiveHours: string;
}

interface Task {
    _id: string;
    title?: string
}

interface Member {
    _id: string;
    name: string;
}

type Project = {
    _id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    members: Member[];
    client: string;
}

interface Projects {
    _id: string;
    name?: string
}

type Report = {
    _id: string;
    completedTasks: Task[];
    plannedTasks: Task[];
    descriptions: string;
    effectiveHours: string;
    status: string;
    createdAt: Date;
    projectId: Projects;
    performance: string;
    challenges: string;
}

type Props = {
    userId?: string;
}

const UserProfile: FC<Props> = ({ userId }) => {
    
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const defaultDate = `${yyyy}-${mm}-${dd}`;

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [ isExpand, setIsExpand ] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    const [attendance, setAttendance] = useState<Attendance | null>(null)
    const [report, setReport] = useState<Report | null>(null)
    const [filter, setFilter] = useState("thisMonth")
    const [project, setProject] = useState<Project[]>([])
    const [selectedDate, setSelectedDate] = useState(defaultDate);


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const [userResponse, attendanceResponse, reportResponse, projectResponse] = await Promise.all([
                    api.get(`/users/${userId}`),
                    api.get(`/user/attendace-history/${userId}?filter=${filter}`),
                    api.get(`/my-report/${userId}?date=${selectedDate}`),
                    api.get(`/allProject/member/${userId}?page=${page}&limit=2`)
                ])
                setUser(userResponse.data)
                setAttendance(attendanceResponse.data)
                setReport(reportResponse.data)
                setProject(projectResponse.data.projects)
                setTotalPages(projectResponse.data.totalPages)
                console.log(projectResponse.data);
            } catch (err: any) {
                console.error("Error fetching:", err.response?.data?.message)
            }
        }
        fetchUser()
    }, [userId, filter, selectedDate])
    
    const updateIsActive = async (userId: string, isActive: boolean): Promise<User> => {
        const res = await api.patch(`/${userId}/active`, { isActive });
        return res.data;
    };




    if (!user) return (
        <div className="h-screen flex items-center justify-center">
            <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading project details...</p>
            </div>
        </div>
    );
    user.createdAt = new Date(user.createdAt);

    return (
        <div className='flex flex-col gap-5'>

            <div className='flex flex-col gap-5'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                    <div className='bg-white p-3 w-full border border-[#ddd] rounded flex flex-col gap-5'>
                        <div className='flex items-center gap-5'>
                            <Image
                                src={user.profileImage}
                                alt="manager profile"
                                width={80}
                                height={580}
                                className="rounded-full object-cover object-center w-[80px] h-[80px]"
                                style={{ maxWidth: '80px', maxHeight: '80px' }}
                            />
                            <div className='flex flex-col gap-1'>
                                <h2 className='font-semibold'>{user.name}</h2>
                                <p className='text-sm text-[#696969]'>{user.role === 'employee' ? 'Employee' : 'Manager'}</p>
                                <p className='text-xs flex gap-3 text-[#696969]'><span>ID: {user.employeeCode}</span>  <span>Joined Date: {user.createdAt.toISOString().slice(0, 10)}</span></p>
                            </div>
                        </div>
                        <div className='flex gap-5'>
                            <Link href={`/admin/profile/edit/${user._id}`} className=' text-black text-center border hover:bg-[#dadada] border-[#ddd] rounded p-2 w-full'>
                                Edit Profile
                            </Link>
                            <button
                                onClick={async () => {
                                    if (!user) return;
                                    const updatedUser = await updateIsActive(user._id, !user.isActive);
                                    setUser(updatedUser);
                                }}
                                className={`rounded p-2 px-10 ${user.isActive ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                            >
                                {user.isActive ? 'Block' : 'Unblock'}
                            </button>
                        </div>
                    </div>
                    <div className='bg-white p-3 px-6 w-full border border-[#ddd] rounded flex flex-col gap-3'>
                        <h1 className='text-2xl font-semibold'>Contact Information</h1>
                        <div>
                            <div className='flex gap-3 items-center text-[#696969]'>
                                <Mail size={13} />
                                <p>{user.email}</p>
                            </div>
                            <div className='flex gap-3 items-center text-[#696969]'>
                                <Map size={13} />
                                <p>{user.street}, {user.city}, {user.state}, {user.pincode}</p>
                            </div>
                            <div className='flex gap-3 items-center text-[#696969]'>
                                <Phone size={13} />
                                <p>+91 {user.phoneNumber}</p>
                            </div>
                            <div className='flex gap-3 items-center text-[#696969]'>
                                <Briefcase size={13} />
                                <p>{user.designation.charAt(0).toUpperCase() + user.designation.slice(1)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='bg-white  border border-[#ddd] rounded'>
                    <div className='flex justify-between'>
                        <h2 className='px-3 pt-5 text-xl font-semibold'>Attendance Overview</h2>
                        <div className='pt-5 px-3'>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="appearance-none bg-white border-2 border-gray-200 rounded-lg px-4 py-3 shadow-sm pr-10 text-sm font-medium text-gray-700 transition-all duration-200 ease-in-out hover:border-blue-400 hover:shadow-md focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none cursor-pointer relative bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em'}}
                            >
                                <option value="thisMonth">This Month</option>
                                <option value="lastMonth">Last Month</option>
                                <option value="overall">Overall</option>
                            </select>
                        </div>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-5 p-3'>
                        <div className='bg-[#DCFCE7] text-[#16A34A] h-30 flex flex-col items-center justify-center rounded'>
                            <Calendar size={20} />
                            <p className='font-semibold text-xl'>{attendance?.present}</p>
                            <p className='text-[#696969] text-[10px] font-semibold'>Present Days</p>
                        </div>
                        <div className='bg-[#DBEAFE] text-[#2563EB] h-30 flex flex-col items-center justify-center rounded'>
                            <Clock size={20} />
                            <p className='font-semibold text-xl'>{attendance?.totlaEffectiveHours}</p>
                            <p className='text-[#696969] text-[10px] font-semibold'>Total Hours</p>
                        </div>
                        <div className='bg-[#F3E8FF] text-[#9333EA] h-30 flex flex-col items-center justify-center rounded'>
                            <TrendingUp size={20} />
                            <p className='font-semibold text-xl'>{attendance?.attendacePercentage}%</p>
                            <p className='text-[#696969] text-[10px] font-semibold'>Attendance</p>
                        </div>
                        <div className='bg-[#FEF9C3] text-[#CA8A04] h-30 flex flex-col items-center justify-center rounded'>
                            <Info size={20} />
                            <p className='font-semibold text-xl'>{attendance?.late}</p>
                            <p className='text-[#696969] text-[10px] font-semibold'>Late</p>
                        </div>
                        <div className='bg-[#FFEDD5] text-[#772200] h-30 flex flex-col items-center justify-center rounded'>
                            <AlarmClock size={20} />
                            <p className='font-semibold text-xl'>{attendance?.halfday}</p>
                            <p className='text-[#696969] text-[10px] font-semibold'>Half Day</p>
                        </div>
                        <div className='bg-[#FEE2E2] text-[#DC2626] h-30 flex flex-col items-center justify-center rounded'>
                            <TrendingDown size={20} />
                            <p className='font-semibold text-xl'>{attendance?.leave}</p>
                            <p className='text-[#696969] text-[10px] font-semibold'>Total Leave</p>
                        </div>
                    </div>
                </div>

                    <div className="bg-white border border-[#ddd] p-5 rounded flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <Calendar size={30} className="p-2 bg-blue-500 text-white rounded" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                max={defaultDate}
                                className="text-sm border border-[#ddd] rounded px-3 py-2 outline-none focus:ring-0"
                            />
                        </div>

                        {report ? (
                            <div className="border border-[#ddd] p-5 rounded">
                                <div className="flex justify-between">
                                    <div className="flex gap-3">
                                    <Calendar size={30} className="p-2 bg-blue-500 text-white rounded" />
                                    <p className="font-medium text-lg flex gap-2">
                                        Report - {new Date(report.createdAt).toLocaleDateString()}
                                        <span className={`text-xs border px-3 flex items-center rounded-full ${report.status === 'pending' ? 'text-yellow-500 bg-yellow-100 border-yellow-300' : report.status === 'accepted' ? 'text-green-500 bg-green-100 border-green-300' : 'text-red-500 bg-red-100 border-red-300'}`}>{report.status}</span>
                                    </p>
                                    </div>
                                    <button onClick={() => setIsExpand(!isExpand)}>
                                    {isExpand ? (
                                        <ChevronDown className="text-[#696969] transition-transform duration-300" />
                                    ) : (
                                        <ChevronRight className="text-[#696969] transition-transform duration-300" />
                                    )}
                                    </button>
                                </div>

                                {isExpand && (
                                    user.role === 'employee' ? (

                                        <div className="mt-6 border-t border-[#ddd] flex flex-col gap-4">
                                            <div className="flex flex-col gap-1">
                                                <h2 className="font-bold text-xs text-[#696969]">Project Name</h2>
                                                <div className="text-lg font-semibold">{report.projectId?.name}</div>
                                            </div>

                                            <div className="flex flex-col gap-3">
                                                <h2 className="font-bold text-xs text-[#696969]">Task Completed</h2>
                                                {report.completedTasks?.map((task) => (
                                                <div key={task._id} className="flex gap-3">
                                                    <CircleCheckBig size={15} className="text-green-500" />
                                                    <p className="text-xs">{task.title}</p>
                                                </div>
                                                ))}
                                            </div>

                                            <div className="flex flex-col gap-3">
                                                <h2 className="font-bold text-xs text-[#696969]">Key Achievements</h2>
                                                <div className="bg-green-50 p-2 text-xs text-[#696969] rounded px-4">
                                                {report.performance}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-3">
                                                <h2 className="font-bold text-xs text-[#696969]">Challenges</h2>
                                                <div className="bg-blue-50 p-2 text-xs text-[#696969] rounded px-4">
                                                {report.challenges}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-3">
                                                <h2 className="font-bold text-xs text-[#696969]">Tomorrow&apos;s</h2>
                                                <div className="bg-yellow-50 p-2 text-xs text-[#696969] rounded px-4">
                                                {report.plannedTasks ? 'Planned' : 'Not planned'}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-6 border-t border-[#ddd] flex flex-col gap-4">
                                            <p className='font-semibold text-sm mt-2'>Description : <span className='font-normal'>{report.descriptions}</span></p>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : selectedDate ? (
                            <p className="text-sm text-gray-500 text-center py-3">No report found for this date.</p>
                        ) : null}
                    </div>

                <div className='bg-white border border-[#ddd] p-5 flex flex-col gap-3'>
                    <h2 className='text-xl font-semibold'>Projects</h2>
                    {project.length > 0 ? (
                        <>
                        {project.map(p => (

                            <div key={p._id} className='p-3 px-5 bg-white border border-[#ddd] rounded-md flex flex-col gap-3'>
                            <div className='flex justify-between'>
                                <div>
                                    <h2 className='text-xl font-semibold'>{p?.name}</h2>
                                    <p className='text-sm text-[#696969]'>{p?.description}</p>
                                </div>
                                <div className={`p-2 text-xs  h-fit px-4 rounded-full border ${p.status === 'ongoing' ? 'bg-[#DBEAFE] border-[#93C5FD] text-[#3B82F6]' : 'bg-green-100 border-green-300 text-green-500'}`}>
                                    {p.status === 'ongoing' ? 'Ongoing' : 'Completed'}
                                </div>
                            </div>
                            <div className='text-[#696969] flex gap-3'>
                                <Calendar size={15} />
                                <p className='text-xs'>{new Date(p.startDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: 'numeric' })} - {new Date(p.endDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: 'numeric' })}</p>
                            </div>
                            <div className='text-[#696969] flex gap-3'>
                                <User size={15} />
                                <p className='text-xs'><span className='font-semibold'>Client : </span>{p.client.charAt(0).toUpperCase()+p.client.slice(1)}</p>
                            </div>
                            <div className='text-[#696969] flex gap-3 flex-col'>
                                <div className='font-semibold text-xs'>Team Members :</div>
                                <div className='ml-5 flex gap-1'>
                                    {p.members.map(m => (
                                        <div key={m._id} className='bg-[#EBEBEB] text-[#696969] text-[10px] px-2 py-1 rounded-full w-fit'>
                                            {m.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        ))}
                        <div className={` mt-4 gap-2 ${project.length >= 3 ? 'flex justify-center' : 'hidden'}`}>
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
                        </>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-3">
                            No project found for this user
                        </p>
                    )}
                </div>
            </div>

        </div>
    )
}

export default UserProfile