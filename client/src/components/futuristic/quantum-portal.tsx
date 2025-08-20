import { useState, useEffect } from "react";
import { HologramCard } from "@/components/ui/hologram-card";
import { Button } from "@/components/ui/button";

interface PortalDestination {
  id: string;
  name: string;
  description: string;
  icon: string;
  energy: number;
  available: boolean;
}

export function QuantumPortal() {
  const [isActive, setIsActive] = useState(false);
  const [destinations] = useState<PortalDestination[]>([
    {
      id: "future-events",
      name: "Événements Futurs",
      description: "Voyez les événements prédits par l'IA quantique",
      icon: "🔮",
      energy: 85,
      available: true
    },
    {
      id: "collective-mind",
      name: "Conscience Collective",
      description: "Connectez-vous à l'esprit de la communauté",
      icon: "🧠",
      energy: 92,
      available: true
    },
    {
      id: "time-analytics",
      name: "Analytiques Temporelles",
      description: "Analysez les tendances passées et futures",
      icon: "⏰",
      energy: 78,
      available: true
    },
    {
      id: "quantum-marketplace",
      name: "Marché Quantique",
      description: "Échanges instantanés entre dimensions",
      icon: "💎",
      energy: 67,
      available: false
    }
  ]);

  const [energyLevel, setEnergyLevel] = useState(100);

  useEffect(() => {
    const timer = setInterval(() => {
      setEnergyLevel(prev => {
        const newLevel = prev + (Math.random() - 0.5) * 10;
        return Math.max(0, Math.min(100, newLevel));
      });
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed bottom-24 right-6 z-40">
      <HologramCard intensity="high" className="w-80 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center">
            <span className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse mr-2"></span>
            Portail Quantique
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsActive(!isActive)}
            className="text-cyan-400 hover:text-white h-8 w-8 p-0"
          >
            {isActive ? "⚡" : "🌀"}
          </Button>
        </div>

        {/* Energy Level */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-cyan-300 mb-2">
            <span>Énergie Quantique</span>
            <span>{energyLevel.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-1000"
              style={{width: `${energyLevel}%`}}
            ></div>
          </div>
        </div>

        {/* Portal Destinations */}
        {isActive && (
          <div className="space-y-3">
            {destinations.map((dest) => (
              <button
                key={dest.id}
                disabled={!dest.available}
                className={`w-full p-3 rounded-xl border text-left transition-all hover:scale-[1.02] ${
                  dest.available
                    ? "border-cyan-400/30 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 hover:border-cyan-400/60"
                    : "border-gray-600/30 bg-gray-800/20 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{dest.icon}</div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">
                      {dest.name}
                    </div>
                    <div className="text-xs text-cyan-200/60">
                      {dest.description}
                    </div>
                  </div>
                  <div className="text-xs text-cyan-400">
                    {dest.energy}%
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Quantum Status */}
        <div className="mt-4 text-center">
          <div className="text-xs text-gray-400">
            Synchronisation quantique: {isActive ? "ACTIVE" : "STANDBY"}
          </div>
          {isActive && (
            <div className="flex justify-center mt-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-cyan-400 rounded-full mx-1 animate-pulse"
                  style={{animationDelay: `${i * 0.2}s`}}
                />
              ))}
            </div>
          )}
        </div>
      </HologramCard>
    </div>
  );
}