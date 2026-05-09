import React from "react";
import { NAV_LINKS, ID_MAP } from "../../constants/dashboardData";

type DashboardNavProps = {
    theme: 'dark' | 'light';
    onToggleTheme: () => void;
    scrolled: boolean;
    active: string;
    setActive: (val: string) => void;
};

export default function DashboardNav({ theme, onToggleTheme, scrolled, active, setActive }: DashboardNavProps) {
    const isLight = theme === 'light';
    const goto = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

    return (
        <nav className={`fixed inset-x-0 top-0 z-50 flex justify-center py-4 transition-all duration-300 ${scrolled ? "nav-blur" : ""}`}>
            <div className="w-full max-w-screen-2xl px-12 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xl text-[#1d98f0] glow-blue">⬡</span>
                    <span className="text-base font-bold tracking-[0.1em] text-[var(--text-base)]">NodeX</span>
                </div>
                
                <div className="flex items-center gap-6">
                    <div>
                        {NAV_LINKS.map((l) => (
                            <button
                                key={l}
                                onClick={() => { setActive(l); goto(ID_MAP[l]); }}
                                className={`px-4 py-2 rounded text-xs tracking-widest border-none cursor-pointer transition-all duration-200
                                    ${active === l
                                        ? "text-[#1D98F0] bg-[#1D98f0]/10 font-bold"
                                        : "text-[var(--text-muted)] hover:text-[var(--text-base)] hover:bg-black/5 bg-transparent"
                                    }`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                    
                    <button
                        onClick={onToggleTheme}
                        className={`glow-btn border border-[#1D9BF0]/30 text-[#1D9BF0] px-4 py-2 rounded text-xs font-bold tracking-widest transition-colors ${isLight ? 'hover:bg-[#1D9BF0]/20' : 'hover:bg-[#1D9BF0]/10'}`}
                    >
                        {isLight ? '🌙 DARK' : '☀️ LIGHT'}
                    </button>
                </div>
            </div>
        </nav>
    );
}