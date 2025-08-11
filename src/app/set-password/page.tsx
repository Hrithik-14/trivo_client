import React, { Suspense } from 'react';
import PasswordSetup from '@/app/components/PasswordSetup';

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center p-8 text-gray-600">Loading...</div>}>
      <PasswordSetup />
    </Suspense>
  );
}
