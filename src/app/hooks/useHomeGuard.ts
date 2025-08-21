'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/app/store'

export const useHomeGuard = () => {
    const router = useRouter()
    const user = useSelector((state: RootState) => state.user.user)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) {
        router.replace('/')
        setLoading(false)
        } else if (user.role === 'admin') {
        router.replace('/admin/dashboard')
        }else if (user.role === 'manager') {
        router.replace('/manager/dashboard')
        }else if (user.role === 'employee') {
        router.replace('/employee/dashboard')
        } else {
        setLoading(false)
        }
    }, [user, router])

    return { loading }
}
