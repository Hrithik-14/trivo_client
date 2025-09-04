'use client';
import React, { useEffect } from 'react';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';
import Image from 'next/image';
import AOS from 'aos';
import 'aos/dist/aos.css';

import { useRouter } from 'next/navigation';
import { useHomeGuard } from './hooks/useHomeGuard';
import toast from 'react-hot-toast';

export default function LandingPage() {
    const router = useRouter()
    const { loading } = useHomeGuard()

    useEffect(() => {
      const message = sessionStorage.getItem("logoutMessage");
      if (message) {
        toast.success(message);
        sessionStorage.removeItem("logoutMessage");
      }
    }, []);

    
    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100,
            easing: 'ease-out-cubic',
        });
    }, []);

    const handleLoginClick = (): void => {
      router.push('/auth/login'); 
    };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
        <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading detail...</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="fixed top-0 left-0 right-0 bg-white drop-shadow-lg z-50" data-aos="fade-down">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image 
                  src="/logo_png.png" 
                  alt="Company logo" 
                  width={100}    
                  height={60}   
                  className='object-cover rounded-lg'
              />
            </div>
            <button 
            onClick={handleLoginClick}
            className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors mr-10 cursor-pointer">
              Log In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div data-aos="fade-right" data-aos-delay="200">
              <h2 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
                Innovating<br />
                Tomorrow&apos;s<br />
                Business<br />
                Solutions
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                TRIVO is your trusted partner for cutting-edge<br />
                technology and strategic insights. We deliver<br />
                exceptional results that drive growth and success.
              </p>
            </div>
            <div className="relative" data-aos="fade-left" data-aos-delay="400">
              <div className="relative w-120 h-100">
              <Image 
                  src="/building_company.png" 
                  alt="Modern glass office building" 
                  fill                         
                  className="object-container mt-8"
              />
              </div>
            </div>
        </div>
        </div>
    </section>

    <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-3xl font-bold text-gray-900 mb-12" data-aos="fade-up">About Us</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2" data-aos="fade-up" data-aos-delay="100">
            <p className="text-gray-600 leading-relaxed mb-6">
                At TRIVO, we`re passionate about transforming businesses through 
                innovative technology solutions. Our team of experts combines 
                deep industry knowledge with cutting-edge technology to deliver 
                results that exceed expectations.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                We believe in building lasting partnerships with our clients, 
                understanding their unique challenges, and crafting tailored 
                solutions that drive sustainable growth and competitive advantage 
                in today`s dynamic marketplace.
              </p>
              <p className="text-gray-600 leading-relaxed">
                From strategic consulting to implementation and ongoing support, 
                we`re committed to your success every step of the way.
              </p>
            </div>
            
            <div className="space-y-6" data-aos="fade-left" data-aos-delay="200">
              <div className="flex items-center space-x-4" data-aos="zoom-in" data-aos-delay="300">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">M</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Minhaj</h4>
                  <p className="text-sm text-gray-600">CEO Founder</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4" data-aos="zoom-in" data-aos-delay="400">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">M</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Muhsina</h4>
                  <p className="text-sm text-gray-600">CTO</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4" data-aos="zoom-in" data-aos-delay="500">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">H</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Hrithik</h4>
                  <p className="text-sm text-gray-600">Manager</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4" data-aos="zoom-in" data-aos-delay="600">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">J</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Javid</h4>
                  <p className="text-sm text-gray-600">Developer</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-8 rounded-lg shadow-sm" data-aos="flip-left" data-aos-delay="100">
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Project completed</div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm" data-aos="flip-left" data-aos-delay="200">
              <div className="text-4xl font-bold text-blue-600 mb-2">200+</div>
              <div className="text-gray-600">Happy Clients</div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm" data-aos="flip-left" data-aos-delay="300">
              <div className="text-4xl font-bold text-blue-600 mb-2">10+</div>
              <div className="text-gray-600">Years Experience</div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white py-12 border-t" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4" data-aos="fade-right" data-aos-delay="100">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-semibold text-gray-900">Business Street,</div>
                  <div className="text-gray-600">Metro, 500</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-600" />
                <div className="text-gray-900">+91 9999999999</div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <div className="text-gray-900">company@trivo.com</div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-6" data-aos="fade-left" data-aos-delay="200">
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors" data-aos="zoom-in" data-aos-delay="300">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors" data-aos="zoom-in" data-aos-delay="400">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors" data-aos="zoom-in" data-aos-delay="500">
                <Twitter className="w-6 h-6" />
              </a>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-8 mt-8 border-t" data-aos="fade-up" data-aos-delay="300">
            <div className="text-sm text-gray-600">Copyright © 2025 Trivo Inc.</div>
            <div className="text-sm text-gray-600">Privacy Policy</div>
          </div>
        </div>
      </footer>
    </div>
  );
}