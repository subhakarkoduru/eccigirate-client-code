"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const InstructionsPage = () => {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push('/livecam');
  };

  const handleSignupClick = () => {
    router.push('/adddevices');
  };

  return (
    <div className={`${styles.background}`}>
      <div className={styles.whiteBackground}>
        <div className={styles.card}>
          <h1 className={styles.title}>Vape Detection App</h1>
          <p className={styles.description}>
            Welcome to the Vape Detection App. Click the buttons below to start streaming video for vape detection or add vape devices that you use.
          </p>
          <div className={styles.instructions}>
            <h2 className={styles.instructionsTitle}>Instructions</h2>
            <p className={styles.instructionsText}>
              Please follow these instructions to use the app effectively:
            </p>
            <ul className={styles.instructionsList}>
              <li>Ensure your camera is connected and functioning.</li>
              <li>Click on LiveCam to start the video stream.</li>
              <li>Click on Add Devices to register new vape devices.</li>
            </ul>
          </div>
          <div className={`${styles.buttonContainer} flex justify-center space-x-8`}>
            <button className={styles.button} onClick={handleLoginClick}>
              LiveCam
            </button>
            <button className={styles.button} onClick={handleSignupClick}>
              Add Devices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionsPage;
