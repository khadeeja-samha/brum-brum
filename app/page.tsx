import Link from "next/link";
import { ArrowRight, ShieldAlert, Cpu, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F0F0F0] text-[#121212] flex flex-col justify-between p-4 md:p-8 selection:bg-[#D02020] selection:text-white">
      {/* Top Navigation Bar */}
      <header className="w-full flex items-center justify-between border-4 border-[#121212] bg-[#FFFFFF] p-4 shadow-[6px_6px_0px_0px_#121212]">
        <div className="flex items-center gap-3">
          {/* Bauhaus Geometric Symbol Logo */}
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-[#D02020] border-2 border-[#121212]" />
            <div className="w-5 h-5 bg-[#1040C0] border-2 border-[#121212]" />
            <div
              className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[18px] border-b-[#F0C020]"
              style={{ filter: "drop-shadow(0 0 0 #121212)" }}
            />
          </div>
          <span className="font-black text-2xl tracking-tighter uppercase">CogniTrace</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 font-bold text-xs uppercase px-3 py-1.5 bg-[#FFFFFF] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1040C0] animate-pulse border border-[#121212]" />
            <span>Audit Engine</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-[#F0C020] border border-[#121212]">Live</span>
          </div>
          <Link
            href="/mirror"
            className="bauhaus-btn bg-[#F0C020] text-[#121212] font-black uppercase text-sm px-4 py-2 border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] hover:-translate-y-0.5 transition-transform flex items-center gap-1.5"
          >
            <span>Mirror Mode</span>
          </Link>
          <Link
            href="/challenge/algebra_linear_equations"
            className="bauhaus-btn bg-[#1040C0] text-white font-black uppercase text-sm px-5 py-2 border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] hover:-translate-y-0.5 transition-transform"
          >
            Start Audit
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Col: Poster Typography & Call to Action */}
        <div className="lg:col-span-7 flex flex-col justify-between border-4 border-[#121212] bg-[#FFFFFF] p-6 md:p-10 shadow-[8px_8px_0px_0px_#121212]">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <div className="inline-block bg-[#D02020] text-white font-black text-xs md:text-sm uppercase tracking-wider px-3 py-1 border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212]">
                Active Verification Engine
              </div>
              <div className="inline-block bg-[#F0C020] text-[#121212] font-black text-xs md:text-sm uppercase tracking-wider px-3 py-1 border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212]">
                Multimodal Self-Audit Ready
              </div>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight leading-[0.9] mb-6">
              Catch The AI
              <br />
              <span className="text-[#D02020] underline decoration-[#121212] decoration-4">Lying</span> To You.
            </h1>
            <p className="text-lg md:text-xl font-medium text-[#121212] leading-relaxed max-w-xl mb-8">
              AI tutors sound convincing even when they make subtle logical errors. CogniTrace gives you full solutions with <strong>exactly one planted flaw</strong> — or uploads your own handwritten work to find flaws in your reasoning. Spot it, explain why, and prove true concept mastery.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t-4 border-[#121212]">
            <Link
              href="/challenge/algebra_linear_equations"
              className="bauhaus-btn flex items-center justify-center gap-3 bg-[#D02020] text-white font-black uppercase text-lg px-8 py-4 border-4 border-[#121212] shadow-[6px_6px_0px_0px_#121212] hover:-translate-y-1 transition-transform"
            >
              <span>Launch First Challenge</span>
              <ArrowRight className="w-6 h-6 stroke-[3]" />
            </Link>
            <Link
              href="/mirror"
              className="bauhaus-btn flex items-center justify-center gap-2 bg-[#F0C020] text-[#121212] font-black uppercase text-base px-6 py-4 border-4 border-[#121212] shadow-[6px_6px_0px_0px_#121212] hover:-translate-y-1 transition-transform"
            >
              <span>Mirror Mode (Self-Audit)</span>
            </Link>
            <Link
              href="/topics"
              className="bauhaus-btn flex items-center justify-center gap-2 bg-[#FFFFFF] text-[#121212] font-black uppercase text-base px-6 py-4 border-4 border-[#121212] shadow-[6px_6px_0px_0px_#121212] hover:-translate-y-1 transition-transform"
            >
              <span>Curriculum & Map</span>
            </Link>
          </div>
        </div>

        {/* Right Col: Geometric Visual & Interactive Blueprint */}
        <div className="lg:col-span-5 border-4 border-[#121212] bg-[#1040C0] p-8 text-white flex flex-col justify-between shadow-[8px_8px_0px_0px_#121212] relative overflow-hidden bg-bauhaus-dots">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <span className="bg-[#FFFFFF] text-[#121212] font-black text-xs uppercase px-3 py-1 border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212]">
                Verification Blueprint
              </span>
              <div className="w-6 h-6 rounded-full bg-[#F0C020] border-2 border-[#121212]" />
            </div>

            <h2 className="text-3xl font-black uppercase tracking-tight mb-4 text-white">
              The Cognitive Audit Loop
            </h2>
            <p className="font-medium text-white/90 text-sm mb-6">
              Three precise steps to break the illusion of competence.
            </p>

            <div className="space-y-4">
              <div className="bg-[#FFFFFF] text-[#121212] p-4 border-3 border-[#121212] shadow-[4px_4px_0px_0px_#121212] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D02020] text-white font-black flex items-center justify-center border-2 border-[#121212] text-sm shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase">Read the Generated Trace</h3>
                  <p className="text-xs text-[#121212]/80">Step-by-step reasoning generated with a planted flaw.</p>
                </div>
              </div>

              <div className="bg-[#FFFFFF] text-[#121212] p-4 border-3 border-[#121212] shadow-[4px_4px_0px_0px_#121212] flex items-center gap-3">
                <div className="w-8 h-8 bg-[#F0C020] text-[#121212] font-black flex items-center justify-center border-2 border-[#121212] text-sm shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase">Pinpoint & Accuse the Flaw</h3>
                  <p className="text-xs text-[#121212]/80">Select the corrupt line & formulate your rationale.</p>
                </div>
              </div>

              <div className="bg-[#FFFFFF] text-[#121212] p-4 border-3 border-[#121212] shadow-[4px_4px_0px_0px_#121212] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1040C0] text-white font-black flex items-center justify-center border-2 border-[#121212] text-sm shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase">Lock In Mastery Node</h3>
                  <p className="text-xs text-[#121212]/80">Real-time update on your Understanding Map.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 mt-6 border-t-2 border-white/40 flex justify-between items-center text-xs font-bold uppercase tracking-wider">
            <span>Active Verification Loop</span>
            <span>Zero Hallucination Leaks</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-4 border-[#121212] bg-[#FFFFFF] p-4 shadow-[4px_4px_0px_0px_#121212]">
        <div className="font-bold text-xs uppercase tracking-wider">
          CogniTrace — Prometheus AI Challenge 2026
        </div>
        <div className="flex gap-4 text-xs font-black uppercase">
          <span className="text-[#D02020]">Misconception</span>
          <span>•</span>
          <span className="text-[#F0C020]">Unstable</span>
          <span>•</span>
          <span className="text-[#1040C0]">Mastered</span>
        </div>
      </footer>
    </main>
  );
}
