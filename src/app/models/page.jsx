"use client";
export const dynamic = "force-dynamic";
import React, { Suspense, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
 
const MODELS = [
  {
    id: "lungs",
    label: "Lungs",
    src: "/models/lungsmodel/scene.gltf",
    scale: "3 3 3",
    position: "0 1.4 -5",
    rotation: "0 180 0",
    caption: "Healthy vs. smoker's lung",
    // Lungs model bounding box is in different (much larger) native units,
    // so label offsets here are tuned separately — nudge Y/Z after viewing in-app.
    labels: [
      {
        text: "Acute lung injury (EVALI)",
        description:
          "E-cigarettes contain acrolein, which can cause acute lung injury and COPD, and may contribute to asthma and lung cancer.",
        position: "2.2 1.6 0",
      },
      {
        text: "Irreversible lung damage",
        description:
          "Evolving evidence points to irreversible lung damage and chronic lung disease from e-cigarette use over time.",
        position: "-2.8 -2.0 0",
      },
    ],
  },
  {
    id: "heart",
    label: "Heart",
    src: "/models/heartmodel/scene.gltf",
    scale: "3 3 3",
    position: "0 1.4 -5",
    rotation: "0 0 0",
    caption: "Effects of nicotine on the heart",
    // Real bounding box at scale=3: X ±0.43, Y ±1.5, Z ±0.5
    labels: [
      {
        text: "Heart rate & blood pressure up",
        description:
          "Nicotine raises blood pressure, speeds up heart rate, and narrows blood vessels, forcing the heart to work harder over time.",
        position: "1.3 1.5 0",
      },
      {
        text: "Risk of irregular heartbeat",
        description:
          "Recent research shows chemicals in some e-cigarettes may disrupt the heart's electrical activity, raising arrhythmia risk.",
        position: "-1.1 -1.3 0",
      },
    ],
  },
  {
    id: "brain",
    label: "Brain",
    src: "/models/brainmodel/scene.gltf",
    scale: "3 3 3",
    position: "0 1.4 -5",
    rotation: "0 0 0",
    caption: "Nicotine's impact on the brain",
    // Real bounding box at scale=3: X ±0.91, Y ±1.45, Z ±1.5
    labels: [
      {
        text: "Impaired brain development (teens)",
        description:
          "Nicotine exposure during adolescence can have long-lasting effects on attention, learning, impulse control, and memory.",
        position: "1.6 1.5 0",
      },
      {
        text: "Nicotine addiction pathway",
        description:
          "Nicotine has high addiction potential without durable cognitive benefit, making it easy to develop dependence.",
        position: "-1.4 -1.3 0",
      },
    ],
  },
];
 
// Label chip: short text always visible in 3D, anchored to the model.
// The longer description is NOT rendered in 3D space — a fixed-size 3D
// panel either overflows tiny screens or wastes space on large ones, and
// since it must also stay inside the camera's frustum as the user orbits,
// there's no single world-space size that avoids clipping on every window
// size. Instead the description is reported up to the page (via onEnter/
// onLeave/onToggle) and rendered as an ordinary responsive HTML overlay —
// see the description panel in ModelsPageInner.
function OrganLabel({ text, position, isActive, onEnter, onLeave, onToggle }) {
  const hitboxRef = useRef(null);

  useEffect(() => {
    const el = hitboxRef.current;
    if (!el) return;

    const handleEnter = () => onEnter();
    const handleLeave = () => onLeave();
    // Touch devices don't fire mouseenter/mouseleave reliably, so a tap
    // toggles the description open/closed instead.
    const handleClick = () => onToggle();

    el.addEventListener("mouseenter", handleEnter);
    el.addEventListener("mouseleave", handleLeave);
    el.addEventListener("click", handleClick);
    return () => {
      el.removeEventListener("mouseenter", handleEnter);
      el.removeEventListener("mouseleave", handleLeave);
      el.removeEventListener("click", handleClick);
    };
  }, [onEnter, onLeave, onToggle]);

  const boxWidth = Math.max(1.2, text.length * 0.075);

  return (
    <a-entity position={position} look-at="[camera]">
      {/* Hitbox: slightly larger than the visible plane so it's easy to hover/tap */}
      <a-entity
        ref={hitboxRef}
        data-raycastable
        geometry={`primitive: plane; height: 0.5; width: ${boxWidth + 0.3}`}
        material="opacity: 0; transparent: true"
        position="0 0 0.005"
      ></a-entity>

      <a-entity
        geometry={`primitive: plane; height: 0.35; width: ${boxWidth}`}
        material={`color: ${isActive ? "#4F46E5" : "#111111"}; opacity: 0.85; side: double`}
      ></a-entity>
      <a-text
        value={text}
        align="center"
        color="#FFFFFF"
        width={3}
        position="0 0 0.01"
      ></a-text>

      {/* small connector dot at the anchor point */}
      <a-entity
        geometry="primitive: sphere; radius: 0.03"
        material="color: #4F46E5"
        position="0 -0.2 0"
      ></a-entity>
    </a-entity>
  );
}
 
function ModelsPageInner() {
  const searchParams = useSearchParams();
  const requestedOrgan = searchParams.get("organ");
  const initialId = MODELS.some((m) => m.id === requestedOrgan)
    ? requestedOrgan
    : MODELS[0].id;

  const [aframeReady, setAframeReady] = useState(false);
  const [activeId, setActiveId] = useState(initialId);
  const [labelsOn, setLabelsOn] = useState(true);
  // { key, text, description } for whichever label is hovered/tapped, or
  // null. Rendered as an HTML overlay (see below) instead of in 3D space.
  const [activeLabel, setActiveLabel] = useState(null);
  const sceneRef = useRef(null);
  const active = MODELS.find((m) => m.id === activeId);

  // Load aframe only in the browser — importing it at module scope breaks
  // the Next.js server build because aframe touches `document` on load.
  useEffect(() => {
    import("aframe").then(() => setAframeReady(true));
  }, []);

  // Reload page on exiting VR (same pattern as your detection page)
  useEffect(() => {
    const node = sceneRef.current;
    if (!node || !aframeReady) return;
    const handleExitVR = () => window.location.reload();
    node.addEventListener("exit-vr", handleExitVR);
    return () => node.removeEventListener("exit-vr", handleExitVR);
  }, [aframeReady]);

  // Switching organs remounts the scene (key={active.id}) — drop any
  // description left open from the previous organ's labels.
  useEffect(() => {
    setActiveLabel(null);
  }, [activeId]);

  if (!aframeReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white text-sm">
        Loading 3D viewer…
      </div>
    );
  }
 
  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900">
        <Link href="/livecam" className="text-white text-sm">
          ← Back
        </Link>
        <span className="text-white font-semibold">{active.label}</span>
        <button
          onClick={() => setLabelsOn((v) => !v)}
          className="text-xs px-3 py-1 rounded-full bg-gray-700 text-white"
        >
          {labelsOn ? "Hide labels" : "Show labels"}
        </button>
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
 
          {/* Camera with cursor: rayOrigin "mouse" makes the raycaster follow
              the actual mouse pointer (default gaze mode stays fixed at
              screen-center, which is why it wasn't tracking the mouse). */}
          <a-entity camera look-controls="enabled: true" wasd-controls="enabled: false" position="0 1.6 0">
            <a-cursor
              cursor="rayOrigin: mouse"
              raycaster="objects: [data-raycastable]"
              fuse="false"
              material="color: #4F46E5; shader: flat"
              geometry="primitive: ring; radiusInner: 0.008; radiusOuter: 0.012"
            ></a-cursor>
          </a-entity>
 
          {/* Outer entity: fixed position, NOT rotating. Labels live here so they stay put. */}
          <a-entity position={active.position}>
            {/* Inner entity: only the mesh rotates, labels are unaffected */}
            <a-entity
              gltf-model={active.src}
              rotation={active.rotation}
              scale={active.scale}
              animation="property: rotation; to: 0 360 0; loop: true; dur: 20000; easing: linear"
            ></a-entity>
 
            {labelsOn &&
              active.labels.map((lbl, i) => {
                const key = `${active.id}-${i}`;
                return (
                  <OrganLabel
                    key={key}
                    text={lbl.text}
                    position={lbl.position}
                    isActive={activeLabel?.key === key}
                    onEnter={() =>
                      setActiveLabel({ key, text: lbl.text, description: lbl.description })
                    }
                    onLeave={() =>
                      setActiveLabel((cur) => (cur?.key === key ? null : cur))
                    }
                    onToggle={() =>
                      setActiveLabel((cur) =>
                        cur?.key === key
                          ? null
                          : { key, text: lbl.text, description: lbl.description }
                      )
                    }
                  />
                );
              })}
          </a-entity>
 
        </a-scene>

        {/* Caption heading — plain HTML instead of in-3D a-text. A-Frame's
            text renders through an SDF texture, so its sharpness depends on
            how many actual screen pixels the plane covers; that varies with
            monitor pixel density and looked blurry on standard-DPI desktop
            screens (fine on high-DPI phones). HTML text is always crisp. */}
        <div className="absolute inset-x-0 top-2 z-10 flex justify-center px-3 pointer-events-none">
          <div className="rounded bg-white/85 px-4 py-1.5 text-center text-sm font-medium text-black sm:text-base">
            {active.caption}
          </div>
        </div>

        {/* Source credit, bottom-right */}
        <div className="absolute bottom-2 right-3 text-[10px] text-gray-400 pointer-events-none">
          Source: American Lung Association / American Cancer Society
        </div>

        {/* Description panel for the active label — plain responsive HTML
            instead of a 3D-space panel, so it's never clipped by the
            camera frustum and always reflows to fit the actual window. */}
        {activeLabel && (
          <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center px-3 pb-3 sm:px-6 sm:pb-6 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-lg max-h-[45vh] overflow-y-auto rounded-lg border border-gray-700 bg-gray-900/95 p-3 shadow-lg sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-indigo-400 sm:text-base">
                  {activeLabel.text}
                </h3>
                <button
                  onClick={() => setActiveLabel(null)}
                  aria-label="Close description"
                  className="shrink-0 text-lg leading-none text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-gray-200 sm:text-sm">
                {activeLabel.description}
              </p>
            </div>
          </div>
        )}
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

export default function ModelsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-black text-white text-sm">
          Loading 3D viewer…
        </div>
      }
    >
      <ModelsPageInner />
    </Suspense>
  );
}