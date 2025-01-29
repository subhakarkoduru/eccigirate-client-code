// src/app/page.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const HomePage = () => {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push('/login');
  };

  const handleSignupClick = () => {
    router.push('/signup');
  };

  return (
    <div className={`${styles.background}`} style={{ backgroundImage: `url('/background.jpg')` }}>
      <div className={styles.container}>
        <h1 className={styles.title}>Vape Detection App</h1>
        <p className={styles.description}>
          Welcome to the Vape Detection App. Click the button below to start streaming video for vape detection.
        </p>
        <div className="flex justify-center space-x-8">
          <button className={styles.button} onClick={handleLoginClick}>
            Login
          </button>
          <button className={styles.button} onClick={handleSignupClick}>
            Signup
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
