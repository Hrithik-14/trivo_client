import { ArrowLeft, User } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

const EditProfile = () => {
    return (
        <div className='flex flex-col gap-5'>
            <div className='flex gap-3 items-center text-blue-500'>
                <ArrowLeft size={15} />
                <p>Back</p>
            </div>
            <form className='bg-white border border-[#ddd] p-5 flex gap-10'>
                <div>
                    <Image src={'/avatar.png'} alt='profile image' width={300} height={300} className='rounded-full' />
                </div>
                <div className='w-full flex flex-col gap-3'>
                    <div className='flex gap-5 items-center text-blue-500 border-b border-[#ddd] pb-2'>
                        <User size={30} />
                        <p className='text-2xl font-semibold'>Personal Information</p>
                    </div>
                    <div className='flex gap-5 w-full'>
                        <label htmlFor="" className='w-full'>
                            <div className='text-xs font-semibold text-[#696969]'>
                                Full name
                            </div>
                            <input type="text" className='border border-[#ddd] p-1 px-3 rounded-lg w-full' />
                        </label>
                        <label htmlFor="" className='w-full'>
                            <div className='text-xs font-semibold text-[#696969]'>
                                Job Role
                            </div>
                            <input type="text" className='border border-[#ddd] p-1 px-3 rounded-lg w-full' />
                        </label>
                        {/* <label htmlFor="" className='w-full'>
                            <div className='text-xs font-semibold text-[#696969]'>
                                Manager
                            </div>
                            <input type="text" className='border border-[#ddd] p-1 px-3 rounded-lg w-full' />
                        </label> */}
                    </div>
                    <div className='flex gap-5'>
                        <label htmlFor="" className='w-full'>
                            <div className='text-xs font-semibold text-[#696969]'>
                                Email
                            </div>
                            <input type="text" className='border border-[#ddd] p-1 px-3 rounded-lg w-full' />
                        </label>
                        <label htmlFor="" className='w-full'>
                            <div className='text-xs font-semibold text-[#696969]'>
                                Date of Birth
                            </div>
                            <input type="date" className='border border-[#ddd] p-1 px-3 rounded-lg w-full' />
                        </label>
                        <label htmlFor="" className='w-full'>
                            <div className='text-xs font-semibold text-[#696969]'>
                                Mobile No.
                            </div>
                            <input type="text" className='border border-[#ddd] p-1 px-3 rounded-lg w-full' />
                        </label>
                    </div>
                    <div>
                        <h2 className='text-lg font-semibold'>Address:</h2>
                        <div className='flex flex-col gap-3 mt-2'>
                            <label htmlFor="" className='w-full'>
                                <div className='text-xs font-semibold text-[#696969]'>
                                    Street
                                </div>
                                <input type="text" className='border border-[#ddd] p-1 px-3 rounded-lg w-full' />
                            </label>
                            <div className='flex gap-5'>
                                <label htmlFor="" className='w-full'>
                                    <div className='text-xs font-semibold text-[#696969]'>
                                        City
                                    </div>
                                    <input type="text" className='border border-[#ddd] p-1 px-3 rounded-lg w-full' />
                                </label>
                                <label htmlFor="" className='w-full'>
                                    <div className='text-xs font-semibold text-[#696969]'>
                                        State
                                    </div>
                                    <input type="text" className='border border-[#ddd] p-1 px-3 rounded-lg w-full' />
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className='w-full flex justify-end'>
                        <button className='bg-green-500 text-white text-sm py-2 px-10 rounded'>
                            Save
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default EditProfile