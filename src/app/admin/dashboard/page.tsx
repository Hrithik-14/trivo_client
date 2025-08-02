
'use client'

import { useState, useEffect, FC } from 'react'
import { Users, UserCheck, Clock, ChevronLeft, ChevronRight, Calendar  } from 'lucide-react';
import PerformanceChart from "@/app/components/PerformanceChart"

const Dashboard: FC = () => {

    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
        setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    const getDaysInMonth = (date: Date): (number | null)[] => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        
        for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
        }
        
        return days;
    };

    const navigateMonth = (direction: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + direction);
        setCurrentDate(newDate);
    };

    const getCurrentTime = () => {
        return currentTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
        });
    };

    const days = getDaysInMonth(currentDate);
    const today = new Date();
    const isCurrentMonth = currentDate.getMonth() === today.getMonth() && 
                            currentDate.getFullYear() === today.getFullYear();
    const todayDate = today.getDate();

    return (
        <div className='flex gap-5  text-black'>

            <div className='flex flex-col gap-5'>
                <div className='flex gap-5'>
                    <div className='border border-[#dddddd] bg-white rounded w-50 h-fit py-2 px-4'>
                        <h5 className='font-bold text-[10px]'>Total Employees</h5>
                        <div className='flex justify-between items-center'>
                            <h2 className='font-semibold'>110</h2>
                            <div className='p-2 bg-[#DBEAFE] text-[#3B82F6] w-fit rounded-full'>
                                <Users size={15}/>
                            </div>
                        </div>
                    </div>
                    <div className='border border-[#dddddd] bg-white rounded w-50 h-fit py-2 px-4'>
                        <h5 className='font-bold text-[10px]'>Present</h5>
                        <div className='flex justify-between items-center'>
                            <h2 className='font-semibold'>100</h2>
                            <div className='p-2 bg-[#DCFCE7] text-[#22C55E] w-fit rounded-full'>
                                <UserCheck size={15}/>
                            </div>
                        </div>
                    </div>
                    <div className='border border-[#dddddd] bg-white rounded w-50 h-fit py-2 px-4'>
                        <h5 className='font-bold text-[10px]'>Late</h5>
                        <div className='flex justify-between items-center'>
                            <h2 className='font-semibold'>7</h2>
                            <div className='p-2 bg-[#FEF9C3] text-[#EAB308] w-fit rounded-full'>
                                <Clock size={15}/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='flex gap-5'>
                    <div className='bg-white p-3 px-8 border border-[#ddd] rounded-md w-fit gap-2 flex flex-col'>
                        <h3 className='font-semibold'>Performance</h3>
                        <PerformanceChart/>
                    </div>
                    <div className='flex flex-col gap-5'>
                        <div className='border border-[#dddddd] bg-white rounded w-76 h-20 flex flex-col justify-center py-2 px-4'>
                            <h5 className='font-bold text-[10px]'>Leave</h5>
                            <div className='flex justify-between items-center'>
                                <h2 className='font-semibold'>3</h2>
                                <div className='p-2 bg-[#FEE2E2] text-[#EF4444] w-fit rounded-full'>
                                    <Calendar size={15}/>
                                </div>
                            </div>
                        </div>
                        <div className='bg-white border border-[#ddd] h-52 rounded-md p-5 gap-5 flex flex-col'>
                            <h2 className='text-xl font-bold '>Projects</h2>
                            <div className='flex gap-5 items-center'>
                                <div className='text-lg bg-[#FEFCE8] p-2 px-3 text-[#EAB308] border border-[#FDE047]'>25</div>
                                <div className='font-medium'>Total Projects</div>
                            </div>
                            <div className='flex gap-5 items-center'>
                                <div className='text-lg bg-[#DCFCE7] p-2 px-3 text-[#22C55E] border border-[#86EFAC]'>10</div>
                                <div className='font-medium'>Completed Projects</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='bg-white p-3 border border-[#dddddd] rounded-md'>
                    <h2 className='text-2xl font-bold text-[#3B82F6]'>Managers Reports</h2>
                    <table className='w-full mt-3'>
                        <thead>
                            <tr className='border-b border-[#ddd]'>
                                <th className='p-2'>#</th>
                                <th className='p-2'>ID</th>
                                <th className='p-2'>Date</th>
                                <th className='p-2'>Name</th>
                                <th className='p-2'>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className='p-2 text-center'>1</td>
                                <td className='p-2 text-center'>TRI/25/12</td>
                                <td className='p-2 text-center'>30-07-2025</td>
                                <td className='p-2 text-center'>Rushaid</td>
                                <td className='p-2 flex justify-center'>
                                    <div className='bg-[#DCFCE7] text-[#4ADE80] border border-[#4ADE80] w-fit text-xs px-4 py-1 rounded-full'>
                                        Completed
                                    </div>
                                </td>
                            </tr>
                            <tr className='border-t border-[#ddd]'>
                                <td className='p-2 text-center'>2</td>
                                <td className='p-2 text-center'>TRI/25/13</td>
                                <td className='p-2 text-center'>30-07-2025</td>
                                <td className='p-2 text-center'>Danish</td>
                                <td className='p-2 flex justify-center'>
                                    <div className='bg-[#FEFCE8] text-[#EAB308] border border-[#FDE047] w-fit text-xs px-4 py-1 rounded-full'>
                                        Pending
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className='flex flex-col gap-5'>
                <div className="w-[350px] h-fit bg-white rounded-md shadow p-4 font-sans">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                        <span className="text-lg font-medium text-gray-800">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </span>
                        <ChevronRight className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="flex gap-1">
                        <button 
                            onClick={() => navigateMonth(-1)}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            <ChevronLeft className="w-4 h-4 text-blue-500" />
                        </button>
                        <button 
                            onClick={() => navigateMonth(1)}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            <ChevronRight className="w-4 h-4 text-blue-500" />
                        </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {dayNames.map((day) => (
                        <div key={day} className="text-xs text-gray-400 text-center py-1 font-medium">
                            {day}
                        </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-4 flex-1">
                        {days.map((day, index) => (
                        <div
                            key={index}
                            className={`
                            h-8 flex items-center justify-center text-sm cursor-pointer rounded
                            ${day === null ? '' : 'hover:bg-gray-100'}
                            ${day && isCurrentMonth && day === todayDate ? 'bg-blue-500 text-white font-medium' : 'text-gray-800'}
                            ${day === null ? 'text-transparent' : ''}
                            `}
                        >
                            {day}
                        </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-sm text-gray-600 font-medium">Time</span>
                        <span className="text-sm text-gray-800 font-medium">{getCurrentTime()}</span>
                    </div>
                </div>
                <div className='bg-white border border-[#ddd] rounded-md p-2'>
                    <h2 className='text-lg font-semibold'>Recent Activity</h2>
                    <div className='flex  gap-5 items-center py-4'>
                        <div className='w-1 h-1 rounded-full bg-[#22C55E]'></div>
                        <div>
                            <h4 className='text-sm'>Team meeting</h4>
                            <p className='text-xs text-[#696969]'>2m ago</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard