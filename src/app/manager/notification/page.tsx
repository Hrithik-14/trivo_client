'use client'
import React from 'react'
import Notifications from '@/app/components/notification/Notification'
import {  } from '@/app/hooks/useAdminAuthGuard'
import { useManangerAuthGuard } from '@/app/hooks/usemanagerAuthGuard'

const ManagerNotification = () => {
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
    <>
      <Notifications/>
    </>
  )
}

export default ManagerNotification