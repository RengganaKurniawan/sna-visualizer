import { useNavigate } from "react-router-dom";

type GraphHeaderProps = {
    graphExists: boolean;
    nodeCount: number;
    edgeCount: number;
    theme: 'dark' | 'light';
    onToggleTheme: () => void;
};

export default function GraphHeader({ graphExists, nodeCount, edgeCount, theme, onToggleTheme }: GraphHeaderProps) {
    const navigate = useNavigate();

    return (
        <header className="tg-header">
            <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1 }}>
                <span className="tg-header-dot" />
                <span className="tg-header-title">Graph Visualization</span>
                {graphExists && (
                    <span className="tg-header-meta">
                        {nodeCount} nodes · {edgeCount} edges
                    </span>
                )}
            </div>
            
            {/* THEME TOGGLE */}
            <button
                onClick={onToggleTheme}
                style={{
                    padding: "5px 12px",
                    background: "transparent",
                    border: "1px solid var(--border-accent)",
                    color: "var(--text-secondary)",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "10px",
                    fontWeight: "bold",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    transition: "all 0.2s"
                }}
            >
                {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>

            {/* HOME */}
            <button className="tg-header-back" onClick={() => navigate("/")}>
                ← Home
            </button>
        </header>
    );
}