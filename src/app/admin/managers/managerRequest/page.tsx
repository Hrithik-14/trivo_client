import { Calendar, ThumbsDown, ThumbsUp } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

const ManagerRequest = () => {
    return (
        <div className='flex flex-col gap-5'>
            <div className='bg-white p-3 px-5 border border-[#ddd] rounded flex gap-3 items-center'>
                <Calendar size={35} className='p-2 bg-blue-500 text-white rounded' />
                <h2 className='text-xl font-semibold'>Managers Request</h2>
            </div>
            <div>
                <h2 className='text-sm font-semibold mb-1'>Regularization</h2>
                <div className='bg-white border border-[#ddd] p-3 rounded flex justify-between'>
                    <div>
                        <div className='flex gap-4 items-center'>
                            <Image src={'/avatar.png'} alt='profile' width={50} height={50} className='rounded-full' />
                            <div>
                                <h2 className='font-semibold'>Rushaid</h2>
                                <p className='text-xs font-semibold text-[#696969]'>02-08-2025</p>
                            </div>
                        </div>
                        <h2 className='text-xs mt-2 font-semibold'>Description: <span className='font-normal'>d</span></h2>
                    </div>
                    <div className='flex gap-5'>
                        <button className='py-2 px-5 flex gap-3 h-fit items-center bg-green-600 rounded text-white'>
                            <ThumbsUp size={15} />
                            <p>Approve</p>
                        </button>
                        <button className='py-2 px-5 flex gap-3 h-fit items-center bg-red-600 rounded text-white'>
                            <ThumbsDown size={15} />
                            <p>Reject</p>
                        </button>
                    </div>
                </div>
            </div>

            <div>
                <h2 className='text-sm font-semibold mb-1'>Leave Request</h2>
                <div className='bg-white border border-[#ddd] p-3 rounded flex justify-between'>
                    <div>
                        <div className='flex gap-4 items-center'>
                            <Image src={'/avatar.png'} alt='profile' width={50} height={50} className='rounded-full' />
                            <div>
                                <h2 className='font-semibold'>Rushaid</h2>
                                <p className='text-xs font-semibold text-[#696969]'>02-08-2025</p>
                            </div>
                        </div>
                        <h2 className='text-xs mt-2 font-semibold'>Description: <span className='font-normal'>d</span></h2>
                    </div>
                    <div className='flex gap-5'>
                        <button className='py-2 px-5 flex gap-3 h-fit items-center bg-green-600 rounded text-white'>
                            <ThumbsUp size={15} />
                            <p>Approve</p>
                        </button>
                        <button className='py-2 px-5 flex gap-3 h-fit items-center bg-red-600 rounded text-white'>
                            <ThumbsDown size={15} />
                            <p>Reject</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ManagerRequest