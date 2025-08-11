
'use client'
import React, { useState } from 'react';
import { Search, Filter, Plus, Clock, CheckCircle, Target, Calendar } from 'lucide-react';

const Page = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    
    const reports = [
        {
            id: 1,
            date: '22/07/2025',
            hours: 7,
            status: 'Submitted',
            tasksCompleted: 3,
            keyAchievements: true,
            nextDayPlanned: true,
            statusColor: 'bg-blue-100 text-blue-800'
        },
        {
            id: 2,
            date: '21/07/2025',
            hours: 6.5,
            status: 'Approved',
            tasksCompleted: 3,
            keyAchievements: true,
            nextDayPlanned: true,
            statusColor: 'bg-green-100 text-green-800'
        },
        {
            id: 3,
            date: '20/07/2025',
            hours: 8,
            status: 'Pending',
            tasksCompleted: 4,
            keyAchievements: true,
            nextDayPlanned: true,
            statusColor: 'bg-yellow-100 text-yellow-800'
        },
        {
            id: 4,
            date: '19/07/2025',
            hours: 7.5,
            status: 'Approved',
            tasksCompleted: 2,
            keyAchievements: true,
            nextDayPlanned: true,
            statusColor: 'bg-green-100 text-green-800'
        }
    ];

    const filteredReports = reports.filter(report => {
        const matchesSearch = report.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            report.status.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All Status' || report.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-xl font-semibold text-gray-900">My Daily Reports</h1>
                        </div>
                        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                            <Plus className="w-4 h-4" />
                            <span>New Report</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search and Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option>All Status</option>
                            <option>Submitted</option>
                            <option>Approved</option>
                            <option>Pending</option>
                        </select>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                            <Filter className="w-4 h-4" />
                            <span>Filter</span>
                        </button>
                    </div>
                </div>

                {/* Reports List */}
                <div className="space-y-4">
                    {filteredReports.map((report) => (
                        <div key={report.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">
                                                Report - {report.date}
                                            </h3>
                                            <div className="flex items-center space-x-4 mt-1">
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    {report.hours} hours
                                                </div>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${report.statusColor}`}>
                                                    {report.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                                
                                {/* Report Details */}
                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
                                        {report.tasksCompleted} tasks completed
                                    </div>
                                    {report.keyAchievements && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Target className="w-4 h-4 mr-2 text-green-500" />
                                            Key achievements logged
                                        </div>
                                    )}
                                    {report.nextDayPlanned && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                                            Next day planned
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredReports.length === 0 && (
                    <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                        <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Page;