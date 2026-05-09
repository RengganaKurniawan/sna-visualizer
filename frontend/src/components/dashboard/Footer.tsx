import React from "react";

type FooterProps = { theme: 'dark' | 'light' };

export default function Footer({ theme }: FooterProps) {
    const isLight = theme === 'light';

    return (
        <footer className={`flex items-center gap-3 px-12 py-7 border-t ${isLight ? "bg-white border-gray-200" : "bg-[#070b0d] border-white/[0.04]"}`}>
            <span className="text-lg text-[#1D9BF0] glow-blue">⬡</span>
            <span className="text-sm font-bold tracking-[0.1em] text-[var(--text-muted)]">NodeX</span>
            <span className="ml-auto text-xs font-bold tracking-widest text-[var(--text-muted)]">Built for network analysis</span>
        </footer>
    );
}