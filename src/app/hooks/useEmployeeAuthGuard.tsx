'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/app/store'

export const useEmployeeAuthGuard = () => {
    const router = useRouter()
    const user = useSelector((state: RootState) => state.user.user)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user === undefined || user === null) return
        if (!user) {
        router.replace('/auth/login')
        } else if (user.role !== 'employee') {
        router.replace('/')
        } else {
        setLoading(false)
        }
    }, [user, router])

    return { loading }
}