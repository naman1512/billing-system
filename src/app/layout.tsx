import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalNavbar from "./components/ConditionalNavbar";
import { Toaster } from 'react-hot-toast';
import AuthProvider from "./components/AuthProvider/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Billing System",
  description: "Billing Generation System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden w-full`}
      >
        <AuthProvider>
          <ConditionalNavbar />
          <div className="w-full overflow-x-hidden">
            {children}
          </div>
        </AuthProvider>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              color: '#1f2937',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(20px)',
              fontSize: '14px',
              fontWeight: '500',
              padding: '16px 20px',
              minWidth: '300px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            },
            success: {
              style: {
                background: 'linear-gradient(135deg, #ffffff 0%, #f0fff4 100%)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                boxShadow: '0 25px 50px -12px rgba(34, 197, 94, 0.25), 0 0 0 1px rgba(34, 197, 94, 0.1)',
              },
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              style: {
                background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.25), 0 0 0 1px rgba(239, 68, 68, 0.1)',
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
            loading: {
              style: {
                background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.25), 0 0 0 1px rgba(99, 102, 241, 0.1)',
              },
              iconTheme: {
                primary: '#6366f1',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
