"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const AddDevicePage = () => {
  const [devices, setDevices] = useState([{ image: null, preview: null }]);
  const router = useRouter();

  const handleImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const updatedDevices = [...devices];
      updatedDevices[index] = {
        image: file,
        preview: URL.createObjectURL(file),
      };
      setDevices(updatedDevices);
    }
  };

  const handleAddMoreClick = () => {
    setDevices([...devices, { image: null, preview: null }]);
  };

  const handleClearImages = () => {
    setDevices([{ image: null, preview: null }]);
  };

  const handleDoneClick = async () => {
    const formData = new FormData();
    devices.forEach((device, index) => {
        if (device.image) {
            formData.append("files", device.image);  // Use the key "files" for each file
        }
    });

    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
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
        alert('Devices uploaded successfully!');
        handleClearImages(); // Clear images after successful upload
        router.push('/livecam'); // Navigate to the next page
      } else {
        // Handle error
        alert('Failed to upload devices');
      }
    } catch (error) {
      console.error('Error uploading devices:', error);
      alert('An error occurred while uploading the devices');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Add Device</h1>
        <p className={styles.subtitle}>
          Add electronic cigarette devices you usually use
        </p>
        {devices.map((device, index) => (
          <div key={index} className={styles.imageUpload}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(index, e)}
              className={styles.input}
            />
            {device.preview && (
              <img
                src={device.preview}
                alt={`Preview ${index}`}
                className={styles.previewImage}
              />
            )}
          </div>
        ))}
        <div className={styles.buttonGroup}>
          <button className={styles.button} onClick={handleAddMoreClick}>
            Add More
          </button>
          <button className={styles.button} onClick={handleDoneClick}>
            Done
          </button>
          <button className={styles.button} onClick={handleClearImages}>
            Clear Images
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDevicePage;
