
'use client'


import api from "@/app/api/axios";
import { Download, Eye, FileText, Mail, Map, PhoneCall, User } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";




interface InvoiceData {
  invoiceNo: string;
  payDate: string;
  basicSalary: number;
  allowance: number;
}

const InvoiceComponent: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  

  return (
    <div className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className=" w-full  max-h-[95vh] overflow-hidden  animate-in slide-in-from-bottom-4 duration-300 p-5">
        <div className="flex gap-5">
          <div className="text-black">
            <Download/>
          </div>
          <div className="w-full px-6 py-5 rounded-2xl shadow-sm bg-gradient-to-br from-white via-gray-50 to-white">
            <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 tracking-wide">
                TRIVO
              </h1>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>Business Street, kinfra, 600</p>
              <p>+91 9533434334 | company@trivo.com</p>
            </div>
            
          </div>

          {/* Invoice Details */}
          <div className="mb-12">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="mb-4">
                  <span className="text-gray-700 font-medium">Invoice No.:</span>
                  <span className="ml-4 text-gray-600">333</span>
                </div>
                <div>
                  <span className="text-gray-700 font-medium">Pay Date:</span>
                  <span className="ml-4 text-gray-600">322</span>
                </div>
              </div>
            </div>
          </div>

          {/* Salary Details */}
          <div className="mb-16">
            <div className="space-y-6">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-700 font-medium">Basic salary</span>
                <span className="text-gray-800 font-medium">₹233</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-700 font-medium">Allowance</span>
                <span className="text-gray-800 font-medium">₹22</span>
              </div>
            </div>
          </div>

          {/* Grand Total */}
          <div className="border-t-2 border-gray-200 pt-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Grand Total</h3>
                <p className="text-sm text-gray-500 mt-1">Amount to be credited to your account</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-gray-800">₹33</span>
              </div>
            </div>
          </div>
          </div>
          <div>
            <button onClick={onClose} className="text-black">
              X
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};







type User = {
    _id: string,
    name: string,
    profileImage: string,
    email: string,
    street: string,
    city: string,
    state: string,
    phoneNumber: string,
    role: string,
    employeeCode: string,
    createdAt: string,
    pincode: number,
    designation: string,
}

const Profile = () => {

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [userId, setUserId] = useState(null)


  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const parsed = storedUser ? JSON.parse(storedUser) : null
    setUserId(parsed?.id ?? null)
  }, [])


    useEffect(() => {
      if (!userId) return; 
        const fetchUser = async () => {
            try {
                const res  = await api.get(`/users/${userId}`)
                setUser(res.data)
            } catch (err) {
                console.error("Error fetching user:", err)
            }
        }
        fetchUser()
    }, [userId])

    const handleAdd = () => setIsModalOpen(true)
    const handleCloseModal = () => { setIsModalOpen(false) }

  return (
    <div>
      {isModalOpen && <InvoiceComponent onClose={handleCloseModal} />}
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
              <span className="text-gray-900 font-medium">{user?.createdAt && user?.createdAt?.slice(0,10)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-semibold">Last Payslips:</span>
              <span className="text-gray-900 font-medium">June 31, 2025</span>
            </div>
          </div>
        </div>
        

        <div className="bg-white rounded-sm shadow-sm p-8 w-full m-8 flex flex-col justify-between">
          <div className="flex gap-3 items-center  font-bold">
            <User size={28} className="font-bold text-blue-500" />
            <h2 className="text-2xl">Employee Details</h2>
          </div>
          <div className="flex gap-5 bg-[#f2f2f2] p-2 items-center">
            <Mail size={16}/>
            <h2>{user?.email}</h2>
          </div>
          <div className="flex gap-5 bg-[#f2f2f2] p-2 items-center">
            <PhoneCall size={16}/>
            <h2>+91 {user?.phoneNumber}</h2>
          </div>
          <div className="flex gap-5 bg-[#f2f2f2] p-2 items-center">
            <Map size={16}/>
            <h2>{user?.street}, {user?.city}, {user?.state}</h2>
          </div>
        </div>
      </div>

      <div className="m-8 bg-white shadow-sm rounded p-8 flex flex-col gap-3">
        <h2 className="text-2xl font-bold">Payslips History</h2>
        <div className="border border-[#ddd] p-4 rounded flex">
          <div className="flex gap-3 w-full">
            <FileText size={35} className="p-2 bg-blue-500 text-white rounded" />
            <div>
              <h5 className="text-xs font-semibold">Invoice No.</h5>
              <h3>22</h3>
            </div>
          </div>
          <div className="w-full flex items-center">
            31  June 2025
          </div>
          <button onClick={handleAdd}>
            <Eye/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
