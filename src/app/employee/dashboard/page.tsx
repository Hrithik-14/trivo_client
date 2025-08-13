import { Clock } from 'lucide-react'
import React from 'react'


const EmployeeDashboard = () => {
    return (
        <div>
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
        </div>
    )
}



export default EmployeeDashboard

