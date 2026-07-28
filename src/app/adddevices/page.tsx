"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, ImagePlus, Upload, Eraser, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
type Device = {
  image: File | null;
  preview: string | null;
};

import styles from './page.module.css';

const AddDevicePage = () => {
  const [devices, setDevices] = useState<Device[]>([{ image: null, preview: null }]);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const router = useRouter();

 const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const updatedDevices = [...devices];
      updatedDevices[index] = {
        image: file,
        preview: URL.createObjectURL(file),
      };
      setDevices(updatedDevices);
    }
};

  const handleRemoveDevice = (index: number) => {
    setDevices((prev) => {
      if (prev.length === 1) {
        return [{ image: null, preview: null }];
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleAddMoreClick = () => {
    setDevices([...devices, { image: null, preview: null }]);
  };

  const handleClearImages = () => {
    setDevices([{ image: null, preview: null }]);
    setStatus(null);
  };

  const handleDoneClick = async () => {
    const formData = new FormData();
    devices.forEach((device, index) => {
        if (device.image) {
            formData.append("files", device.image);  // Use the key "files" for each file
        }
    });

    setIsUploading(true);
    setStatus(null);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      // const response = await fetch('https://b92b-71-191-204-235.ngrok-free.app/upload', {
      //   method: 'POST',
      //   body: formData,
      //   headers: {
      //     'Accept': 'application/json',
      //   },
      // });

      if (response.ok) {
        // Handle success
        setStatus({ type: 'success', message: 'Devices uploaded successfully!' });
        handleClearImages(); // Clear images after successful upload
        router.push('/livecam'); // Navigate to the next page
      } else {
        // Handle error
        setStatus({ type: 'error', message: 'Failed to upload devices' });
      }
    } catch (error) {
      console.error('Error uploading devices:', error);
      setStatus({ type: 'error', message: 'An error occurred while uploading the devices' });
    } finally {
      setIsUploading(false);
    }
  };

  const hasAnyImage = devices.some((device) => device.preview);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Add Device</h1>
          <p className={styles.subtitle}>
            Add photos of the electronic cigarette devices you usually use
          </p>
        </div>

        {status && (
          <div
            style={{ marginBottom: 20 }}
            className={
              status.type === 'success'
                ? 'flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300'
                : 'flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300'
            }
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
            )}
            <span>{status.message}</span>
          </div>
        )}

        <div className={styles.grid}>
          {devices.map((device, index) => (
            <div
              key={index}
              className={`${styles.slot} ${device.preview ? styles.slotFilled : ''}`}
            >
              {!device.preview && (
                <div className={styles.slotEmptyContent}>
                  <ImagePlus className="h-6 w-6" aria-hidden />
                  <span className={styles.slotEmptyText}>Upload photo</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(index, e)}
                className={styles.slotInput}
                aria-label={`Device ${index + 1} image`}
              />
              {device.preview && (
                <img
                  src={device.preview}
                  alt={`Preview ${index}`}
                  className={styles.previewImage}
                />
              )}
              {device.preview && (
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => handleRemoveDevice(index)}
                  aria-label={`Remove device ${index + 1}`}
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              )}
            </div>
          ))}
          <button type="button" className={styles.addSlot} onClick={handleAddMoreClick} aria-label="Add another device">
            <Plus className="h-6 w-6" aria-hidden />
          </button>
        </div>

        <div className={styles.buttonGroup}>
          <button
            className={styles.button}
            onClick={handleDoneClick}
            disabled={isUploading || !hasAnyImage}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Upload className="h-4 w-4" aria-hidden />
            )}
            {isUploading ? 'Uploading…' : 'Done'}
          </button>
          <button
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={handleClearImages}
            disabled={isUploading}
          >
            <Eraser className="h-4 w-4" aria-hidden />
            Clear Images
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDevicePage;
