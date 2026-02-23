import { useState } from "react";

type GraphData = {
    data: any[];
    directed: boolean;
    multigraph: boolean;
    elements: {
        nodes: { data: Record<string, any> }[];
        edges: { data: Record<string, any> }[];
    };
};

function TestPage() {
    const [graph, setGraph] = useState<GraphData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);
        setGraph(null);

        const formData = new FormData();
        formData.append("file", file);

        fetch("http://127.0.0.1:5000/api/process", {
            method: "POST",
            body: formData,
        })
            .then((res) => {
                if (!res.ok) return res.json().then((err) => Promise.reject(err.error));
                return res.json();
            })
            .then((data) => setGraph(data))
            .catch((err) => setError(String(err)))
            .finally(() => setLoading(false));
    };

    return (
        <div style={{ padding: "24px" }}>
            <h1>Graph Test Data</h1>

            <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                style={{ marginBottom: "16px", display: "block" }}
            />

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>Error: {error}</p>}

            {graph && (
                <>
                    <p>
                        <strong>Nodes:</strong> {graph.elements.nodes.length} &nbsp;|&nbsp;
                        <strong>Edges:</strong> {graph.elements.edges.length}
                    </p>
                    <pre style={{ textAlign: "left", fontSize: "12px", overflow: "auto", maxHeight: "80vh" }}>
                        {JSON.stringify(graph, null, 2)}
                    </pre>
                </>
            )}
        </div>
    );
}

export default TestPage;