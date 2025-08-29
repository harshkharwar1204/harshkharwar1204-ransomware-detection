import './globals.css';
import Navbar from '@/components/Navbar';
import { SentinelProvider } from '@/context/SentinelContext';

export const metadata = {
  title: 'Sentinel Ransomware Detector',
  description: 'Real-time ransomware detection and quarantine system.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <SentinelProvider>
          <Navbar />
          <main className="flex-grow container mx-auto p-4 md-p-6">
            {children}
          </main>
        </SentinelProvider>
      </body>
    </html>
  );
}