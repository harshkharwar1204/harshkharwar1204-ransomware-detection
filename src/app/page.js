'use client';
import { useSentinelContext } from '@/context/SentinelContext';
import StatCards from '@/components/StatCards';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Server, Zap } from 'lucide-react';

const Panel = ({ title, icon, children, className }) => (
    <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-xl ${className}`}>
        <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 p-4 border-b border-slate-600/50 rounded-t-xl">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-100">
                {icon} {title}
            </h2>
        </div>
        <div className="p-6 flex-grow overflow-hidden">
            {children}
        </div>
    </div>
);

// Custom chart component that works without external libraries
const ThreatScoreChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                    <Zap size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No threat data available</p>
                    <p className="text-sm mt-2">Start monitoring to see threat scores</p>
                </div>
            </div>
        );
    }

    const maxScore = Math.max(...data.map(d => d.score), 20);
    const chartHeight = 200;
    
    return (
        <div className="relative w-full h-full">
            {/* Chart Title */}
            <div className="mb-4 text-center">
                <h3 className="text-sm font-medium text-slate-400">Real-time Threat Score</h3>
            </div>
            
            {/* Chart Container */}
            <div className="relative bg-slate-900/50 rounded-lg p-4 border border-slate-700/30" style={{ height: chartHeight }}>
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-slate-500 py-2">
                    <span>{maxScore}</span>
                    <span>{Math.round(maxScore * 0.75)}</span>
                    <span>{Math.round(maxScore * 0.5)}</span>
                    <span>{Math.round(maxScore * 0.25)}</span>
                    <span>0</span>
                </div>
                
                {/* Chart Area */}
                <div className="ml-10 mr-4 h-full relative">
                    {/* Grid lines */}
                    <div className="absolute inset-0">
                        {[0, 25, 50, 75, 100].map((percent) => (
                            <div
                                key={percent}
                                className="absolute w-full border-t border-slate-700/30"
                                style={{ top: `${percent}%` }}
                            />
                        ))}
                    </div>
                    
                    {/* Chart Line */}
                    <svg className="absolute inset-0 w-full h-full overflow-visible">
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3"/>
                                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.1"/>
                            </linearGradient>
                        </defs>
                        
                        {/* Area fill */}
                        <path
                            d={`M 0 ${chartHeight} ${data.map((point, index) => {
                                const x = (index / (data.length - 1)) * 100;
                                const y = chartHeight - (point.score / maxScore) * chartHeight;
                                return `L ${x}% ${y}`;
                            }).join(' ')} L 100% ${chartHeight} Z`}
                            fill="url(#gradient)"
                            className="opacity-60"
                        />
                        
                        {/* Line */}
                        <path
                            d={`M ${data.map((point, index) => {
                                const x = (index / (data.length - 1)) * 100;
                                const y = chartHeight - (point.score / maxScore) * chartHeight;
                                return `${x}% ${y}`;
                            }).join(' L ')}`}
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="2"
                            className="drop-shadow-sm"
                        />
                        
                        {/* Data points */}
                        {data.map((point, index) => {
                            const x = (index / (data.length - 1)) * 100;
                            const y = chartHeight - (point.score / maxScore) * chartHeight;
                            return (
                                <circle
                                    key={index}
                                    cx={`${x}%`}
                                    cy={y}
                                    r="3"
                                    fill="#f59e0b"
                                    className="drop-shadow-sm"
                                />
                            );
                        })}
                    </svg>
                </div>
                
                {/* X-axis labels */}
                <div className="absolute bottom-0 left-10 right-4 flex justify-between text-xs text-slate-500 mt-2">
                    {data.length > 0 && (
                        <>
                            <span>{data[0]?.time || ''}</span>
                            {data.length > 1 && <span>{data[Math.floor(data.length / 2)]?.time || ''}</span>}
                            {data.length > 1 && <span>{data[data.length - 1]?.time || ''}</span>}
                        </>
                    )}
                </div>
            </div>
            
            {/* Current Score Display */}
            <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-4 py-2 rounded-lg border border-amber-500/30">
                    <Zap size={16} className="text-amber-400" />
                    <span className="text-sm font-medium text-slate-300">Current Score:</span>
                    <span className="text-lg font-bold text-amber-400">
                        {data.length > 0 ? data[data.length - 1].score : 0}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default function DashboardPage() {
    const { isMonitoring, threatScore, logs, quarantinedFiles, threatScoreHistory } = useSentinelContext();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent mb-2">
                        Sentinel Dashboard
                    </h1>
                    <p className="text-slate-400">Real-time ransomware detection and monitoring</p>
                </div>

                {/* Status Cards */}
                <StatCards 
                    isMonitoring={isMonitoring}
                    threatScore={threatScore}
                    quarantinedFilesCount={quarantinedFiles.length}
                    logsCount={logs.length}
                />

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Threat Score Chart */}
                    <div className="xl:col-span-2">
                        <Panel 
                            title="Threat Score Over Time" 
                            icon={<Zap size={18} className="text-amber-400" />} 
                            className="h-96"
                        >
                            <ThreatScoreChart data={threatScoreHistory} />
                        </Panel>
                    </div>

                    {/* Live Event Log */}
                    <div className="xl:col-span-1">
                        <Panel 
                            title="Live Event Log" 
                            icon={<Server size={18} className="text-sky-400" />} 
                            className="h-96"
                        >
                            <div className="h-full overflow-hidden flex flex-col">
                                <div className="flex-1 overflow-y-auto space-y-2 pr-2 font-mono text-xs">
                                    {logs.length > 0 ? (
                                        logs.slice(0, 50).map((log, index) => (
                                            <div key={index} className="bg-slate-900/50 p-2 rounded border-l-2 border-slate-600">
                                                <div className="flex items-start gap-2">
                                                    <span className="text-slate-500 text-xs shrink-0">
                                                        {log.timestamp}
                                                    </span>
                                                    <span className={`font-bold text-xs shrink-0 ${
                                                        log.level === 'CRITICAL' ? 'text-red-400' : 
                                                        log.level === 'WARNING' ? 'text-yellow-400' : 
                                                        'text-sky-400'
                                                    }`}>
                                                        [{log.level}]
                                                    </span>
                                                </div>
                                                <div className="text-slate-300 mt-1 text-xs leading-relaxed">
                                                    {log.message}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-500">
                                            <div className="text-center">
                                                <Server size={48} className="mx-auto mb-4 opacity-50" />
                                                <p>No events logged</p>
                                                <p className="text-sm mt-2">Start monitoring from the Settings page</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Panel>
                    </div>
                </div>

                {/* Monitoring Status */}
                {isMonitoring && (
                    <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-4">
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-green-400 font-medium">
                                Sentinel is actively monitoring your system
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}