'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, LayoutDashboard, FileWarning, Settings } from 'lucide-react';
import { useSentinelContext } from '@/context/SentinelContext';

const NavLink = ({ href, children }) => {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <Link href={href} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'}`}>
            {children}
        </Link>
    );
};

export default function Navbar() {
    const { isMonitoring } = useSentinelContext();

    return (
        <nav className="bg-slate-900/60 backdrop-blur-lg border-b border-slate-700/50 p-4 sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2">
                        <Shield className="text-sky-400" size={28} />
                        <h1 className="text-xl font-bold text-white hidden sm:block">Sentinel</h1>
                    </Link>
                    <div className="flex items-center gap-2">
                        <NavLink href="/"><LayoutDashboard size={16} /> Dashboard</NavLink>
                        <NavLink href="/quarantine"><FileWarning size={16} /> Quarantine</NavLink>
                        <NavLink href="/settings"><Settings size={16} /> Settings</NavLink>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <div className={`relative flex items-center justify-center w-3 h-3`}>
                        <div className={`absolute w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        {isMonitoring && <div className={`absolute w-3 h-3 rounded-full animate-ping ${isMonitoring ? 'bg-green-500' : 'bg-red-500'}`}></div>}
                    </div>
                    <span className={`font-bold ${isMonitoring ? 'text-green-400' : 'text-red-400'}`}>
                        {isMonitoring ? 'Active' : 'Offline'}
                    </span>
                </div>
            </div>
        </nav>
    );
}