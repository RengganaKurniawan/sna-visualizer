import React, { useEffect, useRef, useState } from "react";
import cytoscape, { NodeDefinition, EdgeDefinition } from "cytoscape"
import "../assets/TestGraph.css"

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
    "#E63946", "#2196F3", "#4CAF50", "#FF9800", "#9C27B0", 
    "#00BCD4", "#FFEB3B", "#F06292", "#795548", "#607D8B", 
    "#00E676", "#FF6D00", 
]

const EDGE_COLORS: Record<string, string> = {
    reply:    "#4C9BE8",
    retweet:  "#4CE87A",
    quote:    "#E8724C",
    mentions: "#E8D94C",
};

// Toggle Switch
function ToggelSwitch({ checked, onChange }: {checked: boolean; onChange: () => void }) {
    return ( 
        <label className="tg-switch">
            <input type="checkbox" checked={checked} onChange={onChange} />
            <span className="tg-switch-track"/>
            <span className="tg-switch-thumb"/>
        </label>
    )
}

// Main
function TestGraph() {
    const [graph, setGraph] = useState<GraphData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filename, setFilename] = useState<string | null>(null);
    const cyRef = useRef<HTMLDivElement | null>(null);
    const cyInstance = useRef<cytoscape.Core | null>(null);
    const [showCommunity, setShowCommunity] = useState(false);
    const [selectedNode, setSelectedNode] = useState<{
        username: string;
        name: string;
        tweets: { id: string; text: string; created_at: string; metrics: any }[];
    } | null>(null);
    const [edgeMode, setEdgeMode] = useState<"typed" | "collapsed">("collapsed");
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
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);
        setGraph(null);
        setShowCommunity(false);
        setSelectedNode(null);
        setFilename(file.name)

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
            elements: { nodes, edges: collapsedEdgesRef.current },
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
                nodeRepulsion: 100000,       // semakin besar = node makin saling menjauh
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

    const nodeCount = graph?.elements.nodes.length ?? 0;
    const edgeCount = graph?.elements.edges.length ?? 0;

    return(
        <div className="tg-root">

            {/* HEADER */}
            <header className="tg-header">
                <span className="tg-header-dot" />
                <span className="tg-header-title">Graph Visualization</span>
                {graph && (
                    <span className="tg-header-meta">
                        {nodeCount} nodes · {edgeCount} edges
                    </span>
                )}
            </header>

            {/* CANVAS */}
            <div
                ref={cyRef}
                className="tg-canvas"
                style={{
                    right: "280px",
                    display: graph ? "block" : "none",
                }}
            />

            {/* CANVAS PLACEHOLDER */}
            {!graph && !loading && (
                <div className="tg-canvas-placeholder">
                    <div className="tg-placeholder-icon">⬡</div>
                    <div className="tg-placeholder-text">Upload a JSON file to begin</div>
                </div>
            )}
            
            {/* RIGHT PANEL */}
            <aside className="tg-panel">

                {/* File Upload */}
                <div className="tg-panel-section">
                    <div className="tg-section-label">Data Source</div>
                    <div className="tg-upload-area">
                        <input type="file" accept=".json" onChange={handleFileUpload} />
                        <span className="tg-upload-icon">⬡</span>
                        <div className="tg-upload-text">Drop JSON file or click</div>
                        <div className="tg-upload-hint">.json graph export</div>
                    </div>
                    {loading && (
                        <div className="tg-status loading">
                            <span className="tg-status-spinner" />
                            Processing {filename}...
                        </div>
                    )}
                    {error && (
                        <div className="tg-status error">
                            X {error}
                        </div>
                    )}
                    {graph && !loading && (
                        <div className="tg-status success">
                            ✓ {filename}
                        </div>
                    )}
                </div>

                {/* Legend */}
                {graph && (
                    <div className="tg-panel-section">
                        <div className="tg-section-label">Edge Types</div>
                        <div className="tg-legend-list">
                            {Object.entries(EDGE_COLORS).map(([type, color]) => (
                                <div key={type} className="tg-legend-item">
                                    <span className="tg-legend-line" style={{ background: color }} />
                                    {type}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Toggles */}
                {graph && (
                    <div className="tg-panel-section">
                        <div className="tg-section-label">Display</div>
                        <div className="tg-toggle-list">
                            <div className="tg-toggle-row">
                                <span className="tg-toggle-label">Show Communities</span>
                                <ToggelSwitch checked={showCommunity} onChange={handleToggleCommunity} />    
                            </div>
                            <div className="tg-toggle-row">
                                <span className="tg-toggle-label">Show interactions</span>
                                <ToggelSwitch checked={edgeMode === "typed"} onChange={handleToggleEdgeMode} />
                            </div>
                        </div>
                    </div>
                )}

            </aside>
            
            {/* NODE DETAIL  */}
            <div className={`tg-node-float ${selectedNode ? "tg-node-float--visible" : ""}`}>
                {selectedNode && (
                    <>
                       <div className="tg-node-header">
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                                <div>
                                    <div className="tg-node-username">@{selectedNode.username}</div>
                                    <div className="tg-node-name">{selectedNode.name}</div>
                                </div>
                                <button
                                    className="tg-node-float-close"
                                    onClick={() => setSelectedNode(null)}
                                >✕</button>
                            </div>
                        </div> 
                        <div className="tg-tweet-list">
                            {selectedNode.tweets.length === 0 ? (
                                <div className="tg-empty-state">No tweets captured<br />for this user</div>
                            ) : (
                                selectedNode.tweets.map(tweet => (
                                    <div key={tweet.id} className="tg-tweet">
                                        <div className="tg-tweet-text">{tweet.text}</div>
                                        <div className="tg-tweet-date">
                                            {new Date(tweet.created_at).toLocaleString()}
                                        </div>
                                        {tweet.metrics && (
                                            <div className="tg-tweet-metrics">
                                                <span>🔁 {tweet.metrics.retweet_count}</span>
                                                <span>💬 {tweet.metrics.reply_count}</span>
                                                <span>❤️ {tweet.metrics.like_count}</span>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
};

export default TestGraph;