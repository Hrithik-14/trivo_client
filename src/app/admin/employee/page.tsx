/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { FC, useEffect, useState } from "react";
import { Users, Plus, Search, Mail, Map, Phone, X, User, Camera } from "lucide-react";
import Image from "next/image";
import api from "@/app/api/axios";
import toast from "react-hot-toast";
import Link from "next/link";
import { notFound } from "next/navigation";
import UserSearch from "@/app/components/UserSearch";
import { useAdminAuthGuard } from "@/app/hooks/useAdminAuthGuard";

const jobRoleLabels: { [key: string]: string } = {
    frontend: "Frontend Developer",
    backend: "Backend Developer",
    tester: "Tester",
    seniordeveloper: "Senior Developer",
    designer: "UI/UX Designer",
};

const jobRoleEnum = Object.keys(jobRoleLabels);

const AddEmployee: FC<{ onClose: () => void }> = ({ onClose }) => {
    const [form, setForm] = useState({
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
        managerId: "",
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({
        ...prev,
        [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name.trim()) {
        toast.error("Name is required");
        return;
        }
        if (!form.email.trim()) {
        toast.error("Email is required");
        return;
        }
        if (!form.designation) {
        toast.error("Job role is required");
        return;
        }
        if (!imageFile) {
        toast.error("Profile image is required");
        return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
        toast.error("Please enter a valid email address");
        return;
        }
        if (form.phoneNumber && !/^\d{10}$/.test(form.phoneNumber)) {
        toast.error("Phone number must be 10 digits");
        return;
        }
        if (form.pincode && !/^\d{6}$/.test(form.pincode)) {
        toast.error("Pincode must be 6 digits");
        return;
        }

        try {
        setLoading(true);
        const formData = new FormData();
        const fieldsToSend = {
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            role: form.role,
            designation: form.designation,
            phoneNumber: form.phoneNumber || "",
            dateOfBirth: form.dateOfBirth || "",
            street: form.street || "",
            city: form.city || "",
            state: form.state || "",
            pincode: form.pincode || "",
            managerId: form.managerId || "",
        };

        Object.entries(fieldsToSend).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== "") {
            formData.append(key, value);
            }
        });

        if (imageFile) {
            formData.append("profileImage", imageFile);
        }
        for (const pair of formData.entries()) {
            if (pair[1] instanceof File) {
            console.log(`${pair[0]}: [FILE] ${pair[1].name} (${pair[1].type}, ${pair[1].size} bytes)`);
            } else {
            console.log(`${pair[0]}: ${pair[1]}`);
            }
        }

        const response = await api.post("/auth/register", formData, {
            headers: {
            "Content-Type": "multipart/form-data",
            },
        });
        toast.success(response.data.message || "Manager registered successfully!");

        setForm({
            name: "",
            designation: "",
            role: "manager",
            email: "",
            dateOfBirth: "",
            phoneNumber: "",
            street: "",
            city: "",
            state: "",
            pincode: "",
            managerId: "",
        });
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
            <h2 className="text-lg font-semibold">Add Manager</h2>
            <button onClick={onClose} className="cursor-pointer">
                <X size={15} />
            </button>
            </div>
            <form onSubmit={handleSubmit} className="bg-white p-5 flex gap-10 rounded mt-2">
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
            <div className="w-full flex flex-col gap-2">
                <div className="flex gap-5 items-center text-blue-500 border-b border-[#ddd] pb-2">
                <User size={30} />
                <p className="text-2xl font-semibold">Personal Information</p>
                </div>
                <div className="flex gap-5 w-full">
                <label className="w-full">
                    <div className="text-xs font-semibold text-[#696969]">Full name</div>
                    <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    type="text"
                    className="border p-2 px-3 rounded-lg w-full border-[#ddd] transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Enter full name"
                    />
                </label>
                <label className="w-full">
                    <div className="text-xs font-semibold text-[#696969]">Job Role</div>
                    <select
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    className="border p-2 px-3 rounded-lg w-full border-[#ddd] transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    >
                    <option value="">Select Job Role</option>
                    {jobRoleEnum.map((role) => (
                        <option key={role} value={role}>
                        {jobRoleLabels[role]}
                        </option>
                    ))}
                    </select>
                </label>
                </div>
                <div className="flex gap-5">
                <label className="w-full">
                    <div className="text-xs font-semibold text-[#696969]">Email</div>
                    <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    className="border p-2 px-3 rounded-lg w-full border-[#ddd] transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Enter email address"
                    />
                </label>
                <label className="w-full">
                    <div className="text-xs font-semibold text-[#696969]">Date of Birth</div>
                    <input
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    type="date"
                    className="border p-2 px-3 rounded-lg w-full border-[#ddd] transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                </label>
                <label className="w-full">
                    <div className="text-xs font-semibold text-[#696969]">Mobile No.</div>
                    <input
                    name="phoneNumber"
                    value={form.phoneNumber}
                    maxLength={10}
                    onChange={handleChange}
                    type="text"
                    className="border p-2 px-3 rounded-lg w-full border-[#ddd] transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="10 digit mobile number"
                    />
                </label>
                </div>
                <h2 className="text-lg font-semibold">Address:</h2>
                <div className="flex flex-col gap-2">
                <label className="w-full">
                    <div className="text-xs font-semibold text-[#696969]">Street</div>
                    <input
                    name="street"
                    value={form.street}
                    onChange={handleChange}
                    type="text"
                    className="border p-2 px-3 rounded-lg w-full border-[#ddd] transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Street address"
                    />
                </label>
                <div className="flex gap-5">
                    <label className="w-full">
                    <div className="text-xs font-semibold text-[#696969]">City</div>
                    <input
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        type="text"
                        className="border p-2 px-3 rounded-lg w-full border-[#ddd] transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder="City"
                    />
                    </label>
                    <label className="w-full">
                    <div className="text-xs font-semibold text-[#696969]">State</div>
                    <input
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        type="text"
                        className="border p-2 px-3 rounded-lg w-full border-[#ddd] transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder="State"
                    />
                    </label>
                </div>
                <label className="w-full">
                    <div className="text-xs font-semibold text-[#696969]">Pincode</div>
                    <input
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    type="text"
                    maxLength={6}
                    className="border p-2 px-3 rounded-lg w-full border-[#ddd] transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="6 digit pincode"
                    />
                </label>
                </div>
                <div className="w-full flex justify-end mt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm py-2 px-10 rounded transition-colors"
                >
                    {loading ? "Saving..." : "Save Manager"}
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [employees, setEmployees] = useState<User[]>([])
    const [ page, setPage ] = useState(1)
    const [ totalPages, setTotalPages ] = useState(1)

    const { loading } = useAdminAuthGuard()
    const [ load, setLoading ] = useState(true)
    const [reload, setReload] = useState(false);


    useEffect(() => {
        api.get<{ totalPages: number; managers: User[]; total: number, page: number }>(`/employeesdeatil?page=${page}&limit=6`)
        .then(res => {
            setEmployees(res.data.managers)
            setTotalPages(res.data.totalPages)
            setLoading(false)
        })
        .catch(err => {console.error("Error inFetching manager:", err); setLoading(false)})
    }, [page, reload])



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
                <Link href={`/admin/profile/${employee._id}`} className="text-[#000] border border-[#ddd] py-2 text-center rounded w-full hover:bg-gray-50 transition-colors">
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