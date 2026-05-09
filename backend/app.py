from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import pandas as pd
import networkx as nx
import community as community_louvain

# setup
app = Flask(__name__)
CORS(app)

# validasi struktur data twitter
def validate_twitter_data(raw_data):
    if not isinstance(raw_data, dict):
        return False, "File JSON tidak valid: Format utama harus berupa object (dict)"

    if 'data' not in raw_data:
        return False, "File JSON tidak valid: Kehilangan atribut 'data' utama"
    
    if not isinstance(raw_data.get('data'), list):
        return False, "File JSON tidak valid: Atribut 'data' harus berupa array/list"
    
    includes = raw_data.get('includes')
    if includes is not None and not isinstance(includes, dict):
        return False, "File JSON tidak valid: Atribut 'includes' harus berupa object (dict)"
    
    return True, "Valid"

# mengambil data interaksi dari raw data
def extract_interactions(raw_data):
    tweets_data = raw_data.get('data', [])
    includes_data = raw_data.get('includes', {}) or {}
    
    includes_tweets = includes_data.get('tweets', [])
    if not isinstance(includes_tweets, list):
        includes_tweets = []

    includes_users = includes_data.get('users', [])
    if not isinstance(includes_users, list):
        includes_users = []
    
    # buat cari author dari referenced tweet
    original_tweets_lookup = {
        tweet['id']: tweet
        for tweet in includes_tweets
        if isinstance(tweet, dict) and 'id' in tweet
    }
    
    # buat label username di node
    users_lookup = {
        user['id']: user
        for user in includes_users
        if isinstance(user, dict) and 'id' in user
    }

    all_tweet_ids = {
        tweet['id']
        for tweet in tweets_data
        if isinstance(tweet, dict) and 'id' in tweet
    }
    unique_includes = [
        tweet for tweet in includes_tweets
        if isinstance(tweet, dict) and tweet.get('id') not in all_tweet_ids
    ]

    # gabungkan tweets dari data[] dan includes.tweets[] untuk ekstraksi interaksi
    all_tweets_for_interaction = tweets_data + unique_includes

    # gabungkan juga untuk user_tweets (semua tweet yang punya author_id)
    all_tweets_for_user_data = tweets_data + unique_includes

    interactions = []

    for tweet in all_tweets_for_interaction:
        if not isinstance(tweet, dict):
            continue
        
        source_id = tweet.get('author_id')
        if not source_id:
            continue

        tweet_id = tweet.get('id', '')
        tweet_text = tweet.get('text', '')

        # EXTRACT REPLY
        # simpan reply_target untuk di skip saat cek mention (hindari double-count)
        reply_target_id = tweet.get('in_reply_to_user_id')
        if reply_target_id and reply_target_id != source_id:
            interactions.append({
                'source': source_id,
                'target': reply_target_id,
                'type': 'Reply',
                'tweet_id': tweet_id
            })

        # EXTRACT RETWEET AND QUOTE
        # simpan RT/quote target untuk di skip saat cek mention (hindari double-count)
        retweet_quote_targets = set()
        is_retweet = tweet_text.startswith('RT @')

        ref_tweets = tweet.get('referenced_tweets')
        if isinstance(ref_tweets, list):
            for ref in ref_tweets:
                if not isinstance(ref, dict):
                    continue
                
                ref_type = ref.get('type')
                ref_id = ref.get('id')
                
                if ref_type not in ['retweeted', 'quoted'] or not ref_id:
                    continue

                target_author_id = None
                target_tweet = original_tweets_lookup.get(ref_id)
                if target_tweet and isinstance(target_tweet, dict):
                    target_author_id = target_tweet.get('author_id')

                # fallback ke mention pertama jika original tweet tidak ada di includes
                if not target_author_id:
                    entities = tweet.get('entities')
                    if isinstance(entities, dict):
                        mentions = entities.get('mentions')
                        if isinstance(mentions, list) and len(mentions) > 0:
                            first_mention = mentions[0]
                            if isinstance(first_mention, dict):
                                target_author_id = first_mention.get('id')
                
                if target_author_id and target_author_id != source_id:
                    edge_type = 'Retweet' if ref_type == 'retweeted' else 'Quote'
                    interactions.append({
                        'source': source_id,
                        'target': target_author_id,
                        'type': edge_type,
                        'tweet_id': tweet_id
                    })
                    # catat target ini supaya tidak double-count sebagai Mention
                    retweet_quote_targets.add(target_author_id)

        # EXTRACT MENTIONS
        # skip jika ini RT (RT @X bukan mention)
        # skip mention yang sudah tercatat sebagai Reply/Retweet/Quote target
        if not is_retweet:
            entities = tweet.get('entities')
            if isinstance(entities, dict):
                mentions = entities.get('mentions')
                if isinstance(mentions, list):
                    for mention in mentions:
                        if not isinstance(mention, dict):
                            continue

                        target_id = mention.get('id')
                        if not target_id or target_id == source_id:
                            continue

                        # skip reply target — sudah tercatat sebagai Reply
                        if target_id == reply_target_id:
                            continue

                        # skip retweet/quote target — sudah tercatat
                        if target_id in retweet_quote_targets:
                            continue

                        interactions.append({
                            'source': source_id,
                            'target': target_id,
                            'type': 'Mention',
                            'tweet_id': tweet_id
                        })

    return interactions, users_lookup, all_tweets_for_user_data


