import React from "react";
import { useNavigate } from "react-router-dom";

type CtaProps = { theme: 'dark' | 'light' };

export default function CtaSection({ theme }: CtaProps) {
    const navigate = useNavigate();
    const isLight = theme === 'light';

    return (
        <section id="create" className={`cta-glow relative py-28 px-12 bg-[var(--bg-root)] border-t border-b ${isLight ? "border-gray-200" : "border-[#1D9BF0]/08"} text-center overflow-hidden transition-colors duration-300`}>
            <div className="relative z-10 max-w-md mx-auto">
                <p className="text-[0.68rem] tracking-[0.2em] uppercase text-[#1D9BF0] mb-3">Create Graph</p>
                <h2 className="text-[clamp(1.8rem,2vw,2.6rem)] font-black leading-[1.12] tracking-tight text-[var(--text-base)] mb-6">
                    Ready to visualize your <span className="text-[#1D9BF0] glow-blue">network?</span>
                </h2>
                <p className="text-base leading-[1.8] text-[var(--text-muted)] mb-10">
                    Upload your Twitter JSON export and NodeX will map every interaction into an explorable graph in seconds.
                </p>
                <button 
                    onClick={() => navigate("/visualize-graph")}
                    className={`glow-btn bg-[#1D9BF0] ${isLight ? "text-white" : "text-[#070b0d]"} font-bold text-base tracking-widest px-10 py-4 rounded border-none cursor-pointer transition-all duration-200`}
                >
                    Open Visualizer →
                </button>
            </div>
        </section>
    );
}