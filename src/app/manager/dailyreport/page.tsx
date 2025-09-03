/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import api from "@/app/api/axios";
import { useManangerAuthGuard } from "@/app/hooks/usemanagerAuthGuard";
import { RootState } from "@/app/store";
import { Calendar, Clock, Columns, Plus, Rows } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

interface Report {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    descriptions: string;
    createdAt: string;
    status: string;
    effectiveHours: string;
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
          await api.post(`/manager-report/${managerId}`, {
            startTime,
            endTime,
            description,
        });

        setMessage("Manager report submitted successfully!");
        setStartTime("");
        setEndTime("");
        setDescription("");
        
        setTimeout(() => {
            onReportSubmitted();
            onClose();
            setMessage("");
        }, 500);
        
        } catch (error: any) {

        setMessage(` ${error.response?.data?.message || "Error submitting report"}`);
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


  const [reports, setReports] = useState<Report[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useSelector((state: RootState) => state.user.user)
  console.log(user);
  
  const { loading } = useManangerAuthGuard()
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [showStyle, setShowStyle] = useState(true)
  const statuses = ["pending", "accepted", "rejected"];


  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        await api.get(`/report/getReportsByEmployee/${user?.id}`, {

          headers: { Authorization:` Bearer ${user?.token}` },
        });
        

      } catch (error) {
        console.error("Failed to fetch statuses", error);
      }
    };

    if (user?.id && user?.token) {
      fetchStatuses();
    }
  }, [user?.id, user?.token]);



  const fetchReports = useCallback(async () => {
    if (!user?.id) return;
    
    
    try {

      const response = await api.get(`/report/getReportsByEmployee/${user?.id}`,
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );

      setReports(Array.isArray(response.data.report) ? response.data.report : []);
    } catch (error: any) {
      console.log(error);
      
      setReports([]);
    } finally {
    }
  }, [user?.id, user?.token])

    useEffect(() => {
    if (user?.id) {
      fetchReports();
    }
  }, [user?.id, fetchReports]);


  const filteredReports = reports.filter((report) => {
      if (statusFilter === "All Status") return true;
  return report.status === statusFilter;

  });


  if (!user?.id) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-500">Please log in to view reports</div>
      </div>
    );
  }

  
    if (loading) return (
        <div className="h-full flex items-center justify-center">
            <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading details...</p>
            </div>
        </div>
    );

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

              className="inline-flex gap-2 items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus size={18} />
              New Report
            </button>
          </div>
        </div>


        <div className="flex justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="bg-[#eaeaea] p-1 rounded-xl inline-flex">
            <motion.button
              onClick={() => setShowStyle(false)}
              animate={{
                backgroundColor: !showStyle ? "#fff" : "#eaeaea",
                color: !showStyle ? "#2563eb" : "#4b5563",
                scale: !showStyle ? 1.05 : 1,
                boxShadow: !showStyle ? "0 2px 6px rgba(0,0,0,0.15)" : "none",
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg"
            >
              <Columns className="w-4 h-4" />
              <span className="font-medium text-sm">Grid</span>
            </motion.button>

            <motion.button
              onClick={() => setShowStyle(true)}
              animate={{
                backgroundColor: showStyle ? "#fff" : "#eaeaea",
                color: showStyle ? "#2563eb" : "#4b5563",
                scale: showStyle ? 1.05 : 1,
                boxShadow: showStyle ? "0 2px 6px rgba(0,0,0,0.15)" : "none",
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg"
            >
              <Rows className="w-4 h-4" />
              <span className="font-medium text-sm">Rows</span>
            </motion.button>
          </div>
        </div>

            <div className={`space-y-4 ${showStyle === true ? '' : 'grid grid-cols-2 gap-5'}`}>
                {filteredReports.length > 0 ? (
                  filteredReports.map((report, index) => (
                    <div key={report.id || index} className="p-6 bg-white hover:bg-gray-50 rounded border border-[#ddd] h-fit">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-4">

                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-blue-600" />
                              </div>
                            <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Report - {new Date(report.date).toLocaleDateString()}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {report.effectiveHours} hours
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            report.status === 'pending' ? 'bg-yellow-100 border border-yellow-300 text-yellow-500' : report.status === 'accepted' ? 'bg-green-100 border border-green-300 text-green-500' : 'bg-red-100 border border-red-300 text-red-500'
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>
                    </div>
                            
                        </div>
                        </div>
                        <div className="text-gray-900">
                            <p className="text-sm leading-relaxed"> Description: {report.descriptions}</p>
                        </div>
                        </div>
                    </div>
                    </div>

                ))
                ) : (
                  <p className="w-full text-center text-lg pt-5 font-semibold">No reports found</p>
                )}
            </div>
      </div>

      <ManagerReportForm
        managerId={user?.id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReportSubmitted={fetchReports}
      />
    </div>
  );
};

export default ManagerReport;