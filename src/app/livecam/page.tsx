// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import "aframe";
// <script src="https://unpkg.com/aframe-look-at-component@1.0.0/dist/aframe-look-at-component.min.js"></script>


// const PhoneAndroidPage = () => {
//   const videoRef = useRef(null);
//   const canvasCaptureRef = useRef(null);
//   const canvasDrawRef = useRef(null);
//   const sceneRef = useRef(null);

//   const [detectionLink, setDetectionLink] = useState("");
//   const [detectionText, setDetectionText] = useState("");
//   const [showVR, setShowVR] = useState(false);
//   const [showVRButton, setShowVRButton] = useState(false);

//   const websocket = useRef(null);
//   let lastFrameTime = 0;
//   const frameRate = 10;

//   const captureFrameId = useRef(null);

//   // Handle setting the scene ref and attaching the event listener
//   const setSceneRef = (node) => {
//     if (node) {
//       // Node is the <a-scene> element
//       sceneRef.current = node;

//       const handleExitVR = () => {
//         console.log("Exit VR event detected");
//         // Reload the page upon exiting VR mode
//         window.location.reload();
//       };

//       // Attach the event listener
//       node.addEventListener("exit-vr", handleExitVR);

//       // Store the handler for cleanup
//       node.handleExitVR = handleExitVR;
//     } else {
//       // Cleanup when the node is unmounted
//       if (sceneRef.current && sceneRef.current.handleExitVR) {
//         sceneRef.current.removeEventListener("exit-vr", sceneRef.current.handleExitVR);
//       }
//     }
//   };

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       setupWebSocket();
//       startCamera();
//     }

//     // Cleanup function on component unmount
//     return () => {
//       if (websocket.current) {
//         websocket.current.close();
//       }
//       if (captureFrameId.current !== null) {
//         cancelAnimationFrame(captureFrameId.current);
//         captureFrameId.current = null;
//       }
//       // Stop the video stream
//       if (videoRef.current && videoRef.current.srcObject) {
//         videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
//       }
//     };
//   }, []);

//   useEffect(() => {
//     console.log("showVR state changed:", showVR);
//     if (showVR) {
//       console.log("Entering VR mode, stopping capture loop");
//       if (captureFrameId.current !== null) {
//         cancelAnimationFrame(captureFrameId.current);
//         captureFrameId.current = null;
//       }
//     } else {
//       console.log("Exiting VR mode or initial state, starting capture loop");
//       if (captureFrameId.current === null) {
//         captureAndSendFrame();
//       }
//     }
//   }, [showVR]);

//   const setupWebSocket = () => {
//     websocket.current = new WebSocket("wss://192.168.1.170:8000/video");
//     websocket.current.binaryType = "arraybuffer";

//     websocket.current.onopen = () => {
//       console.log("WebSocket connection established.");
//       if (videoRef.current) {
//         videoRef.current.style.border = "2px solid green";
//       }
//       startHeartbeat();
//     };

//     websocket.current.onerror = (event) => {
//       console.error("WebSocket error:", event);
//       if (videoRef.current) {
//         videoRef.current.style.border = "2px solid red";
//       }
//     };

//     websocket.current.onclose = (event) => {
//       console.log("WebSocket connection closed:", event.reason);
//       if (videoRef.current) {
//         videoRef.current.style.border = "2px solid red";
//       }
//       setTimeout(setupWebSocket, 1000);
//     };

//     websocket.current.onmessage = (event) => {
//       const messageData = event.data;
//       console.log("WebSocket message received:", messageData);

//       if (messageData === "None") {
//         clearCanvas();
//         setDetectionLink("");
//         setDetectionText("");
//         setShowVRButton(false);
//         setShowVR(false);
//       } else {
//         try {
//           const data = JSON.parse(messageData);
//           console.log("Parsed data:", data);
//           if (data.boundingbox && data.className) {
//             drawRectangle(data.boundingbox, data.className);

//             let linkUrl;
//             switch (data.className) {
//               case "Blume-E-Ciggirate":
//                 linkUrl =
//                   "https://letsblum.com/shop-oc/?dtche%5Bproduct%5D=bloom-vape-blueberry-gushers-live-resin-disposable";
//                 break;
//               case "Diamond-E-Ciggirate":
//                 linkUrl = "https://www.vapes-bars.com/collections/diamond-600";
//                 break;
//               case "Golden-E-Ciggirate":
//                 linkUrl = "https://www.vapespring.com/gold";
//                 break;
//               case "Swift-E-Ciggirate":
//                 linkUrl = "https://swftbar.com/";
//                 break;
//               default:
//                 linkUrl = "https://default-link.com";
//             }

