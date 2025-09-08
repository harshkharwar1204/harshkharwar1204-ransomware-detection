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

    // Initialize with some sample data for testing
    useEffect(() => {
        // Add initial data point
        setThreatScoreHistory([{
            time: new Date().toLocaleTimeString(),
            score: 0
        }]);
    }, []);

    // API Polling Effect
    useEffect(() => {
        let interval;
        
        const fetchStatus = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/status`);
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                
                setThreatScore(data.threatScore || 0);
                setLogs(data.logs || []);
                setQuarantinedFiles(data.quarantinedFiles || []);
                setWhitelist(data.whitelist || []);

                // Update threat score history
                setThreatScoreHistory(prev => {
                    const now = new Date();
                    const timeString = now.toLocaleTimeString();
                    const newEntry = {
                        time: timeString,
                        score: data.threatScore || 0
                    };
                    const MAX_CHART_DATA_POINTS = 20;
                    const newHistory = [...prev, newEntry].slice(-MAX_CHART_DATA_POINTS);
                    return newHistory;
                });
                
                setApiError('');
            } catch (error) {
                console.error("Failed to fetch status:", error);
                setApiError('Connection to Sentinel lost. Is the Python server running?');
            }
        };

        if (isMonitoring) {
            // Fetch immediately
            fetchStatus();
            // Then set up interval
            interval = setInterval(fetchStatus, 2000);
        } else {
            // Keep some history even when not monitoring
            setThreatScoreHistory(prev => prev.length === 0 ? [{
                time: new Date().toLocaleTimeString(),
                score: 0
            }] : prev);
        }
        
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isMonitoring]);

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
                // Reset history when starting
                setThreatScoreHistory([{
                    time: new Date().toLocaleTimeString(),
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
                // Keep final score in history
                setThreatScoreHistory(prev => [...prev, {
                    time: new Date().toLocaleTimeString(),
                    score: 0
                }]);
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
    const handleAddWhitelist = useCallback((path) => {
        setWhitelist(prev => [...prev, path]);
    }, []);
    
    const handleRemoveWhitelist = useCallback((pathToRemove) => {
        setWhitelist(prev => prev.filter(path => path !== pathToRemove));
    }, []);

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