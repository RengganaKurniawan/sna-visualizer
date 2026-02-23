import networkx as nx
import community as community_louvain
from  flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/api/graph", methods=["GET"])
def test_graph():
    # bikin graf
    G = nx.DiGraph()
    for i in range(0, 12):
        G.add_node(i)

    edges = [
        (0, 5), (1, 0), (1, 2), (1, 3),
        (2, 0), (2, 4), (3, 0), (4, 6),
        (5, 7), (6, 8), (8, 9), (8, 10), 
        (8, 7), (9, 7), (10, 7), (10, 11),
        (11, 7),
    ]

    G.add_edges_from(edges)

    # sentralitas
    in_degree_centrality = nx.in_degree_centrality(G)
    nx.set_node_attributes(G, in_degree_centrality, 'in_degree_centrality')

    out_degree_centrality = nx.out_degree_centrality(G)
    nx.set_node_attributes(G, out_degree_centrality, 'out_degree_centrality')

    # algoritma louvain
    undirected_graf = G.to_undirected()
    partition = community_louvain.best_partition(undirected_graf)

    nx.set_node_attributes(G, partition, "community")

    # kasih warna node sesuai komunitas
    community_colors = {
        0: "#ff6666",
        1: "#66b3ff",
        2: "#99ff99",
    }

    for node, community in partition.items():
        G.nodes[node]["color"] = community_colors.get(community, "#d3d3d3")

    # convert ke cytoscape
    cyto_graph = nx.cytoscape_data(G)

    return jsonify(cyto_graph)

if __name__ == "__main__":
    app.run(debug=True)
