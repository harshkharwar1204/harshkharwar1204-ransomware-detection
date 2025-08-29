'use client';
import { useState } from 'react';
import { ShieldOff, List, Plus, X } from 'lucide-react';

export default function WhitelistPanel({ whitelist, onAdd, onRemove, isMonitoring }) {
    const [newPath, setNewPath] = useState('');

    const handleAddClick = () => {
        if (newPath.trim()) {
            onAdd(newPath.trim());
            setNewPath('');
        }
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg">
            <h2 className="text-xl font-semibold p-4 flex items-center gap-2 border-b border-slate-700/50">
                <ShieldOff size={20} /> Whitelist Paths
            </h2>
            <div className="p-4 space-y-4">
                <p className="text-sm text-slate-400">Add trusted folder paths to prevent false alarms. The Sentinel will ignore all activity within these folders.</p>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Add a trusted folder path"
                        value={newPath}
                        onChange={(e) => setNewPath(e.target.value)}
                        className="bg-slate-900 border border-slate-600 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all text-sm"
                    />
                    <button onClick={handleAddClick} className="bg-sky-600 hover:bg-sky-500 text-white font-bold p-2 rounded-md flex items-center justify-center gap-2 transition-transform duration-200 hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed" disabled={isMonitoring}>
                        <Plus size={16} />
                    </button>
                </div>
                {isMonitoring && <p className="text-xs text-yellow-400 text-center">Stop monitoring to modify whitelist.</p>}
            </div>
            <div className="border-t border-slate-700/50 p-4">
                <h3 className="text-md font-semibold mb-2 flex items-center gap-2"><List size={16}/> Current Whitelist</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {whitelist.length > 0 ? whitelist.map((path, index) => (
                        <div key={index} className="flex justify-between items-center bg-slate-700/50 p-2 rounded-md text-sm">
                            <span className="font-mono truncate text-slate-300">{path}</span>
                            <button onClick={() => onRemove(path)} className="text-slate-400 hover:text-red-400 disabled:text-slate-600 disabled:cursor-not-allowed" disabled={isMonitoring}>
                                <X size={16} />
                            </button>
                        </div>
                    )) : (
                        <p className="text-sm text-slate-500 text-center py-4">No whitelisted paths.</p>
                    )}
                </div>
            </div>
        </div>
    );
}