'use client'

import React, { useEffect, useState, useRef } from 'react'
import api from '@/app/api/axios'
import PerformanceChart from '@/app/components/PerformanceChart'
import WaveChart from '@/app/components/WaveChart'
import { Clock } from 'lucide-react'

interface Project {
  _id: string
  name: string
  status: string
}

interface Attendance {
  signInTime?: string
  signOutTime?: string
}

const calculateElapsedTime = (signInTime: string): string => {
  const todayDateStr = new Date().toISOString().split('T')[0]
  const signInDate = new Date(`${todayDateStr}T${signInTime}`)

  const now = new Date()
  let diffMs = now.getTime() - signInDate.getTime()
  if (diffMs < 0) diffMs = 0

  const totalSeconds = Math.floor(diffMs / 1000)
  const hrs = Math.floor(totalSeconds / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60

  return [hrs, mins, secs].map((v) => v.toString().padStart(2, '0')).join(':')
}

const MarkAttendanceButton: React.FC<{
  userId: string | null
  onAttendanceUpdated: () => void
}> = ({ userId, onAttendanceUpdated }) => {
  const [loading, setLoading] = useState(false)
  const [attendanceToday, setAttendanceToday] = useState<Attendance | null>(null)

  const fetchTodayAttendance = async () => {
    if (!userId) return
    try {
      const today = new Date().toISOString().split('T')[0]
      const res = await api.get(`/attendance/${userId}/${today}`)
      setAttendanceToday(res.data.attendance)
    } catch (error) {
      console.log('Error fetching attendance for today', error)
    }
  }

  useEffect(() => {
    fetchTodayAttendance()
  }, [userId])

  const handleMarkAttendance = async () => {
    if (!userId) {
      console.log("No userId found, can't mark attendance")
      return
    }
    setLoading(true)
    try {
      let type = 'signIn'
      if (attendanceToday?.signInTime && !attendanceToday?.signOutTime) {
        type = 'signOut'
      }
      const employeeId = userId
      console.log(`Marking attendance: ${type} for user: ${employeeId}`)
      const res = await api.post('/attendance', { employeeId, type })
      console.log('Attendance marked:', res.data)
      // Notify parent to refresh attendance data
      onAttendanceUpdated()
      await fetchTodayAttendance()
    } catch (error) {
      console.log('Error marking attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!attendanceToday?.signInTime) {
    return (
      <button
        onClick={handleMarkAttendance}
        disabled={loading}
        className="px-4 py-2 rounded bg-green-500 text-white h-full w-30"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    )
  } else if (!attendanceToday?.signOutTime) {
    return (
      <button
        onClick={handleMarkAttendance}
        disabled={loading}
        className="px-4 py-2 rounded bg-red-500 text-white h-full "
      >
        {loading ? 'SigningOut...' : 'SignOut'}
      </button>
    )
  } else {
    return null;
  }
}

const ManagerDashboard = () => {
  const [ongoing, setOngoing] = useState<Project[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [attendance, setAttendance] = useState<Attendance | null>(null)
  const [timer, setTimer] = useState('00:00:00')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const parsed = storedUser ? JSON.parse(storedUser) : null
    setUserId(parsed?.id ?? null)
  }, [])

  const fetchTodayAttendance = async () => {
    if (!userId) return
    try {
      const today = new Date().toISOString().split('T')[0]
      const res = await api.get(`/attendance/${userId}/${today}`)
      setAttendance(res.data.attendance)
    } catch (error) {
      console.log('Error fetching attendance for today', error)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchTodayAttendance()
    }
  }, [userId])

  useEffect(() => {
    if (attendance?.signInTime && !attendance.signOutTime) {
      if (intervalRef.current) clearInterval(intervalRef.current)

      setTimer(calculateElapsedTime(attendance.signInTime))

      intervalRef.current = setInterval(() => {
        setTimer(calculateElapsedTime(attendance.signInTime!))
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setTimer('00:00:00')
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [attendance])

  useEffect(() => {
    const fetchProject = async () => {
      if (!userId) return
      try {
        const res = await api.get<Project[]>(`/managersongoing/${userId}`)
        setOngoing(res.data)
      } catch (error) {
        console.log('Error fetching projects:', error)
      }
    }
    fetchProject()
  }, [userId])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-5">
        <div className="p-4 bg-white rounded border border-[#ddd] w-full flex gap-3 items-center px-10">
          <Clock className="text-green-500" />
          <div>
            <h2 className="text-xs text-[#696969] font-semibold">Login in time</h2>
            <p>{attendance?.signInTime ?? '--:--:--'}</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded border border-[#ddd] w-full flex gap-3 items-center px-10">
          <Clock className="text-rose-500" />
          <div>
            <h2 className="text-xs text-[#696969] font-semibold">Working hours</h2>
            <p>{timer}</p>
          </div>
        </div>

        <div>
          <MarkAttendanceButton userId={userId} onAttendanceUpdated={fetchTodayAttendance} />
        </div>
      </div>

      <div className="flex gap-5">
        <div className="bg-white p-4 border border-[#ddd] rounded w-full">
          <h2 className="font-semibold text-sm mb-4">Working Hours</h2>
          {userId && <WaveChart userId={userId} />}
        </div>

        <div className="bg-white p-4 px-10 border border-[#ddd] rounded">
          <h2 className="font-semibold text-sm mb-4">Attendance</h2>
          <PerformanceChart />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">Current Project</h2>
        {ongoing.length === 0 && <p>No ongoing projects.</p>}
        {ongoing.map((m) => (
          <div key={m._id} className="bg-white p-3 border border-[#ddd] rounded">
            <p className="text-2xl font-bold text-blue-500">{m.name}</p>
            <p className="text-sm text-[#696969]">
              Project status: <span className="font-semibold">{m.status}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ManagerDashboard

