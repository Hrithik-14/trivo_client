/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import api from "@/app/api/axios";
import React, { useEffect, useState } from "react";

interface Report {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  descriptions: string;
  createdAt: string;
}

interface ManagerReportFormProps {
  managerId: string;
  isOpen: boolean;
  onClose: () => void;
  onReportSubmitted: () => void;
}

const ManagerReportForm: React.FC<ManagerReportFormProps> = ({ 
  managerId, 
  isOpen, 
  onClose,
  onReportSubmitted 
}) => {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await api.post(`/manager-report/${managerId}`, {
        startTime,
        endTime,
        description,
      });

      setMessage("✅ Manager report submitted successfully!");
      setStartTime("");
      setEndTime("");
      setDescription("");
      
      // Call parent callback to refresh reports list
      setTimeout(() => {
        onReportSubmitted();
        onClose();
        setMessage("");
      }, 1500);
      
    } catch (error: any) {
      setMessage(`❌ ${error.response?.data?.message || "Error submitting report"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
      onClick={handleBackdropClick}
    >
      <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl w-full max-w-lg max-h-[95vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">New Manager Report</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition ease-in-out duration-150"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-4 max-h-[calc(90vh-120px)] overflow-y-auto">
          {message && (
            <div className={`mb-4 p-3 rounded-md text-sm ${
              message.includes('✅') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Start Time */}
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* End Time */}
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Work Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Describe the work completed during this time period..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="reportForm"
            disabled={loading}
            onClick={handleSubmit}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit Report'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};




const ManagerReport = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const parsed = storedUser ? JSON.parse(storedUser) : null;
    setToken(parsed?.token ?? null)
    setUserId(parsed?.id ?? null);
  }, []);

  // Fetch reports when userId is available
  useEffect(() => {
    if (userId) {
      fetchReports();
    }
  }, [userId]);

  const fetchReports = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError("");
    
    try {
       const response = await api.get(`/report/getReportsByEmployee/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
       );
       console.log("API response:", response.data);
      setReports(Array.isArray(response.data.report) ? response.data.report : []);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to fetch reports");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return "";
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    if (end < start) {
      // Handle next day scenario
      end.setDate(end.getDate() + 1);
    }
    
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}h ${diffMinutes}m`;
  };

  if (!userId) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-500">Please log in to view reports</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between bg-white p-4 rounded border border-[#ddd]">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manager Reports</h1>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Report
            </button>
          </div>
        </div>

            <div className="flex flex-col  gap-5 ">
                {reports.map((report, index) => (
                    <div key={report.id || index} className="p-6 bg-white hover:bg-gray-50 rounded border border-[#ddd]">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-4">
                            <h2>Report Date: {new Date(report.date).toLocaleDateString()}</h2>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {calculateDuration(report.startTime, report.endTime)}
                            </span>
                            </div>
                            {report.createdAt && (
                            <div className="text-sm text-gray-500">
                                {formatDate(report.createdAt)}
                            </div>
                            )}
                        </div>
                        <div className="text-gray-900">
                            <p className="text-sm leading-relaxed"> Description: {report.descriptions}</p>
                        </div>
                        </div>
                    </div>
                    </div>
                ))}
            </div>
      </div>

      {/* Modal */}
      <ManagerReportForm
        managerId={userId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReportSubmitted={fetchReports}
      />
    </div>
  );
};

export default ManagerReport;