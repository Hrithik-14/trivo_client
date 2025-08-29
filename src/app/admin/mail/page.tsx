/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import api from '@/app/api/axios';
import { useAdminAuthGuard } from '@/app/hooks/useAdminAuthGuard';
import { Mail, Send, Users } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast';
import Select from 'react-select';

type ManagerOption = { value: string; label: string };

interface Manager {
    _id: string;
    name: string;
}

const jobRoleLabels: { [key: string]: string } = {
    productmanager: "Product Manager",
    designmanager: "Design Manager",
    frontend: "Frontend Developer",
    backend: "Backend Developer",
    tester: "Tester",
    seniordeveloper: "Senior Developer",
    designer: "UI/UX Designer",
};

const jobRoleEnum = Object.keys(jobRoleLabels);




type User = {
    role: string;
    designation: string;
    managerId: string
};



const MailSend = () => {
    const { control, register, watch, handleSubmit, formState: { errors, isSubmitting },} = useForm();
    const [isOpen, setIsOpen] = useState('allEmployee')
    const [managerOptions, setManagerOptions] = useState<ManagerOption[]>([]);
    const [users, setUser] = useState<User[]>([])
    const { loading } = useAdminAuthGuard()

    const selectedManagerId = watch('managerId')
    const filteredUsers = users.filter(
    (user) => user.managerId === selectedManagerId?.value
    );
    const total = filteredUsers.length;


    const selectedRole = watch('designation')
    const filteredRoles = users.filter(
        (user) => user.designation === selectedRole
    )
    const totalRole = filteredRoles.length

    useEffect(() => {
        const fetchUsers = async() => {
            const res = await api.get<User[]>('/users')
            setUser(res.data); 
        }
        fetchUsers()
    }, [])

    useEffect(() => {
        const fetchManagers = async () => {
        try {
            const res = await api.get('/managersdeatil');
            const options = res.data.map((manager: Manager) => ({
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

    const handleSendMail = async (data: any) => {
        try {
            const payload: any = {
            subject: data.subject,
            content: data.content,
            type: isOpen,
            };

            if (isOpen === "managerAndTeam") {
            payload.userId = data.managerId?.value;
            }

            if (isOpen === "specificTeam") {
            payload.designation = data.designation;
            }

            const res = await api.post("/send-mail", payload);
            toast.success("Mail sent successfully!");
        } catch (err) {
            console.error("Failed to send mail:", err);
            toast.error("Failed to send mail");
        }
    };


    if (loading) return  (   
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
            </div>
        </div>
    )

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
                            <h2 className='font-semibold'>{ users.length || 0}</h2>
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
                            <h2 className='font-semibold'>{ selectedManagerId ? total + 1 : 'None' }</h2>
                        </div>
                        </>
                    ) : (
                        <>
                            <div className="w-full">
                                <label className="text-xs font-semibold text-[#696969]">Job Role</label>
                                    <select
                                    {...register("designation")}
                                    className={`border p-2 px-3 rounded-lg w-full border-[#ddd] transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
                                        errors.designation ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""
                                    }`}
                                    >
                                    <option value="">Select Job Role</option>
                                    {jobRoleEnum.map((role) => (
                                        <option key={role} value={role}>
                                        {jobRoleLabels[role]}
                                        </option>
                                    ))}
                                    </select>
                                    {errors.designation && (
                                    <p className="text-red-500 text-xs mt-1">{errors.designation.message as string}</p>
                                    )}
                            </div>
                            <div className='flex gap-2 bg-[#f2f2f2] p-2 items-center px-6 w-fit rounded'>
                                <Users size={15} className='text-[#696969]' />
                                <h2 className='text-sm'>Recipients : </h2>
                                <h2 className='font-semibold'>{ selectedRole ? totalRole : 'None' }</h2>
                            </div>
                        </>
                    )
                ) }
                <form onSubmit={handleSubmit(handleSendMail)} className="flex flex-col gap-3">
                    <label>
                        <p className="text-xs font-semibold text-[#696969]">Subject</p>
                        <input
                        type="text"
                        {...register("subject", { required: "Subject is required" })}
                        placeholder="Type the matter"
                        className="border rounded p-2 text-sm w-full border-[#ddd] mt-1"
                        />
                        {errors.subject && <p className="text-red-500 text-xs">{errors.subject.message as string}</p>}
                    </label>

                    <label>
                        <p className="text-xs font-semibold text-[#696969]">Message</p>
                        <textarea
                        {...register("content", { required: "Message is required" })}
                        placeholder="Type the matter"
                        className="border rounded p-2 text-sm w-full min-h-30 border-[#ddd] mt-1"
                        />
                        {errors.content && <p className="text-red-500 text-xs">{errors.content.message as string}</p>}
                    </label>

                    <div className="flex justify-end">
                        <button
                        type="submit"
                        className="flex items-center gap-3 p-2 bg-blue-500 px-5 text-white rounded"
                        >
                        {isSubmitting 
                        ?  'Sending...'
                        : <> <Send size={15} /> Send Mail </>
                        }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default MailSend