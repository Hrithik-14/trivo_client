'use client'

import UserProfile from '@/app/components/UserProfile'
import { useManangerAuthGuard } from '@/app/hooks/usemanagerAuthGuard'
import { useParams } from 'next/navigation'
import React from 'react'

const Profile = () => {
    const params = useParams()
    const userId = params.slug as string
    const { loading } = useManangerAuthGuard()

    if (loading) return (
        <div className="h-full flex items-center justify-center">
            <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading details...</p>
            </div>
        </div>
    );
    return (
        <div>
            <UserProfile slug={userId}  />
        </div>
    )
}

export default Profile