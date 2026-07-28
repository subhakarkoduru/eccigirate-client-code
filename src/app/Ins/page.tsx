"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Camera, PlusSquare, Video, ScanLine, ArrowRight, Sparkles } from 'lucide-react';
import { ChatWidget } from "@/components/chat/ChatWidget";
import { SiteHeader } from '@/components/layout/SiteHeader';
import styles from './page.module.css';

const STEPS = [
  { icon: Camera, text: 'Ensure your camera is connected and functioning.' },
  { icon: Video, text: 'Click LiveCam to start the video stream.' },
  { icon: ScanLine, text: 'Click Add Devices to register new vape devices.' },
];

const InstructionsPage = () => {
  const router = useRouter();

  const handleLiveCamClick = () => {
    router.push('/livecam');
  };

  const handleAddDevicesClick = () => {
    router.push('/adddevices');
  };

  return (
    <div className={styles.page}>
      <SiteHeader links={[{ href: '/livecam', label: 'LiveCam' }, { href: '/adddevices', label: 'Add Devices' }, { href: '/learn', label: 'Learn' }]} />
      <div className={styles.hero}>
        <div className={styles.card}>
          <span className={styles.eyebrow}>
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            You&apos;re all set up
          </span>
          <h1 className={styles.title}>Vape Detection App</h1>
          <p className={styles.description}>
            Start streaming video for real-time vape detection, or register the vape devices you
            use so the model can recognize them faster.
          </p>

          <div className={styles.stepGrid}>
            {STEPS.map(({ icon: Icon, text }, index) => (
              <div className={styles.step} key={text}>
                <span className={styles.stepNumber}>{index + 1}</span>
                <p className={styles.stepText}>
                  <Icon className="mb-2 h-4 w-4 text-blue-300" aria-hidden />
                  <br />
                  {text}
                </p>
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <button className={`${styles.actionCard} ${styles.actionPrimary}`} onClick={handleLiveCamClick}>
              <span className={styles.actionIcon}>
                <Video className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className={styles.actionTitle}>LiveCam</span>
                <span className={styles.actionSubtitle}>Start the live detection stream</span>
              </span>
              <ArrowRight className="ml-auto h-5 w-5 opacity-70" aria-hidden />
            </button>
            <button className={`${styles.actionCard} ${styles.actionSecondary}`} onClick={handleAddDevicesClick}>
              <span className={styles.actionIcon}>
                <PlusSquare className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className={styles.actionTitle}>Add Devices</span>
                <span className={styles.actionSubtitle}>Register the devices you use</span>
              </span>
              <ArrowRight className="ml-auto h-5 w-5 opacity-70" aria-hidden />
            </button>
          </div>
        </div>
      </div>
      <ChatWidget />
    </div>
  );
};

export default InstructionsPage;
