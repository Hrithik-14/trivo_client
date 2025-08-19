/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { FC, useEffect, useState } from "react";
import { Users, Plus, Mail, Map, Phone, X, User, Camera } from "lucide-react";
import Image from "next/image";
import api from "@/app/api/axios";
import toast from "react-hot-toast";
import Link from "next/link";
import { notFound } from "next/navigation";
import UserSearch from "@/app/components/UserSearch";
import { useForm, SubmitHandler  } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useManangerAuthGuard } from "@/app/hooks/usemanagerAuthGuard";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";


const jobRoleLabels: { [key: string]: string } = {
  frontend: "Frontend Developer",
  backend: "Backend Developer",
  tester: "Tester",
  seniordeveloper: "Senior Developer",
  designer: "UI/UX Designer",
};

const jobRoleEnum = Object.keys(jobRoleLabels);



// Validation schema with Zod
const employeeSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  designation: z.string().min(1, "Job role is required"),
  role: z.string(),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  dateOfBirth: z.string().optional(),
  phoneNumber: z.string().optional().refine(
    (val) => !val || /^\d{10}$/.test(val),
    "Phone number must be 10 digits"
  ),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional().refine(
    (val) => !val || /^\d{6}$/.test(val),
    "Pincode must be 6 digits"
  ),
  managerId: z.string().min(1, "Manager selection is required"),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

