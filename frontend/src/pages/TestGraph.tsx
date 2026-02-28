import React, { useEffect, useRef, useState } from "react";
import cytoscape, { NodeDefinition, EdgeDefinition } from "cytoscape"

type GraphData = {
    data: any[];
    directed: boolean;
    multigraph: boolean;
    elements: {
        nodes: { data: Record<string, any> }[];
        edges: { data: Record<string, any> }[];
    };
};

const COMMUNITY_COLORS = [
    "#E63946", // red
    "#2196F3", // blue
    "#4CAF50", // green
    "#FF9800", // orange
    "#9C27B0", // purple
    "#00BCD4", // cyan
    "#FFEB3B", // yellow
    "#F06292", // pink
    "#795548", // brown
    "#607D8B", // blue-grey
    "#00E676", // bright green
    "#FF6D00", // deep orange
]

const EDGE_COLORS: Record<string, string> = {
    reply:    "#4C9BE8",
    retweet:  "#4CE87A",
    quote:    "#E8724C",
    mentions: "#E8D94C",
};

function TestGraph() {
    const [graph, setGraph] = useState<GraphData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const cyRef = useRef<HTMLDivElement | null>(null);
    const cyInstance = useRef<cytoscape.Core | null>(null);
    const [showCommunity, setShowCommunity] = useState(false);
    const [selectedNode, setSelectedNode] = useState<{
        username: string;
        name: string;
        tweets: { id: string; text: string; created_at: string; metrics: any }[];
    } | null>(null);
    const [edgeMode, setEdgeMode] = useState<"typed" | "collapsed">("typed");
    const detailedEdgesRef = useRef<EdgeDefinition[]>([]);
    const collapsedEdgesRef = useRef<EdgeDefinition[]>([]);
    const communityIdsRef = useRef<number[]>([]);

    const handleToggleCommunity = () => {
        setShowCommunity(prev => {
            const next = !prev;
            if (!cyInstance.current) return next;

            if (next) {
                communityIdsRef.current.forEach(cid => {
                    if (!cyInstance.current!.$(`#community_${cid}`).length) {
                        cyInstance.current!.add({
                            group: "nodes",
                            data: { id: `community_${cid}` }
                        });
                    }
                });
                cyInstance.current.nodes().filter(n => !n.isParent()).forEach(node => {
                    node.move({ parent: `community_${node.data('community')}` });
                    node.style('background-color', COMMUNITY_COLORS[node.data('community') % COMMUNITY_COLORS.length] ?? '#A0A0A0');
                });
            } else {
                cyInstance.current.nodes().filter(n => !n.isParent()).forEach(node => {
                    node.move({ parent: null });
                    node.style('background-color', '#A0A0A0');
                });
                communityIdsRef.current.forEach(cid => {
                    cyInstance.current!.$(`#community_${cid}`).remove();
                })
            }

            // cyInstance.current.layout({
            //     name: 'cose',
            //     // @ts-ignore
            //     // nodeOverlap: 20,
            //     // // componentSpacing: 50,
            //     // nodeRepulsion: 5000,
            // }).run();

            return next;
        });
    };

    const handleToggleEdgeMode = () => {
        setEdgeMode(prev => {
            const next = prev === "typed" ? "collapsed" : "typed";
            if (cyInstance.current) {
                cyInstance.current.edges().remove();
                const newEdges = next === "typed"
                    ? detailedEdgesRef.current
                    : collapsedEdgesRef.current;
                cyInstance.current.add(newEdges);
                cyInstance.current.style().update();
            }
            return next;
        });
    }

    

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);
        setGraph(null);
        setShowCommunity(false);

        if (cyInstance.current) {
            cyInstance.current.destroy();
            cyInstance.current = null;
        }

        const formData = new FormData();
        formData.append("file", file);

        fetch("http://127.0.0.1:5000/api/process", {
            method: "POST",
            body: formData,
        })
            .then((res) => {
                if (!res.ok) return res.json()
                    .then((err) => Promise.reject(err.error));
                return res.json();
            })
            .then((data) => setGraph(data))
            .catch((err) => setError(String(err)))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (!graph || !cyRef.current || cyInstance.current)
            return;

        const nodes = graph.elements.nodes.map((node): NodeDefinition => ({
            ...node,
            data: {
                ...node.data,
                communityColor: COMMUNITY_COLORS[node.data.community % COMMUNITY_COLORS.length] ?? "#A0A0A0",
            },
        }));

        const edges = graph.elements.edges.map((edge): EdgeDefinition=> ({
            ...edge,
            data: {
                source: edge.data.source,
                target: edge.data.target,
                ...edge.data,
                edgeColor: EDGE_COLORS[edge.data.type] ?? "#999999",
            },
        }));

        detailedEdgesRef.current = edges;

        const edgeMap = new Map<string, EdgeDefinition>();
        edges.forEach((edge) => {
            const key = `${edge.data!.source}__${edge.data!.target}`;
            if (edgeMap.has(key)) {
                const existing = edgeMap.get(key)!;
                existing.data!.weight = (Number(existing.data!.weight) || 1) + (Number(edge.data!.weight) || 1);
            } else {
                edgeMap.set(key, {
                    data: {
                        id: `collapsed__${edge.data!.source}__${edge.data!.target}`,
                        source: edge.data!.source,
                        target: edge.data!.target,
                        weight: Number(edge.data!.weight) || 1,
                        edgeColor: "#999999"
                    }
                });
            }
        });
        collapsedEdgesRef.current = Array.from(edgeMap.values());
        communityIdsRef.current = [...new Set(nodes.map(n => n.data!.community as number))];

        cyInstance.current = cytoscape({
            container: cyRef.current,
            elements: { nodes, edges },
            style: [
                {
                    selector: "node[in_degree_centrality]",
                    style: {
                        label: "data(label)",
                        "font-size": "10px",
                        "text-valign": "bottom",
                        "text-halign": "center",
                        "background-color": "#A0A0A0",
                        width: "mapData(in_degree_centrality, 0, 1, 15, 100)",
                        height: "mapData(in_degree_centrality, 0, 1, 15, 100)",
                    },
                },
                {
                    selector: ":parent",
                    style: {
                        label: "",
                        "background-color": "#cccccc",
                        "background-opacity": 0.1,          // transparan supaya tidak mengganggu
                        "border-width": 2,
                        "border-color": "#ccc",
                        "border-style": "dashed",
                    },
                },
                {
                    selector: "edge",
                    style: {
                        width: "mapData(weight, 1, 10, 1, 6)",
                        "line-color": "data(edgeColor)",
                        "curve-style": "bezier",
                        "target-arrow-color": "data(edgeColor)",
                        "target-arrow-shape": "triangle",
                        opacity: 0.7,
                    },
                },
            ],
            layout: { 
                name: "cose",
                // idealEdgeLength: 150,        // jarak ideal antar node yang terhubung
                nodeOverlap: 100,             // seberapa jauh node didorong saat overlap
                componentSpacing: 100,       // jarak antar cluster/komponen terpisah
                nodeRepulsion: 50000,       // semakin besar = node makin saling menjauh
            },
        });

        cyInstance.current.on("tap", "node", (evt) => {
            const node = evt.target;
            if (node.isParent()) return;
            
            const rawTweets = node.data("tweets");
            const tweets = rawTweets ? JSON.parse(rawTweets) : [];
            setSelectedNode({
                username: node.data("username"),
                name: node.data("name"),
                tweets,
            });
        });

        cyInstance.current.on("tap", (evt) => {
            if (evt.target === cyInstance.current) setSelectedNode(null);
        });
    }, [graph]);

    return(
        <div style={{ padding: "24px", overflow: "hidden" }}>
            <h1>Graph Visualization</h1>

            <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                style={{ marginBottom: "12px", display: "block" }}
            />

            {loading && <p>Processing...</p>}
            {error && <p style={{ color: "red" }}>Error: {error}</p>}

            {/* Legend */}
            {graph && (
                <div style={{ display: "flex", gap: "16px", marginBottom: "12px", flexWrap: "wrap" }}>
                    {Object.entries(EDGE_COLORS).map(([type, color]) => (
                        <span key={type} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
                            <span style={{ display: "inline-block", width: "24px", height: "3px", background: color }} />
                            {type}
                        </span>
                    ))}

                    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer", marginLeft: "auto" }}>
                        <input
                            type="checkbox"
                            checked={showCommunity}
                            onChange={handleToggleCommunity}
                        />
                        Show Community
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}>
                        <input
                            type="checkbox"
                            checked={edgeMode === "collapsed"}
                            onChange={handleToggleEdgeMode}
                        />
                        Collapse Edges
                    </label>
                </div>
            )}

            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", width: "100%" }}>
                <div
                    ref={cyRef}
                    style={{
                        flex: 1,
                        minWidth: 0,
                        height: "500px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        background: "#fafafa",
                        display: graph ? "block" : "none",
                    }}
                />

                {selectedNode && (
                    <div style={{
                        width: "300px",
                        height: "600px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        padding: "16px",
                        overflowY: "auto",
                        flexShrink: 0,
                    }}>
                        <h3 style={{ margin: "0 0 4px" }}>@{selectedNode.username}</h3>
                        <p style={{ margin: "0 0 12px", color: "#666", fontSize: "13px" }}>{selectedNode.name}</p>
                        <hr />
                        {selectedNode.tweets.length === 0 ? (
                            <p style={{ color: "#888", fontSize: "13px" }}>No tweets captured for this user.</p>
                        ) : (
                            selectedNode.tweets.map((tweet) => (
                                <div key={tweet.id} style={{
                                    marginBottom: "12px",
                                    paddingBottom: "12px",
                                    borderBottom: "1px solid #eee",
                                    fontSize: "13px",
                                }}>
                                    <p style={{ margin: "0 0 4px" }}>{tweet.text}</p>
                                    <span style={{ color: "#999", fontSize: "11px" }}>
                                        {new Date(tweet.created_at).toLocaleString()}
                                    </span>
                                    {tweet.metrics && (
                                        <div style={{ display: "flex", gap: "10px", marginTop: "4px", fontSize: "11px", color: "#666" }}>
                                            <span>🔁 {tweet.metrics.retweet_count}</span>
                                            <span>💬 {tweet.metrics.reply_count}</span>
                                            <span>❤️ {tweet.metrics.like_count}</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
                {!graph && !loading && !error && (
                    <p style={{ color: "#888" }}>Upload a JSON file to visualize the graph.</p>
                )}
            </div>
        </div>
    )
}

export default TestGraph;