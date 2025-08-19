"use client";
import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Check,
  X,
} from "lucide-react";
import api from "@/app/api/axios";

interface Report {
  _id: string;
  submittedBy: { name: string; email: string };
  projectId: { name: string };
  effectiveHours: string;
  descriptions?: string;
  status: "pending" | "accepted" | "rejected";
  createdAt?: string;
}

const ManagerDailyReport: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filterType, setFilterType] = useState("latest"); // latest | date | month | year
  const [filterValue, setFilterValue] = useState<string>("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchReports = async () => {
      if (!token) {
        setFetchLoading(false);
        return;
      }

      try {
        setFetchLoading(true);
        const { data } = await api.get(`/report/my?page=${page}&limit=5`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Sort latest first
        const sortedReports = (data.reports || []).sort(
          (a: Report, b: Report) =>
            new Date(b.createdAt || "").getTime() -
            new Date(a.createdAt || "").getTime()
        );

        setReports(sortedReports);
        setFilteredReports(sortedReports);
        setTotalPages(data.totalPages || 1);

        const firstPending = sortedReports.find(
          (r: Report) => r.status === "pending"
        );
        if (firstPending) {
          setSelectedReportId(firstPending._id);
        }
      } catch (error) {
        console.error("Error fetching reports", error);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchReports();
  }, [token, page]);

  // Filtering logic
  useEffect(() => {
    if (filterType === "latest") {
      setFilteredReports(
        [...reports].sort(
          (a, b) =>
            new Date(b.createdAt || "").getTime() -
            new Date(a.createdAt || "").getTime()
        )
      );
    } else if (filterType === "date") {
      setFilteredReports(
        reports.filter(
          (r) =>
            new Date(r.createdAt || "").toISOString().split("T")[0] ===
            filterValue
        )
      );
    } else if (filterType === "month") {
      setFilteredReports(
        reports.filter((r) => {
          const d = new Date(r.createdAt || "");
          const monthYear = `${d.getFullYear()}-${String(
            d.getMonth() + 1
          ).padStart(2, "0")}`;
          return monthYear === filterValue;
        })
      );
    } else if (filterType === "year") {
      setFilteredReports(
        reports.filter(
          (r) =>
            new Date(r.createdAt || "").getFullYear().toString() === filterValue
        )
      );
    }
  }, [filterType, filterValue, reports]);

  const updateStatus = async (id: string, status: "accepted" | "rejected") => {
    try {
      setLoading(true);
      const { data } = await api.patch(
        `/reports/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReports((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, status: data.report?.status || status } : r
        )
      );
    } catch (error) {
      console.error("Error updating status", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const selectedReport = filteredReports.find(
    (report) => report._id === selectedReportId
  );

  if (fetchLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Manager Daily Report
              </h1>
            </div>
            {/* Filter Controls */}
            <div className="flex items-center space-x-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border rounded-lg px-2 py-1"
              >
                <option value="latest">Latest</option>
                <option value="date">Date</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>

              {filterType === "date" && (
                <input
                  type="date"
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="border rounded-lg px-2 py-1"
                />
              )}

              {filterType === "month" && (
                <input
                  type="month"
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="border rounded-lg px-2 py-1"
                />
              )}

              {filterType === "year" && (
                <input
                  type="number"
                  placeholder="Enter year"
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="border rounded-lg px-2 py-1 w-24"
                />
              )}
            </div>
          </div>

          <div className="p-6">
            {filteredReports.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No reports found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReports.map((report) => (
                  <div
                    key={report._id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedReportId === report._id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedReportId(report._id)}
                  >
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-600" />
                      <div>
                        <span className="font-medium text-gray-900">
                          Daily Report - {report.submittedBy.name}
                        </span>
                        <div className="text-sm text-gray-500">
                          {report?.projectId?.name}{" "}
                          {new Date(
                            report.createdAt || ""
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(report.status)}
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          report.status
                        )}`}
                      >
                        {report.status.charAt(0).toUpperCase() +
                          report.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Report Details */}
        {selectedReport && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Daily Report - {selectedReport.submittedBy.name}
                </h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{selectedReport.effectiveHours}</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Working Project
                </h3>
                <p className="text-gray-900 font-medium">
                  {selectedReport?.projectId?.name}
                </p>
              </div>

              {selectedReport.descriptions && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-900">{selectedReport.descriptions}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => updateStatus(selectedReport._id, "rejected")}
                  disabled={loading || selectedReport.status !== "pending"}
                  className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                    selectedReport.status === "rejected"
                      ? "bg-red-600 text-white"
                      : selectedReport.status !== "pending" || loading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                >
                  {loading ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  <span>
                    {selectedReport.status === "rejected"
                      ? "Rejected"
                      : "Reject"}
                  </span>
                </button>
                <button
                  onClick={() => updateStatus(selectedReport._id, "accepted")}
                  disabled={loading || selectedReport.status !== "pending"}
                  className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                    selectedReport.status === "accepted"
                      ? "bg-green-600 text-white"
                      : selectedReport.status !== "pending" || loading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-500 text-white hover:bg-green-600"
                  }`}
                >
                  {loading ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>
                    {selectedReport.status === "accepted"
                      ? "Approved"
                      : "Approve"}
                  </span>
                </button>
              </div>

              {selectedReport.status !== "pending" && (
                <div
                  className={`mt-4 p-4 rounded-lg ${
                    selectedReport.status === "accepted"
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {selectedReport.status === "accepted" ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span
                      className={`font-medium ${
                        selectedReport.status === "accepted"
                          ? "text-green-800"
                          : "text-red-800"
                      }`}
                    >
                      Report has been {selectedReport.status}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDailyReport