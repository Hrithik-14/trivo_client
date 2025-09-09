/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Calendar, ThumbsDown, ThumbsUp } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";
import api from "@/app/api/axios";
import { RootState } from "@/app/store";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useAdminAuthGuard } from "@/app/hooks/useAdminAuthGuard";


interface Employee {
    _id: string;
    name?: string;
    profileImage?: string;
}

interface Request {
    _id: string;
    date: string;
    leaveType?: string;
    description?: string;
    status: "Pending" | "Approve" | "Reject";
    employeeId?: Employee;
}

const ManagerRequest: React.FC = () => {
    const [leaveRequests, setLeaveRequests] = useState<Request[]>([]);
    const [regularizationRequests, setRegularizationRequests] = useState<Request[]>([]);
    const [load, setLoading] = useState<boolean>(true);
    const user = useSelector((state: RootState) => state.user.user);
    const { loading } = useAdminAuthGuard()
    const token = user?.token;



    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);
            const [leaveResponse, regularizationResponse] = await Promise.all([
                api.get<Request[]>("/allrequest", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                api.get<Request[]>("/get-regularization", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            setLeaveRequests(leaveResponse.data);
            setRegularizationRequests(regularizationResponse.data);
        } catch (err: any) {
            console.error("Error fetching requests:", err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleRequestAction = async (
        requestId: string,
        status: "Approve" | "Reject",
    ) => {
        try {
        await api.patch(
            `/leave-status/${requestId}`,
            { status, date: new Date().toISOString() },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success(`Request ${status.toLowerCase()}d successfully`);
        fetchRequests();
        } catch (err: any) {
        toast.error(
            err.response?.data?.message ||
            `Failed to ${status.toLowerCase()} request`
        );
        console.error("Error updating request:", err);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        });
    };

const renderRequestCard = (request: Request) => (
  <div
    key={request._id}
    className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 rounded-lg mb-4"
  >
    <div className="flex justify-between items-start">
      <div className="flex flex-col gap-4 flex-1">
        <div className="flex gap-4 items-start">
          <div className="relative w-14 h-14 flex-shrink-0">
            <Image
              src={request?.employeeId?.profileImage || "/avatar.png"}
              alt="profile"
              fill
              className="rounded-full object-cover object-center border-2 border-gray-100"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="font-semibold text-gray-900 text-base truncate">
                {request?.employeeId?.name || "Employee"}
              </h2>
              <div className="flex-shrink-0">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    request.status === "Pending"
                      ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                      : request.status === "Approve"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {request.status || "Pending"}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 font-medium">
              {formatDate(request.date)}
            </p>
            
            {request.leaveType && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  {request.leaveType}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Description:
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {request.description || "No description provided"}
          </p>
        </div>
      </div>

      {request.status === "Pending" && (
        <div className="flex flex-col sm:flex-row gap-2 ml-4 flex-shrink-0">
          <button
            onClick={() =>
              handleRequestAction(request._id, "Approve")
            }
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <ThumbsUp size={16} />
            <span>Approve</span>
          </button>
          
          <button
            onClick={() =>
              handleRequestAction(request._id, "Reject")
            }
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <ThumbsDown size={16} />
            <span>Reject</span>
          </button>
        </div>
      )}
    </div>
  </div>
);

    if (load) {
        return (
        <div className="flex flex-col gap-5 ">
            <div className="bg-white p-5 px-5 border border-[#ddd] rounded flex gap-3 items-center">
            <Calendar size={35} className="p-2 bg-blue-500 text-white rounded" />
            <h2 className="text-xl font-semibold">Managers Request</h2>
            </div>
            <div className="text-center py-8">Loading requests...</div>
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
        <div className="flex flex-col gap-5">
        <div className="bg-white p-5 px-5 border border-[#ddd] rounded flex gap-3 items-center">
            <Calendar size={35} className="p-2 bg-blue-500 text-white rounded" />
            <h2 className="text-xl font-semibold">Employee Request</h2>
        </div>

        <div>
            <h2 className="text-sm font-semibold mb-2">
            Regularization ({regularizationRequests.length})
            </h2>
            {regularizationRequests.length === 0 ? (
            <div className="bg-gray-50 border border-[#ddd] p-4 rounded text-center text-gray-500">
                No regularization requests
            </div>
            ) : (
            <div className="space-y-3">
                {regularizationRequests.map((request) =>
                renderRequestCard(request)
                )}
            </div>
            )}
        </div>

        <div>
            <h2 className="text-sm font-semibold mb-2">
            Leave Request ({leaveRequests.length})
            </h2>
            {leaveRequests.length === 0 ? (
            <div className="bg-gray-50 border border-[#ddd] p-4 rounded text-center text-gray-500">
                No leave requests
            </div>
            ) : (
            <div className="space-y-3">
                {leaveRequests.map((request) =>
                renderRequestCard(request)
                )}
            </div>
            )}
        </div>
        </div>
    );
};

export default ManagerRequest;
