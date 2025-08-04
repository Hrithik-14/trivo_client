import React, { FC } from 'react'
import { Users, Plus, Search, Mail, Map, Phone } from 'lucide-react'
import Image from 'next/image'

const Managers: FC = () => {
    return (
        <div className='flex flex-col gap-5'>
            <div className='bg-white border border-[#ddd] h-18 rounded flex items-center px-6 justify-between'>
                <div className='flex gap-3 items-center'>
                    <Users size={35} className='p-2 bg-[#18A0FB] text-white rounded' />
                    <p className='text-2xl font-semibold'>Managers Directory</p>
                </div>
                <button className='bg-[#22C55E] text-white px-4 cursor-pointer rounded py-2 flex items-center gap-3'>
                    <Plus size={15} />
                    Add Manager
                </button>
            </div>
            <div className='flex justify-between'>
                <div className='flex items-center gap-3 border border-[#ddd] w-fit px-3 py-2 rounded-full bg-white'>
                    <Search size={15} className='text-[#696969]' />
                    <input type="text" placeholder='search manager name...' className='w-60 focus:outline-none' />
                </div>
                <button className='py-2 px-5 bg-white border border-[#ddd] rounded'>
                    Managers Request
                </button>
            </div>
            <div className='grid grid-cols-3 gap-5'>
                <div className='bg-white border border-[#ddd] rounded p-3 flex flex-col gap-3'>
                    <div className='flex items-center gap-4 font-semibold text-lg'>
                        <Image src={"/avatar.png"} alt='manager profile' width={50} height={50} className='rounded-full' />
                        <h2>Rushaid</h2>
                    </div>
                    <div>
                        <div className='flex gap-3 items-center'>
                            <Mail size={13} className='text-[#696969]' />
                            <p className='text-sm text-[#696969]'>rushaid@gmail.com</p>
                        </div>
                        <div className='flex gap-3 items-center'>
                            <Map size={13} className='text-[#696969]' />
                            <p className='text-sm text-[#696969]'>Benguluru, mala</p>
                        </div>
                        <div className='flex gap-3 items-center'>
                            <Phone size={13} className='text-[#696969]' />
                            <p className='text-sm text-[#696969]'>+91 9999999999</p>
                        </div>
                    </div>
                    <div className='flex gap-2 justify-between'>
                        <button className='bg-blue-500 text-white py-2 text-center rounded w-full'>
                            Message
                        </button>
                        <button className='text-[#000] border border-[#ddd] py-2 text-center rounded w-full'>
                            Profile
                        </button>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Managers