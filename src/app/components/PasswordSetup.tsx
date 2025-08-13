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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Password Setup</h1>
          <p className="text-gray-600 text-sm">Create a secure password for your account</p>
        </div>

        {/* Feedback Messages */}
        {apiMessage && <p className="text-green-600 text-sm mb-4 text-center">{apiMessage}</p>}
        {apiError && <p className="text-red-600 text-sm mb-4 text-center">{apiError}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
 
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">Create Password</label>
            <input
              type="password"
              id="newPassword"
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Create password"
            />
            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Password Requirements */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Password Requirements:</h3>
            {[
              { label: 'At least 8 characters long', valid: passwordRequirements.minLength },
              { label: 'Contains uppercase letter', valid: passwordRequirements.hasUppercase },
              { label: 'Contains special character', valid: passwordRequirements.hasSpecialChar },
              { label: 'Contains number', valid: passwordRequirements.hasNumber }
            ].map((item, i) => (
              <div className="flex items-center space-x-2" key={i}>
                {item.valid ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-gray-400" />}
                <span className={`text-xs ${item.valid ? 'text-green-600' : 'text-gray-500'}`}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
              isFormValid
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Set Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordSetup;
