import { ShieldCheck, Zap, FileWarning, Clock } from 'lucide-react';

const Card = ({ title, value, icon, color, bgColor }) => (
    <div className={`bg-gradient-to-br ${bgColor} backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 flex items-center gap-4 transition-all duration-300 hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/20 transform hover:scale-105`}>
        <div className={`p-4 rounded-xl bg-slate-800/50 border border-slate-600/50 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-400 font-medium">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
    </div>
);

export default function StatCards({ isMonitoring, threatScore, quarantinedFilesCount, logsCount }) {
    const statusText = isMonitoring ? 'Active' : 'Offline';
    const statusColor = isMonitoring ? 'text-green-400' : 'text-red-400';
    const statusBg = isMonitoring ? 'from-green-900/20 to-slate-800/50' : 'from-red-900/20 to-slate-800/50';

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <Card 
                title="Status" 
                value={statusText} 
                icon={<ShieldCheck size={28} />} 
                color={statusColor}
                bgColor={statusBg}
            />
            <Card 
                title="Threat Score" 
                value={threatScore} 
                icon={<Zap size={28} />} 
                color="text-yellow-400"
                bgColor="from-yellow-900/20 to-slate-800/50"
            />
            <Card 
                title="Quarantined" 
                value={quarantinedFilesCount} 
                icon={<FileWarning size={28} />} 
                color="text-orange-400"
                bgColor="from-orange-900/20 to-slate-800/50"
            />
            <Card 
                title="Events Logged" 
                value={logsCount} 
                icon={<Clock size={28} />} 
                color="text-sky-400"
                bgColor="from-sky-900/20 to-slate-800/50"
            />
        </div>
    );
}