const AddEmployee: FC<{ onClose: () => void }> = ({ onClose }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const user = useSelector((state: RootState) => state.user.user)

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isValid },
        setValue,
        watch
    } = useForm<EmployeeFormData>({
        resolver: zodResolver(employeeSchema),
        defaultValues: {
        name: "",
        designation: "",
        role: "employee",
        email: "",
        dateOfBirth: "",
        phoneNumber: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        managerId: user?.id,
        },
        mode: "onChange" // Validates on every change
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        }
    };

    const onSubmit: SubmitHandler<EmployeeFormData> = async (data) => {
        if (!imageFile) {
        toast.error("Profile image is required");
        return;
        }

        try {
        setLoading(true);
        const formData = new FormData();
        
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== "") {
            formData.append(key, value);
            }
        });

        formData.set("email", data.email.trim().toLowerCase());
        formData.set("name", data.name.trim());

        if (imageFile) {
            formData.append("profileImage", imageFile);
        }

        const response = await api.post("/auth/register", formData, {
            headers: {
            "Content-Type": "multipart/form-data",
            },
        });
        
        toast.success(response.data.message || "Employee registered successfully!");

        // Reset form and state
        reset();
        setImageFile(null);
        setImagePreview(null);
        onClose();
        } catch (err: any) {
        console.error("Registration error:", err);
        console.error("Error response:", err?.response);
        
        let errorMessage = "Something went wrong during registration";
        if (err?.response?.data?.message) {
            errorMessage = err.response.data.message;
        } else if (err?.response?.data?.error) {
            errorMessage = err.response.data.error;
        } else if (err?.message) {
            errorMessage = err.message;
        }
        toast.error(errorMessage);
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-4xl p-2 px-10 relative shadow-2xl text-black">
            <div className="flex justify-between">
            <h2 className="text-lg font-semibold">Add Employee</h2>
            <button onClick={onClose} className="cursor-pointer">
                <X size={15} />
            </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-5 flex gap-10 rounded mt-2">
            {/* Image Upload Section */}
            <div className="w-[400px] h-[250px] relative">
                {imagePreview ? (
                <Image
                    src={imagePreview}
                    alt="profile preview"
                    fill
                    className="rounded-full object-cover object-center"
                />
                ) : (
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                    No Image
                </div>
                )}
                <input
                type="file"
                accept="image/*"
                id="fileInput"
                name="profileImage"
                onChange={handleImageChange}
                className="hidden"
                />
                <label
                htmlFor="fileInput"
                className="absolute bottom-2 right-6 bg-white p-2 rounded-full shadow cursor-pointer hover:bg-gray-100 transition"
                >
                <Camera size={20} className="text-gray-600" />
                </label>
            </div>

            {/* Form Fields Section */}
            <div className="w-full flex flex-col gap-2">
                <div className="flex gap-5 items-center text-blue-500 border-b border-[#ddd] pb-2">
                <User size={30} />
                <p className="text-2xl font-semibold">Personal Information</p>
                </div>

                {/* Name, Job Role, and Manager Row */}
                <div className="flex gap-5 w-full">
                <div className="w-full">
                    <label className="text-xs font-semibold text-[#696969]">Full name</label>
                    <input
                    {...register("name")}
                    type="text"
                    className={`border p-2 px-3 rounded-lg w-full border-[#ddd] transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
                        errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""
                    }`}
                    placeholder="Enter full name"
                    />
                    {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                    )}
                </div>

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
                    <p className="text-red-500 text-xs mt-1">{errors.designation.message}</p>
                    )}
                </div>

                <div className="w-full">
                    <label className="text-xs font-semibold text-[#696969]">Manager</label>
                    {user && (
                        <input value={user?.name} disabled className="border p-2 px-2 rounded-lg border-[#ddd]" />
                    )}
                </div>
                </div>

                {/* Email, DOB, Phone Row */}
                <div className="flex gap-5">
                <div className="w-full">
                    <label className="text-xs font-semibold text-[#696969]">Email</label>
                    <input
                    {...register("email")}
                    type="email"
                    className={`border p-2 px-3 rounded-lg w-full border-[#ddd] transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
                        errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""
                    }`}
                    placeholder="Enter email address"
                    />
                    {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                    )}
                </div>

                <div className="w-full">
                    <label className="text-xs font-semibold text-[#696969]">Date of Birth</label>
                    <input
                    {...register("dateOfBirth")}
                    type="date"
                    className="border p-2 px-3 rounded-lg w-full border-[#ddd] transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                </div>

                <div className="w-full">
                    <label className="text-xs font-semibold text-[#696969]">Mobile No.</label>
                    <input
                    {...register("phoneNumber")}
                    type="text"
                    maxLength={10}
                    className={`border p-2 px-3 rounded-lg w-full border-[#ddd] transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
                        errors.phoneNumber ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""
                    }`}
                    placeholder="10 digit mobile number"
                    />
                    {errors.phoneNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>
                    )}
                </div>
                </div>

                {/* Address Section */}
                <h2 className="text-lg font-semibold mt-4">Address:</h2>
                <div className="flex flex-col gap-2">
                <div className="w-full">
                    <label className="text-xs font-semibold text-[#696969]">Street</label>
                    <input
                    {...register("street")}
                    type="text"
                    className="border p-2 px-3 rounded-lg w-full border-[#ddd] transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Street address"
                    />
                </div>

                <div className="flex gap-5">
                    <div className="w-full">
                    <label className="text-xs font-semibold text-[#696969]">City</label>
                    <input
                        {...register("city")}
                        type="text"
                        className="border p-2 px-3 rounded-lg w-full border-[#ddd] transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder="City"
                    />
                    </div>

                    <div className="w-full">
                    <label className="text-xs font-semibold text-[#696969]">State</label>
                    <input
                        {...register("state")}
                        type="text"
                        className="border p-2 px-3 rounded-lg w-full border-[#ddd] transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder="State"
                    />
                    </div>
                </div>

                <div className="w-full">
                    <label className="text-xs font-semibold text-[#696969]">Pincode</label>
                    <input
                    {...register("pincode")}
                    type="text"
                    maxLength={6}
                    className={`border p-2 px-3 rounded-lg w-full border-[#ddd] transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
                        errors.pincode ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""
                    }`}
                    placeholder="6 digit pincode"
                    />
                    {errors.pincode && (
                    <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>
                    )}
                </div>
                </div>

                {/* Submit Button */}
                <div className="w-full flex justify-end mt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm py-2 px-10 rounded transition-colors"
                >
                    {loading ? "Saving..." : "Save Employee"}
                </button>
                </div>
            </div>
            </form>
        </div>
        </div>
    );
};


type User = {
    _id: string,
    name: string,
    profileImage: string,
    email: string,
    street: string,
    city: string,
    state: string,
    phoneNumber: string
}

