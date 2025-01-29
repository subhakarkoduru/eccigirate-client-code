"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // const response = await fetch('https://b92b-71-191-204-235.ngrok-free.app/login', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ email, password }),
      // });

      if (response.ok) {
        const data = await response.json();
        setError(null);
        console.log('Login successful', data);
        // Navigate to the live video stream page
        router.push('/Ins');
      } else {
        const errorData = await response.json();
        setError(errorData.detail);
      }
    } catch (error) {
      console.log(error)
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-white text-2xl font-bold">Vape Detection App</h1>
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className="text-white hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link href="/signup" className="text-white hover:underline">
                Signup Page
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Login Form */}
      <div className="flex justify-center items-center h-[80vh]">
        <div className="w-full max-w-lg p-8 border border-gray-300 rounded-lg shadow-md bg-gray-800 text-white">
          <h1 className="text-3xl font-bold mb-6">Login Page</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <label htmlFor="email" className="block mb-2 font-semibold">Email:</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              className="w-full p-3 mb-6 border border-gray-300 rounded bg-gray-700 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="password" className="block mb-2 font-semibold">Password:</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              className="w-full p-3 mb-6 border border-gray-300 rounded bg-gray-700 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
