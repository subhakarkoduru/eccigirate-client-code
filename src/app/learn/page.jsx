"use client";
import React from "react";
import Link from "next/link";
 
// Curated, authoritative outbound resources. Linking out (not rehosting)
// keeps everything on the right side of copyright — especially for VFHY's
// form-gated lessons, which should be accessed through their own site.
const RESOURCES = [
  {
    name: "VFHY — Prevention Lessons",
    desc: "Virginia Foundation for Healthy Youth's free K–12 nicotine prevention lessons (English & Spanish), correlated to Virginia SOL standards.",
    href: "https://vfhy.org/prevention-lessons/",
    tag: "Curriculum",
  },
  {
    name: "CDC — E-Cigarettes & Youth",
    desc: "Federal data and fact sheets on youth vaping prevalence, health risks, and nicotine's effect on the developing brain.",
    href: "https://www.cdc.gov/tobacco/e-cigarettes/youth.html",
    tag: "Data & facts",
  },
  {
    name: "American Lung Association",
    desc: "Plain-language explanations of what vaping does to the lungs and the rest of the body, plus quitting resources.",
    href: "https://www.lung.org/quit-smoking/e-cigarettes-vaping",
    tag: "Health effects",
  },
  {
    name: "FDA — Youth Tobacco Survey",
    desc: "The latest National Youth Tobacco Survey results and the science behind tobacco product regulation.",
    href: "https://www.fda.gov/tobacco-products/youth-and-tobacco/results-annual-national-youth-tobacco-survey-nyts",
    tag: "Research",
  },
  {
    name: "Truth Initiative — This Is Quitting",
    desc: "A free, confidential, text-based quit-vaping program built for teens and young adults.",
    href: "https://truthinitiative.org/thisisquitting",
    tag: "Get help",
  },
];
 
const ORGANS = [
  { id: "lungs", label: "Lungs", blurb: "See healthy vs. smoker's lung and the damage vaping can cause." },
  { id: "heart", label: "Heart", blurb: "How nicotine strains heart rate, blood pressure, and rhythm." },
  { id: "brain", label: "Brain", blurb: "Why the developing brain is especially vulnerable to nicotine." },
];
 
