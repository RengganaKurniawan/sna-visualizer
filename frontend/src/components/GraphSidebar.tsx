import React from "react";
import { EDGE_COLORS } from "../utils/graphUtils";

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
        <label className="tg-switch">
            <input type="checkbox" checked={checked} onChange={onChange} />
            <span className="tg-switch-track" />
            <span className="tg-switch-thumb" />
        </label>
    );
}

type GraphSidebarProps = {
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    loading: boolean;
    error: string | null;
    filename: string | null;
    graphExists: boolean;
    showCommunity: boolean;
    onToggleCommunity: () => void;
    edgeMode: "typed" | "collapsed";
    onToggleEdgeMode: () => void;
};

export default function GraphSidebar(props: GraphSidebarProps) {
    return (
        <aside className="tg-panel">
            {/* File Upload */}
            <div className="tg-panel-section">
                <div className="tg-section-label">Data Source</div>
                <div className="tg-upload-area">
                    <input type="file" accept=".json" onChange={props.onFileUpload} />
                    <span className="tg-upload-icon">⬡</span>
                    <div className="tg-upload-text">Drop JSON file or click</div>
                    <div className="tg-upload-hint">.json graph export</div>
                </div>
                {props.loading && (
                    <div className="tg-status loading">
                        <span className="tg-status-spinner" /> Processing {props.filename}...
                    </div>
                )}
                {props.error && <div className="tg-status error">X {props.error}</div>}
                {props.graphExists && !props.loading && (
                    <div className="tg-status success">✓ {props.filename}</div>
                )}
            </div>

            {/* Legend */}
            {props.graphExists && (
                <div className="tg-panel-section">
                    <div className="tg-section-label">Edge Types</div>
                    <div className="tg-legend-list">
                        {Object.entries(EDGE_COLORS).map(([type, color]) => (
                            <div key={type} className="tg-legend-item">
                                <span className="tg-legend-line" style={{ background: color as string }} />
                                {type}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Toggles */}
            {props.graphExists && (
                <div className="tg-panel-section">
                    <div className="tg-section-label">Display Settings</div>
                    <div className="tg-toggle-list">
                        {/* communities */}
                        <div className="tg-toggle-row">
                            <span className="tg-toggle-label">Show Communities</span>
                            <ToggleSwitch checked={props.showCommunity} onChange={props.onToggleCommunity} />
                        </div>
                        {/* interactions */}
                        <div className="tg-toggle-row">
                            <span className="tg-toggle-label">Show interactions</span>
                            <ToggleSwitch checked={props.edgeMode === "typed"} onChange={props.onToggleEdgeMode} />
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}