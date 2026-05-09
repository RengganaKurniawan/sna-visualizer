import React from "react";
import { useNavigate } from "react-router-dom";
import { EDGE_TYPES } from "../../constants/dashboardData";

type HeroProps = { theme: 'dark' | 'light' };

export default function HeroSection({ theme }: HeroProps) {
    const navigate = useNavigate();
    const isLight = theme === 'light';
    const goto = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

    return (
        <section className="relative flex min-h-screen h-screen items-center justify-center border-b border-[#1D9BF0]/10 overflow-hidden">
            <div className="w-full max-w-screen-2xl px-12 pt-36 pb-24">
                <div className="max-w-2xl">
                    <div className="fade-up inline-flex items-center gap-2 border border-[#1D9BF0]/30 text-[#1D9BF0] text-[0.7rem] tracking-[0.14em] uppercase px-3 py-1.5 rounded-sm mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1D9BF0] glow-dot flex-shrink-0"/>
                        Twitter Interaction Visualizer
                    </div>

                    <h1 className="fade-up delay-1 text-[clamp(2.4rem,5vw,4rem)] font-black leading-[1.08] tracking-[-0.02em] text-[var(--text-base)] mb-6">
                       Map the <span className="text-[#1D9BF0] glow-blue">network</span><br />behind every tweet
                    </h1>

                    <p className="fade-up delay-2 text-[1.05rem] leading-[1.75] text-[var(--text-muted)] max-w-lg mb-10">
                        NodeX transforms raw Twitter/X data into an interactive graph —
                        revealing communities, influence, and the hidden structure of online conversations.
                    </p>

                    <div className="fade-up delay-3 flex flex-wrap gap-4 mb-14">
                        <button
                            onClick={() => navigate("/visualize-graph")}
                            className={`glow-btn bg-[#1D9BF0] ${isLight ? "text-white" : "text-[#070b0d]"} font-bold text-sm tracking-widest px-8 py-3 rounded border-none cursor-pointer transition-all duration-200`}
                        >
                            Launch Visualizer →
                        </button>
                        <button
                            onClick={() => goto("how")}
                            className="text-sm tracking-widest px-8 py-3 rounded border bg-transparent cursor-pointer transition-all duration-200 text-[var(--text-muted)] border-gray-400 hover:border-gray-500 hover:text-[var(--text-base)]"
                        >
                            See how it works
                        </button>
                    </div>

                    <div className="fade-up delay-4 flex flex-wrap gap-6">
                        {EDGE_TYPES.map(({ type, color }) => (
                            <div key={type} className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                                <span className="text-[0.75rem] font-bold tracking-widest text-[var(--text-muted)]">{type}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 transition-opacity duration-300">
                <span className="scroll-bounce block w-px h-10" style={{ background: "linear-gradient(to bottom, rgba(29, 155, 240, 0.6), transparent)" }} />
                <span className="text-[0.6rem] tracking-[0.22em] uppercase text-[#1D9BF0] font-bold">Scroll</span>
            </div>
        </section>
    );
}