//             setDetectionLink(linkUrl);
//             setDetectionText(`More Information about ${data.className}`);
//             setShowVRButton(true);
//             console.log("Set showVRButton to true");
//           }
//         } catch (error) {
//           console.error("Error parsing message data:", error);
//         }
//       }
//     };
//   };

//   const startHeartbeat = () => {
//     setInterval(() => {
//       if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
//         websocket.current.send("ping");
//       }
//     }, 30000);
//   };

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         await new Promise((resolve) => (videoRef.current.onloadedmetadata = resolve));
//         if (canvasCaptureRef.current && canvasDrawRef.current) {
//           canvasCaptureRef.current.width = videoRef.current.videoWidth;
//           canvasCaptureRef.current.height = videoRef.current.videoHeight;
//           canvasDrawRef.current.width = videoRef.current.videoWidth;
//           canvasDrawRef.current.height = videoRef.current.videoHeight;
//           videoRef.current.play();
//           captureAndSendFrame();
//         }
//       }
//     } catch (error) {
//       console.error("Error accessing the camera:", error);
//       if (videoRef.current) {
//         videoRef.current.style.border = "2px solid red";
//       }
//     }
//   };

//   const captureAndSendFrame = () => {
//     if (showVR) {
//       return;
//     }

//     const now = Date.now();
//     if (now - lastFrameTime < 1000 / frameRate) {
//       captureFrameId.current = requestAnimationFrame(captureAndSendFrame);
//       return;
//     }
//     lastFrameTime = now;

//     if (canvasCaptureRef.current && videoRef.current) {
//       const contextCapture = canvasCaptureRef.current.getContext("2d");
//       contextCapture?.drawImage(
//         videoRef.current,
//         0,
//         0,
//         canvasCaptureRef.current.width,
//         canvasCaptureRef.current.height
//       );
//       canvasCaptureRef.current.toBlob((blob) => {
//         if (websocket.current && websocket.current.readyState === WebSocket.OPEN && blob) {
//           websocket.current.send(blob);
//         }
//       }, "image/jpeg", 0.8);
//       captureFrameId.current = requestAnimationFrame(captureAndSendFrame);
//     }
//   };

//   const drawRectangle = (rectangle, className) => {
//     if (canvasDrawRef.current) {
//       const contextDraw = canvasDrawRef.current.getContext("2d");
//       if (contextDraw) {
//         const x1 = rectangle[0] * canvasDrawRef.current.width;
//         const y1 = rectangle[1] * canvasDrawRef.current.height;
//         const x2 = rectangle[2] * canvasDrawRef.current.width;
//         const y2 = rectangle[3] * canvasDrawRef.current.height;

//         contextDraw.clearRect(0, 0, canvasDrawRef.current.width, canvasDrawRef.current.height);
//         contextDraw.strokeStyle = "red";
//         contextDraw.lineWidth = 2;
//         contextDraw.beginPath();
//         contextDraw.rect(x1, y1, x2 - x1, y2 - y1);
//         contextDraw.stroke();

//         contextDraw.fillStyle = "red";
//         contextDraw.font = "16px Arial";
//         contextDraw.fillText(className, x1, y1 - 10);
//       }
//     }
//   };

//   const clearCanvas = () => {
//     if (canvasDrawRef.current) {
//       const contextDraw = canvasDrawRef.current.getContext("2d");
//       contextDraw?.clearRect(0, 0, canvasDrawRef.current.width, canvasDrawRef.current.height);
//     }
//   };

//   const enterVRMode = () => {
//     console.log("Enter VR Mode button clicked");
//     setShowVR(true);
//   };

//   return (
//     <div className="flex flex-col items-center p-4 bg-white min-h-screen">
//       {showVR ? (
//         // VR scene
//         <div className="w-full h-screen">
//           <a-scene ref={setSceneRef} embedded style={{ height: "100vh", width: "100%" }}>
//             {/* Add lights */}
//             <a-entity light="type: ambient; intensity: 0.5"></a-entity>
//             <a-entity light="type: directional; intensity: 1" position="0 2 1"></a-entity>

//             {/* Your model */}
//             <a-entity
//               id="lung-model"
//               gltf-model="/models/lungsmodel/scene.gltf"
//               position="0 1.6 -5"
//               rotation="0 180 0"
//               scale="3 3 3"
//               look-at="[camera]"
//             ></a-entity>

