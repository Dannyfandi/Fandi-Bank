import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fandi Bank",
  description: "Your personal banking companion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-black text-zinc-50 relative overflow-x-hidden selection:bg-purple-500/30" suppressHydrationWarning>
        
        {/* Animated Liquid Glass Background */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-black">
          <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vh] rounded-full bg-purple-600/30 mix-blend-screen filter blur-[120px] opacity-80 animate-glass-1" />
          <div className="absolute top-[20%] -right-[20%] w-[60vw] h-[80vh] rounded-full bg-fuchsia-600/30 mix-blend-screen filter blur-[140px] opacity-70 animate-glass-2" />
          <div className="absolute -bottom-[20%] left-[20%] w-[80vw] h-[60vh] rounded-full bg-violet-600/30 mix-blend-screen filter blur-[130px] opacity-60 animate-glass-3" />
          <div className="absolute top-[50%] left-[40%] w-[40vw] h-[40vh] rounded-full bg-indigo-600/20 mix-blend-screen filter blur-[100px] opacity-50 animate-glass-4" />
          
          {/* Frost overlay */}
          <div className="absolute inset-0 bg-transparent backdrop-blur-[60px]" />
        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes drift1 {
            0% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(8vw, -6vh) scale(1.08); }
            50% { transform: translate(-3vw, 10vh) scale(0.95); }
            75% { transform: translate(5vw, -3vh) scale(1.05); }
            100% { transform: translate(0, 0) scale(1); }
          }
          @keyframes drift2 {
            0% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(-6vw, 8vh) scale(1.1); }
            50% { transform: translate(4vw, -5vh) scale(0.92); }
            75% { transform: translate(-3vw, 4vh) scale(1.06); }
            100% { transform: translate(0, 0) scale(1); }
          }
          @keyframes drift3 {
            0% { transform: translate(0, 0) scale(1) rotate(0deg); }
            33% { transform: translate(6vw, 7vh) scale(1.08) rotate(2deg); }
            66% { transform: translate(-5vw, -4vh) scale(0.94) rotate(-1deg); }
            100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          }
          @keyframes drift4 {
            0% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-8vw, -6vh) scale(1.15); }
            100% { transform: translate(0, 0) scale(1); }
          }
          .animate-glass-1 { animation: drift1 20s infinite ease-in-out; will-change: transform; }
          .animate-glass-2 { animation: drift2 26s infinite ease-in-out; will-change: transform; }
          .animate-glass-3 { animation: drift3 30s infinite ease-in-out 3s; will-change: transform; }
          .animate-glass-4 { animation: drift4 22s infinite ease-in-out 8s; will-change: transform; }
        `}} />

        <div className="relative z-0 flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
