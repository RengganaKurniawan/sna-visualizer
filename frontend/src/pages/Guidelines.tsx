import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/dashboard/Footer";
import "../assets/Dashboard.css";

type GuidelinesProps = {
    theme: 'dark' | 'light';
    onToggleTheme: () => void;
}

function Guidelines({ theme, onToggleTheme }: GuidelinesProps) {
    const navigate = useNavigate();
    const isLight = theme == 'light';

    return (
        <div className="min-h-screen bg-[var(--bg-root)] text-[var(--text-base)] transition-colors duration-300">

            {/* NAV */}
            <nav className="flex items-center justify-between px-12 py-6 border-b border-[#1D9BF0]/10">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
                    <span className="text-xl text-[#1d98f0] glow-blue">⬡</span>
                    <span className="text-base font-bold tracking-[0.1em] text-[var(--text-base)] hover:text-[#1d98f0] transition-colors">NodeX</span>
                </div>
                <button
                    onClick={onToggleTheme}
                    className={`glow-btn border border-[#1D9BF0]/30 text-[#1D9BF0] px-4 py-2 rounded text-xs font-bold tracking-widest transition-colors ${isLight ? 'hover:bg-[#1D9BF0]/20' : 'hover:bg-[#1D9BF0]/10'}`}
                >
                    {isLight ? '🌙 DARK' : '☀️ LIGHT'}
                </button>
            </nav>

            {/* CONTENT */}
            <div className="max-w-4xl mx-auto px-12 py-20">
                <p className="text-[0.68rem] tracking-[0.2em] uppercase text-[#1D9BF0] mb-3">Guidelines</p>
                <h1 className="text-[clamp(1.8rem,3vw,2.6rem)] font-black leading-[1.12] tracking-tight mb-6">
                    Supported Data <span className="text-[#1D9BF0] glow-blue">Format</span>
                </h1>
                <p className="text-base leading-[1.8] text-[var(--text-muted)] mb-12">
                    NodeX expects a JSON file structured exactly like the standard <strong>Twitter/X API v2</strong> response. 
                    To successfully map interactions, your file must contain a main <code className="text-[#1D9BF0]">data</code> array and an <code className="text-[#1D9BF0]">includes</code> object.
                </p>

                {/* CODE BLOCK */}
                <div className={`relative rounded-lg overflow-hidden border ${isLight ? "bg-[#f8f9fa] border-gray-200" : "bg-[#0d1117] border-[#2f3336]"} mb-12`}>
                    <div className={`flex items-center gap-2 px-4 py-3 border-b ${isLight ? "border-gray-200 bg-white" : "border-[#2f3336] bg-[#070b0d]"}`}>
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                        <span className="ml-2 text-xs font-bold tracking-widest text-[var(--text-muted)]">example_data.json</span>
                    </div>
                    <pre className="p-6 text-sm overflow-x-auto" style={{ fontFamily: "'Space Mono', monospace" }}>
                        <code className={isLight ? "text-black" : "text-[#e6edf3]"}>
{`{
  "data": [
    {
      "id": "1972293601980985805",
      "author_id": "75059213",
      "text": "RT @NodeX: Analyzing networks...",
      "referenced_tweets": [
        {
          "type": "retweeted",
          "id": "1971442159980261662"
        }
      ],
      "entities": {
        "mentions": [
          { "username": "NodeX", "id": "12345" }
        ]
      }
    }
  ],
  "includes": {
    "users": [
      {
        "id": "75059213",
        "name": "Jane Doe",
        "username": "janedoe"
      }
    ],
    "tweets": [
      {
        "id": "1971442159980261662",
        "author_id": "12345",
        "text": "Analyzing networks..."
      }
    ]
  }
}`}
                        </code>
                    </pre>
                </div>
            </div>

            {/* RULE */}
            <div className={`p-6 sm:p-10 rounded-xl border ${isLight ? "bg-gray-50 border-gray-200" : "bg-[#0d1117] border-[#2f3336]"}`}>
                    <h3 className="text-xl font-bold mb-6">Required Fields</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        <div className={`p-8 border rounded-lg ${isLight ? "border-gray-200 bg-white" : "border-[#2f3336] bg-[#070b0d]"}`}>
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-4xl font-black text-[#1D9BF0] leading-none">1</span>
                                <h4 className="text-lg font-bold text-[var(--text-base)] tracking-wide">"data" Array</h4>
                            </div>
                            <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                                Must be a list containing the primary tweets. Each tweet must have an <code className="text-[#1D9BF0]">id</code> and <code className="text-[#1D9BF0]">author_id</code>.
                            </p>
                        </div>

                        <div className={`p-8 border rounded-lg ${isLight ? "border-gray-200 bg-white" : "border-[#2f3336] bg-[#070b0d]"}`}>
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-4xl font-black text-[#1D9BF0] leading-none">2</span>
                                <h4 className="text-lg font-bold text-[var(--text-base)] tracking-wide">"includes" Object</h4>
                            </div>
                            <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                                Must contain <code className="text-[#1D9BF0]">users</code> (to map names to nodes) and <code className="text-[#1D9BF0]">tweets</code> (to resolve Retweets and Quotes).
                            </p>
                        </div>

                    </div>
                </div>

            {/* FOOTER */}
            <Footer theme={theme} />
        </div>
    )
}

export default Guidelines;