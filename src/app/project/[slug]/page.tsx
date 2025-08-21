"use client"; // only if ProjectDetail is a client component
import React from "react";
import ProjectDetail from "@/app/components/project/ProjectDetail";

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = React.use(params);

  return <ProjectDetail slug={resolvedParams.slug} />;
}
  