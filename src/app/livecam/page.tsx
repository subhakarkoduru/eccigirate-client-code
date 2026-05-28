"use client";

import dynamic from "next/dynamic";

const LiveCamClient = dynamic(() => import("./LiveCamClient"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <p className="text-black">Loading camera…</p>
    </div>
  ),
});

export default function LiveCamPage() {
  return <LiveCamClient />;
}
