"use client"

import { Calendar, ChevronDown, ChevronRight, CircleCheckBig, FileText, ThumbsDown, ThumbsUp } from 'lucide-react'
import React, { useState } from 'react'

const ManagerDailyReport = () => {

    const [ isExpand, setIsExpand ] = useState(false)

    return (
        <div className='flex flex-col gap-5'>
            <div className='bg-white border border-[#ddd] p-4 rounded flex gap-3 items-center'>
                <FileText size={35} className='p-2 rounded bg-blue-500 text-white' />
                <p className='text-xl font-semibold'>Employees Daily Report</p>
            </div>

            <div className=' flex flex-col gap-2'>
                <div className='border border-[#ddd] p-5 rounded bg-white'>
                    <div className='flex justify-between'>
                        <div className='flex gap-3'>
                            <Calendar size={30} className='p-2 bg-blue-500 text-white rounded' />
                            <p className='font-medium text-lg'>Daily Report - Rushaid</p>
                        </div>
                        <div className='flex gap-3'>
                            <div className='p-2 text-xs bg-green-100 text-green-500 border border-green-300 rounded-full'>
                                Completed
                            </div>
                            <button onClick={() => setIsExpand(!isExpand)}>
                                {isExpand ? (
                                    <ChevronDown className='text-[#696969] transition-transform duration-300' />
                                ) : (
                                    <ChevronRight className='text-[#696969] transition-transform duration-300' />
                                )}
                            </button>
                        </div>
                    </div>
                    {isExpand && (
                        <div className='mt-6 border p-4 rounded border-[#ddd] flex flex-col gap-4'>
                            <div className=' flex flex-col gap-1'>
                                <h2 className='text-sm font-semibold text-[#696969]'>Description:</h2>
                                <p className='ml-10'>Communicate with 5 client to about project</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className='border border-[#ddd] p-5 rounded bg-white'>
                    <div className='flex justify-between'>
                        <div className='flex gap-3'>
                            <Calendar size={30} className='p-2 bg-blue-500 text-white rounded' />
                            <p className='font-medium text-lg'>Daily Report - Shine</p>
                        </div>
                        
                    </div>
                    <div className='border border-[#ddd] mt-6 p-5 rounded'>
                        <div className=' flex flex-col gap-1'>
                                <h2 className='text-sm font-semibold text-[#696969]'>Description:</h2>
                                <p className='ml-10'>Communicate with 2 client to about project</p>
                            </div>
                    </div>
                    <div className='flex mt-2 justify-end gap-5'>
                        <button className='flex items-center gap-3 p-2 px-8 bg-green-500 text-white rounded'>
                            <ThumbsUp size={15} className='mt-1' /> Approve
                        </button>
                        <button className='flex items-center gap-3 p-2 px-8 bg-red-500 text-white rounded'>
                            <ThumbsDown size={15} className='mt-1' /> Reject
                        </button>
                    </div>
                    
                </div>
            </div>
        </div>
    )
}

export default ManagerDailyReport