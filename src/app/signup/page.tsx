"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      
      // const response = await fetch('https://b92b-71-191-204-235.ngrok-free.app/signup', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ name, email, password }),
      // });
      if (response.ok) {
        const data = await response.json();
        setSuccess(true);
        setError(null);
        console.log('Signup successful', data);
      } else {
        const errorData = await response.json();
        setError(errorData.detail);
        setSuccess(false);
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
      setSuccess(false);
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
                Landing Page
              </Link>
            </li>
            <li>
              <Link href="/login" className="text-white hover:underline">
                Login Page
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Signup Form */}
      <div className="flex justify-center items-center h-[80vh]">
        <div className="w-full max-w-lg p-8 border border-gray-300 rounded-lg shadow-md bg-gray-800 text-white">
          <h1 className="text-3xl font-bold mb-6">Signup Page</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">Signup successful! You can now log in.</p>}
          <form onSubmit={handleSubmit}>
            <label htmlFor="name" className="block mb-2 font-semibold">Name:</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              className="w-full p-3 mb-6 border border-gray-300 rounded bg-gray-700 text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
            <label htmlFor="confirmPassword" className="block mb-2 font-semibold">Confirm Password:</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword" 
              className="w-full p-3 mb-6 border border-gray-300 rounded bg-gray-700 text-white"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit" className="w-full bg-green-500 text-white py-3 rounded hover:bg-green-600">Signup</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
