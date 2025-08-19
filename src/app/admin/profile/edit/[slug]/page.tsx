'use client'


import EditProfile from '@/app/components/userProfile/edit/[slug]/page'
import { useAdminAuthGuard } from '@/app/hooks/useAdminAuthGuard'
import { useParams } from 'next/navigation'
import React from 'react'

const Profile = () => {
    const params = useParams()
    const userId = params.slug as string
    const { loading } = useAdminAuthGuard()

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
            <EditProfile userId={userId} />
        </div>
    )
}

export default Profile