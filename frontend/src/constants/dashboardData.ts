export const NAV_LINKS = ["About", "How It Works", "Create Graph", "Guidelines"];

export const ID_MAP: Record<string, string> = {
  "About": "about",
  "How It Works": "how",
  "Create Graph": "create",
  "Guidelines": "/guidelines"
};

export const EDGE_TYPES = [
    { type: "Reply",   color: "#4C9BE8", note: "User responded to a tweet" },
    { type: "Retweet", color: "#4CE87A", note: "User amplified another's tweet" },
    { type: "Quote",   color: "#E8724C", note: "User quoted with commentary" },
    { type: "Mention", color: "#E8D94C", note: "User referenced another account" },
];

export const FEATURES = [
    { icon: "⬡", title: "Community Detection",  desc: "Automatically groups users into communities based on interaction patterns." },
    { icon: "⟶", title: "Typed Edges",          desc: "Color-coded lines distinguish retweets, replies, quotes, and mentions." },
    { icon: "◎", title: "Influence Mapping",    desc: "Node size reflects centrality — spot the most influential accounts instantly." },
    { icon: "◈", title: "Tweet Drill-Down",     desc: "Click any node to inspect that user's tweets, metrics, and engagement." },
];

export const STEPS = [
    { num: "01", title: "Export Your Data",    desc: "Pull your Twitter/X dataset as a JSON file via the API or an export tool." },
    { num: "02", title: "Upload to NodeX",     desc: "Drop the file in. NodeX parses every interaction and builds the graph." },
    { num: "03", title: "Explore the Network", desc: "Pan, zoom, toggle communities, filter edges, and click nodes to explore." },
];