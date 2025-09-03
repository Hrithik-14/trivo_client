'use client'

import React from "react"
import ProjectDetail from "@/app/components/project/ProjectDetail"
import { useEmployeeAuthGuard } from "@/app/hooks/useEmployeeAuthGuard"

type EmployeeProjectDetailProps = {
  params: Promise<{ slug: string }>
}

const EmployeeProjectDetail = ({ params }: EmployeeProjectDetailProps) => {
  const { loading } = useEmployeeAuthGuard()
  const { slug } = React.use(params)

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    )
  }

  return <ProjectDetail slug={slug} role="employee" />
}

export default EmployeeProjectDetail
