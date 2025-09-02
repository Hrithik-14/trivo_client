import ProjectDetail from '@/app/components/project/ProjectDetail';
import React from 'react';

type AdminProjectDetailProps = {
  params: {
    slug: string;
  };
};

const AdminProjectDetail = ({ params }: AdminProjectDetailProps) => {
  return (
    <div>
      <ProjectDetail slug={params.slug} role="admin" />
    </div>
  );
};

export default AdminProjectDetail;