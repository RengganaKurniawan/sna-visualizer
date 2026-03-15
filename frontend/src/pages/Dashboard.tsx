import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/Dashboard.css"

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

function Dashboard() {
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

    return (
        <div className="min-h-screen bg-[#070b0d] text-[#e8eaeb] overflow-y-hidden">

            {/* NAVIGATION */}
            <nav className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-12 py-4 transition-all duration-300 ${scrolled ? "nav-blur" : ""}`}>
                
                {/* LOGO */}
                <div className="flex items-center gap-2">
                    <span className="text-xl text-[#1d98f0] glow-blue">⬡</span>
                    <span className="text-base font-bold tracking-[0.1em] text-[#f0f2f3]">NodeX</span>
                </div>
                
                {/* LINKS */}
                <div>
                    {NAV_LINKS.map((l) => (
                        <button
                            key={l}
                            onClick={() => { setActive(l); goto(ID_MAP[l]); }}
                            className={`px-4 py-2 rounded text-xs tracking-widest border-none cursor-pointer transition-all duration-200
                                ${active === l
                                    ? "text-[#1D98F0] bg-[#1D98f0]/10"
                                    : "text-[#e8eaeb]/50 bg-transparent hover:text-[#e8eaeb] hover:bg-white/5"
                                }`}
                        >
                            {l}
                        </button>
                    ))}
                </div>
            </nav>

            {/* HERO */}
            <section className="relative flex min-h-screen h-screen items-center border-b border-[#1D9BF0]/10 overflow-hidden">
                <div className="px-12 pt-36 pb-24 max-w-2xl">

                    {/* SUB-TITTLE */}
                    <div className="fade-up inline-flex items-center gap-2 border border-[#1D9BF0]/30 text-[#1D9BF0] text-[0.7rem] tracking-[0.14em] uppercase px-3 py-1.5 rounded-sm mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1D9BF0] glow-dot flex-shrink-0"/>
                        Twitter Interaction Visualizer
                    </div>

                    {/* HEADLINE */}
                    <h1 className="fade-up delay-1 text-[clamp(2.4rem,5vw,4rem)] font-black leading-[1.08] tracking-[-0.02em] text-[#f0f2f3] mb-6">
                       Map the{" "} 
                       <span className="text-[#1D9BF0] glow-blue">network</span>
                       <br />behind every tweet
                    </h1>


                    {/* SUB-EXPLAINATION */}
                    <p className="fade-up delay-2 text-[1.05rem] leading-[1.75] text-[#e8eaeb]/60 max-w-lg mb-10">
                        NodeX transform raw Twitter/X data into an interactive graph —
                        revealing communities, influence, and the hidden structure of online conversations.
                    </p>

                    {/* CTA */}
                    <div className="fade-up delay-3 flex flex-wrap gap-4 mb-14">
                        <button
                            onClick={() => goto("create")}
                            className="glow-btn bg-[#1D9BF0] text-[#070b0d] font-bold text-sm tracking-widest px-8 py-3 rounded border-none cursor-pointer transition-all duration-200"
                        >
                            Launch Visualizer →
                        </button>
                        <button
                            onClick={() => goto("how")}
                            className="text-[#e8eaeb]/70 text-sm tracking-widest px-8 py-3 rounded border border-[#e8eaeb]/20 bg-transparent cursor-pointer hover:border-[#e8eaeb]/40 hover:text-[#e8eaeb] transition-all duration-200"
                        >
                            See how it works
                        </button>
                    </div>

                    {/* EDGE LEGEND */}
                    <div className="fade-up delay-4 flex flex-wrap gap-6">
                        {EDGE_TYPES.map(({ type, color }) => (
                            <div key={type} className="flex items-center gap-2">
                                <span
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ background: color, boxShadow: `0 0 6px ${color}` }}
                                />
                                <span className="text-[0.72rem] tracking-widest text-[#e8eaeb]/40">{type}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SCROLL INDICATOR */}
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 transition-opacity duration-300 ${scrolled ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                    <span
                        className="scroll-bounce block w-px h-10"
                        style={{ background: "linear-gradient(to bottom, rgba(29, 155, 240, 0.6), transparent)" }}
                    
                    />
                    <span className="text-[0.6rem] tracking-[0.22em] uppercase text-[#1D9BF0]/40">Scroll</span>
                </div>
            </section>

            {/* ABOUT */}
            <section id="about" className="py-28 px-12 bg-[#070b0d]">
                <div className="max-w-5xl mx-auto">
                    <p className="text-[0.68rem] tracking-[0.2em] uppercase text-[#1D9BF0] mb-3">About</p>
                    <h2 className="text-[clamp(1.8rem,3vw,2.6rem)] font-black leading-[1.12] tracking-tight text-[#f0f2f3] mb-6">
                        What is <span className="text-[#1D9BF0] glow-blue">NodeX</span>?
                    </h2>
                    <p className="text-base leading-[1.8] text-[#e8eaeb]/55 max-w-2xl mb-16">
                        NodeX is an interactive network graph tool built for researchers, journalists, and analysts
                        who want to understand how information flows on Twitter/X. By mapping who retweets, replies,
                        quotes, and mentions whom — NodeX turns thousands of raw interactions into a visual map of
                        influence and community.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {FEATURES.map((f) => (
                            <div
                                key={f.title}
                                className="glow-card bg-white/[0.025] border border-white/[0.06] rounded-lg p-7 transition-all duration-300 hover:bg-[#1D9BF0]/[0.04] hover:border-[#1D9BF0]/20"
                            >
                                <div 
                                    className="text-2xl text-[#1D9BF0] mb-5"
                                    style={{ textShadow: "0 0 12px rgba(29, 155, 240, 0.5)"}}
                                >
                                    {f.icon}
                                </div>
                                <div className="text-sm font-bold tracking-wide text-[#f0f2f3] mb-2">{f.title}</div>
                                <div className="text-xs leading-relaxed text-[#e8eaeb]/40">{f.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="how" className="py-28 px-12 bg-[#090d0f]">
                <div className="max-w-5xl mx-auto">
                    <p className="text-[0.68rem] tracking-[0.2em] uppercase text-[#1D9BF0] mb-3">How It Works</p>
                    <h2 className="text-[clamp(1.8rem,3vw,2.6rem)] font-black leading-[1.12] tracking-tight text-[#f0f2f3] mb-16">
                        Three steps to your{" "}
                        <span className="text-[#1D9BF0] glow-blue">network graph</span>
                    </h2>

                    {/* STEPS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                        {STEPS.map((s) => (
                            <div key={s.num}>
                                <div className="text-5xl font-black text-[#1D9BF0]/15 leading-none tracking-tighter mb-5">{s.num}</div>
                                <div className="w-8 h-0.5 bg-[#1D9BF0]/25 mb-5" />
                                <div className="text-sm font-bold text-[#f0f2f3] mb-2">{s.title}</div>
                                <div className="text-xs leading-relaxed text-[#e8eaeb]/45">{s.desc}</div>
                            </div>
                        ))}
                    </div>

                    {/* EXPLAINER BOX */}
                    <div className="border border-[#1D9BF0]/12 rounded-lg p-10 bg-[#1D9BF0]/[0.025]">
                        <p className="text-[0.68rem] tracking-[0.2em] uppercase text-[#1D9BF0]/55 mb-8">What NodeX detects</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {EDGE_TYPES.map(({ type, color, note }) => (
                                <div key={type} className="flex items-start gap-3">
                                    <div
                                        className="w-[3px] h-10 rounded-full flex-shrink-0 mt-0.5"
                                        style={{ background: color, boxShadow: `0 0 8px ${color}`}}
                                    />
                                    <div>
                                        <div className="text-sm font-bold mb-1" style={{ color }}>{type}</div>
                                        <div className="text-xs leading-relaxed text-[#e8eaeb]/38">{note}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section id="create" className="cta-glow relative py-28 px-12 bg-[#070b0d] border-t border-b border-[#1D9BF0]/08 text-center overflow-hidden">
                <div className="relative z-10 max-w-md mx-auto">
                    <p className="text-[0.68rem] tracking-[0.2em] uppercase text-[#1D9BF0] mb-3">Create Graph</p>
                    <h2 className="text-[clamp(1.8rem,2vw,2.6rem)] font-black leading-[1.12] tracking-tight text-[#f0f2f3] mb-6">
                        Ready to visualize your{" "}
                        <span className="text-[#1D9BF0] glow-blue">network?</span>
                    </h2>
                    <p className="text-base leading-[1.8] text-[#e8eaeb]/55 mb-10">
                        Upload your Twitter JSON export and NodeX will map every interaction 
                        into an explorable graph in seconds.
                    </p>
                    <button 
                        onClick={() => navigate("/visualize-graph")}
                        className="glow-btn bg-[#1D9BF0] text-[#070b0d] font-bold text-base tracking-widest px-10 py-4 rounded border-none cursor-pointer transition-all duration-200"
                    >
                        Open Visualizer →
                    </button>
                    <p className="mt-5 text-[0.7rem] tracking-widest text-[#e8eaeb]/22">
                        No account required · JSON files only
                    </p>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="flex items-center gap-3 px-12 py-7 border-t border-white/[0.04]">
                <span className="text-lg text-[#1D9BF0] glow-blue">⬡</span>
                <span className="text-sm font-bold tracking-[0.1em] text-[#e8eaeb]/40">NodeX</span>
                <span className="ml-auto text-xs tracking-widest text-[#e8eaeb]/18">Built for network analysis</span>
            </footer>

        </div>
    );
}

export default Dashboard;