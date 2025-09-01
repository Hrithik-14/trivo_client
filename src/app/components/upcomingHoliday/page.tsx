'use client'
import api from "@/app/api/axios"
import { RootState } from "@/app/store";
import { useEffect, useState } from "react"
import { useSelector } from "react-redux";

interface Holidays {
    _id: string;
    date: Date;
    description: string;
}

const UpcomingHoliday = () => {
    const [days, setDay] = useState<Holidays[]>([])
    const user = useSelector((state: RootState) => state.user.user)

    useEffect(() => {
        const fetchHoliday = async () => {
            try {
                const res = await api.get('/get-holiday', {
                    headers: {
                        Authorization: `Bearer ${user?.token}`
                    }
                })
                setDay(res.data)
            } catch (err) {
                console.error("Failed to fetch holidays:", err)
            }
        }
        fetchHoliday()
    }, [user?.token])

    // 🔹 Filter and sort holidays first
    const upcomingHolidays = days
        .filter((day) => new Date(day.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return (
        <div className="p-4 bg-white border border-gray-200 h-full w-80 rounded">
            <h2 className="font-bold mb-4">Upcoming Holidays:</h2>
            <ul>
                {upcomingHolidays.length > 0 ? (
                    upcomingHolidays.map((day) => (
                        <li
                            key={day._id}
                            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg mb-3 hover:bg-gray-50 transition-colors"
                        >
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
                    ))
                ) : (
                    <p className="text-gray-500 text-center">No upcoming holidays</p>
                )}
            </ul>
        </div>
    )
}

export default UpcomingHoliday
