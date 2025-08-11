"use client"

import api from '@/app/api/axios'
import { AlarmClock, ArrowLeft, Briefcase, Calendar, ChevronDown, ChevronRight, CircleCheckBig, Clock, File, Info, Mail, Map, Phone, TicketCheck, TrendingDown, TrendingUp, User  } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'


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

const Profile = () => {
    
    const [ isExpand, setIsExpand ] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    const router = useRouter()
    const params = useParams()
    const userId = params.slug as string


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res  = await api.get(`/users/${userId}`)
                setUser(res.data)
            } catch (err) {
                console.error("Error fetching user:", err)
            }
        }
        fetchUser()
    }, [userId])
    
    const updateIsActive = async (userId: string, isActive: boolean): Promise<User> => {
        const res = await api.patch(`/${userId}/active`, { isActive });
        return res.data;
    };




    if (!user) return (
        <div className="h-full flex items-center justify-center">
            <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading project details...</p>
            </div>
        </div>
    );
    user.createdAt = new Date(user.createdAt);

    return (
        <div className='flex flex-col gap-5'>

            <div className='flex gap-3 items-center text-blue-500'>
                <ArrowLeft size={15} />
                <p>Back</p>
            </div>

            <div className='flex flex-col gap-5'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                    <div className='bg-white p-3 w-full border border-[#ddd] rounded flex flex-col gap-5'>
                        <div className='flex items-center gap-5'>
                            <div className="w-20 h-20 rounded-full overflow-hidden">
                                <Image
                                    src={user.profileImage || "/avatar.png"}
                                    alt="profile"
                                    width={80}
                                    height={80}
                                    className="object-cover"
                                />
                            </div>

                            <div className='flex flex-col gap-1'>
                                <h2 className='font-semibold'>{user.name}</h2>
                                <p className='text-sm text-[#696969]'>{user.role === 'employee' ? 'Employee' : 'Manager'}</p>
                                <p className='text-xs flex gap-3 text-[#696969]'><span>ID: {user.employeeCode}</span>  <span>Joined Date: {user.createdAt.toISOString().slice(0, 10)}</span></p>
                            </div>
                        </div>
                        <div className='flex gap-5'>
                            <button className='bg-blue-500 text-white rounded p-2 w-full'>
                                Message
                            </button>
                            <Link href={`/admin/profile/edit/${user._id}`} className=' text-[#696969] text-center border border-[#ddd] rounded p-2 w-full'>
                                Edit Profile
                            </Link>
                            <button
                                onClick={async () => {
                                    if (!user) return;
                                    const updatedUser = await updateIsActive(user._id, !user.isActive);
                                    setUser(updatedUser);
                                }}
                                className={`rounded p-2 ${user.isActive ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
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
                    <h2 className='px-5 pt-3 text-lg font-semibold'>Attendance Overview</h2>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-5 p-5'>
                        <div className='bg-[#DCFCE7] text-[#16A34A] h-30 flex flex-col items-center justify-center rounded'>
                            <Calendar size={20} />
                            <p className='font-semibold text-xl'>22</p>
                            <p className='text-[#696969] text-[10px] font-semibold'>Present Days</p>
                        </div>
                        <div className='bg-[#DBEAFE] text-[#2563EB] h-30 flex flex-col items-center justify-center rounded'>
                            <Clock size={20} />
                            <p className='font-semibold text-xl'>160</p>
                            <p className='text-[#696969] text-[10px] font-semibold'>Total Hours</p>
                        </div>
                        <div className='bg-[#F3E8FF] text-[#9333EA] h-30 flex flex-col items-center justify-center rounded'>
                            <TrendingUp size={20} />
                            <p className='font-semibold text-xl'>94%</p>
                            <p className='text-[#696969] text-[10px] font-semibold'>Attendance</p>
                        </div>
                        <div className='bg-[#FEF9C3] text-[#CA8A04] h-30 flex flex-col items-center justify-center rounded'>
                            <Info size={20} />
                            <p className='font-semibold text-xl'>2</p>
                            <p className='text-[#696969] text-[10px] font-semibold'>Late</p>
                        </div>
                        <div className='bg-[#FFEDD5] text-[#772200] h-30 flex flex-col items-center justify-center rounded'>
                            <AlarmClock size={20} />
                            <p className='font-semibold text-xl'>1</p>
                            <p className='text-[#696969] text-[10px] font-semibold'>Half Day</p>
                        </div>
                        <div className='bg-[#FEE2E2] text-[#DC2626] h-30 flex flex-col items-center justify-center rounded'>
                            <TrendingDown size={20} />
                            <p className='font-semibold text-xl'>4</p>
                            <p className='text-[#696969] text-[10px] font-semibold'>Total Leave</p>
                        </div>
                    </div>
                </div>

                <div className='bg-white border border-[#ddd] p-5 rounded flex flex-col gap-2'>
                    <h1 className='text-xl font-semibold'>Daily Report</h1>
                    <div className='border border-[#ddd] p-5 rounded'>
                        <div className='flex justify-between'>
                            <div className='flex gap-3'>
                                <Calendar size={30} className='p-2 bg-blue-500 text-white rounded' />
                                <p className='font-medium text-lg'>Report - 02/08/2025</p>
                            </div>
                            <button onClick={() => setIsExpand(!isExpand)}>
                                {isExpand ? (
                                    <ChevronDown className='text-[#696969] transition-transform duration-300' />
                                ) : (
                                    <ChevronRight className='text-[#696969] transition-transform duration-300' />
                                )}
                            </button>
                        </div>
                        {isExpand && (
                            <div className='mt-6 border-t border-[#ddd] flex flex-col gap-4'>
                                <div className='mt-3 flex flex-col gap-1'>
                                    <h2 className='font-bold text-xs text-[#696969]'>Project Name</h2>
                                    <h2 className='text-lg font-semibold'>Company Portal</h2>
                                </div>
                                <div className='mt-3 flex flex-col gap-3'>
                                    <h2 className='font-bold text-xs text-[#696969]'>Task Completed</h2>
                                    <div>
                                        <div className='flex gap-3'>
                                            <CircleCheckBig size={15} className='text-green-500' />
                                            <p className='text-xs'>Completed User Authentication</p>
                                        </div>
                                    </div>
                                </div>
                                <div className='flex flex-col gap-3'>
                                    <h2 className='font-bold text-xs text-[#696969]'>Key Achievements</h2>
                                    <div className='bg-green-50 p-2 text-xs text-[#696969] rounded px-4'>
                                        Successfully deployed new feature to production
                                    </div>
                                </div>
                                <div className='flex flex-col gap-3'>
                                    <h2 className='font-bold text-xs text-[#696969]'>Challenges</h2>
                                    <div className='bg-blue-50 p-2 text-xs text-[#696969] rounded px-4'>
                                        Database optimization took longer than expected
                                    </div>
                                </div>
                                <div className='flex flex-col gap-3'>
                                    <h2 className='font-bold text-xs text-[#696969]'>Tomorrow&apos;s</h2>
                                    <div className='bg-yellow-50 p-2 text-xs text-[#696969] rounded px-4'>
                                        Start working on mobile responsive design
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className='bg-white border border-[#ddd] p-5 flex flex-col gap-3'>
                    <h2 className='text-xl font-semibold'>Projects</h2>
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
            </div>

        </div>
    )
}

export default Profile