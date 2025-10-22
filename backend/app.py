from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import pandas as pd
import networkx as nx
import community as community_louvain

# setup
app = Flask(__name__)
CORS(app)

# mengambil data interaksi dari raw data
def extract_interactions(raw_data):
    tweets_data = raw_data.get('data', [])
    includes_data = raw_data.get('includes', {})
    original_tweets_lookup = {tweet['id']: tweet for tweet in includes_data.get('tweets', [])}

    interactions = []

    for tweet in tweets_data:
        source_id = tweet.get('author_id')
        if not source_id:
            continue

        # ambil reply
        if tweet.get('in_reply_to_user_id'):
            target_id = tweet.get('in_reply_to_user_id')
            
            # cek reply diri sendiri (thread)
            if source_id != target_id:
                interactions.append({'source': source_id, 'target': target_id, 'type': 'reply'})

        # ambil quote
        if 'referenced_tweets' in tweet:
            for ref_tweet in tweet['referenced_tweets']:
                ref_type = ref_tweet.get('type')
                original_tweet = original_tweets_lookup.get(ref_tweet.get('id'))

                target_id = None
                if not original_tweet and ref_type == 'retweeted':
                    # cek original retweet masih ada/available
                    if 'entities' in tweet and 'mentions' in tweet['entities'] and tweet['entities']['mentions']:
                        # author paling atas
                        original_author_mention = tweet['entities']['mentions'][0]
                        target_id = original_author_mention.get('id')
                    else:
                        continue
                elif original_tweet:
                    target_id = original_tweet.get('author_id')
                else:
                    continue

                if target_id and source_id != target_id:
                    if ref_type == 'retweeted':
                        interactions.append({'source': source_id, 'target': target_id, 'type': 'retweet'})
                    elif ref_type == 'quoted':
                        interactions.append({'source': source_id, 'target': target_id, 'type': 'quote'})

        # ambil mention
        is_retweet = tweet.get('text', '').startswith('RT @')
        if not is_retweet and 'entities' in tweet and 'mentions' in tweet['entities']:
            # ambol user yang direply
            reply_target_id = tweet.get('in_reply_to_user_id')
            for mention in tweet['entities']['mentions']:
                target_id = mention.get('id')
                if target_id and source_id != target_id and (not reply_target_id or target_id != reply_target_id):
                    interactions.append({'source': source_id, 'target': target_id, 'type': 'mentions'})

    return interactions

@app.route('/api/process', methods=['POST'])
def process_data():
    # cek input
    if 'file' not in request.files:
        return jsonify({"error": "Tidak ada file yang dimasukan"}), 400
    
    file = request.files['file']
    if not file or not file.filename.endswith('.json'):
        return jsonify({"error": "Format file harus.json"}), 400
    
    try:
        raw_data = json.load(file.stream)
        interactions = extract_interactions(raw_data)

        if not interactions:
            return jsonify({"error": "Tidak ada interaksi valid"}), 400
        
        df = pd.DataFrame(interactions)

        required_cols_for_drop = ['source', 'target', 'type']
        if not all(col in df.columns for col in required_cols_for_drop):
             missing_cols = [col for col in required_cols_for_drop if col not in df.columns]
             print(f"ERROR: Missing columns for drop_duplicates: {missing_cols}")
             return jsonify({"error": f"Kolom hilang saat pemrosesan: {missing_cols}"}), 500

        df.drop_duplicates(subset=['source', 'target', 'type'], inplace=True)

        if df.empty:
            return jsonify({"error": "tidak ada interaksi"}), 400
        
        # buat graf
        graph = nx.from_pandas_edgelist(df, 'source', 'target', edge_attr=['type'], create_using=nx.DiGraph())

        # analisis sentralitas
        in_degree_centrality = nx.in_degree_centrality(graph)
        nx.set_node_attributes(graph, in_degree_centrality, 'in_degree_centrality')

        out_degree_centrality = nx.out_degree_centrality(graph)
        nx.set_node_attributes(graph, out_degree_centrality, 'out_degree_centrality')

        # analisis deteksi komunitas
        if graph.number_of_edges() > 0:
            graph_undirected = graph.to_undirected()
            partition = community_louvain.best_partition(graph_undirected)
            nx.set_node_attributes(graph, partition, 'community')
        else:
            nx.set_node_attributes(graph, 0, 'community')

        # label attribute
        labels = {node: str(node) for node in graph.nodes()}
        nx.set_node_attributes(graph, labels, 'label')

        # networkX ke Cytoscape
        graph_frontend = nx.cytoscape_data(graph)

        for element in graph_frontend.get('elements', {}).get('nodes', []):
            element['data'] = {k: (v if isinstance(v, (str, int, float, bool)) else str(v)) for k, v in element.get('data', {}).items()}
        for element in graph_frontend.get('elements', {}).get('edges', []):
            element['data'] = {k: (v if isinstance(v, (str, int, float, bool)) else str(v)) for k, v in element.get('data', {}).items()}

        return jsonify(graph_frontend)
    
    except json.JSONDecodeError:
        return jsonify({"error": "File JSON tidak valid"}), 400
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Terjadi kesalahan internal: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(port=5000, debug=True)