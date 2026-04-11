type Tweet = { id: string; text: string; created_at: string; metrics: any };

type TweetDetailPanelProps = {
    node: { username: string; name: string; tweets: Tweet[] } | null;
    onClose: () => void;
};

export default function TweetDetailPanel({ node, onClose }: TweetDetailPanelProps) {
    return (
        <div className={`tg-node-float ${node ? "tg-node-float--visible" : ""}`}>
            {node && (
                <>
                    <div className="tg-node-header">
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                            <div>
                                <div className="tg-node-username">@{node.username}</div>
                                <div className="tg-node-name">{node.name}</div>
                            </div>
                            <button className="tg-node-float-close" onClick={onClose}>✕</button>
                        </div>
                    </div>
                    <div className="tg-tweet-list">
                        {node.tweets.length === 0 ? (
                            <div className="tg-empty-state">No tweets captured<br />for this user</div>
                        ) : (
                            node.tweets.map((tweet) => (
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
    );
}