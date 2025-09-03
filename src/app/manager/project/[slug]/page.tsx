'use client'

import ProjectDetail from "@/app/components/project/ProjectDetail"
import { useManangerAuthGuard } from "@/app/hooks/usemanagerAuthGuard"
import React from "react"

type ManagerProjectDetailProps = {
    params: Promise<{ slug: string }>
}


const ManagerProjectDetail = ({ params }: ManagerProjectDetailProps) => {
    const { loading } = useManangerAuthGuard()
    const { slug } = React.use(params)

    if (loading) return  (   
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading detail...</p>
            </div>
        </div>
    )
    return (
        <div>
            <ProjectDetail slug={slug} role="manager"/>
        </div>
    )
}

export default ManagerProjectDetail