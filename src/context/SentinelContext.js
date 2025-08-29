'use client';
import { createContext, useContext } from 'react';
import { useSentinel } from '@/hooks/useSentinel'; // We will reuse the hook we already built!

const SentinelContext = createContext(null);

export function SentinelProvider({ children }) {
    // The useSentinel hook now lives here, at the highest level of the application.
    const sentinelStateAndActions = useSentinel(); 
    
    return (
        <SentinelContext.Provider value={sentinelStateAndActions}>
            {children}
        </SentinelContext.Provider>
    );
}

// This is a helper that makes it easy for any page or component to access the global state.
export function useSentinelContext() {
    const context = useContext(SentinelContext);
    if (!context) {
        throw new Error('useSentinelContext must be used within a SentinelProvider');
    }
    return context;
}
