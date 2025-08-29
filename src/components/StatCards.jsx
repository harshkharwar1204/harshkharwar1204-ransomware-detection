import { ShieldCheck, Zap, FileWarning, Clock } from 'lucide-react';

const Card = ({ title, value, icon, color }) => (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex items-center gap-4 transition-all hover:border-sky-500/50 hover:bg-slate-800">
        <div className={`p-3 rounded-lg bg-slate-700/50 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

export default function StatCards({ isMonitoring, threatScore, quarantinedFilesCount, logsCount }) {
    const statusText = isMonitoring ? 'Active' : 'Offline';
    const statusColor = isMonitoring ? 'text-green-400' : 'text-red-400';

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card title="Status" value={statusText} icon={<ShieldCheck size={24} />} color={statusColor} />
            <Card title="Threat Score" value={threatScore} icon={<Zap size={24} />} color="text-yellow-400" />
            <Card title="Quarantined" value={quarantinedFilesCount} icon={<FileWarning size={24} />} color="text-orange-400" />
            <Card title="Events Logged" value={logsCount} icon={<Clock size={24} />} color="text-sky-400" />
        </div>
    );
}