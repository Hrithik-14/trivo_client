import React, { useState, useEffect } from "react";
import { Calendar, Clock, FileText, User, ChevronLeft, ChevronRight, LogIn, LogOut } from "lucide-react";

// TypeScript interfaces
interface AttendanceRecord {
  _id: string;
  employeeId: string;
  date: string;
  loginTime: string | null;
  logoutTime: string | null;
  status: 'Present' | 'Absent' | 'Half Day' | 'Late' | 'Leave' | 'Holiday';
  totalHours: string;
  isActive: boolean; // if employee is currently logged in
  leaveType?: string;
  leaveReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface SelectedDateInfo {
  day: number;
  dateKey: string;
  data: AttendanceRecord | null;
}

interface Employee {
  _id: string;
  name: string;
  employeeId: string;
  department: string;
  email: string;
}

const AttendancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'leave' | 'regularisation'>('calendar');
  const [selectedDate, setSelectedDate] = useState<SelectedDateInfo | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceRecord>>({});
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Simulated current employee data - replace with actual auth context
  const mockEmployee: Employee = {
    _id: "emp_123",
    name: "John Doe",
    employeeId: "EMP001",
    department: "Engineering",
    email: "john.doe@company.com"
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Mock API functions - replace with actual API calls
  const fetchAttendanceData = async (month: number, year: number): Promise<AttendanceRecord[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data based on login/logout tracking
    const mockData: AttendanceRecord[] = [
      {
        _id: "att_001",
        employeeId: "EMP001",
        date: "2025-08-01",
        loginTime: "09:15:00",
        logoutTime: "18:30:00",
        status: "Present",
        totalHours: "9h 15m",
        isActive: false,
        createdAt: "2025-08-01T09:15:00Z",
        updatedAt: "2025-08-01T18:30:00Z"
      },
      {
        _id: "att_002",
        employeeId: "EMP001",
        date: "2025-08-02",
        loginTime: "09:00:00",
        logoutTime: "18:15:00",
        status: "Present",
        totalHours: "9h 15m",
        isActive: false,
        createdAt: "2025-08-02T09:00:00Z",
        updatedAt: "2025-08-02T18:15:00Z"
      },
      {
        _id: "att_003",
        employeeId: "EMP001",
        date: "2025-08-05",
        loginTime: "10:15:00",
        logoutTime: "18:30:00",
        status: "Late",
        totalHours: "8h 15m",
        isActive: false,
        createdAt: "2025-08-05T10:15:00Z",
        updatedAt: "2025-08-05T18:30:00Z"
      },
      {
        _id: "att_004",
        employeeId: "EMP001",
        date: "2025-08-06",
        loginTime: "09:30:00",
        logoutTime: "13:30:00",
        status: "Half Day",
        totalHours: "4h 00m",
        isActive: false,
        createdAt: "2025-08-06T09:30:00Z",
        updatedAt: "2025-08-06T13:30:00Z"
      },
      {
        _id: "att_005",
        employeeId: "EMP001",
        date: "2025-08-18",
        loginTime: "09:00:00",
        logoutTime: null,
        status: "Present",
        totalHours: "In Progress",
        isActive: true,
        createdAt: "2025-08-18T09:00:00Z",
        updatedAt: "2025-08-18T09:00:00Z"
      }
    ];
    
    return mockData;
  };

  const handleLogin = async (): Promise<void> => {
    try {
      setLoading(true);
      // API call to mark login
      const response = await fetch('/api/attendance/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          employeeId: mockEmployee._id,
          loginTime: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        setIsLoggedIn(true);
        // Refresh attendance data
        await loadAttendanceData();
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      setLoading(true);
      // API call to mark logout
      const response = await fetch('/api/attendance/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          employeeId: mockEmployee._id,
          logoutTime: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        setIsLoggedIn(false);
        // Refresh attendance data
        await loadAttendanceData();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceData = async (): Promise<void> => {
    try {
      const data = await fetchAttendanceData(currentMonth.getMonth(), currentMonth.getFullYear());
      const dataMap: Record<string, AttendanceRecord> = {};
      
      data.forEach(record => {
        dataMap[record.date] = record;
      });
      
      setAttendanceData(dataMap);
      
      // Check if employee is currently logged in
      const todayKey = new Date().toISOString().split('T')[0];
      const todayRecord = dataMap[todayKey];
      setIsLoggedIn(todayRecord?.isActive || false);
      
    } catch (error) {
      console.error('Error loading attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentEmployee(mockEmployee);
    loadAttendanceData();
  }, [currentMonth]);

  const getDaysInMonth = (date: Date): (number | null)[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const formatDateKey = (year: number, month: number, day: number): string => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getStatusColor = (status: AttendanceRecord['status']): string => {
    switch (status) {
      case "Present": return "bg-green-100 text-green-800";
      case "Leave": return "bg-red-100 text-red-800";
      case "Half Day": return "bg-yellow-100 text-yellow-800";
      case "Late": return "bg-orange-100 text-orange-800";
      case "Holiday": return "bg-blue-100 text-blue-800";
      case "Absent": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (timeString: string): string => {
    if (!timeString) return 'Not recorded';
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const navigateMonth = (direction: number): void => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
    setSelectedDate(null);
  };

  const handleDateClick = (day: number): void => {
    if (!day) return;
    const dateKey = formatDateKey(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate({ day, dateKey, data: attendanceData[dateKey] || null });
  };

  const renderCalendar = () => {
    const days = getDaysInMonth(currentMonth);
    const today = new Date();
    const isCurrentMonth = currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear();

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-3 text-center font-semibold text-gray-600 text-sm">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="p-3 h-16"></div>;
            }

            const dateKey = formatDateKey(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const attendance = attendanceData[dateKey];
            const isToday = isCurrentMonth && day === today.getDate();
            const isSelected = selectedDate?.day === day;

            return (
              <div
                key={day}
                onClick={() => handleDateClick(day)}
                className={`p-2 h-16 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                } ${isToday ? "border-blue-500 border-2" : "border-gray-200"}`}
              >
                <div className="flex flex-col h-full">
                  <span className={`text-sm font-medium ${isToday ? "text-blue-600" : "text-gray-700"}`}>
                    {day}
                  </span>
                  {attendance && (
                    <div className={`text-xs px-1 py-0.5 rounded mt-1 ${getStatusColor(attendance.status)}`}>
                      {attendance.status}
                      {attendance.isActive && (
                        <div className="w-2 h-2 bg-green-500 rounded-full inline-block ml-1 animate-pulse"></div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAttendanceDetails = () => {
    if (!selectedDate) {
      return (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Select a date from the calendar to view attendance details</p>
        </div>
      );
    }

    const { day, data } = selectedDate;
    const selectedDateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const formattedDate = selectedDateObj.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="border-b pb-4 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Attendance Details</h3>
          <p className="text-gray-600">{formattedDate}</p>
        </div>

        {data ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Status:</span>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(data.status)}`}>
                  {data.status}
                </span>
                {data.isActive && (
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Currently Active
                  </span>
                )}
              </div>
            </div>

            {data.loginTime && (
              <div className="flex items-center gap-3">
                <LogIn className="w-5 h-5 text-green-500" />
                <span className="font-medium">Login Time:</span>
                <span className="text-gray-700">{formatTime(data.loginTime)}</span>
              </div>
            )}

            {data.logoutTime && (
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-red-500" />
                <span className="font-medium">Logout Time:</span>
                <span className="text-gray-700">{formatTime(data.logoutTime)}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Total Hours:</span>
              <span className="text-gray-700">{data.totalHours}</span>
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
            <p className="text-gray-400 text-sm mt-2">Employee was not logged in on this day</p>
          </div>
        )}
      </div>
    );
  };

  const renderCurrentStatus = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = attendanceData[today];

    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{currentEmployee?.name}</h3>
              <p className="text-sm text-gray-600">{currentEmployee?.employeeId} - {currentEmployee?.department}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {todayRecord && (
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {todayRecord.loginTime ? `Logged in at ${formatTime(todayRecord.loginTime)}` : 'Not logged in today'}
                </p>
                {todayRecord.isActive && (
                  <p className="text-xs text-green-600 font-medium flex items-center gap-1 justify-end">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Currently Active
                  </p>
                )}
              </div>
            )}
            
            {!loading && (
              <button
                onClick={isLoggedIn ? handleLogout : handleLogin}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isLoggedIn
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoggedIn ? (
                  <>
                    <LogOut className="w-4 h-4" />
                    Logout
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Login
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading && !currentEmployee) {
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Employee Attendance Portal</h1>
          <p className="text-gray-600">Track your login/logout times and attendance records</p>
        </div>

        {renderCurrentStatus()}

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
              <Calendar className="w-5 h-5" />
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

        {activeTab === "calendar" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {renderCalendar()}
            </div>
            <div>
              {renderAttendanceDetails()}
            </div>
          </div>
        )}

        {activeTab === "leave" && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Leave Management</h2>
            <p className="text-gray-600">Apply for leaves and manage your leave balance.</p>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium mb-2">API Endpoints to implement:</p>
              <ul className="text-blue-700 space-y-1 text-sm">
                <li>• POST /api/leave/apply - Apply for new leave</li>
                <li>• GET /api/leave/history - View leave history</li>
                <li>• GET /api/leave/balance - Check leave balance</li>
                <li>• DELETE /api/leave/:id - Cancel pending requests</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "regularisation" && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Attendance Regularisation</h2>
            <p className="text-gray-600">Request corrections for missed login/logout entries.</p>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium mb-2">API Endpoints to implement:</p>
              <ul className="text-blue-700 space-y-1 text-sm">
                <li>• POST /api/attendance/regularise - Request attendance correction</li>
                <li>• GET /api/attendance/regularisation-requests - View pending requests</li>
                <li>• GET /api/attendance/regularisation-history - Check history</li>
                <li>• POST /api/attendance/upload-document - Upload supporting documents</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;