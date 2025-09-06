
'use client'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import api from '@/app/api/axios'
import WaveChart from '@/app/components/WaveChart'
import { Clock } from 'lucide-react'
import EmployeeAttendance from '@/app/components/EmployeeAttendence'
import { useEmployeeAuthGuard } from '@/app/hooks/useEmployeeAuthGuard'
import { useSelector } from 'react-redux'
import { RootState } from '@/app/store'
import UpcomingHoliday from '@/app/components/upcomingHoliday/page'

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
  const now = new Date()

  const [h, m, s] = signInTime.split(':').map(Number)

  const signInDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, s)

  let diffMs = now.getTime() - signInDate.getTime()
  if (diffMs < 0) diffMs = 0

  const totalSeconds = Math.floor(diffMs / 1000)
  const hrs = Math.floor(totalSeconds / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60

  return [hrs, mins, secs].map((v) => v.toString().padStart(2, '0')).join(':')
}


const calculateWorkedTime = (signInTime: string, signOutTime: string): string => {
  const now = new Date()

  const [h1, m1, s1] = signInTime.split(':').map(Number)
  const [h2, m2, s2] = signOutTime.split(':').map(Number)

  const signInDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h1, m1, s1)
  const signOutDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h2, m2, s2)

  let diffMs = signOutDate.getTime() - signInDate.getTime()
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

  const fetchTodayAttendance = useCallback(async () => {
    if (!userId) return
    try {
      const today = new Date().toISOString().split('T')[0]
      const res = await api.get(`/attendance/${userId}/${today}`)
      setAttendanceToday(res.data.attendance)
    } catch (error) {
      console.log('Error fetching attendance for today', error)
    }
  }, [userId])

  useEffect(() => {
    fetchTodayAttendance()
  }, [userId, fetchTodayAttendance])

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
      await api.post('/attendance', { employeeId, type })
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
        className="px-4 py-2 rounded bg-green-500 text-white  w-70"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    )
  } else if (!attendanceToday?.signOutTime) {
    return (
      <button
        onClick={handleMarkAttendance}
        disabled={loading}
        className="px-4 py-2 rounded bg-red-500 text-white  w-70"
      >
        {loading ? 'SigningOut...' : 'SignOut'}
      </button>
    )
  } else {
    return null;
  }
}

const EmployeeDashboard = () => {
  const [ongoing, setOngoing] = useState<Project[]>([])
  const [attendance, setAttendance] = useState<Attendance | null>(null)
  const [timer, setTimer] = useState('00:00:00')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { loading } = useEmployeeAuthGuard()
  const user = useSelector((state: RootState) => state.user.user)



  const fetchTodayAttendance = useCallback(async () => {
    if (!user?.id) return
    try {
      const today = new Date().toISOString().split('T')[0]
      const res = await api.get(`/attendance/${user?.id}/${today}`)
      setAttendance(res.data.attendance)
    } catch (error) {
      console.log('Error fetching attendance for today', error)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) {
      fetchTodayAttendance()
    }
  }, [user?.id, fetchTodayAttendance])

useEffect(() => {
  if (attendance?.signInTime && !attendance.signOutTime) {
    if (intervalRef.current) clearInterval(intervalRef.current)

    setTimer(calculateElapsedTime(attendance.signInTime))

    intervalRef.current = setInterval(() => {
      setTimer(calculateElapsedTime(attendance.signInTime!))
    }, 1000)
  } else if (attendance?.signInTime && attendance?.signOutTime) {
    if (intervalRef.current) clearInterval(intervalRef.current)

    setTimer(calculateWorkedTime(attendance.signInTime, attendance.signOutTime))
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
      if (!user?.id) return
      try {
        const res = await api.get<Project[]>(`/member/${user?.id}`)
        setOngoing(res.data)
      } catch (error) {
        console.log('Error fetching projects:', error)
      }
    }
    fetchProject()
  }, [user?.id])

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading project details...</p>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-5 justify-between">
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
            <MarkAttendanceButton userId={user?.id || null} onAttendanceUpdated={fetchTodayAttendance} />
      </div>

      <div className="flex gap-5 h-100 overflow-hidden">
        <div className="bg-white p-4 border border-[#ddd] rounded w-full flex flex-col justify-center">
          <h2 className="font-semibold text-sm mb-10">Working Hours</h2>
          {user?.id && <WaveChart userId={user?.id} />}
        </div>

        <div className="bg-white p-4 px-10 border border-[#ddd] rounded">
          <h2 className="font-semibold text-sm mb-4">Attendance</h2>
          {user?.id && <EmployeeAttendance employeeId={user?.id} />}
        </div>
      </div>

      <div className='flex gap-3 max-h-80 '>
        <div className="flex flex-col gap-3 w-full bg-white p-4 border border-[#ddd] rounded overflow-y-auto scrollbar-thin">
          <h2 className="font-semibold">Current Project</h2>
          {ongoing.length === 0 && <p>No ongoing projects.</p>}
          {ongoing.map((m) => (
            <div key={m._id} className="bg-white p-3 border border-[#ddd] rounded ">
              <p className="text-2xl font-bold text-blue-500">{m.name}</p>
              <p className="text-sm text-[#696969]">
                Project status: <span className="font-semibold">{m.status}</span>
              </p>
            </div>
          ))}
        </div>
        <div className='overflow-y-auto min-w-80 scrollbar-thin'>
          <UpcomingHoliday />
        </div>
      </div>
    </div>
  )
}

export default EmployeeDashboard
