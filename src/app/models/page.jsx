"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import "aframe";

const MODELS = [
  {
    id: "lungs",
    label: "Lungs",
    src: "/models/lungsmodel/scene.gltf",
    scale: "3 3 3",
    position: "0 1.4 -5",
    rotation: "0 180 0",
    caption: "Healthy vs. smoker's lung",
  },
  {
    id: "heart",
    label: "Heart",
    src: "/models/heartmodel/scene.gltf",
    scale: "3 3 3",
    position: "0 1.4 -5",
    rotation: "0 0 0",
    caption: "Effects of nicotine on the heart",
  },
  {
    id: "brain",
    label: "Brain",
    src: "/models/brainmodel/scene.gltf",
    scale: "3 3 3",
    position: "0 1.4 -5",
    rotation: "0 0 0",
    caption: "Nicotine's impact on the brain",
  },
];

export default function ModelsPage() {
  const [activeId, setActiveId] = useState(MODELS[0].id);
  const sceneRef = useRef(null);
  const active = MODELS.find((m) => m.id === activeId);

  // Reload page on exiting VR (same pattern as your detection page)
  useEffect(() => {
    const node = sceneRef.current;
    if (!node) return;
    const handleExitVR = () => window.location.reload();
    node.addEventListener("exit-vr", handleExitVR);
    return () => node.removeEventListener("exit-vr", handleExitVR);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900">
        <Link href="/phoneandroid" className="text-white text-sm">
          ← Back
        </Link>
        <span className="text-white font-semibold">{active.label}</span>
        <span className="w-12" />
      </div>

      {/* Scene — keyed so it remounts cleanly per model */}
      <div className="relative flex-1">
        <a-scene
          key={active.id}
          ref={sceneRef}
          embedded
          vr-mode-ui="enabled: true"
          style={{ height: "100%", width: "100%" }}
        >
          <a-entity light="type: ambient; intensity: 0.6"></a-entity>
          <a-entity light="type: directional; intensity: 1" position="0 2 1"></a-entity>

          <a-entity
            gltf-model={active.src}
            position={active.position}
            rotation={active.rotation}
            scale={active.scale}
            animation="property: rotation; to: 0 360 0; loop: true; dur: 20000; easing: linear"
          ></a-entity>

          <a-entity
            position="0 3 -5"
            geometry="primitive: plane; height: 0.3; width: 2"
            material="color: #FFFFFF; opacity: 0.85"
            look-at="[camera]"
          >
            <a-text value={active.caption} align="center" color="#000000" position="0 0 0.01"></a-text>
          </a-entity>
        </a-scene>
      </div>

      {/* Bottom tab bar */}
      <div className="flex bg-gray-900 border-t border-gray-700">
        {MODELS.map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveId(m.id)}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              activeId === m.id
                ? "text-indigo-400 border-t-2 border-indigo-400 bg-gray-800"
                : "text-gray-400"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}