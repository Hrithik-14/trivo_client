'use client'

import api from '@/app/api/axios';
import { FileText, Calendar, Clock, User, Filter, Search, X, UserCheck } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import SearchableDropdown from './Searchuser';

interface Employee {
    _id: string;
    name: string;
    employeeCode: string;
    profileImage: string;
}

interface Attendance {
    _id: string;
    employeeId: Employee;
    date: Date;
    status: string;
    leaveDescription: string;
}

const TodaysLeave = () => {
    const [users, setUser] = useState<Attendance[]>([])
    const [loading, setLoading] = useState(true)
    const [employees, setEmployees] = useState<Employee[]>([])
    
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    })
    const [selectedEmployee, setSelectedEmployee] = useState('')
    const [showAll, setShowAll] = useState(false)
    const [employeeSearch, setEmployeeSearch] = useState('')
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        const fetchEmployees = async() => {
            try {
                const res = await api.get('/users')
                const data = Array.isArray(res.data) ? res.data : res.data.users || [];
                setEmployees(data)
            } catch (err) {
                console.error('Error fetching employees:', err);
            }
        }
        fetchEmployees()
    }, [])

    useEffect(() => {
        const fetchuser = async() => {
            try {
                setLoading(true)
                const params = new URLSearchParams()
                
                if (showAll) {
                    params.append('showAll', 'true')
                } else if (selectedDate) {
                    params.append('date', selectedDate)
                }
                
                if (selectedEmployee) {
                    params.append('employeeId', selectedEmployee)
                }
                
                const res = await api.get(`/leave-status?${params.toString()}`)
                setUser(res.data)
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false)
            }
        }
        fetchuser()
    }, [selectedDate, selectedEmployee, showAll])

    const clearFilters = () => {
        const today = new Date();
        setSelectedDate(today.toISOString().split('T')[0])
        setSelectedEmployee('')
        setShowAll(false)
        setEmployeeSearch('')
    }

    const filteredEmployees = employees.filter(emp => 
        emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        emp.employeeCode.toLowerCase().includes(employeeSearch.toLowerCase())
    )

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'absent':
                return 'bg-red-500 text-white'
            case 'late':
                return 'bg-yellow-500 text-white'
            case 'leave':
                return 'bg-orange-500 text-white'
            default:
                return 'bg-green-500 text-white'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'absent':
                return <User size={16} />
            case 'late':
                return <Clock size={16} />
            case 'leave':
                return <Calendar size={16} />
            default:
                return <UserCheck size={16} />
        }
    }

    const hasActiveFilters = selectedEmployee || showAll || selectedDate !== new Date().toISOString().split('T')[0]

    return (
        <div className='min-h-[400px] bg-gradient-to-br from-slate-50 to-white shadow-lg rounded-md border border-gray-100 overflow-hidden'>
            <div className='bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                        <div className='bg-white/20 backdrop-blur-sm p-3 rounded-lg'>
                            <FileText size={32} className='text-white' />
                        </div>
                        <div>
                            <h2 className='text-2xl font-bold'>Attendance Management</h2>
                        </div>
                    </div>
                    
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                            showFilters || hasActiveFilters
                                ? 'bg-white text-blue-600 shadow-md'
                                : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                    >
                        <Filter size={18} />
                        <span className='font-medium'>Filters</span>
                        {hasActiveFilters && (
                            <span className='bg-blue-600 text-white text-xs px-2 py-1 rounded-full'>
                                Active
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {showFilters && (
                <div className='bg-gray-50 border-b border-gray-200 p-6'>
                    <div className='space-y-4'>
                        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-end'>
                            <div className='flex-shrink-0 justify-between h-17'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Date Filter
                                </label>
                                <label className='inline-flex h-full'>
                                    <input
                                        type="checkbox"
                                        checked={showAll}
                                        onChange={(e) => setShowAll(e.target.checked)}
                                        className='rounded border-gray-300 text-blue-600 shadow-sm w-4 h-4'
                                    />
                                    <span className='ml-2 text-sm font-medium text-gray-700'>Show All Records</span>
                                </label>
                            </div>

                            {!showAll && (
                                <div className='flex-1 min-w-0'>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Select Date
                                    </label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white'
                                    />
                                </div>
                            )}
                            <SearchableDropdown
                                employees={filteredEmployees} 
                                selectedEmployee={selectedEmployee}
                                setSelectedEmployee={setSelectedEmployee}
                            />

                            <button
                                onClick={clearFilters}
                                disabled={!hasActiveFilters}
                                className='flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'
                            >
                                <X size={16} />
                                Clear
                            </button>
                        
                        </div>

                    </div>
                </div>
            )}

            <div className='p-6'>
                {loading ? (
                    <div className='flex items-center justify-center py-12'>
                        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
                    </div>
                ) : users.length > 0 ? (
                    <div className='space-y-4'>
                        <div className='flex items-center justify-between mb-6'>
                            <div>
                                <h3 className='text-lg font-semibold text-gray-800'>
                                    Leave Records ({users.length})
                                </h3>
                                <p className='text-sm text-gray-600 mt-1'>
                                    {showAll ? 'Showing all records' : 
                                        selectedDate && `Date: ${new Date(selectedDate).toLocaleDateString('en-US', { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}`
                                    }
                                    {selectedEmployee && employees.find(emp => emp._id === selectedEmployee) && 
                                        ` • Employee: ${employees.find(emp => emp._id === selectedEmployee)?.name}`
                                    }
                                </p>
                            </div>
                        </div>
                        
                        {users.map(user => (
                            <div key={user._id} className='bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden'>
                                <div className='p-5'>
                                    <div className='flex items-center justify-between gap-4'>
                                        <div className='flex items-center gap-4 flex-1'>
                                            <div className='relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-gray-100 flex-shrink-0'>
                                                <Image 
                                                    src={user.employeeId?.profileImage || '/avatar.png'}
                                                    alt='Profile'
                                                    fill
                                                    className='object-cover object-center'
                                                />
                                            </div>
                                            <div className='min-w-0 flex-1'>
                                                <h3 className='font-semibold text-gray-900 text-lg'>
                                                    {user.employeeId?.name}
                                                </h3>
                                                <p className='text-gray-500 text-sm font-medium'>
                                                    ID: {user.employeeId?.employeeCode}
                                                </p>
                                            </div>
                                        </div>

                                        <div className='text-center hidden sm:block flex-shrink-0'>
                                            <div className='flex items-center gap-2 text-gray-600 mb-1'>
                                                <Calendar size={16} />
                                                <span className='text-sm font-medium'>Date</span>
                                            </div>
                                            <p className='text-sm text-gray-800 font-semibold'>
                                                {new Date(user.date).toLocaleDateString('en-US', { 
                                                    weekday: 'short', 
                                                    month: 'short', 
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>

                                        <div className='flex-shrink-0'>
                                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm uppercase tracking-wider ${getStatusColor(user.status)}`}>
                                                {getStatusIcon(user.status)}
                                                {user.status}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='sm:hidden mt-3 pt-3 border-t border-gray-100'>
                                        <div className='flex items-center gap-2 text-gray-600'>
                                            <Calendar size={16} />
                                            <span className='text-sm font-medium'>
                                                {new Date(user.date).toLocaleDateString('en-US', { 
                                                    weekday: 'long', 
                                                    month: 'long', 
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {user.leaveDescription && (
                                    <div className='border-t border-gray-100 bg-gray-50/50 p-5'>
                                        <div className='flex items-start gap-3'>
                                            <div className='bg-blue-100 p-1.5 rounded-md flex-shrink-0 mt-0.5'>
                                                <FileText size={14} className='text-blue-600' />
                                            </div>
                                            <div className='min-w-0 flex-1'>
                                                <h4 className='font-semibold text-gray-900 mb-1 text-sm'>
                                                    Leave Description
                                                </h4>
                                                <p className='text-gray-700 text-sm leading-relaxed'>
                                                    {user.leaveDescription}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='text-center py-16'>
                        <div className='bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center'>
                            <Search size={32} className='text-gray-400' />
                        </div>
                        <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                            {hasActiveFilters ? 'No Records Found' : 'No Leave Records'}
                        </h3>
                        <p className='text-gray-500 max-w-sm mx-auto'>
                            {hasActiveFilters 
                                ? 'Try adjusting your filters to see more results.'
                                : 'All employees are present for the selected date. Great attendance!'
                            }
                        </p>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default TodaysLeave