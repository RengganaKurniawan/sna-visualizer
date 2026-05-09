import cytoscape  from "cytoscape";

export type GraphData = {
    data: any[];
    directed: boolean;
    multigraph: boolean;
    elements: {
        nodes: { data: Record<string, any> }[];
        edges: { data: Record<string, any> }[];
    };
};

export const EDGE_COLORS: Record<string, string> = {
    reply: "#4C9BE8",
    retweet: "#4CE87A",
    quote: "#E8724C",
    mention: "#E8D94C",
};

export function generateColor(index: number, total: number): string {
    if (total <= 12) {
        const hue = (index / total) * 360;
        return `hsl(${hue}, 70%, 55%)`;
    } else {
        const hue = (index * 137.508) % 360;
        const saturation = 55 + (index % 3) * 15;
        const lightness = 45 + (index % 2) * 15;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
}

export const getCytoscapeStyles = (theme: 'dark' | 'light'): cytoscape.StylesheetStyle[] => [
    {
        selector: "node[in_degree_centrality]",
        style: {
            label: "data(label)",
            "font-size": "11px",
            "text-valign": "bottom",
            "text-halign": "center",
            
            "color": theme === 'dark' ? "#ffffff" : "#0f1419", 
            
            "text-outline-color": theme === 'dark' ? "#0d1117" : "#f7f9f9", 
            "text-outline-width": 3,          
            
            "background-color": "#1D9BF0",
            width: "mapData(in_degree_centrality, 0, 1, 15, 100)",
            height: "mapData(in_degree_centrality, 0, 1, 15, 100)",
        },
    },
    {
        selector: ":parent",
        style: {
            label: "",
            "background-color": "#1D9BF0",              
            "background-opacity": 0.05,                  
            "border-width": 1,                           
            "border-color": "rgba(29,155,240,0.3)",      
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
            
            opacity: theme === 'dark' ? 0.7 : 0.85,
        },
    },
];

export const CYTOSCAPE_LAYOUT: cytoscape.LayoutOptions = {
    name: "cose",
    // idealEdgeLength: 150,        // jarak ideal antar node yang terhubung
    nodeOverlap: 100,             // seberapa jauh node didorong saat overlap
    componentSpacing: 100,       // jarak antar cluster/komponen terpisah
    nodeRepulsion: 100000,       // semakin besar = node makin saling menjauh
}