// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";
// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { Shield, Check, X } from "lucide-react";
// import api from "../api/axios";

// // Interfaces
// interface PasswordSetupForm {
//   employeeName: string;
//   employeeId: string;
//   email: string;
//   newPassword: string;
//   confirmPassword: string;
// }

// interface PasswordRequirements {
//   minLength: boolean;
//   hasUppercase: boolean;
//   hasSpecialChar: boolean;
//   hasNumber: boolean;
// }

// // Validation
// const validatePassword = (password: string): PasswordRequirements => ({
//   minLength: password.length >= 8,
//   hasUppercase: /[A-Z]/.test(password),
//   hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
//   hasNumber: /\d/.test(password),
// });

// const PasswordSetup: React.FC = () => {
//   const router = useRouter();

//   const [formData, setFormData] = useState<PasswordSetupForm>({
//     employeeName: "Sijo Jhon",
//     employeeId: "TRIVO788-0011",
//     email: "",
//     newPassword: "",
//     confirmPassword: "",
//   });

//   const [passwordRequirements, setPasswordRequirements] =
//     useState<PasswordRequirements>({
//       minLength: false,
//       hasUppercase: false,
//       hasSpecialChar: false,
//       hasNumber: false,
//     });

//   const [errors, setErrors] = useState<Partial<PasswordSetupForm>>({});
//   const [apiMessage, setApiMessage] = useState("");
//   const [apiError, setApiError] = useState("");
//   const [email, setEmail] = useState<string>(""); 

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const storedEmail = localStorage.getItem("forgotPasswordEmail");
//       if (storedEmail) {
//         setEmail(storedEmail);
//       }
//     }
//   }, []);

//   const handleInputChange = (field: keyof PasswordSetupForm, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//     if (field === "newPassword") {
//       setPasswordRequirements(validatePassword(value));
//     }
//     if (errors[field]) {
//       setErrors((prev) => ({ ...prev, [field]: undefined }));
//     }
//   };

//   const validateForm = (): boolean => {
//     const newErrors: Partial<PasswordSetupForm> = {};
//     const { newPassword, confirmPassword } = formData;

//     const requirements = validatePassword(newPassword);
//     if (!Object.values(requirements).every(Boolean)) {
//       newErrors.newPassword = "Password does not meet all requirements";
//     }

//     if (!newPassword) newErrors.newPassword = "Password is required";
//     if (!confirmPassword)
//       newErrors.confirmPassword = "Please confirm your password";
//     else if (newPassword !== confirmPassword)
//       newErrors.confirmPassword = "Passwords do not match";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setApiMessage("");
//     setApiError("");

//     if (!validateForm()) return;

//     try {
//       const response = await api.post(
//         "/auth/reset-password",
//         {
//           email: email,
//           newPassword: formData.newPassword,
//         },
//         {
//           headers: { "Content-Type": "application/json" },
//         }
//       );

//       const data = response.data;
//       setApiMessage(data.message || "Password reset successfully!");
//       setFormData((prev) => ({
//         ...prev,
//         newPassword: "",
//         confirmPassword: "",
//       }));
//       router.push("/auth/login");
//     } catch (error: any) {
//       const errorMessage =
//         error.response?.data?.message ||
//         "Server error. Please try again later.";
//       setApiError(errorMessage);
//     }
//   };

//   const isFormValid =
//     Object.values(passwordRequirements).every(Boolean) &&
//     formData.newPassword === formData.confirmPassword &&
//     formData.newPassword !== "";

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
//             <Shield className="w-8 h-8 text-blue-600" />
//           </div>
//           <h1 className="text-2xl font-semibold text-gray-900 mb-2">
//             Reset Password
//           </h1>
//           <p className="text-gray-600 text-sm">
//             Create a secure password for your account
//           </p>
//         </div>

//         {/* API Feedback */}
//         {apiMessage && (
//           <p className="text-green-600 text-sm mb-4 text-center">
//             {apiMessage}
//           </p>
//         )}
//         {apiError && (
//           <p className="text-red-600 text-sm mb-4 text-center">{apiError}</p>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Create Password
//             </label>
//             <input
//               type="password"
//               value={formData.newPassword}
//               onChange={(e) => handleInputChange("newPassword", e.target.value)}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//               placeholder="Create password"
//             />
//             {errors.newPassword && (
//               <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
//             )}
//           </div>

//           {/* Confirm Password */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Confirm Password
//             </label>
//             <input
//               type="password"
//               value={formData.confirmPassword}
//               onChange={(e) =>
//                 handleInputChange("confirmPassword", e.target.value)
//               }
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//               placeholder="Confirm your password"
//             />
//             {errors.confirmPassword && (
//               <p className="text-red-500 text-xs mt-1">
//                 {errors.confirmPassword}
//               </p>
//             )}
//           </div>

//           {/* Password Requirements */}
//           <div className="bg-gray-50 rounded-lg p-4">
//             <h3 className="text-sm font-medium text-gray-700 mb-3">
//               Password Requirements:
//             </h3>
//             {[
//               {
//                 label: "At least 8 characters long",
//                 valid: passwordRequirements.minLength,
//               },
//               {
//                 label: "Contains uppercase letter",
//                 valid: passwordRequirements.hasUppercase,
//               },
//               {
//                 label: "Contains special character",
//                 valid: passwordRequirements.hasSpecialChar,
//               },
//               {
//                 label: "Contains number",
//                 valid: passwordRequirements.hasNumber,
//               },
//             ].map((item, i) => (
//               <div className="flex items-center space-x-2" key={i}>
//                 {item.valid ? (
//                   <Check className="w-4 h-4 text-green-500" />
//                 ) : (
//                   <X className="w-4 h-4 text-gray-400" />
//                 )}
//                 <span
//                   className={`text-xs ${
//                     item.valid ? "text-green-600" : "text-gray-500"
//                   }`}
//                 >
//                   {item.label}
//                 </span>
//               </div>
//             ))}
//           </div>

//           {/* Submit */}
//           <button
//             type="submit"
//             disabled={!isFormValid}
//             className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
//               isFormValid
//                 ? "bg-blue-600 hover:bg-blue-700"
//                 : "bg-gray-300 cursor-not-allowed"
//             }`}
//           >
//             Set Password
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default PasswordSetup;


/* eslint-disable @typescript-eslint/no-explicit-any */
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
      

      setApiMessage(response.data.message || "Password reset successfully!");
      reset();
      router.push("/auth/login");
      localStorage.removeItem("forgotPasswordEmail");

    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Server error. Please try again later.";
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
