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
  X,
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
  status: "absent" | "halfday" | "late" | "present";
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
  leaveDate: Date | null;
  description: string;
}

interface DayStatus {
  _id: string;
  employeeId: string;
  date: string;
  status: "absent" | "halfday" | "late" | "present";
  signInTime?: string;
}

interface LeaveDes {
  _id: string;
  employeeId: string;
  requestTo: string;
  leaveType?: string;
  status?: string;
  description?: string;
  date: string;
}

interface DayResponse {
  dayStatus: DayStatus;
  des?: LeaveDes;
}

interface SimpleCalendarProps {
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
  attendanceData: Record<string, AttendanceRecord>;
  tileContent: (props: { date: Date; view: string }) => React.ReactElement | null;
  tileClassName: (props: { date: Date; view: string }) => string;
}

interface TileProps {
  date: Date;
  view: string;
}

interface LeaveCount {
  sickCount: number;
  PaternityCount: number;
  MaternityCount: number;
  CasualCount: number;
  PrivilegeCount: number;
  CompOffCount: number;
  CompOffHave: number;
}

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const SimpleCalendar: React.FC<SimpleCalendarProps> = ({ 
  selectedDate, 
  onDateChange, 
  attendanceData, 
  tileContent, 
  tileClassName 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const getDaysInMonth = (date: Date): (Date | null)[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction: number) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const days = getDaysInMonth(currentMonth);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4 bg-gray-50 p-2 rounded">
        <button 
          onClick={() => navigateMonth(-1)}
          className="px-3 py-1 hover:bg-gray-200 rounded font-semibold"
        >
          ‹
        </button>
        <h2 className="text-lg font-semibold">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <button 
          onClick={() => navigateMonth(1)}
          className="px-3 py-1 hover:bg-gray-200 rounded font-semibold"
        >
          ›
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2 bg-gray-50 p-2 rounded">
        {weekdays.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600 p-1">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (!day) {
            return <div key={index} className="h-12"></div>;
          }
          
          const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
          const isToday = day.toDateString() === new Date().toDateString();
          const customClassName = tileClassName ? tileClassName({ date: day, view: 'month' }) : '';
          
          return (
            <button
              key={index}
              onClick={() => onDateChange(day)}
              className={`h-12 relative border border-transparent rounded transition-all ${
                isSelected ? 'bg-blue-600 text-white' : 
                isToday ? 'bg-blue-100 text-blue-800 font-semibold' :
                'hover:bg-gray-100'
              } ${customClassName}`}
            >
              <span className="text-sm">{day.getDate()}</span>
              {tileContent && tileContent({ date: day, view: 'month' })}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const AttendancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"calendar" | "leave" | "regularisation">("calendar");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceRecord>>({});
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  const [leaveForm, setLeaveForm] = useState<LeaveApplication>({
    leaveType: "",
    leaveDate: null,
    description: "",
  });
  const [leaveHistory, setLeaveHistory] = useState<LeaveDes[]>([]);
  const [regularisationHistory, setRegularisationHistory] = useState<LeaveDes[]>([]);

  const user = useSelector((state: RootState) => state.user.user);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [day, setDay] = useState<DayResponse | null>(null);

  const [leaveCount, setLeaveCount] = useState<LeaveCount | null>(null) 
  
  const leaveTypes = [
    "Casual", "Sick", "Maternity", "Paternity", "Privilege", "Regularization", "CompOff"
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
      } catch (error) {
        console.error("Error fetching attendance:", error);
        setError("Failed to load attendance data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [user?.token]);


  useEffect(() => {
    const fetchTotalLeaveCount = async () => {
      try {
        const res = await api.get('/get-my-leave-count', {
          headers: {
            Authorization: `Bearer ${user?.token}`
          }
        })
        setLeaveCount(res.data)
      } catch (err) {
        console.error('Error in fetching leave count:', error);
      }
    }
    fetchTotalLeaveCount()
  }, [user?.token])

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
        
        const date = data?.date || selectedDate;
        const response = await api.get(`/singleday-status`, {
          params: { date },
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setDay(response.data);
      } catch (err) {
        console.log(err);
        setDay(null);
      }
    };

    fetchData();
  }, [selectedDate, attendanceData, user?.token]);

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

  const getStatusColor = (status: string): string => {
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

  const formatTime = (timeString: string | undefined): string => {
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

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const tileContent = ({ date, view }: TileProps): React.ReactElement | null => {
    if (view === "month") {
      const dateKey = formatDateKey(date);
      const attendanceRecord = attendanceData[dateKey];

      if (attendanceRecord) {
        return (
          <div className="flex flex-col items-center mt-1 absolute bottom-1 left-1/2 transform -translate-x-1/2">
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

  const tileClassName = ({ date, view }: TileProps): string => {
    if (view === "month") {
      const dateKey = formatDateKey(date);
      const attendanceRecord = attendanceData[dateKey];
    }
    return "";
  };

  const handleLeaveSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.token) return;

    if (!leaveForm.leaveType || !leaveForm.leaveDate || !leaveForm.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const requestBody = {
        leaveDate: leaveForm.leaveDate.toISOString().split('T')[0],
        leaveType: leaveForm.leaveType,
        description: leaveForm.description.trim()
      };

      console.log("Submitting leave request:", requestBody);

      const response = await api.post("/request-leave", requestBody, {
        headers: { 
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
      });

      toast.success(response.data?.message || "Leave application submitted successfully!");
      setLeaveForm({ leaveType: "", leaveDate: null, description: "" });
      setIsLeaveModalOpen(false);
      fetchLeaveHistory();
    } catch (error: any) {
      console.error("Leave submission error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to submit leave application";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderCalendar = () => {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Attendance Calendar</h2>
        </div>

        <SimpleCalendar
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          attendanceData={attendanceData}
          tileContent={tileContent}
          tileClassName={tileClassName}
        />

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
          </div>
        </div>
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
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No attendance record for this date</p>
          <p className="text-gray-400 text-sm mt-2">Employee was not logged in on this day</p>
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
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(dayStatus.status)}`}>
                {dayStatus.status === "present" ? "Present" : dayStatus.status}
              </span>
            </div>
          </div>

          {dayStatus.status !== 'absent' && (
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Sign In Time:</span>
              <span className="text-gray-700">{formatTime(dayStatus.signInTime)}</span>
            </div>
          )}

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
                <span className="text-gray-700">{des.description || "No reason provided"}</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderLeaveSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between">
         <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
          <div className="w-40 flex flex-col items-center border py-2 border-[#ddd] bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className={`text-4xl font-bold mb-2 ${leaveCount?.sickCount == 8 ? 'text-red-500' : 'text-green-500'}`}>
              {leaveCount?.sickCount}/<span className="text-[#696969]">8</span>
            </div>
            <span className="text-[#696969] font-semibold text-sm text-center">Total Sick <br/> Leave</span>
          </div>
          
          <div className="w-40 flex flex-col items-center border py-2 border-[#ddd] bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className={`text-4xl font-bold mb-2 ${leaveCount?.PaternityCount == 12 ? 'text-red-500' : 'text-green-500'}`}>
              {leaveCount?.PaternityCount}/<span className="text-[#696969]">12</span>
            </div>
            <span className="text-[#696969] font-semibold text-sm text-center">Total Paternity <br/> Leave</span>
          </div>
          
          <div className="w-40 flex flex-col items-center border py-2 border-[#ddd] bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className={`text-4xl font-bold mb-2 ${leaveCount?.MaternityCount == 90 ? 'text-red-500' : 'text-green-500'}`}>
              {leaveCount?.MaternityCount}/<span className="text-[#696969]">90</span>
            </div>
            <span className="text-[#696969] font-semibold text-sm text-center">Total Maternity <br/> Leave</span>
          </div>
          
          <div className="w-40 flex flex-col items-center border py-2 border-[#ddd] bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className={`text-4xl font-bold mb-2 ${leaveCount?.CasualCount == 6 ? 'text-red-500' : 'text-green-500'}`}>
              {leaveCount?.CasualCount}/<span className="text-[#696969]">6</span>
            </div>
            <span className="text-[#696969] font-semibold text-sm text-center">Total Casual <br/> Leave</span>
          </div>
          
          <div className="w-40 flex flex-col items-center border py-2 border-[#ddd] bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className={`text-4xl font-bold mb-2 ${leaveCount?.PrivilegeCount == 15 ? 'text-red-500' : 'text-green-500'}`}>
              {leaveCount?.PrivilegeCount}/<span className="text-[#696969]">15</span>
            </div>
            <span className="text-[#696969] font-semibold text-sm text-center">Total Privilege <br/> Leave</span>
          </div>
          
          <div className="w-40 flex flex-col items-center border py-2 border-[#ddd] bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className={`text-4xl font-bold mb-2 ${leaveCount?.CompOffCount == leaveCount?.CompOffHave ? 'text-red-500' : 'text-green-500'}`}>
              {leaveCount?.CompOffCount}/<span className="text-[#696969]">{leaveCount?.CompOffHave}</span>
            </div>
            <span className="text-[#696969] font-semibold text-sm text-center">Total CompOff <br/> Leave</span>
          </div>
        </div>
        <button
          onClick={() => setIsLeaveModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FileText className="w-5 h-5" />
          Apply for Leave
        </button>
      </div>

      {isLeaveModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">

            <button
              onClick={() => setIsLeaveModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-6">Apply for Leave</h2>

            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                  <select
                    value={leaveForm.leaveType}
                    onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Leave Type</option>
                    {leaveTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Leave Date</label>
                  <input
                    type="date"
                    value={leaveForm.leaveDate ? leaveForm.leaveDate.toISOString().split("T")[0] : ""}
                    onChange={(e) => setLeaveForm({ ...leaveForm, leaveDate: new Date(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <textarea
                  value={leaveForm.description}
                  onChange={(e) => setLeaveForm({ ...leaveForm, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Enter reason for leave..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    'Submitting...'
                  ) : (
                    "Submit Leave Application"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Leave History</h3>
        {leaveHistory.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {leaveHistory.map(leave => (
              <div key={leave._id} className="shadow-sm border border-gray-300 rounded-lg p-4 flex flex-col gap-2">
                <div className="flex gap-3">
                  <h2 className={`w-fit px-3 text-xs py-1 rounded-full font-semibold ${
                    leave.leaveType === "Sick" ? "text-red-700 bg-red-100 border border-red-300" :
                    leave.leaveType === "Casual" ? "text-blue-700 bg-blue-100 border border-blue-300" :
                    leave.leaveType === "Maternity" ? "text-pink-700 bg-pink-100 border border-pink-300" :
                    leave.leaveType === "Paternity" ? "text-indigo-700 bg-indigo-100 border border-indigo-300" :
                    leave.leaveType === "Privilege" ? "text-purple-700 bg-purple-100 border border-purple-300" :
                    leave.leaveType === "Regularization" ? "text-yellow-700 bg-yellow-100 border border-yellow-300" :
                    "text-gray-700 bg-gray-100 border border-gray-300"
                  }`}>
                    {leave.leaveType}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-xs border font-medium ${
                    leave.status === "Approve"
                      ? "bg-green-100 text-green-800 border-green-300"
                      : leave.status === "Reject"
                      ? "bg-red-100 text-red-800 border-red-300"
                      : "bg-yellow-100 text-yellow-800 border-yellow-300"
                  }`}>
                    {leave.status}
                  </span>
                </div>
                <div className="flex gap-3 items-center">
                  <FileText size={18} className="text-gray-500" />
                  <h2>{leave.description}</h2>
                </div>
                <div className="flex gap-3 items-center">
                  <CalendarIcon size={18} className="text-gray-500" />
                  <h2>{new Date(leave.date).toLocaleDateString()}</h2>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No leave applications found</p>
        )}
      </div>
    </div>
  );

  const renderRegularisationSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Regularisation History</h3>
        {regularisationHistory.length > 0 ? (
          <div className="flex flex-col gap-3">
            {regularisationHistory.map((request) => (
              <div key={request._id} className="shadow-sm border border-gray-300 rounded-lg p-4 flex flex-col gap-2">
                <div className="flex gap-3">
                  <h2 className="w-fit px-3 text-xs py-1 rounded-full font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300">
                    {request.leaveType}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-xs border font-medium ${
                    request.status === "Approve"
                      ? "bg-green-100 text-green-800 border-green-300"
                      : request.status === "Reject"
                      ? "bg-red-100 text-red-800 border-red-300"
                      : "bg-yellow-100 text-yellow-800 border-yellow-300"
                  }`}>
                    {request.status}
                  </span>
                </div>
                <div className="flex gap-3 items-center">
                  <FileText size={18} className="text-gray-500" />
                  <h2>{request.description}</h2>
                </div>
                <div className="flex gap-3 items-center">
                  <CalendarIcon size={18} className="text-gray-500" />
                  <h2>{new Date(request.date).toLocaleDateString()}</h2>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No regularisation requests found</p>
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
          <button onClick={() => setError("")} className="ml-auto text-red-500 hover:text-red-700">
            <X />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>{success}</span>
          <button onClick={() => setSuccess("")} className="ml-auto text-green-500 hover:text-green-700">
            <X />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {renderAlerts()}

        <div className="w-full flex justify-center">
          <div className="bg-white w-fit p-2 shadow-md mb-6 rounded-full">
            <div className="flex">
              <button
                onClick={() => setActiveTab("calendar")}
                className={`flex items-center gap-2 px-6 py-4 rounded-full font-medium transition-colors ${
                  activeTab === "calendar"
                    ? "text-blue-600 bg-blue-50"
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
                    ? "text-blue-600 bg-blue-50"
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
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <Clock className="w-5 h-5" />
                Regularisation
              </button>
            </div>
          </div>
        </div>

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