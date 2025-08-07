/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../api/axios';

export default function VerifyOtpForm() {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false)
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem('forgotPasswordEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      await api.post('auth/verify-otp', { email, otp });
      setMessage('OTP verified successfully! Redirecting...');
      setTimeout(() => {
        router.push('/resetpass');
      }, 1500);
    } catch (err: any) {
      setError('Invalid or expired OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      setError('Email not found. Please try again.');
      return;
    }

    setResendLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post(
        '/auth/send-otp',
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response?.data?.message === 'OTP sent successfully') {
        setMessage('OTP resent successfully to your email.');
      } else {
        setError('Failed to resend OTP.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl border border-gray-100 rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-slate-800 mb-2">Verify Your Code</h1>
            <p className="text-slate-600 text-sm">
              {`We've sent a 6-digit verification code to your email`}
            </p>
            {email && (
              <p className="text-slate-500 text-xs mt-1 font-medium">{email}</p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={otp}
                required
                maxLength={6}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 text-center text-lg font-mono tracking-widest border border-gray-200 rounded-xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all duration-200 placeholder:text-slate-400"
                placeholder="000000"
              />
            </div>

            {/* Messages */}
            {message && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <p className="text-emerald-700 text-sm font-medium text-center">{message}</p>
              </div>
            )}
            
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-red-700 text-sm font-medium text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-slate-700 hover:bg-slate-800 disabled:bg-slate-300 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Verify Code'
              )}
            </button>
          </form>

          {/* Resend Section */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-center text-sm text-slate-600 mb-3">
              {`Didn't receive the code?`}
            </p>
            <button
              onClick={handleResendOTP}
              disabled={resendLoading}
              className="w-full text-slate-700 hover:text-slate-800 py-2 px-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              {resendLoading ? 'Resending...' : 'Resend Code'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-500">
            Having trouble? Contact our support team
          </p>
        </div>
      </div>
    </div>
  );
}