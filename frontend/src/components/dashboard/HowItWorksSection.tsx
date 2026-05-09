import React from "react";
import { STEPS, EDGE_TYPES } from "../../constants/dashboardData";

type HowItWorksProps = { theme: 'dark' | 'light' };

export default function HowItWorksSection({ theme }: HowItWorksProps) {
    const isLight = theme === 'light';

    return (
        <section id="how" className="py-28 px-12 bg-[var(--bg-alt)] transition-colors duration-300">
            <div className="max-w-5xl mx-auto">
                <p className="text-[0.68rem] tracking-[0.2em] uppercase text-[#1D9BF0] mb-3">How It Works</p>
                <h2 className="text-[clamp(1.8rem,3vw,2.6rem)] font-black leading-[1.12] tracking-tight text-[var(--text-base)] mb-16">
                    Three steps to your <span className="text-[#1D9BF0] glow-blue">network graph</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                    {STEPS.map((s) => (
                        <div key={s.num}>
                            <div className="text-5xl font-black text-[#1D9BF0] leading-none tracking-tighter mb-5">{s.num}</div>
                            <div className="w-8 h-0.5 bg-[#1D9BF0]/25 mb-5" />
                            <div className="text-sm font-bold text-[var(--text-base)] mb-2">{s.title}</div>
                            <div className="text-xs leading-relaxed text-[var(--text-muted)]">{s.desc}</div>
                        </div>
                    ))}
                </div>

                <div className={`border rounded-lg p-10 ${isLight ? "bg-[#1D9BF0]/5 border-[#1D9BF0]/20" : "bg-[#1D9BF0]/[0.025] border-[#1D9BF0]/12"}`}>
                    <p className="text-[0.68rem] tracking-[0.2em] uppercase text-[#1D9BF0] font-bold mb-8">What NodeX detects</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {EDGE_TYPES.map(({ type, color, note }) => (
                            <div key={type} className="flex items-start gap-3">
                                <div className="w-[3px] h-10 rounded-full flex-shrink-0 mt-0.5" style={{ background: color, boxShadow: `0 0 8px ${color}`}} />
                                <div>
                                    <div className="text-sm font-bold mb-1" style={{ color }}>{type}</div>
                                    <div className="text-xs leading-relaxed text-[var(--text-muted)]">{note}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}