//             {/* Left Lung Annotation */}
//             <a-entity
//               position="-1 3.1 -5"
//               geometry="primitive: plane; height: 0.2; width: 0.5"
//               material="color: #FFFFFF; opacity: 0.8"
//               look-at="[camera]"
//             >
//               <a-text
//                 value="Smokers Lung"
//                 align="center"
//                 color="#000000"
//                 position="0 0 0.01"
//               ></a-text>
//             </a-entity>

//             {/* Right Lung Annotation */}
//             <a-entity
//               position="1 3.1 -5"
//               geometry="primitive: plane; height: 0.2; width: 0.5"
//               material="color: #FFFFFF; opacity: 0.8"
//               look-at="[camera]"
//             >
//               <a-text
//                 value="Non Smokers Lung"
//                 align="center"
//                 color="#000000"
//                 position="0 0 0.01"
//               ></a-text>
//             </a-entity>
//           </a-scene>
//         </div>
//       ) : (
//         // Previous content
//         <>
//           <h1 className="text-xl font-bold mb-4 text-black">Phone Camera Stream</h1>
//           <div className="relative w-full max-w-2xl">
//             <div className="relative w-full">
//               <video ref={videoRef} autoPlay className="w-full h-auto"></video>
//               <canvas
//                 ref={canvasDrawRef}
//                 className="absolute top-0 left-0 w-full h-full"
//               ></canvas>
//             </div>
//           </div>
//           <canvas ref={canvasCaptureRef} className="hidden"></canvas>

//           {/* Display links when both detectionLink and detectionText are available */}
//           {detectionLink && detectionText && (
//             <div className="bg-white p-2 border border-black mt-4">
//               <a
//                 href="https://www.cdc.gov/tobacco/e-cigarettes/empower-vape-free-youth-campaign.html"
//                 className="mr-4 text-blue-500 underline"
//               >
//                 Prevention Details
//               </a>
//               <a href={detectionLink} className="mr-4 text-blue-500 underline">
//                 {detectionText}
//               </a>
//             </div>
//           )}

//           {/* Display VR button if there's a detection */}
//           {showVRButton && !showVR && (
//             <button
//               onClick={enterVRMode}
//               className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
//             >
//               Enter VR Mode
//             </button>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default PhoneAndroidPage;


"use client";

import React, { useEffect, useRef, useState } from "react";
import "aframe";
// Note: The script tag in your import is unnecessary in React.
// Instead, use import statements or include the script in your HTML if needed.

