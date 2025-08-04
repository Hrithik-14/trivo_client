"use client"

import { ChevronDown, ChevronRight, FileText, Plus, X, Search } from 'lucide-react'
import React, { FC, useState, useRef, useEffect } from 'react'

interface Employee {
    id: string;
    name: string;
    email: string;
    mobile: string;
    jobRole: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
}

interface FormData {
    employeeName: string;
    employeeId: string;
    jobRole: string;
    email: string;
    mobileNo: string;
    salaryDate: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    basicSalary: string;
    allowance: string;
}

interface SearchableDropdownProps {
    value: string;
    onSelect: (employee: Employee) => void;
    placeholder: string;
    searchKey: keyof Employee;
    displayKey: keyof Employee;
    data?: Employee[];
    disabled?: boolean;
}

const mockEmployees: Employee[] = [
    {
        id: 'TAN0378-0021',
        name: 'Anirudh',
        email: 'anirudh@gmail.com',
        mobile: '+91 9999999999',
        jobRole: 'Backend Developer',
        street: '123, Banglore street',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '606060'
    },
    {
        id: 'TAN0378-0022',
        name: 'Priya Sharma',
        email: 'priya.sharma@gmail.com',
        mobile: '+91 9876543210',
        jobRole: 'Frontend Developer',
        street: '456, MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001'
    },
    {
        id: 'TAN0378-0023',
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@gmail.com',
        mobile: '+91 8765432109',
        jobRole: 'Full Stack Developer',
        street: '789, Brigade Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560025'
    },
    {
        id: 'TAN0378-0024',
        name: 'Sneha Reddy',
        email: 'sneha.reddy@gmail.com',
        mobile: '+91 7654321098',
        jobRole: 'UI/UX Designer',
        street: '321, Koramangala',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560034'
    },
    {
        id: 'TAN0378-0025',
        name: 'Arjun Patel',
        email: 'arjun.patel@gmail.com',
        mobile: '+91 6543210987',
        jobRole: 'DevOps Engineer',
        street: '654, Whitefield',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560066'
    }
];