// Inline slide viewer: renders a PDF page-by-page to a canvas using pdf.js
// (loaded from CDN on the client only, so it never runs during the Next.js
// server build). Gives real slideshow UX — prev/next, arrow keys, page
// counter, fullscreen, and a download link — while keeping the deck as a
// single file.
function SlideViewer({ pdfUrl, downloadUrl }) {
  const canvasRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const pdfRef = React.useRef(null);
  const renderTaskRef = React.useRef(null);
  const [numPages, setNumPages] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
 
  // Load pdf.js from CDN once, then open the document.
  React.useEffect(() => {
    let cancelled = false;
 
    const ensurePdfJs = () =>
      new Promise((resolve, reject) => {
        if (window.pdfjsLib) return resolve(window.pdfjsLib);
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = () => {
          try {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
            resolve(window.pdfjsLib);
          } catch (e) {
            reject(e);
          }
        };
        script.onerror = reject;
        document.body.appendChild(script);
      });
 
    (async () => {
      try {
        const pdfjsLib = await ensurePdfJs();
        const doc = await pdfjsLib.getDocument(pdfUrl).promise;
        if (cancelled) return;
        pdfRef.current = doc;
        setNumPages(doc.numPages);
        setLoading(false);
      } catch (e) {
        console.error("PDF load failed:", e);
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    })();
 
    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);
 
  // Render the current page whenever it changes.
  React.useEffect(() => {
    const doc = pdfRef.current;
    const canvas = canvasRef.current;
    if (!doc || !canvas) return;
 
    let cancelled = false;
    (async () => {
      try {
        const pdfPage = await doc.getPage(page);
        if (cancelled) return;
 
        const containerWidth = containerRef.current
          ? containerRef.current.clientWidth
          : 900;
        const baseViewport = pdfPage.getViewport({ scale: 1 });
        const scale = Math.min(2, containerWidth / baseViewport.width);
        const viewport = pdfPage.getViewport({ scale });
 
        const ratio = window.devicePixelRatio || 1;
        canvas.width = viewport.width * ratio;
        canvas.height = viewport.height * ratio;
        canvas.style.width = "100%";
        canvas.style.height = "auto";
 
        const ctx = canvas.getContext("2d");
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
 
        if (renderTaskRef.current) {
          try { renderTaskRef.current.cancel(); } catch (e) {}
        }
        renderTaskRef.current = pdfPage.render({
          canvasContext: ctx,
          viewport,
        });
        await renderTaskRef.current.promise;
      } catch (e) {
        if (e && e.name !== "RenderingCancelledException") {
          console.error("Page render failed:", e);
        }
      }
    })();
 
    return () => {
      cancelled = true;
    };
  }, [page, numPages]);
 
  const go = React.useCallback(
    (dir) => {
      setPage((p) => Math.min(numPages || 1, Math.max(1, p + dir)));
    },
    [numPages]
  );
 
  // Keyboard navigation when the viewer is focused/hovered.
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    const node = containerRef.current;
    if (node) node.addEventListener("keydown", onKey);
    return () => {
      if (node) node.removeEventListener("keydown", onKey);
    };
  }, [go]);
 
  const enterFullscreen = () => {
    const node = containerRef.current;
    if (node && node.requestFullscreen) node.requestFullscreen();
  };
 
  if (error) {
    return (
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 text-center">
        <p className="text-gray-400 text-sm mb-4">
          The slide preview couldn&apos;t load, but you can still download the deck.
        </p>
        <a
          href={downloadUrl}
          download
          className="inline-block px-5 py-2.5 rounded-full bg-teal-500 text-black font-semibold text-sm hover:bg-teal-400 transition-colors"
        >
          Download slides
        </a>
      </div>
    );
  }
 
  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
      {/* Canvas stage */}
      <div
        ref={containerRef}
        tabIndex={0}
        className="relative bg-black flex items-center justify-center outline-none"
        style={{ minHeight: "220px" }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
            Loading slides…
          </div>
        )}
        <canvas ref={canvasRef} className="block max-w-full" />
 
        {/* Prev / Next overlay arrows */}
        {!loading && numPages > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              disabled={page <= 1}
              aria-label="Previous slide"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 text-white text-xl flex items-center justify-center disabled:opacity-30 hover:bg-black/80 transition"
            >
              ‹
            </button>
            <button
              onClick={() => go(1)}
              disabled={page >= numPages}
              aria-label="Next slide"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 text-white text-xl flex items-center justify-center disabled:opacity-30 hover:bg-black/80 transition"
            >
              ›
            </button>
          </>
        )}
      </div>
 
      {/* Control bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-t border-gray-800">
        <span className="text-gray-400 text-sm tabular-nums">
          {loading ? "—" : `${page} / ${numPages}`}
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={enterFullscreen}
            className="text-gray-300 text-sm hover:text-white transition"
          >
            Fullscreen
          </button>
          <a
            href={downloadUrl}
            download
            className="px-4 py-1.5 rounded-full bg-teal-500 text-black font-semibold text-sm hover:bg-teal-400 transition-colors"
          >
            Download
          </a>
        </div>
      </div>
    </div>
  );
}
 
export default function LearnPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 sticky top-0 z-10">
        <Link href="/livecam" className="text-white text-sm">
          ← Back
        </Link>
        <span className="text-white font-semibold">Learn</span>
        <span className="w-12" />
      </div>
 
      {/* Hero */}
      <section className="px-6 pt-10 pb-8 max-w-3xl mx-auto text-center">
        <p className="text-sm font-semibold tracking-widest text-teal-400 mb-3">
          THE TRUTH ABOUT VAPING
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          What e-cigarettes really do to your body
        </h1>
        <p className="text-gray-400 text-base leading-relaxed">
          No vape is safe — but the sooner you understand the risks, the easier it
          is to make a healthy choice. Explore the interactive models, the slides,
          and trusted resources below.
        </p>
      </section>
 
      {/* 3D models */}
      <section className="px-6 py-8 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-1">Explore in 3D</h2>
        <p className="text-gray-400 text-sm mb-5">
          Rotate and tap the labels to see how vaping affects each organ.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ORGANS.map((o) => (
            <Link
              key={o.id}
              href={`/models?organ=${o.id}`}
              className="block rounded-xl bg-gray-900 border border-gray-800 p-5 hover:border-teal-500 transition-colors"
            >
              <div className="text-lg font-semibold text-teal-400 mb-1">
                {o.label}
              </div>
              <p className="text-gray-400 text-sm leading-snug">{o.blurb}</p>
              <span className="inline-block mt-3 text-xs text-teal-300">
                View model →
              </span>
            </Link>
          ))}
        </div>
      </section>
 
      {/* Slides */}
      <section className="px-6 py-8 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-1">Educational slides</h2>
        <p className="text-gray-400 text-sm mb-5">
          A short, source-backed overview — flip through below or download it.
        </p>
        <SlideViewer
          pdfUrl="/slides/vaping_education.pdf"
          downloadUrl="/slides/vaping_education.pptx"
        />
      </section>
 
      {/* Resources */}
      <section className="px-6 py-8 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-1">Trusted resources</h2>
        <p className="text-gray-400 text-sm mb-5">
          These link out to the organizations that produced them.
        </p>
        <div className="space-y-3">
          {RESOURCES.map((r) => (
            <a
              key={r.href}
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl bg-gray-900 border border-gray-800 p-5 hover:border-teal-500 transition-colors"
            >
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="text-base font-semibold">{r.name}</span>
                <span className="shrink-0 text-[11px] uppercase tracking-wide text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded-full">
                  {r.tag}
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-snug">{r.desc}</p>
            </a>
          ))}
        </div>
      </section>
 
      {/* Quit help callout */}
      <section className="px-6 py-8 max-w-4xl mx-auto">
        <div className="rounded-xl bg-teal-900/40 border border-teal-700 p-6 text-center">
          <p className="text-sm font-semibold tracking-wide text-teal-300 mb-2">
            FREE & CONFIDENTIAL
          </p>
          <div className="text-2xl font-bold mb-2">Thinking about quitting?</div>
          <p className="text-gray-300 text-sm mb-4 max-w-md mx-auto">
            Text <span className="font-bold text-white">DITCHVAPE</span> to{" "}
            <span className="font-bold text-white">88709</span> for free, text-based
            support built for young people, from Truth Initiative.
          </p>
        </div>
      </section>
 
      <footer className="px-6 py-8 text-center text-xs text-gray-600">
        Educational use · Sources: CDC, FDA, American Lung Association, VFHY, Truth Initiative
      </footer>
    </div>
  );
}