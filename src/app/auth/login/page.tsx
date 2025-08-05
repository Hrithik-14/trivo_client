  'use client'
  import React, { useState } from 'react'
  import Image from 'next/image'
  import { useForm } from 'react-hook-form'
  import { Eye, EyeOff, User, Lock } from 'lucide-react'
  import api from '@/app/api/axios'
  import axios from 'axios'
  import { useRouter } from 'next/navigation'
  import { useDispatch } from 'react-redux'
  import { setUser } from '@/app/store/userSlice'
import toast from 'react-hot-toast'

  interface LoginFormData {
    identifier: string
    password: string
  }

  function Login() {
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()
    const dispatch = useDispatch()
    
    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
      reset
    } = useForm<LoginFormData>({
      mode: 'onChange'
    })

const onSubmit = async (data: LoginFormData) => {
  try {
    const res = await api.post('/auth/login', data)
    toast.success('Login successful!')

    localStorage.setItem("token", res.data.token)

    dispatch(setUser({
      id: res.data.user.id,
      name: res.data.user.name,
      email: res.data.user.email,
      employeeCode: res.data.user.employeeCode,
      role: res.data.user.role,
      token: res.data.token,
    }))

    reset()

    if (res.data.user.role === "admin") {
      router.push("/admin/dashboard")
    } else {
      router.push("/")
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      toast.error(error.response?.data?.message || 'Login failed')
    } else {
      alert('Something went wrong')
    }
  }
}



    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword)
    }

    return (
      <div className='bg-[url("/bg.png")] bg-center bg-cover h-screen flex items-center'>
        <div className='w-[30%] h-[80vh] bg-white/10 backdrop-blur-md p-8 rounded-xl text-white text-center ml-20 flex flex-col items-center justify-center'>
          <div className='mb-12'>
            <Image src="/logo_png.png" alt="Logo image" width={150} height={35} />
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className='w-full space-y-6'>
            <div className='relative'>
              <div className='relative'>
                <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-[#eee] w-5 h-5' />
                <input
                  type="text"
                  placeholder="username or email"
                  className={`w-full bg-white/20 backdrop-blur-sm border ${
                    errors.identifier ? 'border-red-400' : 'border-white/30'
                  } rounded-lg px-10 py-3 text-white placeholder-gray-100 focus:outline-none focus:border-white/60 transition-colors`}
                  {...register('identifier', {
                    required: 'Username is required',
                    minLength: {
                      value: 10,
                      message: 'Username or Email must be needed'
                    }
                  })}
                />
              </div>
              {errors.identifier && (
                <p className='text-red-400 text-sm mt-1 text-left'>{errors.identifier.message}</p>
              )}
            </div>

            <div className='relative'>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-[#eee] w-4 h-4' />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="password"
                  className={`w-full bg-white/20 backdrop-blur-sm border ${
                    errors.password ? 'border-red-400' : 'border-white/30'
                  } rounded-lg px-10 py-3 pr-12 text-white placeholder-gray-100 focus:outline-none focus:border-white/60 transition-colors`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    }
                  })}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-[#eee] transition-colors'
                >
                  {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                </button>
              </div>
              {errors.password && (
                <p className='text-red-400 text-sm mt-1 text-left'>{errors.password.message}</p>
              )}
            </div>

            <div className='text-right'>
              <a href="#" className='text-sm text-gray-300 hover:text-white transition-colors'>
                Forgotten password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className='w-full bg-black hover:bg-gray-800 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2'
            >
              {isSubmitting ? (
                <>
                  <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    )
  }

  export default Login