
'use client';
import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://127.0.0.1:5000';

export function useSentinel() {
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [threatScore, setThreatScore] = useState(0);
    const [logs, setLogs] = useState([]);
    const [quarantinedFiles, setQuarantinedFiles] = useState([]);
    const [monitoredFolder, setMonitoredFolder] = useState('');
    const [apiError, setApiError] = useState('');
    const [threatScoreHistory, setThreatScoreHistory] = useState([]);
    const [whitelist, setWhitelist] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    // Fetch status from API
    const fetchStatus = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/status`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            
            setIsMonitoring(data.isMonitoring);
            setThreatScore(data.threatScore);
            setLogs(data.logs || []);
            setQuarantinedFiles(data.quarantinedFiles || []);
            setWhitelist(data.whitelist || []);
            setIsConnected(true);
            setApiError('');

            // Update chart data only if monitoring is active
            if (data.isMonitoring) {
                setThreatScoreHistory(prev => {
                    const now = new Date();
                    const newEntry = {
                        time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
                        score: data.threatScore
                    };
                    const MAX_CHART_DATA_POINTS = 30;
                    return [...prev, newEntry].slice(-MAX_CHART_DATA_POINTS);
                });
            } else {
                // Reset chart when not monitoring
                setThreatScoreHistory(prev => prev.length > 0 ? [] : prev);
            }
        } catch (error) {
            console.error("Failed to fetch status:", error);
            setIsConnected(false);
            setApiError('Connection to Sentinel lost. Is the Python server running?');
        }
    }, []);

    // Initial status fetch and continuous polling
    useEffect(() => {
        // Fetch status immediately on mount
        fetchStatus();

        // Set up continuous polling every 2 seconds
        const interval = setInterval(fetchStatus, 2000);
        
        return () => clearInterval(interval);
    }, [fetchStatus]);

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
                setMonitoredFolder(path);
                // Initialize chart with starting point
                setThreatScoreHistory([{
                    time: new Date().toLocaleTimeString('en-US', { hour12: false }),
                    score: 0
                }]);
            } else {
                throw new Error(data.message || 'Failed to start monitoring');
            }
        } catch (error) {
            console.error("Start error:", error);
            setApiError(`Start Failed: ${error.message}`);
        }
    }, [whitelist]);

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
                setThreatScoreHistory([]);
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Failed to stop monitoring');
            }
        } catch (error) {
            console.error("Stop error:", error);
            setApiError(error.message);
        }
    }, []);

    const handleAddWhitelist = (path) => setWhitelist(prev => [...prev, path]);
    const handleRemoveWhitelist = (pathToRemove) => setWhitelist(prev => prev.filter(p => p !== pathToRemove));

    return {
        isMonitoring,
        threatScore,
        logs,
        quarantinedFiles,
        monitoredFolder,
        apiError,
        threatScoreHistory,
        whitelist,
        isConnected,
        handleStart,
        handleStop,
        handleAddWhitelist,
        handleRemoveWhitelist
    };
}
