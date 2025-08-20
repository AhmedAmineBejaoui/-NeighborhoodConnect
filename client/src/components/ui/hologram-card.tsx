import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface HologramCardProps {
  children: ReactNode;
  className?: string;
  intensity?: "low" | "medium" | "high";
}

export function HologramCard({ children, className = "", intensity = "medium" }: HologramCardProps) {
  const intensityClasses = {
    low: "opacity-80 backdrop-blur-sm",
    medium: "opacity-90 backdrop-blur-md",
    high: "opacity-95 backdrop-blur-lg"
  };

  return (
    <div className="relative group">
      {/* Hologram effect layers */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-2xl blur-sm opacity-30 animate-pulse"></div>
      
      <Card className={`relative bg-black/40 dark:bg-white/5 border border-cyan-400/30 ${intensityClasses[intensity]} hover:border-cyan-400/60 transition-all duration-500 ${className}`}>
        {/* Scanning line effect */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse opacity-40"></div>
        
        {/* Corner elements */}
        <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-cyan-400 opacity-60"></div>
        <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-cyan-400 opacity-60"></div>
        <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-cyan-400 opacity-60"></div>
        <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-cyan-400 opacity-60"></div>
        
        {children}
      </Card>
    </div>
  );
}