const Employees: FC = () => {
    const user = useSelector((state: RootState) => state.user.user)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [employees, setEmployees] = useState<User[]>([])
    const [ page, setPage ] = useState(1)
    const [ totalPages, setTotalPages ] = useState(1)

    const { loading } = useManangerAuthGuard()
    const [ load, setLoading ] = useState(true)
    const [reload, setReload] = useState(false);

    console.log(user);
    const token = user?.token
    console.log('tokk',token);


    useEffect(() => {
        const fetchEmployees = async () => {
            if (!user || !user.token) {
                console.log('Waiting for user token to be available...');
                return;
            }

            try {
                console.log('Making request with token available');
                
                const response = await api.get<{ 
                    totalPages: number; 
                    managers: User[]; 
                    total: number; 
                    page: number 
                }>(`/managerEmployeesdeatil?page=${page}&limit=6`, {
                    headers: { 
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    }
                });

                setEmployees(response.data.managers);
                setTotalPages(response.data.totalPages);
                setLoading(false);

            } catch (err: any) {
                console.error("Error fetching employees:", err);
                
                if (err?.response?.status === 401) {
                    console.error('Authentication failed - token invalid');
                }
                
                setLoading(false);
            }
        };

        fetchEmployees();
    }, [page, reload, user?.token]);



    const handleAdd = () => setIsModalOpen(true);
    const handleCloseModal = () => {setIsModalOpen(false); setReload(prev => !prev)};

    if (loading) return  (   
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
            </div>
        </div>
    )
    if (load) return  (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
            </div>
        </div>
    )
    if (!employees) return notFound()

    return (
        <div className="flex flex-col gap-5">
        {isModalOpen && <AddEmployee onClose={handleCloseModal} />}
        <div className="bg-white border border-[#ddd] h-18 rounded flex items-center px-6 justify-between">
            <div className="flex gap-3 items-center">
            <Users size={35} className="p-2 bg-[#18A0FB] text-white rounded" />
            <p className="text-2xl font-semibold">Employees Directory</p>
            </div>
            <button
            onClick={handleAdd}
            className="bg-[#22C55E] text-white px-4 cursor-pointer rounded py-2 flex items-center gap-3 hover:bg-green-600 transition-colors"
            >
            <Plus size={15} />
            Add Employee
            </button>
        </div>
        <div className="flex justify-between">
            <form onSubmit={(e) => e.preventDefault()}>
                <UserSearch role="employee" />
            </form>
            <Link href={'/manager/employee/employee-request'} className="py-2 px-5 bg-white border border-[#ddd] rounded hover:bg-gray-50 transition-colors">
                Employee Request
            </Link>
        </div>
        <div className="grid grid-cols-3 gap-5">
        {employees.map(employee => (
            <div key={employee._id} className="bg-white border border-[#ddd] rounded p-3 flex flex-col gap-3">
            <div className="flex items-center gap-4 font-semibold text-lg">
                {employee.profileImage ? (
                <Image
                    src={employee.profileImage}
                    alt="manager profile"
                    width={50}
                    height={50}
                    className="rounded-full object-cover object-center w-[50px] h-[50px]"
                    style={{ maxWidth: '50px', maxHeight: '50px' }}
                />
                ) : (
                <Image
                    src="/avatar.png"
                    alt="default profile"
                    width={50}
                    height={50}
                    className="rounded-full"
                />
                )}
                <h2>{employee.name}</h2>
            </div>
            <div>
                <div className="flex gap-3 items-center">
                <Mail size={13} className="text-[#696969]" />
                <p className="text-sm text-[#696969]">{employee.email}</p>
                </div>
                <div className="flex gap-3 items-center">
                <Map size={13} className="text-[#696969]" />
                <p className="text-sm text-[#696969]">{employee.street}, {employee.city}, {employee.state}</p>
                </div>
                <div className="flex gap-3 items-center">
                <Phone size={13} className="text-[#696969]" />
                <p className="text-sm text-[#696969]">+91 {employee.phoneNumber}</p>
                </div>
            </div>
            <div className="flex gap-2 justify-between">
                <button className="bg-blue-500 text-white py-2 text-center rounded w-full hover:bg-blue-600 transition-colors">
                Message
                </button>
                <Link href={`/manager/employee-profile/${employee._id}`} className="text-[#000] border border-[#ddd] py-2 text-center rounded w-full hover:bg-gray-50 transition-colors">
                Profile
                </Link>
                <ul>
                </ul>
            </div>
            </div>
        ))}
        </div>
            <div className="flex justify-center mt-4 gap-2">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(prev => prev - 1)}
                    className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                >
                    Prev
                </button>
                <span className="px-4 py-2">{page} / {totalPages}</span>
                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(prev => prev + 1)}
                    className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Employees;