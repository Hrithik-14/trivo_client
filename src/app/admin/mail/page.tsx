"use client"

import api from '@/app/api/axios';
import { Mail, Send, Users } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Select from 'react-select';

type ManagerOption = { value: string; label: string };

const MailSend = () => {

    const [isOpen, setIsOpen] = useState('allEmployee')
    const { control } = useForm()
    const [managerOptions, setManagerOptions] = useState<ManagerOption[]>([]);

    useEffect(() => {
        const fetchManagers = async () => {
        try {
            const res = await api.get('/managers');
            const options = res.data.map((manager: any) => ({
            value: manager._id,
            label: manager.name
            }));
            setManagerOptions(options);
            
        } catch (err) {
            console.error("Failed to fetch managers:", err);
        }
        };

        fetchManagers();
    }, []);

    return (
        <div className='flex flex-col gap-5'>
            <div className='bg-white border border-[#ddd] p-3 flex gap-3 items-center rounded'>
                <Mail size={35} className='p-2 bg-blue-500 rounded text-white' />
                <h2 className='text-xl font-semibold'>Mail Center</h2>
            </div>
            <div className='bg-white p-5 border border-[#ddd] rounded flex flex-col gap-3'>
                <h2 className='text-sm font-semibold'>Select Recipients</h2>
                <div className='flex gap-5'>
                    <button onClick={() => setIsOpen('allEmployee')} className={`flex gap-3 p-3 px-5 rounded w-full items-center ${isOpen === 'allEmployee' ? 'text-blue-500 bg-blue-100 border border-blue-300' : 'text-black border border-[#ddd] bg-white'}`}>
                        <Users size={20}  />
                        <div>
                            <h2 className='font-semibold'>All Employees</h2>
                            <p className='text-xs font-semibold'>110 Recipient</p>
                        </div>
                    </button>
                    <button onClick={() => setIsOpen('managerAndTeam')} className={`flex gap-3 p-3 px-5 rounded w-full items-center ${isOpen === 'managerAndTeam' ? 'text-blue-500 bg-blue-100 border border-blue-300' : 'text-black border border-[#ddd] bg-white'}`}>
                        <Users size={20}  />
                        <div>
                            <h2 className='font-semibold'>Mananger & Team</h2>
                            <p className='text-xs font-semibold'>Selected Mananger</p>
                        </div>
                    </button>
                    <button onClick={() => setIsOpen('specificTeam')} className={`flex gap-3 p-3 px-5 rounded w-full items-center ${isOpen === 'specificTeam' ? 'text-blue-500 bg-blue-100 border border-blue-300' : 'text-black border border-[#ddd] bg-white'}`}>
                        <Users size={20}  />
                        <div>
                            <h2 className='font-semibold'>Specific Team</h2>
                            <p className='text-xs font-semibold'>Choose Team</p>
                        </div>
                    </button>
                </div>
                { isOpen === 'allEmployee' ? (
                    <>
                        <div className='flex gap-2 bg-[#f2f2f2] p-2 items-center px-6 w-fit rounded'>
                            <Users size={15} className='text-[#696969]' />
                            <h2 className='text-sm'>Recipients : </h2>
                            <h2 className='font-semibold'>110</h2>
                        </div>
                    </>
                ) : (
                    isOpen === 'managerAndTeam' ? (
                        <>
                            <Controller
                                control={control}
                                name="managerId"
                                rules={{ required: "Manager is required" }}
                                render={({ field }) => (
                                    <Select
                                    {...field}
                                    options={managerOptions}
                                    placeholder='Select manager'
                                    className='text-sm w-60'
                                    isClearable
                                    />
                                )}
                            />
                        <div className='flex gap-2 bg-[#f2f2f2] p-2 items-center px-6 w-fit rounded'>
                            <Users size={15} className='text-[#696969]' />
                            <h2 className='text-sm'>Recipients : </h2>
                            <h2 className='font-semibold'>110</h2>
                        </div>
                        </>
                    ) : (
                        <>
                            <Controller
                                control={control}
                                name="managerId"
                                rules={{ required: "Manager is required" }}
                                render={({ field }) => (
                                    <Select
                                    {...field}
                                    options={managerOptions}
                                    placeholder='Select manager'
                                    className='text-sm w-60'
                                    isClearable
                                    />
                                )}
                            />
                        <div className='flex gap-2 bg-[#f2f2f2] p-2 items-center px-6 w-fit rounded'>
                            <Users size={15} className='text-[#696969]' />
                            <h2 className='text-sm'>Recipients : </h2>
                            <h2 className='font-semibold'>110</h2>
                        </div>
                        </>
                    )
                ) }
                <div>
                    <label htmlFor="">
                        <p className='text-xs font-semibold text-[#696969]'>Subject</p>
                        <input type="text" placeholder='Type the matter' className='border rounded p-2 text-sm w-full border-[#ddd] mt-1' />
                    </label>
                    <label htmlFor="">
                        <p className='text-xs font-semibold text-[#696969]'>Message</p>
                        <textarea  placeholder='Type the matter' className='border rounded p-2 text-sm w-full min-h-30 border-[#ddd] mt-1' />
                    </label>
                    <div className='flex justify-end'>
                        <button className='flex items-center gap-3 p-2 bg-blue-500 px-5 text-white rounded'>
                            <Send size={15} />
                            Send Mail
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MailSend