import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/Dashboard.css"

type DashboardProps = {
    theme: 'dark' | 'light';
    onToggleTheme: () => void;
}

const NAV_LINKS = ["About", "How It Works", "Create Graph"];

const EDGE_TYPES = [
    { type: "Reply",   color: "#4C9BE8", note: "User responded to a tweet" },
    { type: "Retweet", color: "#4CE87A", note: "User amplified another's tweet" },
    { type: "Quote",   color: "#E8724C", note: "User quoted with commentary" },
    { type: "Mention", color: "#E8D94C", note: "User referenced another account" },
];

const FEATURES = [
    { icon: "⬡", title: "Community Detection",  desc: "Automatically groups users into communities based on interaction patterns." },
    { icon: "⟶", title: "Typed Edges",          desc: "Color-coded lines distinguish retweets, replies, quotes, and mentions." },
    { icon: "◎", title: "Influence Mapping",    desc: "Node size reflects centrality — spot the most influential accounts instantly." },
    { icon: "◈", title: "Tweet Drill-Down",     desc: "Click any node to inspect that user's tweets, metrics, and engagement." },
];

const STEPS = [
    { num: "01", title: "Export Your Data",    desc: "Pull your Twitter/X dataset as a JSON file via the API or an export tool." },
    { num: "02", title: "Upload to NodeX",     desc: "Drop the file in. NodeX parses every interaction and builds the graph." },
    { num: "03", title: "Explore the Network", desc: "Pan, zoom, toggle communities, filter edges, and click nodes to explore." },
];

const ID_MAP: Record<string, string> = {
  About: "about",
  "How It Works": "how",
  "Create Graph": "create",
};