const SearchableDropdown: FC<SearchableDropdownProps> = ({ 
    value, 
    onSelect, 
    placeholder, 
    searchKey, 
    displayKey, 
    data = mockEmployees,
    disabled = false 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    const filteredData = data.filter(item =>
        item[searchKey].toLowerCase().includes(searchTerm.toLowerCase()) ||
        item[displayKey].toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (item: Employee) => {
        onSelect(item);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                className={`w-full px-3 py-2 bg-gray-100 border-0 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex items-center justify-between ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className={value ? 'text-black' : 'text-gray-500'}>
                    {value || placeholder}
                </span>
                <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && !disabled && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-hidden">
                    <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search..."
                                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                            />
                        </div>
                    </div>
                    
                    <div className="max-h-48 overflow-y-auto">
                        {filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <div
                                    key={item.id}
                                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0"
                                    onClick={() => handleSelect(item)}
                                >
                                    <div className="font-medium text-sm text-gray-900">{item[displayKey]}</div>
                                    <div className="text-xs text-gray-500">{item[searchKey]} • {item.jobRole}</div>
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-4 text-center text-gray-500 text-sm">
                                No employees found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

interface AddPayslipProps {
    onClose: () => void;
}

const AddPayslip: FC<AddPayslipProps> = ({ onClose }) => {
    const [formData, setFormData] = useState<FormData>({
        employeeName: '',
        employeeId: '',
        jobRole: '',
        email: '',
        mobileNo: '',
        salaryDate: '2025-07',
        street: '',
        city: '',
        state: '',
        pincode: '',
        basicSalary: '',
        allowance: ''
    });

    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleEmployeeSelect = (employee: Employee) => {
        setSelectedEmployee(employee);
        setFormData(prev => ({
            ...prev,
            employeeName: employee.name,
            employeeId: employee.id,
            jobRole: employee.jobRole,
            email: employee.email,
            mobileNo: employee.mobile,
            street: employee.street,
            city: employee.city,
            state: employee.state,
            pincode: employee.pincode
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
    };

    const clearEmployeeSelection = () => {
        setSelectedEmployee(null);
        setFormData({
            employeeName: '',
            employeeId: '',
            jobRole: '',
            email: '',
            mobileNo: '',
            salaryDate: formData.salaryDate,
            street: '',
            city: '',
            state: '',
            pincode: '',
            basicSalary: formData.basicSalary,
            allowance: formData.allowance
        });
    };

    return (
        <div className='fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
            <div className="bg-white rounded-lg w-full max-w-4xl p-6 relative shadow-2xl text-black">
                <div className='flex justify-between items-center mb-6'>
                    <h2 className="text-xl font-medium text-gray-800">Payslips</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="space-y-4">
                    {/* First Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Employee Name</label>
                            <div className="relative">
                                <SearchableDropdown
                                    value={formData.employeeName}
                                    onSelect={handleEmployeeSelect}
                                    placeholder="Select Employee"
                                    searchKey="id"
                                    displayKey="name"
                                />
                                {selectedEmployee && (
                                    <button 
                                        type="button"
                                        className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-20"
                                        onClick={clearEmployeeSelection}
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Employee ID</label>
                            <SearchableDropdown
                                value={formData.employeeId}
                                onSelect={handleEmployeeSelect}
                                placeholder="Select Employee ID"
                                searchKey="name"
                                displayKey="id"
                                disabled={!!selectedEmployee}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Job Role</label>
                            <input
                                type="text"
                                value={formData.jobRole}
                                onChange={(e) => handleInputChange('jobRole', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-100 border-0 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={!!selectedEmployee}
                            />
                        </div>
                    </div>

                    {/* Second Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-100 border-0 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={!!selectedEmployee}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Mobile No.</label>
                            <input
                                type="text"
                                value={formData.mobileNo}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('mobileNo', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-100 border-0 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={!!selectedEmployee}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Salary Date</label>
                            <input
                                type="month"
                                value={formData.salaryDate}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('salaryDate', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-100 border-0 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Street Address */}
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Street</label>
                        <input
                            type="text"
                            value={formData.street}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('street', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-100 border-0 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={!!selectedEmployee}
                        />
                    </div>

                    {/* Third Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">City</label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('city', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-100 border-0 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={!!selectedEmployee}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">State</label>
                            <input
                                type="text"
                                value={formData.state}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('state', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-100 border-0 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={!!selectedEmployee}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Pincode</label>
                            <input
                                type="text"
                                value={formData.pincode}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('pincode', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-100 border-0 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={!!selectedEmployee}
                            />
                        </div>
                    </div>

                    {/* Fourth Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Basic Salary</label>
                            <input
                                type="number"
                                value={formData.basicSalary}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('basicSalary', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-100 border-0 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder=""
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Allowance</label>
                            <input
                                type="number"
                                value={formData.allowance}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('allowance', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-100 border-0 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder=""
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleSubmit}
                            className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 rounded transition-colors duration-200"
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Payslip: FC = () => {
    const [isExpand, setIsExpand] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const handleAdd = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    return (
        <div className='flex flex-col gap-5'>
            { isModalOpen && <AddPayslip onClose={handleCloseModal} /> }
            <div className='bg-white border border-gray-300 rounded p-4 flex justify-between'>
                <div className='flex gap-3 items-center'>
                    <FileText size={35} className='p-2 bg-blue-500 text-white rounded' />
                    <p className='text-2xl font-semibold'>Payslips</p>
                </div>
                <button onClick={handleAdd} className='flex gap-3 py-2 px-4 text-white rounded items-center bg-green-500'>
                    <Plus size={15} />
                    <p>Create Payslips</p>
                </button>
            </div>
            <div className='bg-white border border-gray-300 p-3 rounded'>
                <div className=' flex justify-between items-center'>
                    <div className='flex gap-3'>
                        <div>
                            <div className='w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-semibold'>
                                R
                            </div>
                        </div>
                        <div>
                            <h3 className='font-semibold'>Rushaid</h3>
                            <p className='text-xs font-semibold text-gray-500'>TR/2025/05</p>
                        </div>
                    </div>
                    <div className='flex gap-3'>
                        <h2 className='text-md font-semibold'>42,000</h2>
                        <button onClick={() => setIsExpand(!isExpand)}>
                            {isExpand ? (
                                <ChevronDown className='text-gray-500 transition-transform duration-300' />
                            ) : (
                                <ChevronRight className='text-gray-500 transition-transform duration-300' />
                            )}
                        </button>
                    </div>
                </div>
                { isExpand && (
                    <>
                        <div className='border-t border-gray-300 mt-3 px-3 py-2 flex flex-col gap-2'>
                            <div className='flex justify-between items-center'>
                                <h2 className='text-sm'>Basic Salary</h2>
                                <p className='text-sm'>41,500</p>
                            </div>
                            <div className='flex justify-between items-center'>
                                <h2 className='text-sm'>Allowance</h2>
                                <p className='text-sm'>1,500</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default Payslip