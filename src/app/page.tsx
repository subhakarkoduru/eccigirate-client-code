// src/app/page.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, ShieldCheck, Camera, ScanEye, BookOpen } from 'lucide-react';
import styles from './page.module.css';

const FEATURES = [
  {
    icon: Camera,
    title: 'Live Detection',
    text: 'Stream your camera feed and get real-time vape detection alerts.',
  },
  {
    icon: ScanEye,
    title: 'Device Library',
    text: 'Register the devices you use so the model recognizes them faster.',
  },
  {
    icon: BookOpen,
    title: 'Learn More',
    text: 'Explore prevention resources and the health effects of vaping.',
  },
];

const HomePage = () => {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push('/login');
  };

  const handleSignupClick = () => {
    router.push('/signup');
  };

  return (
    <div className={styles.background} style={{ backgroundImage: `url('/background.jpg')` }}>
      <div className={styles.overlay} />
      <div className={styles.container}>
        <div className={styles.badge}>
          <ShieldCheck className="h-4 w-4" aria-hidden />
          AI-Powered Vape Detection
        </div>
        <h1 className={styles.title}>Vape Detection App</h1>
        <p className={styles.description}>
          Stream live video, detect vaping activity in real time, and keep your space safer.
        </p>
        <div className={styles.actions}>
          <button className={styles.buttonPrimary} onClick={handleLoginClick}>
            <LogIn className="h-4 w-4" aria-hidden />
            Login
          </button>
          <button className={styles.buttonSecondary} onClick={handleSignupClick}>
            <UserPlus className="h-4 w-4" aria-hidden />
            Signup
          </button>
        </div>
        <div className={styles.features}>
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div className={styles.feature} key={title}>
              <span className={styles.featureIcon}>
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className={styles.featureText}>
                <span className={styles.featureTitle}>{title}</span>
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
