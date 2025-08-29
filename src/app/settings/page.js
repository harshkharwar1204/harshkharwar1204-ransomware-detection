'use client';
import { useState } from 'react';
import { useSentinelContext } from '@/context/SentinelContext';
import { Settings, Server } from 'lucide-react';
import WhitelistPanel from '@/components/WhitelistPanel'; // We can reuse this component!

export default function SettingsPage() {
    const { 
        isMonitoring,
        monitoredFolder,
        apiError,
        whitelist,
        handleStart,
        handleStop,
        handleAddWhitelist,
        handleRemoveWhitelist
    } = useSentinelContext();

    const [inputPath, setInputPath] = useState('');

    const onStartClick = () => {
        handleStart(inputPath);
        setInputPath(''); // Clear input after starting
    };

    return (
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
            <div className="mb-2">
                <h1 className="text-3xl font-bold flex items-center gap-3"><Settings className="text-slate-400" /> Settings & Controls</h1>
                <p className="text-slate-400 mt-1">Configure and control the Sentinel monitoring service.</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Server size={20} /> Monitoring Control</h2>
                {isMonitoring ? (
                    <div className="space-y-4">
                        <p className="text-slate-300">Sentinel is currently active and monitoring:</p>
                        <p className="font-mono bg-slate-900 p-3 rounded-md text-sky-300 border border-slate-600 break-all">{monitoredFolder}</p>
                        <button onClick={handleStop} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-transform duration-200 hover:scale-105">
                            Stop Monitoring
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-slate-300">Enter the absolute path of the folder you want to protect.</p>
                        <input 
                            type="text"
                            placeholder="e.g., C:\Users\YourUser\Documents"
                            value={inputPath}
                            onChange={(e) => setInputPath(e.target.value)}
                            className="bg-slate-900 border border-slate-600 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                        />
                        <button onClick={onStartClick} className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-transform duration-200 hover:scale-105">
                            Start Monitoring
                        </button>
                    </div>
                )}
                {apiError && <p className="text-red-400 text-sm mt-4 text-center">{apiError}</p>}
            </div>

            <WhitelistPanel 
                whitelist={whitelist}
                onAdd={handleAddWhitelist}
                onRemove={handleRemoveWhitelist}
                isMonitoring={isMonitoring}
            />
        </div>
    );
}
