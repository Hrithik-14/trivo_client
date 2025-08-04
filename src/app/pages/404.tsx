import Link from "next/link";
import React from "react";

export default function Custom404() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 text-center px-4">
      <h1 className="text-5xl font-bold text-red-600 mb-4">404</h1>
      <p className="text-xl mb-4">Oops! The page you're looking for doesn't exist.</p>
      <Link href="/">
        <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          Go to Home
        </button>
      </Link>
    </div>
  );
}
