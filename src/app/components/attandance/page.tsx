/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  FileText,
  User,
  LogIn,
  LogOut,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import api from "@/app/api/axios";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

// TypeScript interfaces
interface AttendanceRecord {
  _id: string;
  employeeId: string;
  date: string;

  signInTime: string | null;
  signOutTime: string | null;
  status: "absent" | "halfday" | "late";
  totalHours: string;
  isActive: boolean; // if employee is currently logged in
  leaveType?: string;
  leaveReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface Employee {
  _id: string;
  name: string;
  employeeId: string;
  department: string;
  email: string;
}

interface LeaveApplication {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  document?: File;
  
}

interface RegularisationRequest {
  date: string;
  signInTime: string;
  signOutTime: string;
  reason: string;
  document?: File;
}

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const AttendancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "calendar" | "leave" | "regularisation"
  >("calendar");
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [attendanceData, setAttendanceData] = useState<
    Record<string, AttendanceRecord>
  >({});
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Leave and regularisation states
  const [leaveForm, setLeaveForm] = useState<LeaveApplication>({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [regularisationForm, setRegularisationForm] =
    useState<RegularisationRequest>({
      date: "",
      signInTime: "",
      signOutTime: "",
      reason: "",
    });
  const [leaveHistory, setLeaveHistory] = useState<any[]>([]);
  const [regularisationHistory, setRegularisationHistory] = useState<any[]>([]);

  const user = useSelector((state: RootState) => state.user.user);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [day, setDay] = useState("");
  const leaveTypes = [
    "Annual Leave",
    "Sick Leave",
    "Personal Leave",
    "Emergency Leave",
    "Maternity Leave",
    "Paternity Leave",
  ];
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await api.get("/singleday-status",  {
          
  //         headers: { Authorization: `Bearer ${user?.token}` },
  //       });
  //       console.log(response.data);
  //       setDay(response.data);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };
  //   fetchData();
  // }, []);

  // Fetch attendance data
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!user?.token) return;

      try {
        setLoading(true);
        setError("");

        const response = await api.get("/getMyAttendenceHistory", {
          headers: { Authorization: `Bearer ${user?.token}` },
        });

        if (response.data?.attendance) {
          setAttendance(response.data.attendance);
        }
      } catch (error: any) {
        console.error("Error fetching attendance:", error);
        setError("Failed to load attendance data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [user?.token]);

  // Process attendance data
  useEffect(() => {
    const loadAttendanceData = () => {
      try {
        const dataMap: Record<string, AttendanceRecord> = {};

        attendance.forEach((record) => {
          // Ensure date format is consistent (YYYY-MM-DD)
          const dateKey = record.date.split("T")[0]; // Remove time part if exists
          dataMap[dateKey] = record;
        });

        setAttendanceData(dataMap);

        // Check if employee is currently logged in
        const today = new Date();
        const todayKey = today.toISOString().split("T")[0];
        const todayRecord = dataMap[todayKey];
        setIsLoggedIn(todayRecord?.isActive || false);
      } catch (error) {
        console.error("Error processing attendance data:", error);
        setError("Error processing attendance data");
      }
    };

    if (attendance.length > 0) {
      loadAttendanceData();
    }
  }, [attendance]);

  // Fetch leave history
  const fetchLeaveHistory = async () => {
    if (!user?.token) return;

    try {
      const response = await api.get("/api/leave/history", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setLeaveHistory(response.data.leaves || []);
    } catch (error) {
      console.error("Error fetching leave history:", error);
    }
  };

  // Fetch regularisation history
  const fetchRegularisationHistory = async () => {
    if (!user?.token) return;

    try {
      const response = await api.get("/api/attendance/regularisation-history", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setRegularisationHistory(response.data.requests || []);
    } catch (error) {
      console.error("Error fetching regularisation history:", error);
    }
  };

  // Load additional data based on active tab
  useEffect(() => {
    if (activeTab === "leave") {
      fetchLeaveHistory();
    } else if (activeTab === "regularisation") {
      fetchRegularisationHistory();
    }
  }, [activeTab, user?.token]);

  const formatDateKey = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const getStatusColor = (status: AttendanceRecord["status"]): string => {
    switch (status) {
      case "halfday":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "late":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "absent":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const formatTime = (timeString: string | null): string => {
    if (!timeString) return "Not recorded";

    try {
      // Handle different time formats
      let time: Date;
      if (timeString.includes("T")) {
        time = new Date(timeString);
      } else {
        time = new Date(`2000-01-01T${timeString}`);
      }

      return time.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return timeString; // Return original if parsing fails
    }
  };

  const handleDateChange = (value: Value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  // Calendar tile content to show attendance status
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const dateKey = formatDateKey(date);
      const attendanceRecord = attendanceData[dateKey];

      if (attendanceRecord) {
        const statusColor = getStatusColor(attendanceRecord.status);
        return (
          <div className="flex flex-col items-center mt-1">
            <div
              className={`w-2 h-2 rounded-full ${
                attendanceRecord.status === "halfday"
                  ? "bg-orange-500"
                  : attendanceRecord.status === "late"
                  ? "bg-yellow-500"
                  : attendanceRecord.status === "absent"
                  ? "bg-red-500"
                  : "bg-green-500"
              }`}
            ></div>
            {attendanceRecord.isActive && (
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse mt-1"></div>
            )}
          </div>
        );
      }
    }
    return null;
  };

  // Calendar tile class name to style tiles
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const dateKey = formatDateKey(date);
      const attendanceRecord = attendanceData[dateKey];
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();

      let className = "relative ";

      if (isToday) {
        className += "react-calendar__tile--today ";
      }

      if (attendanceRecord) {
        const status = attendanceRecord.status;
        if (status === "absent") {
          className += "bg-red-50 border border-red-200 ";
        } else if (status === "halfday") {
          className += "bg-orange-50 border border-yellow-200 ";
        } else if (status === "late") {
          className += "bg-yellow-50 border border-orange-200 ";
        } else {
          className += "bg-green-50 border border-green-200 ";
        }
      }

      return className;
    }
    return null;
  };

  // Leave application handler
  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) return;

    try {
      setLoading(true);
      setError("");

      await api.post("/api/leave/apply", leaveForm, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setSuccess("Leave application submitted successfully!");
      setLeaveForm({ leaveType: "", startDate: "", endDate: "", reason: "" });
      fetchLeaveHistory(); // Refresh history
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Failed to submit leave application"
      );
    } finally {
      setLoading(false);
    }
  };

  // Regularisation request handler
  const handleRegularisationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) return;

    try {
      setLoading(true);
      setError("");

      await api.post("/api/attendance/regularise", regularisationForm, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setSuccess("Regularisation request submitted successfully!");
      setRegularisationForm({
        date: "",
        signInTime: "",
        signOutTime: "",
        reason: "",
      });
      fetchRegularisationHistory(); // Refresh history
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Failed to submit regularisation request"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderCalendar = () => {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Attendance Calendar
          </h2>
        </div>

        <div className="calendar-container">
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            tileContent={tileContent}
            tileClassName={tileClassName}
            className="react-calendar-custom"
            next2Label={null}
            prev2Label={null}
            showNeighboringMonth={false}
          />
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Legend:</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>Half Day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Late</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span>Absent</span>
            </div>
          </div>
        </div>

        <style jsx global>{`
          .react-calendar-custom {
            width: 100% !important;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            font-family: inherit;
          }

          .react-calendar-custom .react-calendar__navigation {
            display: flex;
            height: 44px;
            margin-bottom: 1em;
            background: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
          }

          .react-calendar-custom .react-calendar__navigation button {
            min-width: 44px;
            background: none;
            border: none;
            font-size: 16px;
            font-weight: 600;
            color: #374151;
            padding: 8px;
            transition: all 0.2s;
          }

          .react-calendar-custom .react-calendar__navigation button:hover {
            background-color: #e5e7eb;
            border-radius: 4px;
          }

          .react-calendar-custom .react-calendar__navigation button:disabled {
            background-color: transparent;
            color: #9ca3af;
          }

          .react-calendar-custom .react-calendar__month-view__weekdays {
            text-align: center;
            text-transform: uppercase;
            font-weight: 600;
            font-size: 0.75em;
            color: #6b7280;
            background: #f9fafb;
            padding: 8px 0;
          }

          .react-calendar-custom
            .react-calendar__month-view__weekdays__weekday {
            padding: 0.5em;
          }

          .react-calendar-custom .react-calendar__month-view__days__day {
            height: 60px;
            padding: 4px;
            border: 1px solid transparent;
            transition: all 0.2s;
            position: relative;
          }

          .react-calendar-custom .react-calendar__month-view__days__day:hover {
            background-color: #f3f4f6;
          }

          .react-calendar-custom .react-calendar__tile--active {
            background: #3b82f6 !important;
            color: white !important;
            border-radius: 4px;
          }

          .react-calendar-custom .react-calendar__tile--active:hover {
            background: #2563eb !important;
          }

          .react-calendar-custom .react-calendar__tile--today {
            background: #dbeafe;
            color: #1d4ed8;
            font-weight: 600;
            border-radius: 4px;
          }

          .react-calendar-custom
            .react-calendar__month-view__days__day--neighboringMonth {
            color: #d1d5db;
          }

          .react-calendar-custom .react-calendar__tile:disabled {
            background-color: #f9fafb;
            color: #d1d5db;
          }
        `}</style>
      </div>
    );
  };

  const renderAttendanceDetails = () => {
    if (!selectedDate) {
      return (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            Select a date from the calendar to view attendance details
          </p>
        </div>
      );
    }

    const dateKey = formatDateKey(selectedDate);
    const data = attendanceData[dateKey];
    const formattedDate = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });


    const fetchData = async () => {
      try {
        const date = data?.date
        const response = await api.get(`/singleday-status?date=${date}`,   {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        console.log(response.data);
        setDay(response.data);
      } catch (err) {
        console.log(err);
      }
    };
    

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="border-b pb-4 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Attendance Details
          </h3>
          <p className="text-gray-600">{formattedDate}</p>
        </div>

        {data ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Status:</span>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                    data.status
                  )}`}
                >
                  {data.status}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Description:</span>
              <span className="text-gray-700">{data.totalHours || "0:00"}</span>
            </div>

            {data.leaveType && (
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Leave Type:</span>
                <span className="text-gray-700">{data.leaveType}</span>
              </div>
            )}

            {data.leaveReason && (
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Reason:</span>
                <span className="text-gray-700">{data.leaveReason}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No attendance record for this date</p>
            <p className="text-gray-400 text-sm mt-2">
              Employee was not logged in on this day
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderLeaveSection = () => (
    <div className="space-y-6">
      {/* Leave Application Form */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Apply for Leave
        </h2>

        <form onSubmit={handleLeaveSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leave Type *
              </label>
              <select
                value={leaveForm.leaveType}
                onChange={(e) =>
                  setLeaveForm({ ...leaveForm, leaveType: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Leave Type</option>
                {leaveTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={leaveForm.startDate}
                onChange={(e) =>
                  setLeaveForm({ ...leaveForm, startDate: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                value={leaveForm.endDate}
                onChange={(e) =>
                  setLeaveForm({ ...leaveForm, endDate: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason *
            </label>
            <textarea
              value={leaveForm.reason}
              onChange={(e) =>
                setLeaveForm({ ...leaveForm, reason: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Enter reason for leave..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? "Submitting..." : "Submit Leave Application"}
          </button>
        </form>
      </div>

      {/* Leave History */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Leave History</h3>
        {leaveHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Leave Type</th>
                  <th className="text-left p-3">Duration</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Applied Date</th>
                </tr>
              </thead>
              <tbody>
                {leaveHistory.map((leave, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3">{leave.leaveType}</td>
                    <td className="p-3">
                      {leave.startDate} - {leave.endDate}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          leave.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : leave.status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {leave.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {new Date(leave.appliedDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No leave applications found
          </p>
        )}
      </div>
    </div>
  );

  const renderRegularisationSection = () => (
    <div className="space-y-6">
      {/* Regularisation Request Form */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Request Attendance Regularisation
        </h2>

        <form onSubmit={handleRegularisationSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={regularisationForm.date}
                onChange={(e) =>
                  setRegularisationForm({
                    ...regularisationForm,
                    date: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sign In Time *
              </label>
              <input
                type="time"
                value={regularisationForm.signInTime}
                onChange={(e) =>
                  setRegularisationForm({
                    ...regularisationForm,
                    signInTime: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sign Out Time *
              </label>
              <input
                type="time"
                value={regularisationForm.signOutTime}
                onChange={(e) =>
                  setRegularisationForm({
                    ...regularisationForm,
                    signOutTime: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Regularisation *
            </label>
            <textarea
              value={regularisationForm.reason}
              onChange={(e) =>
                setRegularisationForm({
                  ...regularisationForm,
                  reason: e.target.value,
                })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Please explain why you need attendance regularisation..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? "Submitting..." : "Submit Regularisation Request"}
          </button>
        </form>
      </div>

      {/* Regularisation History */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Regularisation History
        </h3>
        {regularisationHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Time</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Requested Date</th>
                </tr>
              </thead>
              <tbody>
                {regularisationHistory.map((request, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      {new Date(request.date).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      {request.signInTime} - {request.signOutTime}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : request.status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {new Date(request.requestedDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No regularisation requests found
          </p>
        )}
      </div>
    </div>
  );

  // Alert messages
  const renderAlerts = () => (
    <div className="mb-4 space-y-2">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>{success}</span>
          <button
            onClick={() => setSuccess("")}
            className="ml-auto text-green-500 hover:text-green-700"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );

  if (loading && attendance.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Alerts */}
        {renderAlerts()}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("calendar")}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === "calendar"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <CalendarIcon className="w-5 h-5" />
              Calendar
            </button>
            <button
              onClick={() => setActiveTab("leave")}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === "leave"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <FileText className="w-5 h-5" />
              Leave
            </button>
            <button
              onClick={() => setActiveTab("regularisation")}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === "regularisation"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <Clock className="w-5 h-5" />
              Regularisation
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "calendar" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">{renderCalendar()}</div>
            <div>{renderAttendanceDetails()}</div>
          </div>
        )}

        {activeTab === "leave" && renderLeaveSection()}

        {activeTab === "regularisation" && renderRegularisationSection()}
      </div>
    </div>
  );
};

export default AttendancePage;
