'use client'

import api from "@/app/api/axios";
import { Download, Eye, FileText, Filter, Mail, Map, PhoneCall, User, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { useEmployeeAuthGuard } from "@/app/hooks/useEmployeeAuthGuard";

type User = {
  _id: string;
  name: string;
  profileImage: string;
  email: string;
  street: string;
  city: string;
  state: string;
  phoneNumber: string;
  role: string;
  employeeCode: string;
  createdAt: string;
  pincode: number;
  designation: string;
};

type Payslip = {
  _id: string;
  employeeName: string;
  employeeCode: string;
  designation: string;
  email: string;
  phoneNumber: string;
  salaryDate: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  basicSalary: number;
  allowance: number;
  netSalary: number;
  tax: number;
  incentive: number;
  bonus: number;
};

const Profile = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const users = useSelector((state: RootState) => state.user.user)
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>("");
  const { loading } = useEmployeeAuthGuard()
  

  useEffect(() => {
    if (!users?.id) return;

    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/${users?.id}`);
        setUser(res.data);

        const payslipRes = await api.get(`/payslips/user/${users?.id}`);
        console.log(payslipRes.data);
        setPayslips(payslipRes.data);
      } catch (err) {
        console.error("Error fetching user or payslips:", err);
      }
    };

    fetchUser();
  }, [users?.id]);

  const filteredPayslips = filterMonth
  ? payslips.filter((p) => p.salaryDate.startsWith(filterMonth))
  : payslips;

  const handleOpenInvoice = (p: Payslip) => {
    setSelectedPayslip(p);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPayslip(null);
  };

  const handleDownloadInvoice = async () => {
  if (!selectedPayslip) return;

  const element = document.getElementById("invoice");
  if (!element) return;

  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(`Invoice_${selectedPayslip._id}.pdf`);
};

  if (loading) return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
  );

  return (
    <div>
      {isModalOpen && selectedPayslip && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="w-full max-h-[95vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300 p-5">
            <div className="flex gap-5">
              <div className="text-black cursor-pointer" onClick={handleDownloadInvoice}>
                <Download />
              </div>
              <div id="invoice" className="w-full px-6 py-5 rounded-2xl shadow-sm" style={{ backgroundColor: '#ffffff' }}>
                <div className="flex justify-between items-start mb-4">
                  <div style={{ width: '200px', height: '60px', position: 'relative' }}>
                      <Image
                        src="/Logo.png"
                        alt="Company Logo"
                        fill
                        style={{ objectFit: 'contain' }} 
                      />
                    </div>
                  <div className="text-right text-sm" style={{ color: '#4B5563' }}>
                    <p>Business Street, kinfra, 600</p>
                    <p>+91 9533434334 | company@trivo.com</p>
                  </div>
                </div>

                <div className="border-b pb-2 mb-4 gap-2" style={{ borderColor: '#D1D5DB' }}>
                  <div>
                    <span style={{ color: '#374151', fontWeight: 500 }}>Invoice No.:</span>
                    <span className="ml-4" style={{ color: '#6B7280' }}>{selectedPayslip._id}</span>
                  </div>
                  <div>
                    <span style={{ color: '#374151', fontWeight: 500 }}>Pay Date:</span>
                    <span className="ml-4" style={{ color: '#6B7280' }}>
                      {new Date(selectedPayslip.salaryDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between py-1">
                    <span style={{ color: '#374151', fontWeight: 500 }}>Basic salary</span>
                    <span style={{ color: '#1F2937', fontWeight: 500 }}>₹ {selectedPayslip.basicSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span style={{ color: '#374151', fontWeight: 500 }}>Allowance</span>
                    <span style={{ color: '#1F2937', fontWeight: 500 }}>₹ {selectedPayslip.allowance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span style={{ color: '#374151', fontWeight: 500 }}>Bonus</span>
                    <span style={{ color: '#1F2937', fontWeight: 500 }}>₹ {selectedPayslip.bonus.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span style={{ color: '#374151', fontWeight: 500 }}>Incentive</span>
                    <span style={{ color: '#1F2937', fontWeight: 500 }}>₹ {selectedPayslip.incentive.toLocaleString()}</span>
                  </div>
                </div>

                <h2 style={{ color: '#DC2626', fontWeight: 700, fontSize: '1.125rem', padding: '0.5rem 0' }}>DEDUCTIONS</h2>
                <div className="border-t-2 py-3 flex justify-between" style={{ borderColor: '#FCA5A5' }}>
                  <span>Tax (10%)</span>
                  <span> -₹ {selectedPayslip.tax.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center border-t pt-3" style={{ borderColor: '#D1D5DB' }}>
                  <h3 style={{ color: '#1F2937', fontWeight: 700, fontSize: '1.25rem' }}>Grand Total</h3>
                  <span style={{ color: '#1F2937', fontWeight: 700, fontSize: '1.875rem' }}>₹ {selectedPayslip.netSalary.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <button onClick={handleCloseModal} className="text-black">
                <X />
              </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        <div className="bg-white rounded-sm shadow-sm p-8 w-full m-8">
          <div className="flex gap-5">
            <div className="w-24 h-24 rounded-full relative overflow-hidden bg-gray-200 flex-shrink-0">
              <Image src={user?.profileImage || '/avatar.png'} alt="" fill className="rounded-full object-cover" />
            </div>
            <div className="flex-1 pt-2">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{user?.name}</h1>
              <p className="text-xl text-blue-500 font-medium mb-8">
                {user?.designation && `${user.designation[0].toUpperCase()}${user.designation.slice(1)}`}
              </p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-semibold">Employee code:</span>
              <span className="text-gray-900 font-medium">{user?.employeeCode}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-semibold">Joined Date:</span>
              <span className="text-gray-900 font-medium">{user?.createdAt?.slice(0, 10)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-semibold">Last Payslips:</span>
              <span className="text-gray-900 font-medium">
                {payslips.length > 0 ? new Date(payslips[0].salaryDate).toLocaleDateString() : 'No payslips yet'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-sm shadow-sm p-8 w-full m-8 flex flex-col justify-between">
          <div className="flex gap-3 items-center font-bold">
            <User size={28} className="text-blue-500" />
            <h2 className="text-2xl">Employee Details</h2>
          </div>
          <div className="flex gap-5 bg-[#f2f2f2] p-2 items-center">
            <Mail size={16} />
            <h2>{user?.email}</h2>
          </div>
          <div className="flex gap-5 bg-[#f2f2f2] p-2 items-center">
            <PhoneCall size={16} />
            <h2>+91 {user?.phoneNumber}</h2>
          </div>
          <div className="flex gap-5 bg-[#f2f2f2] p-2 items-center">
            <Map size={16} />
            <h2>{user?.street}, {user?.city}, {user?.state}</h2>
          </div>
        </div>
      </div>

      <div className="m-8 bg-white shadow-sm rounded p-8 flex flex-col gap-3">
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold">Payslips History</h2>
          <div className="inline-flex items-center bg-gray-100 rounded-full p-1 gap-1 mb-2">
            <div className="flex items-center gap-2 px-4 py-2  text-gray-600 font-medium">
              <Filter className="w-4 h-4" />
              <span>Month:</span>
            </div>
            <div className="relative">
              <input
                type="month"
                id="month-4"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-white rounded-full px-4 py-2 border-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium text-gray-700 min-w-[160px]"
              />
            </div>
            {filterMonth && (
              <button
                onClick={() => setFilterMonth("")}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all duration-200 ml-1"
                title="Clear filter"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        {filteredPayslips.length > 0 ? (
          filteredPayslips.map((p) => (
          <div key={p._id} className="border border-[#ddd] p-4 rounded flex justify-between">
            <div className="flex gap-3 w-full">
              <FileText size={35} className="p-2 bg-blue-500 text-white rounded" />
              <div>
                <h5 className="text-xs font-semibold">Invoice No.</h5>
                <h3>{p._id}</h3>
              </div>
            </div>
            <div className="w-full flex items-center">
              {new Date(p.salaryDate).toLocaleDateString()}
            </div>
            <button onClick={() => handleOpenInvoice(p)}>
              <Eye />
            </button>
          </div>
        ))
        ) : (
          <p className="w-full text-center">No payslips available</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
