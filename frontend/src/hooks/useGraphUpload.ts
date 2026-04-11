import React, { useState } from "react";
import { GraphData } from "../utils/graphUtils";

export function useGraphUpload(onUploadStart?: () => void) {
    const [graph, setGraph] = useState<GraphData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filename, setFilename] = useState<string | null>(null);

    const uploadFile = async (file: File) => {
        if (onUploadStart) {
            onUploadStart();
        }

        setLoading(true);
        setError(null);
        setGraph(null);
        setFilename(file.name);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("http://127.0.0.1:5000/api/process", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to process graph data");
            }

            const data = await res.json();
            setGraph(data);
        } catch (err) {
            setError(String(err));
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            uploadFile(file);
        }
    };

    return { graph, loading, error, filename, handleFileUpload };
}