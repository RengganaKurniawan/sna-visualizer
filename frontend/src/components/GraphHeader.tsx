import { useNavigate } from "react-router-dom";

type GraphHeaderProps = {
    graphExists: boolean;
    nodeCount: number;
    edgeCount: number;
};

export default function GraphHeader({ graphExists, nodeCount, edgeCount }: GraphHeaderProps) {
    const navigate = useNavigate();

    return (
        <header className="tg-header">
            <span className="tg-header-dot" />
            <span className="tg-header-title">Graph Visualization</span>
            {graphExists && (
                <span className="tg-header-meta">
                    {nodeCount} nodes · {edgeCount} edges
                </span>
            )}
            <button className="tg-header-back" onClick={() => navigate("/")}>
                ← Home
            </button>
        </header>
    );
}