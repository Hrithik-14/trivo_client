/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState, useEffect, FC } from "react";
import {
  Users,
  UserCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Eye,
  Download,
  Filter,
} from "lucide-react";
import PerformanceChart from "@/app/components/PerformanceChart";
import { useAdminAuthGuard } from "@/app/hooks/useAdminAuthGuard";
import api from "@/app/api/axios";
import dayjs from "dayjs";
import moment from "moment";
import MyCalendar from "../calendar/page";

interface Attendence {
  lateCount: number;
  leaveCount: number;
  message: string;
  presentCount: number;
}

interface Admin {
  _id: string;
  name:string
  employeeCode:string
}

type Project = {
  total: number;
  completed:number
}
interface ManagerReport {
  _id: string;
  reportId: string;
  date: string;
  managerName: string;
  managerId: string;
  status: "completed" | "pending" | "in_progress" | "overdue";
  title: string;
  description?: string;
  submittedAt?: string;
  dueDate?: string;
  submittedBy: Admin;
}

const Dashboard: FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { loading } = useAdminAuthGuard();
  const [users, setUsers] = useState([]);
  const [attendenceCount, setAttendenceCount] = useState<Attendence | undefined>();
  const [now, setNow] = useState(moment().format("hh:mm A"));
  const [managerReports, setManagerReports] = useState<ManagerReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const reportsPerPage = 5;
  const [totalProjects, setTotalProjects] = useState<Project | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(moment().format("hh:mm A"));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/admin/getAllProject");
        console.log(response.data.stats);
        setTotalProjects(response.data.stats)
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/getTotalEmployee");
        setUsers(res.data.allEmployees);
      } catch (err) {
        console.log(err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/statusAttendence");
        console.log(res.data);
        setAttendenceCount(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetch();
  }, []);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  useEffect(() => {
    const fetchManagerReports = async () => {
      setReportsLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: reportsPerPage,
          status: statusFilter !== "all" ? statusFilter : undefined,
        };

        const res = await api.get("/admin/getAllManagerReports", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(res.data);
        setManagerReports(res.data.reports || []);
        setTotalReports(res.data.total || 0);
      } catch (err) {
        console.error("Error fetching manager reports:", err);
        setManagerReports([]);
        setTotalReports(0);
      } finally {
        setReportsLoading(false);
      }
    };

    fetchManagerReports();
  }, [currentPage, statusFilter]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const getDaysInMonth = (date: Date): (number | null)[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-[#DCFCE7] text-[#4ADE80] border-[#4ADE80]";
      case "pending":
        return "bg-[#FEFCE8] text-[#EAB308] border-[#FDE047]";
      case "in_progress":
        return "bg-[#DBEAFE] text-[#3B82F6] border-[#3B82F6]";
      case "overdue":
        return "bg-[#FEE2E2] text-[#EF4444] border-[#EF4444]";
      default:
        return "bg-[#F3F4F6] text-[#6B7280] border-[#6B7280]";
    }
  };

  const formatDate = (dateString: string) => {
    return moment(dateString).format("DD-MM-YYYY");
  };

  const totalPages = Math.ceil(totalReports / reportsPerPage);

  const days = getDaysInMonth(currentDate);
  const today = new Date();
  const isCurrentMonth =
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear();
  const todayDate = today.getDate();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );

  return (
    <div className="flex gap-5 text-black">
      <div className="flex flex-col gap-5 w-full">
        <div className="grid grid-cols-3 gap-5 w-full">
          <div className="border border-[#dddddd] bg-white rounded h-fit py-2 px-4">
            <h5 className="font-bold text-[10px]">Total Employees</h5>
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">{users}</h2>
              <div className="p-2 bg-[#DBEAFE] text-[#3B82F6] w-fit rounded-full">
                <Users size={15} />
              </div>
            </div>
          </div>
          <div className="border border-[#dddddd] bg-white rounded h-fit py-2 px-4">
            <h5 className="font-bold text-[10px]">Today&apos;s Present</h5>
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">
                {attendenceCount?.presentCount || 0}
              </h2>
              <div className="p-2 bg-[#DCFCE7] text-[#22C55E] w-fit rounded-full">
                <UserCheck size={15} />
              </div>
            </div>
          </div>
          <div className="border border-[#dddddd] bg-white rounded h-fit py-2 px-4">
            <h5 className="font-bold text-[10px]">Today&apos;s Late</h5>
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">{attendenceCount?.lateCount}</h2>
              <div className="p-2 bg-[#FEF9C3] text-[#EAB308] w-fit rounded-full">
                <Clock size={15} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-5">
          <div className="bg-white p-3 px-8 border border-[#ddd] rounded-md w-fit gap-2 flex flex-col">
            <h3 className="font-semibold">Performance</h3>
            <PerformanceChart />
          </div>
          <div className="flex flex-col gap-5 w-full">
            <div className="border border-[#dddddd] bg-white rounded h-fit flex flex-col justify-center py-2 lg:py-6 px-4 lg:px-6">
              <h5 className="font-bold text-[10px]">Today&apos;s Leave</h5>
              <div className="flex justify-between items-center">
                <h2 className="font-semibold">{attendenceCount?.leaveCount}</h2>
                <div className="p-2 bg-[#FEE2E2] text-[#EF4444] w-fit rounded-full">
                  <Calendar size={15} />
                </div>
              </div>
            </div>
            <div className="bg-white border border-[#ddd] h-52 lg:h-full rounded-md p-5 gap-5 flex flex-col justify-center">
              <h2 className="text-xl lg:text-3xl font-bold">Projects</h2>
              <div className="flex gap-5 items-center">
                <div className="text-lg lg:text-2xl bg-[#FEFCE8] w-13 text-center p-2 px-3 text-[#EAB308] border border-[#FDE047]">
                  {totalProjects?.total}
                </div>
                <div className="font-medium lg:text-lg">Total Projects</div>
              </div>
              <div className="flex gap-5 items-center">
                <div className="text-lg lg:text-2xl bg-[#DCFCE7] w-13 text-center p-2 px-3 text-[#22C55E] border border-[#86EFAC]">
                  {totalProjects?.completed}
                </div>
                <div className="font-medium lg:text-lg">Completed Projects</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 border border-[#dddddd] rounded-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[#3B82F6]">
              Managers Reports
            </h2>
          </div>

          {reportsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#ddd]">
                      <th className="p-3 text-left">#</th>
                      <th className="p-3 text-left">ID</th>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Manager</th>
                      <th className="p-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {managerReports.length > 0 ? (
                      managerReports.map((report, index) => (
                        <tr
                          key={report._id}
                          className="border-t border-[#ddd] hover:bg-gray-50"
                        >
                          <td className="p-3">
                            {(currentPage - 1) * reportsPerPage + index + 1}
                          </td>
                          <td className="p-3 font-mono text-sm">
                            {report.submittedBy?.employeeCode}
                          </td>
                          <td className="p-3">{formatDate(report.date)}</td>
                          <td className="p-3">
                            <div>
                              <div className="font-medium">
                                {report.submittedBy?.name}
                              </div>
                              
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className={`${getStatusColor(
                                report.status
                              )} border w-fit text-xs px-3 py-1 rounded-full capitalize`}
                            >
                              {report.status.replace("_", " ")}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-8 text-center text-gray-500"
                        >
                          No manager reports found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#ddd]">
                  <div className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * reportsPerPage + 1} to{" "}
                    {Math.min(currentPage * reportsPerPage, totalReports)} of{" "}
                    {totalReports} reports
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-[#ddd] rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}  
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 border rounded ${
                            currentPage === page
                              ? "bg-[#3B82F6] text-white border-[#3B82F6]"
                              : "border-[#ddd] hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-[#ddd] rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <MyCalendar />

    </div>
  );
};

export default Dashboard;
