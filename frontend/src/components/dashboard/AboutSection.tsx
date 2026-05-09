import React from "react";
import { FEATURES } from "../../constants/dashboardData";

type AboutProps = { theme: 'dark' | 'light' };

export default function AboutSection({ theme }: AboutProps) {
    const isLight = theme === 'light';

    return (
        <section id="about" className="py-28 px-12 bg-[var(--bg-root)] transition-colors duration-300">
            <div className="max-w-5xl mx-auto">
                <p className="text-[0.68rem] tracking-[0.2em] uppercase text-[#1D9BF0] mb-3">About</p>
                <h2 className="text-[clamp(1.8rem,3vw,2.6rem)] font-black leading-[1.12] tracking-tight text-[var(--text-base)] mb-6">
                    What is <span className="text-[#1D9BF0] glow-blue">NodeX</span>?
                </h2>
                <p className="text-base leading-[1.8] text-[var(--text-muted)] max-w-2xl mb-16">
                    NodeX is an interactive network graph tool built for researchers, journalists, and analysts
                    who want to understand how information flows on Twitter/X.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {FEATURES.map((f) => (
                        <div key={f.title} className={`glow-card border rounded-lg p-7 transition-all duration-300 hover:border-[#1D9BF0]/40 ${isLight ? "bg-white border-gray-200 shadow-sm" : "bg-white/[0.025] border-white/[0.06] hover:bg-[#1D9BF0]/[0.04]"}`}>
                            <div className="text-2xl text-[#1D9BF0] mb-5" style={{ textShadow: "0 0 12px rgba(29, 155, 240, 0.5)"}}>{f.icon}</div>
                            <div className="text-sm font-bold tracking-wide text-[var(--text-base)] mb-2">{f.title}</div>
                            <div className="text-xs leading-relaxed text-[var(--text-muted)]">{f.desc}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}