/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "../api/axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Basic validation
  if (!email) {
    setError("Email is required");
    return;
  }

  setIsLoading(true);
  setError("");

  try {
    const response = await api.post(
      "/auth/send-otp",
      { email },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response?.data?.message === "OTP sent successfully") {
      localStorage.setItem("forgotPasswordEmail", email); 
      setIsSubmitted(true);
      router.push("/otpverify");
    } else {
      setError("Something went wrong. Please try again.");
    }

  } catch (err: any ) {
    console.error("Error sending OTP:", err);
    setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
  } finally {
    setIsLoading(false);
  }
};



  const handleBackToLogin = () => {
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/10 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-purple-400/10 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-1000"></div>
      </div>

      {/* Main card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 transition-all duration-500 hover:bg-white/15">
          {!isSubmitted ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold ">
                  Forgot Password?
                </h1>
                <p className=" text-lg">{`No worries, we'll send you reset instructions.`}</p>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium "
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-[#ddd] rounded-xl  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                      placeholder="Enter your email"
                      required
                    />
                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full bg-blue-500 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Sent OTP</span>
                  )}
                </button>
              </form>

              {/* Back to login */}
              <div className="text-center">
                <button
                  onClick={handleBackToLogin}
                  className="inline-flex items-center space-x-2 transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to login</span>
                </button>
              </div>
            </div>
          ) : (
            /* Success state */
            <div className="text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-bold">
                  Check your email
                </h1>
                <p className="text-white/70 text-lg">
                  We sent a password reset OTP to
                </p>
                <p className="text-white font-medium">{email}</p>
              </div>

              <div className="space-y-4">
                <p className="text-white/60 text-sm">
                  {` Didn't receive the email? Check your spam folder or`}
                </p>

                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                  className="text-purple-300 hover:text-purple-200 font-medium transition-colors duration-200"
                >
                  try another email address
                </button>
              </div>

              <button
                onClick={handleBackToLogin}
                className="inline-flex items-center space-x-2 text-white/70 hover:text-white transition-colors duration-200 mt-6"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to login</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/50 text-sm">
            Remember your password?{" "}
            <button
              onClick={handleBackToLogin}
              className="text-purple-300 hover:text-purple-200 font-medium transition-colors duration-200"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
