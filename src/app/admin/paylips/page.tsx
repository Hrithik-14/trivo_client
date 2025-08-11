"use client"

import api from '@/app/api/axios';
import { useAdminAuthGuard } from '@/app/hooks/useAdminAuthGuard';
import { ChevronDown, ChevronRight, FileText, Plus, X } from 'lucide-react'
import Image from 'next/image';
import React, { FC, useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import Select from 'react-select';

interface Employee {
    employeeCode: string;
    name: string;
    email: string;
    phoneNumber: string;
    designation: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    role: string;
}

interface FormData {
    employeeName: string;
    employeeCode: string;
    designation: string;
    email: string;
    phoneNumber: string;
    salaryDate: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    basicSalary: string;
    allowance: string;
    bonus: string;
    incentive: string;
    tax: string;
}

interface AddPayslipProps {
    onClose: () => void;
}

type EmployeeOption = { value: string; label: string };

const AddPayslip: FC<AddPayslipProps> = ({ onClose }) => {
    const { register, handleSubmit, control, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            employeeName: '',
            employeeCode: '',
            designation: '',
            email: '',
            phoneNumber: '',
            salaryDate: '2025-07',
            street: '',
            city: '',
            state: '',
            pincode: '',
            basicSalary: '',
            allowance: '',
            bonus: '',
            incentive: '',
            tax: ''
        }
    });

    const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [employeeList, setEmployeeList] = useState<Employee[]>([]);

    // Watch salary fields for tax calculation
    const basicSalary = watch('basicSalary');
    const allowance = watch('allowance');
    const bonus = watch('bonus');
    const incentive = watch('incentive');

    // Calculate and set tax automatically (10% of total earnings)
    useEffect(() => {
        const basic = parseFloat(basicSalary) || 0;
        const allow = parseFloat(allowance) || 0;
        const bon = parseFloat(bonus) || 0;
        const incent = parseFloat(incentive) || 0;
        
        const totalEarnings = basic + allow + bon + incent;
        const calculatedTax = totalEarnings * 0.10; // 10% tax
        
        setValue('tax', calculatedTax.toFixed(2));
    }, [basicSalary, allowance, bonus, incentive, setValue]);

    const onSubmit = async (data: FormData) => {
        try {
            const res = await api.post('/payslips', data);
            console.log('Payslip saved:', res.data);
            toast.success('Payslips created')
            reset();
            onClose()
        } catch (error) {
            console.error('Failed to save payslip:', error);
        }
    };

    const handleEmployeeSelect = (option: EmployeeOption | null) => {
        if (!option) {
            clearEmployeeSelection();
            return;
        }
        const employee = employeeList.find(emp => emp.employeeCode === option.value);
        if (employee) {
            setSelectedEmployee(employee);
            setValue('employeeName', employee.name);
            setValue('employeeCode', employee.employeeCode);
            setValue('designation', employee.designation);
            setValue('email', employee.email);
            setValue('phoneNumber', employee.phoneNumber);
            setValue('street', employee.street);
            setValue('city', employee.city);
            setValue('state', employee.state);
            setValue('pincode', employee.pincode);
        }
    };

    const clearEmployeeSelection = () => {
        setSelectedEmployee(null);
        reset({
            employeeName: '',
            employeeCode: '',
            designation: '',
            email: '',
            phoneNumber: '',
            salaryDate: watch('salaryDate'),
            street: '',
            city: '',
            state: '',
            pincode: '',
            basicSalary: watch('basicSalary'),
            allowance: watch('allowance'),
            bonus: watch('bonus'),
            incentive: watch('incentive'),
            tax: watch('tax')
        });
    };

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await api.get('/users');
                const employees: Employee[] = res.data.users;
                const filteredEmployees = employees.filter(emp => emp.role !== 'admin');

                setEmployeeList(filteredEmployees);
                const options = filteredEmployees.map(emp => ({
                    value: emp.employeeCode,
                    label: emp.name
                }));
                setEmployeeOptions(options);
            } catch (err) {
                console.error("Failed to fetch employees:", err);
            }
        };

        fetchEmployees();
    }, []);

    return (
        <div className='fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
            <form 
                onSubmit={handleSubmit(onSubmit)} 
                className="bg-white rounded-lg w-full max-w-4xl p-6 relative shadow-2xl text-black max-h-[90vh] overflow-y-auto"
            >
                <div className='flex justify-between items-center mb-6'>
                    <h2 className="text-xl font-medium text-gray-800">Payslips</h2>
                    <button 
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Employee Name</label>
                            <div className="relative">
                                <Controller
                                    control={control}
                                    name="employeeCode"
                                    rules={{ required: "Employee is required" }}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            options={employeeList.map(emp => ({
                                                value: emp.employeeCode,
                                                label: `${emp.name} (${emp.employeeCode})`
                                            }))}
                                            placeholder='Select employee'
                                            className='text-sm w-60'
                                            isClearable
                                            onChange={val => {
                                                field.onChange(val?.value ?? '');
                                                handleEmployeeSelect(val as EmployeeOption | null);
                                            }}
                                            value={selectedEmployee ? { value: selectedEmployee.employeeCode, label: `${selectedEmployee.name} (${selectedEmployee.employeeCode})` } : null}
                                        />
                                    )}
                                />
                                {errors.employeeCode && <p className="text-red-500 text-xs mt-1">{errors.employeeCode.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Employee ID</label>
                            <input
                                {...register('employeeCode', { required: "Employee ID is required" })}
                                type="text"
                                className="w-full px-3 py-2 bg-gray-100 border-0 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={!!selectedEmployee}
                            />
                            {errors.employeeCode && <p className="text-red-500 text-xs mt-1">{errors.employeeCode.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Job Role</label>
                            <input
                                {...register('designation', { required: "Job Role is required" })}
                                type="text"
                                className="w-full px-3 py-2 bg-gray-100 border-0 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={!!selectedEmployee}
                            />
                            {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Email</label>
                            <input
                                {...register('email', { 
                                    required: "Email is required", 
                                    pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                                })}
                                type="email"
                                className="w-full px-3 py-2 bg-gray-100 border-0 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={!!selectedEmployee}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Mobile No.</label>
                            <input
                                {...register('phoneNumber', { required: "Mobile number is required" })}
                                type="text"
                                className="w-full px-3 py-2 bg-gray-100 border-0 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={!!selectedEmployee}
                            />
                            {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Salary Date</label>
                            <input
                                {...register('salaryDate', { required: "Salary Date is required" })}
                                type="month"
                                className="w-full px-3 py-2 bg-gray-100 border-0 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.salaryDate && <p className="text-red-500 text-xs mt-1">{errors.salaryDate.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Street</label>
                        <input
                            {...register('street', { required: "Street is required" })}
                            type="text"
                            className="w-full px-3 py-2 bg-gray-100 border-0 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={!!selectedEmployee}
                        />
                        {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">City</label>
                            <input
                                {...register('city', { required: "City is required" })}
                                type="text"
                                className="w-full px-3 py-2 bg-gray-100 border-0 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={!!selectedEmployee}
                            />
                            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">State</label>
                            <input
                                {...register('state', { required: "State is required" })}
                                type="text"
                                className="w-full px-3 py-2 bg-gray-100 border-0 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={!!selectedEmployee}
                            />
                            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Pincode</label>
                            <input
                                {...register('pincode', { required: "Pincode is required" })}
                                type="text"
                                className="w-full px-3 py-2 bg-gray-100 border-0 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={!!selectedEmployee}
                            />
                            {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>}
                        </div>
                    </div>

                    {/* Salary Components Section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Salary Components</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Basic Salary</label>
                                <input
                                    {...register('basicSalary', { required: "Basic Salary is required" })}
                                    type="number"
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.basicSalary && <p className="text-red-500 text-xs mt-1">{errors.basicSalary.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Allowance</label>
                                <input
                                    {...register('allowance', { required: "Allowance is required" })}
                                    type="number"
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.allowance && <p className="text-red-500 text-xs mt-1">{errors.allowance.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Bonus</label>
                                <input
                                    {...register('bonus')}
                                    type="number"
                                    defaultValue="0"
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Incentive</label>
                                <input
                                    {...register('incentive')}
                                    type="number"
                                    defaultValue="0"
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Tax (10% Auto-calculated)</label>
                                <input
                                    {...register('tax')}
                                    type="number"
                                    step="0.01"
                                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded text-sm focus:outline-none"
                                    disabled
                                />
                            </div>
                            
                            <div className="flex items-end">
                                <div className="bg-blue-50 p-3 rounded border border-blue-200 w-full">
                                    <p className="text-sm text-gray-600">Net Salary</p>
                                    <p className="text-lg font-semibold text-blue-600">
                                        ₹ {(
                                            (parseFloat(basicSalary) || 0) + 
                                            (parseFloat(allowance) || 0) + 
                                            (parseFloat(bonus) || 0) + 
                                            (parseFloat(incentive) || 0) - 
                                            (parseFloat(watch('tax')) || 0)
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-6 gap-4">
                    <button
                        type="submit"
                        className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    )
}

type Paylips = {
    _id: string,
    employeeCode: string,
    employeeName: string,
    email: string,
    street: string,
    city: string,
    state: string,
    phoneNumber: string,
    profileImage?: string | null;
    basicSalary: number;
    allowance: number;
    bonus?: number;
    incentive?: number;
    tax?: number;
}

const Payslip: FC = () => {
    const [isExpand, setIsExpand] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ payslips, setPayslips ] = useState<Paylips[]>([])
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [reload, setReload] = useState(false);
    const { loading } = useAdminAuthGuard()

    useEffect(() => {
        const fetchPayslips = async() => {
            try {
                const res = await api.get(`/payslips?page=${page}&limit=4`);
                setPayslips(res.data.data);
                setTotalPages(res.data.totalPages);
            } catch (err) {
                console.error("Payslips fetching error");
            }
        }
        fetchPayslips()
    }, [page, reload])
    
    const handleAdd = () => setIsModalOpen(true);
    const handleCloseModal = () => {setIsModalOpen(false); setReload(prev => !prev)};

    const calculateNetSalary = (payslip: Paylips) => {
        const totalEarnings = payslip.basicSalary + payslip.allowance + (payslip.bonus || 0) + (payslip.incentive || 0);
        const tax = payslip.tax || 0;
        return totalEarnings - tax;
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
            { isModalOpen && <AddPayslip onClose={handleCloseModal} /> }
            <div className='bg-white border border-gray-300 rounded p-4 flex justify-between'>
                <div className='flex gap-3 items-center'>
                    <FileText size={35} className='p-2 bg-blue-500 text-white rounded' />
                    <p className='text-2xl font-semibold'>Payslips</p>
                </div>
                <button onClick={handleAdd} className='flex gap-3 py-2 px-4 text-white rounded items-center bg-green-500'>
                    <Plus size={16} />
                    <p>Create Payslips</p>
                </button>
            </div>
            <div className=''>
                {payslips.map(pay => (
                    <div key={pay._id} className='mb-2 bg-white border border-gray-300 p-3 rounded'>
                        <div className=' flex justify-between items-center'>
                            <div className='flex gap-3'>
                                <div>
                                    {pay.profileImage ? (
                                        <Image
                                            src={pay.profileImage}
                                            alt='profile'
                                            width={50}
                                            height={50}
                                            className='rounded-full max-w-[50px] max-h-[50px] object-cover'
                                        />
                                        ) : (
                                        <Image
                                            src='/avatar.png'
                                            alt='default profile'
                                            width={50}
                                            height={50}
                                            className='rounded-full max-w-[50px] max-h-[50px] object-cover'
                                        />
                                    )}
                                </div>
                                <div>
                                    <h3 className='font-semibold'>{pay.employeeName}</h3>
                                    <p className='text-xs font-semibold text-gray-500'>{pay.employeeCode}</p>
                                </div>
                            </div>
                            <div className='flex gap-3'>
                                <h2 className='text-md font-semibold'>₹ {calculateNetSalary(pay).toLocaleString()}</h2>
                                <button onClick={() => setIsExpand(prevId => prevId === pay._id ? null : pay._id)}>
                                    {isExpand === pay._id ? (
                                        <ChevronDown className='text-gray-500 transition-transform duration-300' />
                                    ) : (
                                        <ChevronRight className='text-gray-500 transition-transform duration-300' />
                                    )}
                                </button>
                            </div>
                        </div>
                        { isExpand === pay._id  && (
                            <>
                                <div className='border-t border-gray-300 mt-3 px-3 py-2'>
                                    <div className='mb-2'>
                                        <h4 className='font-medium text-green-600 text-sm mb-2'>Earnings</h4>
                                        <div className='flex flex-col gap-1 pl-2'>
                                            <div className='flex justify-between items-center'>
                                                <h2 className='text-sm'>Basic Salary</h2>
                                                <p className='text-sm'>₹ {pay.basicSalary?.toLocaleString()}</p>
                                            </div>
                                            <div className='flex justify-between items-center'>
                                                <h2 className='text-sm'>Allowance</h2>
                                                <p className='text-sm'>₹ {pay.allowance?.toLocaleString()}</p>
                                            </div>
                                            {pay.bonus && pay.bonus > 0 && (
                                                <div className='flex justify-between items-center'>
                                                    <h2 className='text-sm'>Bonus</h2>
                                                    <p className='text-sm'>₹ {pay.bonus?.toLocaleString()}</p>
                                                </div>
                                            )}
                                            {pay.incentive && pay.incentive > 0 && (
                                                <div className='flex justify-between items-center'>
                                                    <h2 className='text-sm'>Incentive</h2>
                                                    <p className='text-sm'>₹ {pay.incentive?.toLocaleString()}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className='mb-2'>
                                        <h4 className='font-medium text-red-600 text-sm mb-2'>Deductions</h4>
                                        <div className='flex flex-col gap-1 pl-2'>
                                            <div className='flex justify-between items-center'>
                                                <h2 className='text-sm'>Tax (10%)</h2>
                                                <p className='text-sm'>₹ {pay.tax?.toLocaleString() || '0'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='border-t border-gray-300 pt-2'>
                                        <div className='flex justify-between items-center font-semibold'>
                                            <h2 className='text-sm'>Net Salary</h2>
                                            <p className='text-sm text-blue-600'>₹ {calculateNetSalary(pay).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
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
    )
}

export default Payslip