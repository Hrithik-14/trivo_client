import ProjectDetail from '@/app/components/project/ProjectDetail'
import { useAdminAuthGuard } from '@/app/hooks/useAdminAuthGuard'
import React from 'react'

type AdminProjectDetailProps = {
  params: Promise<{ slug: string }>
}

const AdminProjectDetail = ({ params }: AdminProjectDetailProps) => {
  const { loading } = useAdminAuthGuard()
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

  return (
    <div>
      <ProjectDetail slug={slug} role="admin" />
    </div>
  )
}

export default AdminProjectDetail