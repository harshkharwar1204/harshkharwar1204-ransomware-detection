'use client';
import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://127.0.0.1:5000';

// This is our custom hook. It manages all the logic.
export function useSentinel() {
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [threatScore, setThreatScore] = useState(0);
    const [logs, setLogs] = useState([]);
    const [quarantinedFiles, setQuarantinedFiles] = useState([]);
    const [monitoredFolder, setMonitoredFolder] = useState('');
    const [apiError, setApiError] = useState('');
    const [threatScoreHistory, setThreatScoreHistory] = useState([]);
    const [whitelist, setWhitelist] = useState([]);

    // API Polling Effect
    useEffect(() => {
        let interval;
        if (isMonitoring) {
            interval = setInterval(async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}/status`);
                    if (!response.ok) throw new Error('Network response was not ok');
                    const data = await response.json();
                    
                    setThreatScore(data.threatScore);
                    setLogs(data.logs);
                    setQuarantinedFiles(data.quarantinedFiles);
                    setWhitelist(data.whitelist || []);

                    setThreatScoreHistory(prev => {
                        const now = new Date();
                        const newEntry = {
                            time: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
                            score: data.threatScore
                        };
                        const MAX_CHART_DATA_POINTS = 30;
                        return [...prev, newEntry].slice(-MAX_CHART_DATA_POINTS);
                    });
                    setApiError('');
                } catch (error) {
                    console.error("Failed to fetch status:", error);
                    setApiError('Connection to Sentinel lost. Is the Python server running?');
                }
            }, 2000);
        } else {
            setThreatScoreHistory([]);
        }
        return () => clearInterval(interval);
    }, [isMonitoring]);

    // API Handlers wrapped in useCallback for performance
    const handleStart = useCallback(async (path) => {
        if (!path) {
            setApiError("Please specify a folder to monitor.");
            return;
        }
        try {
            setApiError('');
            const response = await fetch(`${API_BASE_URL}/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path, whitelist }),
            });
            const data = await response.json();
            if (response.ok) {
                setIsMonitoring(true);
                setMonitoredFolder(data.message.replace('Monitoring started on ', ''));
            } else {
                throw new Error(data.message || 'Failed to start monitoring');
            }
        } catch (error) {
            console.error("Start error:", error);
            setApiError(`Start Failed: ${error.message}`);
        }
    }, [whitelist]); // Dependency array includes whitelist

    const handleStop = useCallback(async () => {
        try {
            setApiError('');
            const response = await fetch(`${API_BASE_URL}/stop`, { method: 'POST' });
            if (response.ok) {
                setIsMonitoring(false);
                setThreatScore(0);
                setLogs([]);
                setQuarantinedFiles([]);
                setMonitoredFolder('');
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Failed to stop monitoring');
            }
        } catch (error) {
            console.error("Stop error:", error);
            setApiError(error.message);
        }
    }, []);

    // Whitelist Handlers
    const handleAddWhitelist = (path) => setWhitelist(prev => [...prev, path]);
    const handleRemoveWhitelist = (pathToRemove) => setWhitelist(prev => prev.filter(path => path !== pathToRemove));

    // Return all the state and functions the UI will need
    return {
        isMonitoring,
        threatScore,
        logs,
        quarantinedFiles,
        monitoredFolder,
        apiError,
        threatScoreHistory,
        whitelist,
        handleStart,
        handleStop,
        handleAddWhitelist,
        handleRemoveWhitelist
    };
}
