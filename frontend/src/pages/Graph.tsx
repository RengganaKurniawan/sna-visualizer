import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import cytoscape, { NodeDefinition, EdgeDefinition } from "cytoscape"
import {
    GraphData,
    EDGE_COLORS,
    generateColor,
    CYTOSCAPE_STYLES,
    CYTOSCAPE_LAYOUT
} from "../utils/graphUtils";
import { useGraphUpload } from "../hooks/useGraphUpload";
import GraphHeader from "../components/GraphHeader";
import GraphSidebar from "../components/GraphSidebar";
import TweetDetailPanel from "../components/TweetDetailPanel";
import "../assets/TestGraph.css"

// Main
function Graph() {
    const navigate = useNavigate();
    
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
    
    const { graph, loading, error, filename, handleFileUpload } = useGraphUpload(() => {
        setShowCommunity(false);
        setSelectedNode(null);
        setEdgeMode("collapsed");

        if (cyInstance.current) {
            cyInstance.current.destroy();
            cyInstance.current = null;
        }
    })
    
    const handleToggleCommunity = () => {
        setShowCommunity(prev => {
            const next = !prev;
            if (!cyInstance.current) return next;

            if (next) {
                // bikin node parent - kotak container
                communityIdsRef.current.forEach(cid => {
                    if (!cyInstance.current!.$(`#community_${cid}`).length) {
                        cyInstance.current!.add({
                            group: "nodes",
                            data: { id: `community_${cid}` }
                        });
                    }
                });
                // pindahin setiap komunitas ke parent
                cyInstance.current.nodes().filter(n => !n.isParent()).forEach(node => {
                    node.move({ parent: `community_${node.data('community')}` });
                    node.style('background-color', generateColor(node.data('community'), communityIdsRef.current.length));
                });
            } else {
                cyInstance.current.nodes().filter(n => !n.isParent()).forEach(node => {
                    node.move({ parent: null });
                    node.style('background-color', '#1D9BF0');
                });
                communityIdsRef.current.forEach(cid => {
                    cyInstance.current!.$(`#community_${cid}`).remove();
                })
            }

            // cyInstance.current.layout({
            //     name: 'cose',

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

    useEffect(() => {
        if (!graph || !cyRef.current || cyInstance.current)
            return;

        const communityIds = [...new Set(graph.elements.nodes.map(n => n.data.community as number))];
        communityIdsRef.current = communityIds;
        const totalCommunities = communityIds.length;

        const nodes = graph.elements.nodes.map((node): NodeDefinition => ({
            ...node,
            data: {
                ...node.data,
                communityColor: generateColor(node.data.community, totalCommunities)
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
                        edgeColor: "#4a6080"
                    }
                });
            }
        });
        collapsedEdgesRef.current = Array.from(edgeMap.values());
        

        cyInstance.current = cytoscape({
            container: cyRef.current,
            elements: { nodes, edges: collapsedEdgesRef.current },
            style: CYTOSCAPE_STYLES,
            layout: CYTOSCAPE_LAYOUT,
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
            <GraphHeader
                graphExists={!!graph}
                nodeCount={nodeCount}
                edgeCount={edgeCount}
            />

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

            {/* SIDEBAR */}
            <GraphSidebar 
                onFileUpload={handleFileUpload}
                loading={loading}
                error={error}
                filename={filename}
                graphExists={!!graph}
                showCommunity={showCommunity}
                onToggleCommunity={handleToggleCommunity}
                edgeMode={edgeMode}
                onToggleEdgeMode={handleToggleEdgeMode}
            />

            {/* PANEL */}
            <TweetDetailPanel 
                node={selectedNode} 
                onClose={() => setSelectedNode(null)} 
            />
        </div>
    )
};

export default Graph;