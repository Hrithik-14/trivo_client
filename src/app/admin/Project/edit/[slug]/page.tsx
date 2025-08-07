/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/app/api/axios';
import toast from 'react-hot-toast';

interface Project {
    _id: string;
    name: string;
    startDate: string;
    endDate: string;
    managerId: string;
    description: string;
    client: string;
    clientEmail: string;
}

interface Manager {
    _id: string;
    name: string;
    email: string;
}


export default function UpdateProjectPage() {
    const router = useRouter();
    const params = useParams()
    const projectId = params.slug as string;;

    const [project, setProject] = useState<Project | null>(null);
    const [managers, setManagers] = useState<Manager[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        managerId: '',
        description: '',
        client: '',
        clientEmail: '',
    });

    const [errors, setErrors] = useState<Partial<typeof formData>>({});

    useEffect(() => {
        const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [projectResponse, managersResponse] = await Promise.all([
            api.get(`/getProjectById/${projectId}`),
            api.get('/managersdeatil')
            ]);

            const projectData = projectResponse.data.project || projectResponse.data;
            const managersData = managersResponse.data.managers || managersResponse.data;

            setProject(projectData);
            setManagers(managersData);

            setFormData({
            name: projectData.name || '',
            startDate: projectData.startDate ? projectData.startDate.split('T')[0] : '',
            endDate: projectData.endDate ? projectData.endDate.split('T')[0] : '',
            managerId: projectData.managerId || '',
            description: projectData.description || '',
            client: projectData.client || '',
            clientEmail: projectData.clientEmail || '',
            });

        } catch (err: any) {
            console.error('Error fetching data:', err);
            setError(err.response?.data?.message || 'Failed to fetch project details');
        } finally {
            setLoading(false);
        }
        };

        if (projectId) {
        fetchData();
        }
    }, [projectId]);

    const validateForm = () => {
        const newErrors: Partial<typeof formData> = {};

        if (!formData.name.trim()) {
        newErrors.name = 'Project name is required';
        }

        if (!formData.startDate) {
        newErrors.startDate = 'Start date is required';
        }

        if (!formData.endDate) {
        newErrors.endDate = 'End date is required';
        }

        if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
        newErrors.endDate = 'End date must be after start date';
        }

        if (!formData.managerId) {
        newErrors.managerId = 'Manager is required';
        }

        if (!formData.client.trim()) {
        newErrors.client = 'Client name is required';
        }

        if (!formData.clientEmail.trim()) {
        newErrors.clientEmail = 'Client email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.clientEmail)) {
        newErrors.clientEmail = 'Please enter a valid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
        ...prev,
        [name]: value
        }));

        if (errors[name as keyof typeof errors]) {
        setErrors(prev => ({
            ...prev,
            [name]: undefined
        }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
        return;
        }

        try {
        setUpdating(true);
        setError(null);

        const response = await api.patch(`/updateProject/${projectId}`, formData);

        if (response.data.status === 'success') {
            toast.success('Project updated successfully!');
            router.push(`/admin/Project/${projectId}`);
        }

        } catch (err: any) {
        toast.error('Error updating project:', err);
        setError(err.response?.data?.message || 'Failed to update project');
        } finally {
        setUpdating(false);
        }
    };

    if (loading) {
        return (
        <div className="h-full flex items-center justify-center">
            <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading project details...</p>
            </div>
        </div>
        );
    }

    if (error && !project) {
        return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
            </div>
            <button
                onClick={() => router.back()}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
                Go Back
            </button>
            </div>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Update Project</h1>
                <p className="text-gray-600 mt-2">Modify project details and settings</p>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name *
                    </label>
                    <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter project name"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* Manager */}
                <div>
                    <label htmlFor="managerId" className="block text-sm font-medium text-gray-700 mb-2">
                    Project Manager *
                    </label>
                    <select
                    id="managerId"
                    name="managerId"
                    value={formData.managerId}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.managerId ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    >
                    <option value="">Select a manager</option>
                    {managers.map((manager) => (
                        <option key={manager._id} value={manager._id}>
                        {manager.name} ({manager.email})
                        </option>
                    ))}
                    </select>
                    {errors.managerId && <p className="mt-1 text-sm text-red-600">{errors.managerId}</p>}
                </div>

                {/* Start Date */}
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                    </label>
                    <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.startDate ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    />
                    {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
                </div>

                {/* End Date */}
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                    </label>
                    <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.endDate ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    />
                    {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
                </div>

                {/* Client Name */}
                <div>
                    <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name *
                    </label>
                    <input
                    type="text"
                    id="client"
                    name="client"
                    value={formData.client}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.client ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter client name"
                    />
                    {errors.client && <p className="mt-1 text-sm text-red-600">{errors.client}</p>}
                </div>

                {/* Client Email */}
                <div>
                    <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Client Email *
                    </label>
                    <input
                    type="email"
                    id="clientEmail"
                    name="clientEmail"
                    value={formData.clientEmail}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.clientEmail ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter client email"
                    />
                    {errors.clientEmail && <p className="mt-1 text-sm text-red-600">{errors.clientEmail}</p>}
                </div>
                </div>

                {/* Description */}
                <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Project Description
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter project description..."
                />
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-6">
                <button
                    type="submit"
                    disabled={updating}
                    className={`flex-1 sm:flex-none px-6 py-3 text-white font-medium rounded-md transition-colors ${
                    updating
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    }`}
                >
                    {updating ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                    </span>
                    ) : (
                    'Update Project'
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                    Cancel
                </button>
                </div>
            </form>
            </div>
        </div>
        </div>
    );
}