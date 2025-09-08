'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, LayoutDashboard, FileWarning, Settings } from 'lucide-react';
import { useSentinelContext } from '@/context/SentinelContext';

const NavLink = ({ href, children }) => {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <Link 
            href={href} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                isActive 
                    ? 'bg-gradient-to-r from-sky-500/20 to-blue-500/20 text-sky-300 border border-sky-500/30 shadow-lg shadow-sky-500/20' 
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border border-transparent'
            }`}
        >
            {children}
        </Link>
    );
};

export default function Navbar() {
    const { isMonitoring } = useSentinelContext();

    return (
        <nav className="bg-slate-900/95 backdrop-blur-lg border-b border-slate-700/50 p-4 sticky top-0 z-50 shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-3 group">
                        <Shield className="text-sky-400 group-hover:text-sky-300 transition-colors" size={32} />
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent hidden sm:block">
                            Sentinel
                        </h1>
                    </Link>
                    <div className="flex items-center gap-2">
                        <NavLink href="/">
                            <LayoutDashboard size={16} /> 
                            <span className="hidden sm:inline">Dashboard</span>
                        </NavLink>
                        <NavLink href="/quarantine">
                            <FileWarning size={16} /> 
                            <span className="hidden sm:inline">Quarantine</span>
                        </NavLink>
                        <NavLink href="/settings">
                            <Settings size={16} /> 
                            <span className="hidden sm:inline">Settings</span>
                        </NavLink>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`relative flex items-center justify-center w-3 h-3`}>
                        <div className={`absolute w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        {isMonitoring && (
                            <div className="absolute w-3 h-3 rounded-full animate-ping bg-green-500"></div>
                        )}
                    </div>
                    <span className={`font-bold text-sm ${isMonitoring ? 'text-green-400' : 'text-red-400'}`}>
                        {isMonitoring ? 'Active' : 'Offline'}
                    </span>
                </div>
            </div>
        </nav>
    );
}