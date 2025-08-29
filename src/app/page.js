'use client';
import { useSentinelContext } from '@/context/SentinelContext';
import StatCards from '@/components/StatCards';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Server, Zap } from 'lucide-react';

const Panel = ({ title, icon, children, className }) => (
    <div className={`bg-slate-800/50 border border-slate-700 rounded-lg flex flex-col ${className}`}>
        <h2 className="text-lg font-semibold p-4 flex items-center gap-2 border-b border-slate-700/50">{icon} {title}</h2>
        <div className="p-4 flex-grow overflow-y-auto">{children}</div>
    </div>
);

export default function DashboardPage() {
    const { isMonitoring, threatScore, logs, quarantinedFiles, threatScoreHistory } = useSentinelContext();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-5 w-full">
                <StatCards 
                    isMonitoring={isMonitoring}
                    threatScore={threatScore}
                    quarantinedFilesCount={quarantinedFiles.length}
                    logsCount={logs.length}
                />
            </div>
            <div className="lg:col-span-2">
                <Panel title="Threat Score Over Time" icon={<Zap size={18} />} className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={threatScoreHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <defs><linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.7}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient></defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.3)" />
                            <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                            <Area type="monotone" dataKey="score" stroke="#f59e0b" fillOpacity={1} fill="url(#colorScore)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Panel>
            </div>
            <div className="lg:col-span-3">
                <Panel title="Live Event Log" icon={<Server size={18} />} className="h-[280px]">
                    <div className="font-mono text-xs space-y-2 flex flex-col-reverse pr-2 h-full">
                        {logs.length > 0 ? logs.map((log, index) => (
                            <div key={index}><span className="text-slate-500 mr-2">{log.timestamp}</span><span className={`font-bold mr-2 ${log.level === 'CRITICAL' ? 'text-red-400' : log.level === 'WARNING' ? 'text-yellow-400' : 'text-sky-400'}`}>[{log.level}]</span><span className="text-slate-300">{log.message}</span></div>
                        )) : (<div className="text-center text-slate-500 m-auto"><p>No events. Start monitoring from the Settings page.</p></div>)}
                    </div>
                </Panel>
            </div>
        </div>
    );
}