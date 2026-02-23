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
    
    # buat cari author dari referenced tweet
    original_tweets_lookup = {tweet['id']: tweet for tweet in includes_data.get('tweets', [])}

    # buat label usename di node
    users_lookup = {user['id']: user for user in includes_data.get('users', [])}

    interactions = []

    for tweet in tweets_data:
        source_id = tweet.get('author_id')
        if not source_id:
            continue

        # ambil reply
        if tweet.get('in_reply_to_user_id'):
            target_id = tweet.get('in_reply_to_user_id')
            if source_id != target_id:
                interactions.append({
                    'source': source_id, 
                    'target': target_id,
                    'type': 'reply'
                })
            
        # ambil retweet dan quote
        if 'referenced_tweets' in tweet:
            for ref_tweet in tweet['referenced_tweets']:
                ref_type = ref_tweet.get('type')
                
                if ref_type == 'replied_to':
                    continue

                original_tweet = original_tweets_lookup.get(ref_tweet.get('id'))

                target_id = None
                if not original_tweet and ref_type == 'retweeted':
                    # original tweet ga ada di includes antara dihapus/priv account
                    # cek ke mention pertama karena author
                    mentions = tweet.get('entities', {}).get('mentions', [])
                    if mentions:
                        target_id = mentions[0].get('id')
                    else:
                        continue
                elif original_tweet:
                    target_id = original_tweet.get('author_id')
                else:
                    continue

                if target_id and source_id != target_id:
                    if ref_type == 'retweeted':
                        interactions.append({
                            'source': source_id,
                            'target': target_id,
                            'type': 'retweet'
                        })
                    elif ref_type == 'quoted':
                        interactions.append({
                            'source': source_id,
                            'target': target_id,
                            'type': 'quote'
                        })
                    

        # ambil mention

        # skip (RT @) karena bukan mention asli
        is_retweet = tweet.get('text', '').startswith('RT @')
        if not is_retweet and 'entities' in tweet and 'mentions' in tweet['entities']:
            
            # ambil user yang reply
            reply_target_id = tweet.get('in_reply_to_user_id')
            for mention in tweet['entities']['mentions']:
                target_id = mention.get('id')
                
                #skip diri sendiri dan target reply
                if target_id and source_id != target_id and (not reply_target_id or target_id != reply_target_id):
                    interactions.append({
                        'source': source_id, 
                        'target': target_id, 
                        'type': 'mentions'
                    })

    return interactions, users_lookup

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
        interactions, users_lookup = extract_interactions(raw_data)

        if not interactions:
            return jsonify({"error": "Tidak ada interaksi valid"}), 400
        
        df = pd.DataFrame(interactions)

        # edge weight, menghitung interaksi setiap pasang source, target, type
        df = (
            df.groupby(['source', 'target', 'type'])
            .size()
            .reset_index(name='weight')
        )

        if df.empty:
            return jsonify({"error": "Tidak ada interaksi setelah agregasi"}), 400
        
        # buat graph
        graph = nx.from_pandas_edgelist(
            df, 'source', 'target',
            edge_attr=['type', 'weight'],
            create_using=nx.DiGraph()
        )

        # sentralitas
        nx.set_node_attributes(graph, nx.in_degree_centrality(graph),  'in_degree_centrality')
        nx.set_node_attributes(graph, nx.out_degree_centrality(graph), 'out_degree_centrality')

        # deteksi komunitas
        if graph.number_of_edges() > 0:
            partition = community_louvain.best_partition(graph.to_undirected())
            nx.set_node_attributes(graph, partition, 'community')
        else:
            nx.set_node_attributes(graph, 0, 'community')

        # username label
        for node in graph.nodes():
            user = users_lookup.get(node, {})
            graph.nodes[node]['label'] = user.get('username', str(node))
            graph.nodes[node]['name']     = user.get('name', '')
            graph.nodes[node]['username'] = user.get('username', str(node))
        
        # export ke Cytoscape
        graph_frontend = nx.cytoscape_data(graph)

        # pastikan tipe primitif
        for element in graph_frontend.get('elements', {}).get('nodes', []):
            element['data'] = {
                k: (v if isinstance(v, (str, int, float, bool)) else str(v))
                for k, v in element.get('data', {}).items()
            }
        for element in graph_frontend.get('elements', {}).get('edges', []):
            element['data'] = {
                k: (v if isinstance(v, (str, int, float, bool)) else str(v))
                for k, v in element.get('data', {}).items()
            }

        return jsonify(graph_frontend)
    
    except json.JSONDecodeError:
        return jsonify({"error": "File JSON tidak valid"}), 400
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Terjadi kesalahan internal: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(port=5000, debug=True)