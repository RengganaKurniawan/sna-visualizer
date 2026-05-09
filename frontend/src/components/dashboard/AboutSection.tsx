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
                
                <div className="w-full h-px my-16 bg-gradient-to-r from-transparent via-[#1D9BF0]/30 to-transparent transition-opacity duration-300" />

                {/* node roles */}
                <div className={`p-8 md:p-10 rounded-xl border ${isLight ? "bg-gray-50 border-gray-200" : "bg-[#0d1117] border-[#2f3336]"}`}>
                    <div className="mb-8 border-b border-[#1D9BF0]/10 pb-6">
                        <h3 className="text-xl font-bold text-[var(--text-base)] mb-2">Social Network Analysis (SNA) Roles</h3>
                        <p className="text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
                            NodeX automatically analyzes the in-degree (mentions received) and out-degree (mentions sent) of every user. Based on the 80th percentile threshold of your specific dataset, key players are visually tagged:
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* hub */}
                        <div className="flex items-start gap-4">
                            <div className="text-2xl text-[#1D9BF0] mt-1 drop-shadow-[0_0_8px_rgba(29,155,240,0.5)]">★</div>
                            <div>
                                <h4 className="text-sm font-bold text-[var(--text-base)] mb-1">Community Hub</h4>
                                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                    <strong>High In / High Out.</strong> The central connectors of the network. They receive a massive amount of attention and actively engage with others in return.
                                </p>
                            </div>
                        </div>

                        {/* influencer */}
                        <div className="flex items-start gap-4">
                            <div className="text-2xl text-[#1D9BF0] mt-0.5 drop-shadow-[0_0_8px_rgba(29,155,240,0.5)]">▲</div>
                            <div>
                                <h4 className="text-sm font-bold text-[var(--text-base)] mb-1">Influencer</h4>
                                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                    <strong>High In / Low Out.</strong> Highly targeted by the network. People talk to or about them constantly, but they rarely reply or amplify others.
                                </p>
                            </div>
                        </div>

                        {/* broadcaster */}
                        <div className="flex items-start gap-4">
                            <div className="text-2xl text-[#1D9BF0] mt-1 drop-shadow-[0_0_8px_rgba(29,155,240,0.5)]">◆</div>
                            <div>
                                <h4 className="text-sm font-bold text-[var(--text-base)] mb-1">Broadcaster</h4>
                                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                    <strong>Low In / High Out.</strong> The amplifiers. They push large amounts of content, mentions, or retweets outward, but receive little direct engagement back.
                                </p>
                            </div>
                        </div>

                        {/* peripheral */}
                        <div className="flex items-start gap-4">
                            <div className="text-2xl text-[#1D9BF0] mt-1 drop-shadow-[0_0_8px_rgba(29,155,240,0.5)]">●</div>
                            <div>
                                <h4 className="text-sm font-bold text-[var(--text-base)] mb-1">Peripheral</h4>
                                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                    <strong>Low In / Low Out.</strong> Standard users forming the outer edges of the conversation. They participate, but don't drive the network's core structure.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}