function Dashboard({ theme, onToggleTheme }: DashboardProps) {
    const navigate = useNavigate();
    const [active, setActive] = useState("About");
    const [scrolled, setScrolled] = useState(false);
    
    useEffect(() => {
        // detek scroll
        const fn = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", fn);

        // section visibility
        const sections = ["about", "how", "create"];
        const observers: IntersectionObserver[] = [];

        sections.forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        const reverseMap: Record<string, string> = {
                            about: "About",
                            how: "How It Works",
                            create: "Create Graph",
                        };
                        setActive(reverseMap[id]);
                    }
                },
                { threshold: 0.2} // berapa section muncul biar ganti
            );

            observer.observe(el);
            observers.push(observer);
        });

        return () => {
            window.removeEventListener("scroll", fn);
            observers.forEach((o) => o.disconnect());
        };
    }, []);

    const goto = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth"})

    const isLight = theme === 'light';
    const bgRoot = isLight ? "bg-[#f7f9f9]" : "bg-[#070b0d]";
    const bgAlt = isLight ? "bg-[#ffffff]" : "bg-[#090d0f]";
    const textBase = isLight ? "text-[#0f1419]" : "text-[#f0f2f3]";
    const textMuted = isLight ? "text-[#536471]" : "text-[#8b98a5]";

    return (
        <div className={`min-h-screen ${bgRoot} ${textBase} overflow-y-hidden transition-colors duration-300`}>

            {/* NAVIGATION */}
            <nav className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-12 py-4 transition-all duration-300 ${scrolled ? "nav-blur" : ""}`}>
                
                {/* LOGO */}
                <div className="flex items-center gap-2">
                    <span className="text-xl text-[#1d98f0] glow-blue">⬡</span>
                    <span className={`text-base font-bold tracking-[0.1em] ${isLight ? "text-[#0f1419]" : "text-[#f0f2f3]"}`}>NodeX</span>
                </div>
                
                {/* LINKS & THEME */}
                <div className="flex items-center gap-6">
                    <div>
                        {NAV_LINKS.map((l) => (
                            <button
                                key={l}
                                onClick={() => { setActive(l); goto(ID_MAP[l]); }}
                                className={`px-4 py-2 rounded text-xs tracking-widest border-none cursor-pointer transition-all duration-200
                                    ${active === l
                                        ? "text-[#1D98F0] bg-[#1D98f0]/10 font-bold"
                                        : `${textMuted} hover:${textBase} hover:bg-black/5 bg-transparent`
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
            </nav>

            {/* HERO */}
            <section className="relative flex min-h-screen h-screen items-center border-b border-[#1D9BF0]/10 overflow-hidden">
                <div className="px-12 pt-36 pb-24 max-w-2xl">
                    <div className="fade-up inline-flex items-center gap-2 border border-[#1D9BF0]/30 text-[#1D9BF0] text-[0.7rem] tracking-[0.14em] uppercase px-3 py-1.5 rounded-sm mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1D9BF0] glow-dot flex-shrink-0"/>
                        Twitter Interaction Visualizer
                    </div>

                    <h1 className={`fade-up delay-1 text-[clamp(2.4rem,5vw,4rem)] font-black leading-[1.08] tracking-[-0.02em] ${isLight ? "text-[#0f1419]" : "text-[#f0f2f3]"} mb-6`}>
                       Map the <span className="text-[#1D9BF0] glow-blue">network</span><br />behind every tweet
                    </h1>

                    <p className={`fade-up delay-2 text-[1.05rem] leading-[1.75] ${textMuted} max-w-lg mb-10`}>
                        NodeX transform raw Twitter/X data into an interactive graph —
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
                            className={`text-sm tracking-widest px-8 py-3 rounded border bg-transparent cursor-pointer transition-all duration-200 ${textMuted} border-gray-400 hover:border-gray-500 hover:${textBase}`}
                        >
                            See how it works
                        </button>
                    </div>

                    <div className="fade-up delay-4 flex flex-wrap gap-6">
                        {EDGE_TYPES.map(({ type, color }) => (
                            <div key={type} className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                                <span className={`text-[0.75rem] font-bold tracking-widest ${textMuted}`}>{type}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 transition-opacity duration-300 ${scrolled ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                    <span className="scroll-bounce block w-px h-10" style={{ background: "linear-gradient(to bottom, rgba(29, 155, 240, 0.6), transparent)" }} />
                    <span className="text-[0.6rem] tracking-[0.22em] uppercase text-[#1D9BF0] font-bold">Scroll</span>
                </div>
            </section>

            {/* ABOUT */}
            <section id="about" className={`py-28 px-12 ${bgRoot} transition-colors duration-300`}>
                <div className="max-w-5xl mx-auto">
                    <p className="text-[0.68rem] tracking-[0.2em] uppercase text-[#1D9BF0] mb-3">About</p>
                    <h2 className={`text-[clamp(1.8rem,3vw,2.6rem)] font-black leading-[1.12] tracking-tight ${isLight ? "text-[#0f1419]" : "text-[#f0f2f3]"} mb-6`}>
                        What is <span className="text-[#1D9BF0] glow-blue">NodeX</span>?
                    </h2>
                    <p className={`text-base leading-[1.8] ${textMuted} max-w-2xl mb-16`}>
                        NodeX is an interactive network graph tool built for researchers, journalists, and analysts
                        who want to understand how information flows on Twitter/X.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {FEATURES.map((f) => (
                            <div key={f.title} className={`glow-card border rounded-lg p-7 transition-all duration-300 hover:border-[#1D9BF0]/40 ${isLight ? "bg-white border-gray-200 shadow-sm" : "bg-white/[0.025] border-white/[0.06] hover:bg-[#1D9BF0]/[0.04]"}`}>
                                <div className="text-2xl text-[#1D9BF0] mb-5" style={{ textShadow: "0 0 12px rgba(29, 155, 240, 0.5)"}}>{f.icon}</div>
                                <div className={`text-sm font-bold tracking-wide ${isLight ? "text-[#0f1419]" : "text-[#f0f2f3]"} mb-2`}>{f.title}</div>
                                <div className={`text-xs leading-relaxed ${textMuted}`}>{f.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="how" className={`py-28 px-12 ${bgAlt} transition-colors duration-300`}>
                <div className="max-w-5xl mx-auto">
                    <p className="text-[0.68rem] tracking-[0.2em] uppercase text-[#1D9BF0] mb-3">How It Works</p>
                    <h2 className={`text-[clamp(1.8rem,3vw,2.6rem)] font-black leading-[1.12] tracking-tight ${isLight ? "text-[#0f1419]" : "text-[#f0f2f3]"} mb-16`}>
                        Three steps to your <span className="text-[#1D9BF0] glow-blue">network graph</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                        {STEPS.map((s) => (
                            <div key={s.num}>
                                <div className="text-5xl font-black text-[#1D9BF0] leading-none tracking-tighter mb-5">{s.num}</div>
                                <div className="w-8 h-0.5 bg-[#1D9BF0]/25 mb-5" />
                                <div className={`text-sm font-bold ${isLight ? "text-[#0f1419]" : "text-[#f0f2f3]"} mb-2`}>{s.title}</div>
                                <div className={`text-xs leading-relaxed ${textMuted}`}>{s.desc}</div>
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
                                        <div className={`text-xs leading-relaxed ${textMuted}`}>{note}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section id="create" className={`cta-glow relative py-28 px-12 ${bgRoot} border-t border-b ${isLight ? "border-gray-200" : "border-[#1D9BF0]/08"} text-center overflow-hidden transition-colors duration-300`}>
                <div className="relative z-10 max-w-md mx-auto">
                    <p className="text-[0.68rem] tracking-[0.2em] uppercase text-[#1D9BF0] mb-3">Create Graph</p>
                    <h2 className={`text-[clamp(1.8rem,2vw,2.6rem)] font-black leading-[1.12] tracking-tight ${isLight ? "text-[#0f1419]" : "text-[#f0f2f3]"} mb-6`}>
                        Ready to visualize your <span className="text-[#1D9BF0] glow-blue">network?</span>
                    </h2>
                    <p className={`text-base leading-[1.8] ${textMuted} mb-10`}>
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

            {/* FOOTER */}
            <footer className={`flex items-center gap-3 px-12 py-7 border-t ${isLight ? "bg-white border-gray-200" : "bg-[#070b0d] border-white/[0.04]"}`}>
                <span className="text-lg text-[#1D9BF0] glow-blue">⬡</span>
                <span className={`text-sm font-bold tracking-[0.1em] ${textMuted}`}>NodeX</span>
                <span className={`ml-auto text-xs font-bold tracking-widest ${textMuted}`}>Built for network analysis</span>
            </footer>

        </div>
    );
}

export default Dashboard;