const PhoneAndroidPage = () => {
  const videoRef = useRef(null);
  const canvasCaptureRef = useRef(null);
  const canvasDrawRef = useRef(null);
  const sceneRef = useRef(null);

  const [detectionLink, setDetectionLink] = useState("");
  const [detectionText, setDetectionText] = useState("");
  const [showVR, setShowVR] = useState(false);
  const [showVRButton, setShowVRButton] = useState(false);

  // Added cameraStarted state
  const [cameraStarted, setCameraStarted] = useState(false);

  const websocket = useRef(null);
  let lastFrameTime = 0;
  const frameRate = 10;

  const captureFrameId = useRef(null);

  // Handle setting the scene ref and attaching the event listener
  const setSceneRef = (node) => {
    if (node) {
      // Node is the <a-scene> element
      sceneRef.current = node;

      const handleExitVR = () => {
        console.log("Exit VR event detected");
        // Reload the page upon exiting VR mode
        window.location.reload();
      };

      // Attach the event listener
      node.addEventListener("exit-vr", handleExitVR);

      // Store the handler for cleanup
      node.handleExitVR = handleExitVR;
    } else {
      // Cleanup when the node is unmounted
      if (sceneRef.current && sceneRef.current.handleExitVR) {
        sceneRef.current.removeEventListener("exit-vr", sceneRef.current.handleExitVR);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setupWebSocket();
      // Removed startCamera() from here
    }

    // Cleanup function on component unmount
    return () => {
      if (websocket.current) {
        websocket.current.close();
      }
      if (captureFrameId.current !== null) {
        cancelAnimationFrame(captureFrameId.current);
        captureFrameId.current = null;
      }
      // Stop the video stream
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // New useEffect to start camera after user interaction
  useEffect(() => {
    if (cameraStarted) {
      startCamera();
    }
  }, [cameraStarted]);

  useEffect(() => {
    console.log("showVR state changed:", showVR);
    if (showVR) {
      console.log("Entering VR mode, stopping capture loop");
      if (captureFrameId.current !== null) {
        cancelAnimationFrame(captureFrameId.current);
        captureFrameId.current = null;
      }
    } else {
      console.log("Exiting VR mode or initial state, starting capture loop");
      if (captureFrameId.current === null && cameraStarted) {
        captureAndSendFrame();
      }
    }
  }, [showVR, cameraStarted]); // Added cameraStarted to dependency array

  const setupWebSocket = () => {
    websocket.current = new WebSocket("ws://localhost:8000/video");
    //websocket.current = new WebSocket("wss://b92b-71-191-204-235.ngrok-free.app/video");
    websocket.current.binaryType = "arraybuffer";

    websocket.current.onopen = () => {
      console.log("WebSocket connection established.");
      if (videoRef.current) {
        videoRef.current.style.border = "2px solid green";
      }
      startHeartbeat();
    };

    websocket.current.onerror = (event) => {
      console.error("WebSocket error:", event);
      if (videoRef.current) {
        videoRef.current.style.border = "2px solid red";
      }
    };

    websocket.current.onclose = (event) => {
      console.log("WebSocket connection closed:", event.reason);
      if (videoRef.current) {
        videoRef.current.style.border = "2px solid red";
      }
      setTimeout(setupWebSocket, 1000);
    };

    websocket.current.onmessage = (event) => {
      const messageData = event.data;
      console.log("WebSocket message received:", messageData);

      if (messageData === "None") {
        clearCanvas();
        setDetectionLink("");
        setDetectionText("");
        setShowVRButton(false);
        setShowVR(false);
      } else {
        try {
          const data = JSON.parse(messageData);
          console.log("Parsed data:", data);
          if (data.boundingbox && data.className) {
            drawRectangle(data.boundingbox, data.className);

            let linkUrl;
            switch (data.className) {
              case "Blume-E-Ciggirate":
                linkUrl =
                  "https://letsblum.com/shop-oc/?dtche%5Bproduct%5D=bloom-vape-blueberry-gushers-live-resin-disposable";
                break;
              case "Diamond-E-Ciggirate":
                linkUrl = "https://www.vapes-bars.com/collections/diamond-600";
                break;
              case "Golden-E-Ciggirate":
                linkUrl = "https://www.vapespring.com/gold";
                break;
              case "Swift-E-Ciggirate":
                linkUrl = "https://swftbar.com/";
                break;
              case "ELFBAR-E-Ciggirate":
                linkUrl = "https://swftbar.com/";
                break;
              case "Vuse-E-Ciggirate":
                linkUrl = "https://swftbar.com/";
                break;
              case "GEEK-E-Ciggirate":
                linkUrl = "https://swftbar.com/";
                break;
              default:
                linkUrl = "https://default-link.com";
            }

            setDetectionLink(linkUrl);
            setDetectionText(`More Information about ${data.className}`);
            setShowVRButton(true);
            console.log("Set showVRButton to true");
          }
        } catch (error) {
          console.error("Error parsing message data:", error);
        }
      }
    };
  };

  const startHeartbeat = () => {
    setInterval(() => {
      if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
        websocket.current.send("ping");
      }
    }, 30000);
  };

  const startCamera = async () => {
    try {
      //const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } }, // Request the back camera
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise((resolve) => (videoRef.current.onloadedmetadata = resolve));
        if (canvasCaptureRef.current && canvasDrawRef.current) {
          canvasCaptureRef.current.width = videoRef.current.videoWidth;
          canvasCaptureRef.current.height = videoRef.current.videoHeight;
          canvasDrawRef.current.width = videoRef.current.videoWidth;
          canvasDrawRef.current.height = videoRef.current.videoHeight;
          videoRef.current.play();
          captureAndSendFrame();
        }
      }
    } catch (error) {
      console.error("Error accessing the camera:", error);
      if (videoRef.current) {
        videoRef.current.style.border = "2px solid red";
      }
    }
  };

  const captureAndSendFrame = () => {
    if (showVR) {
      return;
    }

    const now = Date.now();
    if (now - lastFrameTime < 1000 / frameRate) {
      captureFrameId.current = requestAnimationFrame(captureAndSendFrame);
      return;
    }
    lastFrameTime = now;

    if (canvasCaptureRef.current && videoRef.current) {
      const contextCapture = canvasCaptureRef.current.getContext("2d");
      contextCapture?.drawImage(
        videoRef.current,
        0,
        0,
        canvasCaptureRef.current.width,
        canvasCaptureRef.current.height
      );
      canvasCaptureRef.current.toBlob((blob) => {
        if (websocket.current && websocket.current.readyState === WebSocket.OPEN && blob) {
          websocket.current.send(blob);
        }
      }, "image/jpeg", 0.8);
      captureFrameId.current = requestAnimationFrame(captureAndSendFrame);
    }
  };

  const drawRectangle = (rectangle, className) => {
    if (canvasDrawRef.current) {
      const contextDraw = canvasDrawRef.current.getContext("2d");
      if (contextDraw) {
        const x1 = rectangle[0] * canvasDrawRef.current.width;
        const y1 = rectangle[1] * canvasDrawRef.current.height;
        const x2 = rectangle[2] * canvasDrawRef.current.width;
        const y2 = rectangle[3] * canvasDrawRef.current.height;

        contextDraw.clearRect(0, 0, canvasDrawRef.current.width, canvasDrawRef.current.height);
        contextDraw.strokeStyle = "red";
        contextDraw.lineWidth = 2;
        contextDraw.beginPath();
        contextDraw.rect(x1, y1, x2 - x1, y2 - y1);
        contextDraw.stroke();

        contextDraw.fillStyle = "red";
        contextDraw.font = "16px Arial";
        contextDraw.fillText(className, x1, y1 - 10);
      }
    }
  };

  const clearCanvas = () => {
    if (canvasDrawRef.current) {
      const contextDraw = canvasDrawRef.current.getContext("2d");
      contextDraw?.clearRect(0, 0, canvasDrawRef.current.width, canvasDrawRef.current.height);
    }
  };

  const enterVRMode = () => {
    console.log("Enter VR Mode button clicked");
    setShowVR(true);
  };

  // New handler for starting the camera
  const handleStartCamera = () => {
    setCameraStarted(true);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-white min-h-screen">
      {showVR ? (
        // VR scene
        <div className="w-full h-screen">
          <a-scene ref={setSceneRef} embedded style={{ height: "100vh", width: "100%" }}>
            {/* Add lights */}
            <a-entity light="type: ambient; intensity: 0.5"></a-entity>
            <a-entity light="type: directional; intensity: 1" position="0 2 1"></a-entity>

            {/* Your model */}
            <a-entity
              id="lung-model"
              gltf-model="/models/lungsmodel/scene.gltf"
              position="0 1.6 -5"
              rotation="0 180 0"
              scale="3 3 3"
              look-at="[camera]"
            ></a-entity>

            {/* Left Lung Annotation */}
            <a-entity
              position="-1 3.1 -5"
              geometry="primitive: plane; height: 0.2; width: 0.5"
              material="color: #FFFFFF; opacity: 0.8"
              look-at="[camera]"
            >
              <a-text
                value="Smokers Lung"
                align="center"
                color="#ff0000"
                position="0 0 0.01"
              ></a-text>
            </a-entity>

            {/* Right Lung Annotation */}
            <a-entity
              position="1 3.1 -5"
              geometry="primitive: plane; height: 0.2; width: 0.5"
              material="color: #FFFFFF; opacity: 0.8"
              look-at="[camera]"
            >
              <a-text
                value="Non Smokers Lung"
                align="center"
                color="#008000"
                position="0 0 0.01"
              ></a-text>
            </a-entity>
          </a-scene>
        </div>
      ) : !cameraStarted ? (
        // Show Start Camera button if camera hasn't started
        <button
          onClick={handleStartCamera}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Start Camera
        </button>
      ) : (
        // Previous content after camera has started
        <>
          <h1 className="text-xl font-bold mb-4 text-black">Phone Camera Stream</h1>
          <div className="relative w-full max-w-2xl">
            <div className="relative w-full">
              <video ref={videoRef} autoPlay className="w-full h-auto"></video>
              <canvas
                ref={canvasDrawRef}
                className="absolute top-0 left-0 w-full h-full"
              ></canvas>
            </div>
          </div>
          <canvas ref={canvasCaptureRef} className="hidden"></canvas>

          {/* Display links when both detectionLink and detectionText are available */}
          {detectionLink && detectionText && (
            <div className="bg-white p-2 border border-black mt-4">
              <a
                href="https://www.cdc.gov/tobacco/e-cigarettes/empower-vape-free-youth-campaign.html"
                className="mr-4 text-blue-500 underline"
              >
                Prevention Details
              </a>
              <a href={detectionLink} className="mr-4 text-blue-500 underline">
                {detectionText}
              </a>
            </div>
          )}

          {/* Display VR button if there's a detection */}
          {showVRButton && !showVR && (
            <button
              onClick={enterVRMode}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Enter VR Mode
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default PhoneAndroidPage;

