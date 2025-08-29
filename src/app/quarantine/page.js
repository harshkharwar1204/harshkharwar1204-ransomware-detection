'use client';
import { useSentinelContext } from '@/context/SentinelContext';
import { FileWarning, Clock } from 'lucide-react';

export default function QuarantinePage() {
    const { quarantinedFiles } = useSentinelContext();

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-3"><FileWarning className="text-orange-400" /> Quarantined Files</h1>
                <p className="text-slate-400 mt-1">These files have been automatically isolated due to suspicious activity.</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg">
                <div className="grid grid-cols-2 text-sm font-semibold text-slate-400 border-b border-slate-700 px-6 py-3">
                    <div className="col-span-1">Filename</div>
                    <div className="col-span-1">Date Quarantined</div>
                </div>
                <div className="divide-y divide-slate-700/50">
                {quarantinedFiles.length > 0 ? quarantinedFiles.map((file, index) => (
                    <div key={index} className="grid grid-cols-2 items-center px-6 py-4 hover:bg-slate-800 transition-colors">
                        <p className="font-mono text-orange-300 truncate col-span-1">{file.name}</p>
                        <p className="text-slate-400 flex items-center gap-2 col-span-1"><Clock size={14}/> {file.timestamp}</p>
                    </div>
                )) : (
                    <div className="text-center text-slate-500 p-12">
                        <p>No files have been quarantined yet.</p>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
}
