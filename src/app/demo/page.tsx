import type { Metadata } from "next";
import DemoInteractive from "./DemoInteractive";

export const metadata: Metadata = {
  title: "Try the Demo — Generate Your First AI Video",
  description:
    "Upload three photos, record a 30-second voice sample, and watch Official AI generate a studio-quality video featuring your face and voice in under five minutes. No credit card. No filming.",
  alternates: { canonical: "/demo" },
  openGraph: {
    title: "Try the Official AI Demo",
    description:
      "See how Official AI turns three photos and a 30-second voice sample into a multi-cut, studio-quality social video.",
    url: "/demo",
    type: "website",
  },
};

export default function DemoPage() {
  return (
    <>
      <section className="relative pt-28 pb-10 px-5 sm:px-8 max-w-4xl mx-auto">
        <div className="text-center">
          <p className="text-p3 uppercase tracking-[0.22em] text-white/45 mb-4">
            Interactive Demo
          </p>
          <h1 className="text-h1 sm:text-[52px] leading-[1.05] tracking-tight text-white font-semibold">
            Generate your first AI video in under five minutes.
          </h1>
          <p className="text-p1 text-white/60 mt-6 max-w-2xl mx-auto leading-relaxed">
            Upload three photos. Record a 30-second voice sample. Official AI
            builds your digital twin and generates a complete, multi-cut social
            video — using your face, your voice, and your brand tone. No
            filming, no editing, no credit card.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3 text-left">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
            <p className="text-p3 text-white/40">Step 01</p>
            <h2 className="text-p1 text-white font-semibold mt-2">
              Upload three photos
            </h2>
            <p className="text-p3 text-white/55 mt-2 leading-relaxed">
              Front-facing, slight angle, profile. Phone photos are fine. The
              engine builds a consistent 360° likeness from these three frames.
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
            <p className="text-p3 text-white/40">Step 02</p>
            <h2 className="text-p1 text-white font-semibold mt-2">
              Record a 30-second voice sample
            </h2>
            <p className="text-p3 text-white/55 mt-2 leading-relaxed">
              Read a short script on your phone. The voice model captures your
              tone, cadence, and emphasis — no studio mic required.
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
            <p className="text-p3 text-white/40">Step 03</p>
            <h2 className="text-p1 text-white font-semibold mt-2">
              Watch it build your first video
            </h2>
            <p className="text-p3 text-white/55 mt-2 leading-relaxed">
              Hook, body, CTA — stitched from 3–8 separate AI-generated cuts,
              the same multi-cut method used on the real platform. Review every
              shot before approving.
            </p>
          </div>
        </div>

        <div className="mt-14 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8">
          <h2 className="text-h3 text-white font-semibold">
            What you&apos;ll see
          </h2>
          <ul className="mt-4 space-y-2 text-p2 text-white/65 leading-relaxed">
            <li>
              <span className="text-white/90 font-medium">A real twin, not an avatar.</span>{" "}
              Detailed facial geometry, skin tone, expression, and gesture
              modeling — not a generic stock character.
            </li>
            <li>
              <span className="text-white/90 font-medium">A real script, not filler.</span>{" "}
              A hook tailored to your industry, structured like a proven format
              (market update, quick tip, myth-bust, or hook-first intro).
            </li>
            <li>
              <span className="text-white/90 font-medium">A real edit, not a one-shot clip.</span>{" "}
              3–8 cuts professionally stitched with pacing, transitions, and a
              CTA — the same Studio pipeline production customers use.
            </li>
            <li>
              <span className="text-white/90 font-medium">Full review before anything publishes.</span>{" "}
              The demo doesn&apos;t post anywhere. You see the final video,
              download it if you want, and decide whether to continue.
            </li>
          </ul>
          <p className="text-p3 text-white/40 mt-6">
            Built for financial advisors, attorneys, doctors, realtors, and any
            solo professional whose brand lives on their face and voice. For
            regulated professions, every script is fully editable before
            generation so you can run your own compliance review.
          </p>
        </div>
      </section>

      <div id="demo-interactive">
        <DemoInteractive />
      </div>
    </>
  );
}
