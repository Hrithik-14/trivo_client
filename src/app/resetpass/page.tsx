"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Check, X, Eye, EyeOff } from "lucide-react";
import api from "../api/axios";
import { useForm } from "react-hook-form";

// Interfaces
interface PasswordSetupForm {
  employeeName: string;
  employeeId: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasSpecialChar: boolean;
  hasNumber: boolean;
}

const validatePassword = (password: string): PasswordRequirements => ({
  minLength: password.length >= 8,
  hasUppercase: /[A-Z]/.test(password),
  hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  hasNumber: /\d/.test(password),
});

const PasswordSetup: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [apiMessage, setApiMessage] = useState("");
  const [apiError, setApiError] = useState("");
  const [passwordRequirements, setPasswordRequirements] =
    useState<PasswordRequirements>({
      minLength: false,
      hasUppercase: false,
      hasSpecialChar: false,
      hasNumber: false,
    });

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isValid },
    reset,
  } = useForm<PasswordSetupForm>({
    mode: "onChange",
  });

  const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const newPassword = watch("newPassword");
  const confirmPassword = watch("confirmPassword");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("forgotPasswordEmail");
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }
  }, []);

  useEffect(() => {
    setPasswordRequirements(validatePassword(newPassword || ""));
    if (confirmPassword && newPassword !== confirmPassword) {
      setError("confirmPassword", {
        type: "validate",
        message: "Passwords do not match",
      });
    } else {
      clearErrors("confirmPassword");
    }
  }, [newPassword, confirmPassword, setError, clearErrors]);

  useEffect(() => {
  if (typeof window !== "undefined") {
    const storedEmail = localStorage.getItem("forgotPasswordEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
    
      router.replace("/"); 
    }
  }
}, []);

  const onSubmit = async (data: PasswordSetupForm) => {
    setApiMessage("");
    setApiError("");

      if (!email) {
    setApiError("Email not found. Please go back and verify again.");
    return;
  }


    const requirements = validatePassword(data.newPassword);
    if (!Object.values(requirements).every(Boolean)) {
      setError("newPassword", {
        type: "validate",
        message: "Password does not meet all requirements",
      });
      return;
    }

    try {
      const response = await api.post(
        "/auth/reset-password",
        {
          email,
          newPassword: data.newPassword,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("response:",response)

      setApiMessage(response.data.message || "Password reset successfully!");
      reset();
      router.push("/auth/login");
      localStorage.removeItem("forgotPasswordEmail");

    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Server error. Please try again later.";
        console.log("error message",errorMessage)
      setApiError(errorMessage);
    }
  };

  

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Reset Password
          </h1>
          <p className="text-gray-600 text-sm">
            Create a secure password for your account
          </p>
        </div>

        {/* API Feedback */}
        {apiMessage && (
          <p className="text-green-600 text-sm mb-4 text-center">{apiMessage}</p>
        )}
        {apiError && (
          <p className="text-red-600 text-sm mb-4 text-center">{apiError}</p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* New Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
      Create Password
    </label>
    <input
      type={showPassword ? "text" : "password"}
      placeholder="Create password"
      {...register("newPassword", { required: "Password is required" })}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    />
    <button
      type="button"
      className="absolute right-3 top-10 transform -translate-y-1/2 text-gray-500"
      onClick={() => setShowPassword((prev) => !prev)}
    >
      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
    </button>
    {errors.newPassword && (
      <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>
    )}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
      Confirm Password
    </label>
    <input
      type={showConfirmPassword ? "text" : "password"}
      placeholder="Confirm password"
      {...register("confirmPassword", {
        required: "Please confirm your password",
      })}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    />
    <button
      type="button"
      className="absolute right-3 top-10 transform -translate-y-1/2 text-gray-500"
      onClick={() => setShowConfirmPassword((prev) => !prev)}
    >
      {showConfirmPassword ? (
        <EyeOff className="w-5 h-5" />
      ) : (
        <Eye className="w-5 h-5" />
      )}
    </button>
    {errors.confirmPassword && (
      <p className="text-red-500 text-xs mt-1">
        {errors.confirmPassword.message}
      </p>
    )}  
          </div>

          {/* Password Requirements */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Password Requirements:
            </h3>
            {[
              {
                label: "At least 8 characters long",
                valid: passwordRequirements.minLength,
              },
              {
                label: "Contains uppercase letter",
                valid: passwordRequirements.hasUppercase,
              },
              {
                label: "Contains special character",
                valid: passwordRequirements.hasSpecialChar,
              },
              {
                label: "Contains number",
                valid: passwordRequirements.hasNumber,
              },
            ].map((item, i) => (
              <div className="flex items-center space-x-2" key={i}>
                {item.valid ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-gray-400" />
                )}
                <span
                  className={`text-xs ${
                    item.valid ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={
              !isValid ||
              !Object.values(passwordRequirements).every(Boolean) ||
              newPassword !== confirmPassword
            }
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
              isValid &&
              Object.values(passwordRequirements).every(Boolean) &&
              newPassword === confirmPassword
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-300 cursor-not-allowed"
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
