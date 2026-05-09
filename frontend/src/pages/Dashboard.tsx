import { useState, useEffect } from "react";
import DashboardNav from "../components/dashboard/DashboardNav";
import HeroSection from "../components/dashboard/HeroSection";
import AboutSection from "../components/dashboard/AboutSection";
import HowItWorksSection from "../components/dashboard/HowItWorksSection";
import CtaSection from "../components/dashboard/CtaSection";
import Footer from "../components/dashboard/Footer";
import "../assets/Dashboard.css";

type DashboardProps = {
    theme: 'dark' | 'light';
    onToggleTheme: () => void;
};

export default function Dashboard({ theme, onToggleTheme }: DashboardProps) {
    const [active, setActive] = useState("About");
    const [scrolled, setScrolled] = useState(false);
    
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", handleScroll);

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
                { threshold: 0.2 } 
            );

            observer.observe(el);
            observers.push(observer);
        });

        return () => {
            window.removeEventListener("scroll", handleScroll);
            observers.forEach((o) => o.disconnect());
        };
    }, []);

    return (
        <div className="min-h-screen bg-[var(--bg-root)] text-[var(--text-base)] overflow-y-hidden transition-colors duration-300">
            <DashboardNav 
                theme={theme} 
                onToggleTheme={onToggleTheme} 
                scrolled={scrolled} 
                active={active} 
                setActive={setActive} 
            />
            <HeroSection theme={theme} />
            <AboutSection theme={theme} />
            <HowItWorksSection theme={theme} />
            <CtaSection theme={theme} />
            <Footer theme={theme} />
        </div>
    );
}