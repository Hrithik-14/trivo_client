"use client";
import api from "@/app/api/axios";
import { useState, useRef, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface Holidays {
  _id: string;
  date: Date;
  description: string;
}
interface Holiday {
  date: Date;
  description: string;
}

interface HolidayForm {
  description: string;
}

export default function MyCalendar() {
  const [date, setDate] = useState<Value>(new Date());
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<{ message: string; type: "holiday" | "none" | null }>({ message: "", type: null,});
  const selectedDateRef = useRef<Date | null>(null);
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);
  const user = useSelector((state: RootState) => state.user.user)
  const [days, setDay] = useState<Holidays[]>([])

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<HolidayForm>();


  useEffect(() => {
    const fetchHoliday = async() => {
      const res = await api.get('/get-holiday', {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      })
      setDay(res.data)
    }
    fetchHoliday()
  }, [user?.token, holidays])

  const handleClickDay = (value: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    
    const found = days.find(
      (d) => new Date(d.date).toDateString() === value.toDateString()
    );

    if (found) {
      setSelectedStatus({message:`Status: ${found.description}`, type: 'holiday'});
    } else {
      setSelectedStatus({message: "No status", type: 'none'});
    }
    
    
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
      if (value < today) {
        toast.error("You cannot mark past dates as holiday");
        return;
      }
      selectedDateRef.current = value;
      setOpen(true);
    } else {
      clickTimeout.current = setTimeout(() => {
        setDate(value);
        clickTimeout.current = null;
      }, 250);
    }
  };

  const onSubmit = async (data: HolidayForm) => {
    if (!selectedDateRef.current) return;

    const newHoliday: Holiday = {
      date: selectedDateRef.current,
      description: data.description,
    };

    try {
      await api.post(
        "/mark-holiday",
        {
          holiday: newHoliday.date,
          description: newHoliday.description,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setHolidays([...holidays, newHoliday]);
      setOpen(false);
      toast.success("Holiday marked successfully");
      reset();
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const errorMessage =
      error?.response?.data?.message || "Failed to mark holiday";

    toast.error(errorMessage);
    }
  };


  return (
    <div className="p-4 rounded-lg max-h-[86.3vh] overflow-y-hidden min-w-100 border border-[#ddd] bg-white">
      <Calendar
        onClickDay={handleClickDay}
        value={date}
        prevLabel="←"
        nextLabel="→"
        prev2Label={null}
        next2Label={null}
        tileClassName={({ date }) =>
          days.some((h) => new Date(h.date).toLocaleDateString('en-US', {  weekday: 'long',  year: 'numeric', month: 'long', day: 'numeric'}) === date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}))
            ? "holiday"
            : undefined
        }
      />

      <div className="mt-4">
        {selectedStatus.type && (
          <div className={`p-3 rounded-lg border bg-gray-50 ${selectedStatus.type === 'holiday' ? 'text-green-500 text-lg' : 'text-gray-700'} font-medium`}>
            {selectedStatus.message}
          </div>
        )}
      </div>

      <div className="mt-4 h-[50%] overflow-y-scroll scrollbar-thin">
        <h2 className="font-bold mb-2 sticky top-0 bg-white">Upcoming Holidays:</h2>
        <ul>
          {days
            .filter((day) => new Date(day.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((day) => (
            <li key={day._id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg mb-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">
                    {new Date(day.date).getDate()}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{day.description}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(day.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {open && (
        <div className="fixed inset-0  backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-out scale-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Add Holiday</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedDateRef.current?.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Holiday Description
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register("description", { required: true })}
                    placeholder="Enter holiday name or description..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-0 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 px-4 py-3 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-400 disabled:to-blue-400 text-white font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    'Saving...'
                  ) : (
                    'Save Holiday'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .holiday {
          background: #f44336 !important;
          color: white !important;
          border-radius: 10px !important
        }
        .react-calendar {
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #ddd;
        }
        .react-calendar__tile {
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
