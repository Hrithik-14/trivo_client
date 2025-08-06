'use client';
import React from 'react';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  const handleLoginClick = (): void => {
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white drop-shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Image
              src="/logo_png.png"
              alt="Company logo"
              width={100}
              height={60}
              className="object-contain rounded-lg"
            />
            <button
              onClick={handleLoginClick}
              className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition"
            >
              Log In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                {'Innovating'}<br />
                {`Tomorrow's`}<br />
                {"Business"}<br />
                {"Solutions"}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                TRIVO is your trusted partner for cutting-edge technology and strategic insights.
                We deliver exceptional results that drive growth and success.
              </p>
            </div>
            <div className="flex justify-center">
              <Image
                src="/building_company.png"
                width={500}
                height={400}
                alt="Modern glass office building"
                className="object-contain mt-4"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-16 bg-gray-50 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-12">About Us</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
            {/* About Text */}
            <div className="lg:col-span-2 space-y-6">
              <p className="text-lg text-gray-600 leading-relaxed">
                At TRIVO, we`re passionate about transforming businesses through innovative
                technology solutions. Our team of experts combines deep industry knowledge with
                cutting-edge technology to deliver results that exceed expectations.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We believe in building lasting partnerships with our clients, understanding their
                unique challenges, and crafting tailored solutions that drive sustainable growth and
                competitive advantage in today`s dynamic marketplace.
              </p>
              <p className="text-gray-600 leading-relaxed">
                From strategic consulting to implementation and ongoing support, we`re committed to
                your success every step of the way.
              </p>
            </div>

            {/* Team Members */}
            <div className="bg-white rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-6 shadow-2xl">
              {[
                { name: 'Minhaj', role: 'CEO Founder', color: 'bg-blue-500', initial: 'M' },
                { name: 'Muhsina', role: 'CTO', color: 'bg-purple-500', initial: 'M' },
                { name: 'Hrithik', role: 'Manager', color: 'bg-green-500', initial: 'H' },
                { name: 'Javid', role: 'Developer', color: 'bg-orange-500', initial: 'J' },
              ].map((member) => (
                <div key={member.name} className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${member.color} rounded-full flex items-center justify-center`}>
                    <span className="text-white font-semibold">{member.initial}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{member.name}</h4>
                    <p className="text-sm text-gray-600">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { value: '500+', label: 'Project completed' },
              { value: '200+', label: 'Happy Clients' },
              { value: '10+', label: 'Years Experience' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white p-8 rounded-lg shadow-sm">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="space-y-4">
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

            {/* Social Icons */}
            <div className="flex justify-start md:justify-end space-x-6">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="text-gray-400 hover:text-blue-600 transition">
                  <Icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-8 mt-8 border-t">
            <div className="text-sm text-gray-600">© 2025 Trivo Inc.</div>
            <div className="text-sm text-gray-600 mt-2 sm:mt-0">Privacy Policy</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
