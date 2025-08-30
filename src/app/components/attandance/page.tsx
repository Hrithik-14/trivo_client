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
import toast from "react-hot-toast";

interface AttendanceRecord {
  _id: string;
  employeeId: string;
  date: string;
  description: string;
  signInTime: string | null;
  signOutTime: string | null;
  status: "absent" | "halfday" | "late";
  totalHours: string;
  isActive: boolean;
  leaveType?: string;
  leaveReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface Employee {
  _id: string;
  name: string;
  employeeId: string; 
  email: string;
}

interface LeaveApplication {
  leaveType: string;
  leaveDate:  Date | null;
  description: string;
}

interface DayStatus {
  _id: string;
  employeeId: string;
  date: string;
  status: "absent" | "halfday" | "late";
  signInTime?: string;
}

interface LeaveDes {
  _id: string;
  employeeId: string;
  requestTo: string;
  leaveType?: string;
  status?: string;
  description?: string;
}

interface DayResponse {
  dayStatus: DayStatus;
  des?: LeaveDes;
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

  const [leaveForm, setLeaveForm] = useState<LeaveApplication>({
    leaveType: "",
    leaveDate: null,
    description: "",
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
  const [day, setDay] = useState<DayResponse | null>(null);
  const leaveTypes = [
    "Casual",
    "Sick",
    "Personal",
    "Maternity",
    "Paternity",
    "Privilege",
    "Regularization"
  ];

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

  useEffect(() => {
    const loadAttendanceData = () => {
      try {
        const dataMap: Record<string, AttendanceRecord> = {};

        attendance.forEach((record) => {
          const dateKey = record.date.split("T")[0];
          dataMap[dateKey] = record;
        });

        setAttendanceData(dataMap);

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

  useEffect(() => {
  if (!selectedDate) return;

  const fetchData = async () => {
    try {
      const dateKey = formatDateKey(selectedDate);
      const data = attendanceData[dateKey];
      
      const date = data?.date ||selectedDate
      const response = await api.get<DayResponse>(`/singleday-status`, {
        params: {date},
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setDay(response.data);
      console.log('daa', response.data);
      
    } catch (err) {
      console.log(err);
      setDay(null)
    }
  };

  fetchData();
}, [selectedDate]); 

  const fetchLeaveHistory = async () => {
    if (!user?.token) return;

    try {
      const response = await api.get("/get-my-request", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setLeaveHistory(response.data || []);
    } catch (error) {
      console.error("Error fetching leave history:", error);
    }
  };

  const fetchRegularisationHistory = async () => {
    if (!user?.token) return;

    try {
      const response = await api.get("/get-my-regularization", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setRegularisationHistory(response.data || []);
    } catch (error) {
      console.error("Error fetching regularisation history:", error);
    }
  };

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
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const formatTime = (timeString: string | null): string => {
    if (!timeString) return "Not recorded";

    try {
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
      return timeString;
    }
  };

  const handleDateChange = (value: Value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

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
                  : ""
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

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) return;

    try {
      setLoading(true);
      setError("");

      await api.post("/request-leave", leaveForm, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      toast.success("Leave application submitted successfully!");
      setLeaveForm({ leaveType: "", leaveDate: null, description: "" });
      fetchLeaveHistory();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to submit leave application"
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
            tileDisabled={({ date, view }) => {
              if (view === 'month') {
                const day = date.getDay(); 
                return day === 0 || day === 6;
              }
              return false;
            }}
          />
        </div>

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
    
    const formattedDate = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (!day?.dayStatus && !day?.des) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No attendance record for this date</p>
        <p className="text-gray-400 text-sm mt-2">
          Employee was not logged in on this day
        </p>
      </div>
    );
  }
    
  const { dayStatus, des } = day;

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="border-b pb-4 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Attendance Details</h3>
        <p className="text-gray-600">{formattedDate}</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-gray-500" />
          <span className="font-medium">Status:</span>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(dayStatus.status)}`}
            >
              {dayStatus.status}
            </span>
          </div>
        </div>

        {dayStatus.status !== 'absent'  &&
          <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-gray-500" />
          <span className="font-medium">Sign In Time:</span>
          <span className="text-gray-700">{dayStatus.signInTime || "Not available"}</span>
        </div>}

        {des && (
          <>
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Leave Type:</span>
              <span className="text-gray-700">{des.leaveType}</span>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Reason:</span>
              <span className="text-gray-700">{des.description|| "No reason provided"}</span>
            </div>
          </>
        )}
      </div>
    </div>
    );
  };

  const renderLeaveSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Apply for Leave
        </h2>

        <form onSubmit={handleLeaveSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leave Type
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
                Leave Date
              </label>
              <input
                type="date"
                value={ leaveForm.leaveDate ? leaveForm.leaveDate.toISOString().split("T")[0] : ""}
                onChange={(e) =>
                  setLeaveForm({ ...leaveForm, leaveDate: new Date(e.target.value) })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason
            </label>
            <textarea
              value={leaveForm.description}
              onChange={(e) =>
                setLeaveForm({ ...leaveForm, description: e.target.value })
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

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Leave History</h3>
        {leaveHistory.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {leaveHistory.map(leave => (
              <div key={leave._id} className="shadow-sm border border-[#ddd] rounded-lg p-4 flex flex-col gap-2">
                <div className="flex gap-3">
                  <h2 className={` w-fit px-3 text-xs py-1 rounded-full font-semibold ${leave.leaveType === "Sick" ? "text-red-700 bg-red-100 border border-red-300" :leave.leaveType === "Casual" ? "text-blue-700 bg-blue-100 border border-blue-300" :leave.leaveType === "Maternity" ? "text-pink-700 bg-pink-100 border border-pink-300" :leave.leaveType === "Paternity" ? "text-indigo-700 bg-indigo-100 border border-indigo-300" :leave.leaveType === "Privilege" ? "text-purple-700 bg-purple-100 border border-purple-300" :leave.leaveType === "Regularization" ? "text-yellow-700 bg-yellow-100 border border-yellow-300" :leave.leaveType === "Personal" ? "text-green-700 bg-green-100 border border-green-300" :"text-gray-700 bg-gray-100 border border-gray-300"}`}>
                    {leave.leaveType}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs border font-medium ${
                      leave.status === "Approve"
                        ? "bg-green-100 text-green-800 border-green-300"
                        : leave.status === "Reject"
                        ? "bg-red-100 text-red-800 border-red-300"
                        : "bg-yellow-100 text-yellow-800  border-yellow-300"
                    }`}
                  >
                    {leave.status}
                  </span>
                </div>
                <div className="flex gap-3 items-center">
                  <FileText size={18} className="text-[#696969]" />
                  <h2>{leave.description}</h2>
                </div>
                <div className="flex gap-3 items-center">
                  <CalendarIcon size={18} className="text-[#696969]" />
                  <h2>{new Date(leave.date).toLocaleDateString()}</h2>
                </div>
              </div>
            ))}
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
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Regularisation History
        </h3>
        {regularisationHistory.length > 0 ? (
          <div className="flex flex-col gap-3">
                {regularisationHistory.map((request, index) => (
                  <div key={request._id} className="shadow-sm border border-[#ddd] rounded-lg p-4 flex flex-col gap-2">
                <div className="flex gap-3">
                  <h2 className={` w-fit px-3 text-xs py-1 rounded-full font-semibold `}>
                    {request.leaveType}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs border font-medium ${
                      request.status === "Approve"
                        ? "bg-green-100 text-green-800 border-green-300"
                        : request.status === "Reject"
                        ? "bg-red-100 text-red-800 border-red-300"
                        : "bg-yellow-100 text-yellow-800  border-yellow-300"
                    }`}
                  >
                    {request.status}
                  </span>
                </div>
                <div className="flex gap-3 items-center">
                  <FileText size={18} className="text-[#696969]" />
                  <h2>{request.description}</h2>
                </div>
                <div className="flex gap-3 items-center">
                  <CalendarIcon size={18} className="text-[#696969]" />
                  <h2>{new Date(request.date).toLocaleDateString()}</h2>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No regularisation requests found
          </p>
        )}
      </div>
    </div>
  );

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
    <div className="min-h-[100%] bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        
        {renderAlerts()}

        <div className="w-full flex justify-center">
          <div className="bg-white w-fit p-2 shadow-md mb-6  rounded-full">
            <div className="flex ">
              <button
                onClick={() => setActiveTab("calendar")}
                className={`flex items-center gap-2 px-6 py-4 rounded-full font-medium transition-colors ${
                  activeTab === "calendar"
                    ? "text-blue-600  bg-blue-50"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <CalendarIcon className="w-5 h-5" />
                Calendar
              </button>
              <button
                onClick={() => setActiveTab("leave")}
                className={`flex items-center gap-2 px-6 py-4 rounded-full font-medium transition-colors ${
                  activeTab === "leave"
                    ? "text-blue-600  bg-blue-50"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <FileText className="w-5 h-5" />
                Leave
              </button>
              <button
                onClick={() => setActiveTab("regularisation")}
                className={`flex items-center gap-2 px-6 py-4 rounded-full font-medium transition-colors ${
                  activeTab === "regularisation"
                    ? "text-blue-600  bg-blue-50"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <Clock className="w-5 h-5" />
                Regularisation
              </button>
            </div>
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