@app.route('/api/process', methods=['POST'])
def process_data():
    # cek input
    if 'file' not in request.files:
        return jsonify({"error": "Tidak ada file yang dimasukan"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Nama file kosong"}), 400
    
    if not file.filename.lower().endswith('.json'):
        return jsonify({"error": "File harus berekstensi .json"}), 400
    
    try:
        raw_data = json.load(file)
        
        is_valid, err_msg = validate_twitter_data(raw_data)
        if not is_valid:
            return jsonify({"error": err_msg}), 400
        
        interactions, users_lookup, all_tweets = extract_interactions(raw_data)

        if not interactions:
            return jsonify({"error": "Tidak ada interaksi valid"}), 400
        
        # NETWORKX GRAPH
        # MultiDiGraph: memungkinkan multiple edge antara user yang sama
        graph = nx.MultiDiGraph()

        for interaction in interactions:
            graph.add_edge(
                interaction['source'],
                interaction['target'],
                type=interaction['type'],
                tweet_id=interaction['tweet_id'],
                weight=1
            )

        # CALCULATE CENTRALITY
        in_degree = nx.in_degree_centrality(graph)
        out_degree = nx.out_degree_centrality(graph)

        nx.set_node_attributes(graph, nx.in_degree_centrality(graph),  'in_degree_centrality')
        nx.set_node_attributes(graph, nx.out_degree_centrality(graph), 'out_degree_centrality')

        # CALCULATE USER ROLES
        in_values = list(in_degree.values())
        out_values = list(out_degree.values())

        in_values.sort()
        out_values.sort()

        # 80% considered to be high
        in_threshold = in_values[int(len(in_values) * 0.80)] if in_values else 0
        out_threshold = out_values[int(len(out_values) * 0.80)] if out_values else 0

        for node in graph.nodes():
            node_in = in_degree[node]
            node_out = out_degree[node]

            if node_in >= in_threshold and node_out >= out_threshold:
                role = "Community Hub"
            elif node_in >= in_threshold and node_out < out_threshold:
                role = "Influencer"
            elif node_in < in_threshold and node_out >= out_threshold:
                role = "Broadcaster"
            else:
                role = "Peripheral"

            graph.nodes[node]['role'] = role


        # DETECT COMMUNITIES
        undirected_graph = graph.to_undirected()
        partition = community_louvain.best_partition(undirected_graph)
        nx.set_node_attributes(graph, partition, 'community')

        # USER METADATA (tweets)
        # pakai all_tweets = data[] + unique includes.tweets[]
        # supaya node yang muncul dari RT/quote juga punya tweet data
        user_tweets = {}
        for tweet in all_tweets:
            if not isinstance(tweet, dict):
                continue
            author_id = tweet.get('author_id')
            if not author_id:
                continue
            
            if author_id not in user_tweets:
                user_tweets[author_id] = []
            user_tweets[author_id].append({
                'id':         tweet.get('id', ''),
                'text':       tweet.get('text', ''),
                'created_at': tweet.get('created_at', ''),
                'metrics':    tweet.get('public_metrics', {}),
            })
        
        for node in graph.nodes():
            user_info = users_lookup.get(node, {})
            graph.nodes[node]['username']   = user_info.get('username', str(node))
            graph.nodes[node]['name']        = user_info.get('name',     str(node))
            graph.nodes[node]['label']       = user_info.get('username', str(node))
            
            tweets = user_tweets.get(node, [])
            graph.nodes[node]['tweets']      = json.dumps(tweets, ensure_ascii=False)
            graph.nodes[node]['tweet_count'] = len(tweets)
        
        # EXPORT TO CYTOSCAPE
        graph_frontend = nx.cytoscape_data(graph)

        # pastikan semua value bertipe primitif (string, int, float, bool)
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