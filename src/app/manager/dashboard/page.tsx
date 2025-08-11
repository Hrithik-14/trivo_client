<<<<<<< HEAD
import { Clock } from 'lucide-react'
import React from 'react'

const ManagerDashboard = () => {
    return (
        <div>
=======
'use client'

import api from '@/app/api/axios'
import PerformanceChart from '@/app/components/PerformanceChart'
import WaveChart from '@/app/components/WaveChart'
import { Clock } from 'lucide-react'
import React, { useEffect, useState } from 'react'


interface Project {
    _id: string;
    name: string;
    status: string
}

const ManagerDashboard = () => {
    const [ongoing, setOngoing] = useState<Project[]>([])
    const [userId, setUserId] = useState(null)
    
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const parsed = storedUser ? JSON.parse(storedUser) : null;
        setUserId(parsed.id); 
    }, []);
    console.log(userId); 
    
    

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await api.get<Project[]>(`/managersongoing/${userId}`)
                setOngoing(res.data)
                console.log(res.data);
            } catch (err) {
                console.log("Error fetching: ", err);
                
            }
            
        }
        if (userId) {
            fetchProject();
        }

    }, [userId])

    return (
        <div className='flex flex-col gap-5'>
>>>>>>> 645c818e21aca5174c3d0d721732f22a5bf44729
            <div className='flex gap-5'>
                <div className='p-4 bg-white rounded border border-[#ddd] w-full flex gap-3 items-center px-10'>
                    <Clock className='text-green-500' />
                    <div>
                        <h2 className='text-xs text-[#696969] font-semibold'>Login in time</h2>
                        <p>08:58 AM</p>
                    </div>
                </div>
                <div className='p-4 bg-white rounded border border-[#ddd] w-full flex gap-3 items-center px-10'>
                    <Clock className='text-rose-500' />
                    <div>
                        <h2 className='text-xs text-[#696969] font-semibold'>Working hours</h2>
                        <p>00:00</p>
                    </div>
                </div>
                <button className='p-4 bg-green-500 text-white rounded border border-[#ddd] w-fit'>
                    SignIn
                </button>
            </div>
<<<<<<< HEAD
=======
            <div className='flex justify-between gap-5'>
                <div className='bg-white p-4  border border-[#ddd] rounded w-full'>
                    <h2 className='font-semibold text-sm mb-4'>Working Hours</h2>
                    <WaveChart/>
                </div>
                <div className='bg-white p-4 px-10 border border-[#ddd] rounded'>
                    <h2 className='font-semibold text-sm mb-4'>Attendence</h2>
                    <PerformanceChart/>
                </div>
            </div>
            <div className='flex flex-col gap-3'>
                <h2 className='font-semibold'>Current Project</h2>
                {ongoing.map(m => (
                    <div key={m._id} className='bg-white p-3 border border-[#ddd] rounded'>
                        <p className='text-2xl font-bold text-blue-500'>{m.name}</p>
                        <p className='text-sm text-[#696969]'>Project status: <span className='font-semibold'>{m.status}</span></p>
                    </div>
                ))}
            </div>
>>>>>>> 645c818e21aca5174c3d0d721732f22a5bf44729
        </div>
    )
}


export default ManagerDashboard