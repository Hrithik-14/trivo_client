<<<<<<< HEAD
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Check, X } from 'lucide-react';
import api from '../api/axios';

// Interfaces
interface PasswordSetupForm {
  employeeName: string;
  employeeId: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasSpecialChar: boolean;
  hasNumber: boolean;
}

// Validation
const validatePassword = (password: string): PasswordRequirements => ({
  minLength: password.length >= 8,
  hasUppercase: /[A-Z]/.test(password),
  hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  hasNumber: /\d/.test(password),
});

const PasswordSetup: React.FC = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [formData, setFormData] = useState<PasswordSetupForm>({
    employeeName: 'Sijo Jhon',
    employeeId: 'TRIVO788-0011',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirements>({
    minLength: false,
    hasUppercase: false,
    hasSpecialChar: false,
    hasNumber: false,
  });

  const [errors, setErrors] = useState<Partial<PasswordSetupForm>>({});
  const [apiMessage, setApiMessage] = useState('');
  const [apiError, setApiError] = useState('');

  const handleInputChange = (field: keyof PasswordSetupForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'newPassword') {
      setPasswordRequirements(validatePassword(value));

    }
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PasswordSetupForm> = {};
    const { employeeName, employeeId, newPassword, confirmPassword } = formData;

    if (!employeeName.trim()) newErrors.employeeName = 'Employee name is required';
    if (!employeeId.trim()) newErrors.employeeId = 'Employee ID is required';

    const requirements = validatePassword(newPassword);
    if (!Object.values(requirements).every(Boolean)) {
      newErrors.newPassword = 'Password does not meet all requirements';
    }

    if (!newPassword) newErrors.newPassword = 'Password is required';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setApiMessage('');
  setApiError('');

  if (!token) {
    setApiError('Missing token in URL.');
    return;
  }

  if (!validateForm()) return;

  try {
    const response = await api.post(
      '/auth/set-password',
      { token, password: formData.newPassword },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const data = response.data;

    setApiMessage(data.message || 'Password set successfully!');
    setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
    router.push('/auth/login')

  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || 'Server error. Please try again later.';
    setApiError(errorMessage);
  }
};


  const isFormValid =
    Object.values(passwordRequirements).every(Boolean) &&
    formData.newPassword === formData.confirmPassword &&
    formData.newPassword !== '';

  return (
    <Suspense fallback={<div className="text-center p-8 text-gray-600">Loading...</div>}>
      <PasswordSetup />
    </Suspense>
  );
};

export default PasswordSetup;
=======
import React, { Suspense } from 'react';
import PasswordSetup from '@/app/components/PasswordSetup';

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center p-8 text-gray-600">Loading...</div>}>
      <PasswordSetup />
    </Suspense>
  );
}
>>>>>>> 645c818e21aca5174c3d0d721732f22a5bf44729
