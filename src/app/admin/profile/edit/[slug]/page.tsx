/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { ArrowLeft, Camera, User } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import { useForm } from 'react-hook-form'
import api from '@/app/api/axios'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAdminAuthGuard } from '@/app/hooks/useAdminAuthGuard'

const jobRoles: { [key: string]: string } = {
  frontend: 'Frontend Developer',
  backend: 'Backend Developer',
  tester: 'Tester',
  seniordeveloper: 'Senior Developer',
  designer: 'UI/UX Designer',
  productmanager: 'Product Manager',
  designmanager: 'Design Manager',
};

const EditProfile = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm()
    const params = useParams();
    const userId = params.slug as string;
    console.log("User ID from URL:", userId);


    const [userData, setUserData] = React.useState<any>(null);
    const [managerList, setManagerList] = React.useState<any[]>([]);
    const [load, setLoading] = React.useState(true);
    const { loading } = useAdminAuthGuard()
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [imagePreview, setImagePreview] = React.useState<string>('');

    React.useEffect(() => {
        const fetchUserData = async () => {
        try {
            const userRes = await api.get(`/users/${userId}`);
            setUserData(userRes.data);

            reset({
            fullName: userRes.data.name,
            email: userRes.data.email,
            mobile: userRes.data.phoneNumber,
            dob: userRes.data.dateOfBirth?.slice(0, 10),
            address: {
                street: userRes.data.street,
                city: userRes.data.city,
                state: userRes.data.state,
            },
            pincode: userRes.data.pincode,
            jobRole: userRes.data.designation,
            manager: userRes.data.managerId,
            });

            setImagePreview(userRes.data.profileImage || '/avatar.png');

            if (userRes.data.role === 'employee') {
            const managerRes = await api.get('/managersdeatil');
            setManagerList(managerRes.data);
            }

            setLoading(false);
        } catch (err) {
            toast.error('Failed to load user data');
        }
        };

        fetchUserData();
    }, [userId, reset]);

    const getJobRoleOptions = () => {
        if (userData?.role === 'manager') {
        return Object.entries(jobRoles).filter(([key]) => ['productmanager', 'designmanager'].includes(key));
        } else {
        return Object.entries(jobRoles).filter(([key]) => !['productmanager', 'designmanager'].includes(key));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
        setSelectedFile(file);
        setImagePreview(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data: any) => {
        const formData = new FormData();
        formData.append('name', data.fullName);
        formData.append('email', data.email);
        formData.append('phoneNumber', data.mobile);
        formData.append('dateOfBirth', data.dob);
        formData.append('street', data.address?.street || '');
        formData.append('city', data.address?.city || '');
        formData.append('state', data.address?.state || '');
        formData.append('pincode', data.pincode);
        formData.append('role', userData.role);
        formData.append('designation', data.jobRole);
        if (userData.role === 'employee') {
            formData.append('managerId', data.manager || '');
        }

        if (selectedFile) {
        formData.append('profileImage', selectedFile);
        }

        try {
        await api.patch(`/updateuser/${userId}`, formData, {
            headers: {
            'Content-Type': 'multipart/form-data',
            },
        });
        toast.success('User updated successfully');
        } catch (err) {
        toast.error('Error updating user');
        }
    };


    if (load) return (
        <div className="h-full flex items-center justify-center">
            <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile details...</p>
            </div>
        </div>
    );

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
        <form onSubmit={handleSubmit(onSubmit)} className='bg-white border border-[#ddd] p-5 flex gap-10'>
            <div className='relative h-[230px] w-[300px]'>
            <Image
                src={imagePreview}
                alt='profile image'
                fill
                className='rounded-full object-cover object-center'
            />

            <input
                type="file"
                accept="image/*"
                className="hidden"
                id='fileInput'
                onChange={handleFileChange}
            />
            <label
                htmlFor="fileInput"
                className="absolute bottom-2 right-6 bg-white p-2 rounded-full shadow cursor-pointer hover:bg-gray-100 transition"
            >
                <Camera size={20} className="text-gray-600" />
            </label>
            </div>
            <div className='w-full flex flex-col gap-3'>
            <div className='flex gap-5 items-center text-blue-500 border-b border-[#ddd] pb-2'>
                <User size={30} />
                <p className='text-2xl font-semibold'>Personal Information</p>
            </div>

            <div className='flex gap-5 w-full'>
                <label className='w-full'>
                <div className='text-xs font-semibold text-[#696969]'>Full name</div>
                <input {...register("fullName")} type='text' className='border border-[#ddd] p-1 px-3 rounded-lg w-full' />
                </label>
                <label className='w-full'>
                <div className='text-xs font-semibold text-[#696969]'>Job Role</div>
                <select {...register("jobRole")} className='border border-[#ddd] p-1 px-3 rounded-lg w-full'>
                    {getJobRoleOptions().map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                    ))}
                </select>
                </label>
                {userData?.role === 'employee' && (
                <label className='w-full'>
                    <div className='text-xs font-semibold text-[#696969]'>Manager</div>
                    <select {...register("manager")} className='border border-[#ddd] p-1 px-3 rounded-lg w-full'>
                    <option value=''>Select Manager</option>
                    {managerList.map((mgr: any) => (
                        <option key={mgr._id} value={mgr._id}>{mgr.name}</option>
                    ))}
                    </select>
                </label>
                )}
            </div>

            <div className='flex gap-5'>
                <label className='w-full'>
                <div className='text-xs font-semibold text-[#696969]'>Email</div>
                <input {...register("email")} type='email' className='border border-[#ddd] p-1 px-3 rounded-lg w-full' />
                </label>
                <label className='w-full'>
                <div className='text-xs font-semibold text-[#696969]'>Date of Birth</div>
                <input {...register("dob")} type='date' className='border border-[#ddd] p-1 px-3 rounded-lg w-full' />
                </label>
                <label className='w-full'>
                <div className='text-xs font-semibold text-[#696969]'>Mobile No.</div>
                <input {...register("mobile")} type='text' className='border border-[#ddd] p-1 px-3 rounded-lg w-full' />
                </label>
            </div>

            <div>
                <h2 className='text-lg font-semibold'>Address:</h2>
                <div className='flex flex-col gap-3 mt-2'>
                <label className='w-full'>
                    <div className='text-xs font-semibold text-[#696969]'>Street</div>
                    <input {...register("address.street")} type='text' className='border border-[#ddd] p-1 px-3 rounded-lg w-full' />
                </label>
                <div className='flex gap-5'>
                    <label className='w-full'>
                    <div className='text-xs font-semibold text-[#696969]'>City</div>
                    <input {...register("address.city")} type='text' className='border border-[#ddd] p-1 px-3 rounded-lg w-full' />
                    </label>
                    <label className='w-full'>
                    <div className='text-xs font-semibold text-[#696969]'>State</div>
                    <input {...register("address.state")} type='text' className='border border-[#ddd] p-1 px-3 rounded-lg w-full' />
                    </label>
                </div>
                <label className='w-full'>
                    <div className='text-xs font-semibold text-[#696969]'>Pincode</div>
                    <input {...register("pincode")} type='text' className='border border-[#ddd] p-1 px-3 rounded-lg w-full' />
                </label>
                </div>
            </div>

            <div className='w-full flex justify-end'>
                <button type='submit' className='bg-green-500 text-white text-sm py-2 px-10 rounded'>
                {isSubmitting ? 'Saving...': 'Save'}
                </button>
            </div>
            </div>
        </form>
        </div>
    )
}

export default EditProfile;