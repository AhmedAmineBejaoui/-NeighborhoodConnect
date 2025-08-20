import { useState, useEffect } from "react";
import { HologramCard } from "@/components/ui/hologram-card";

interface SmartMetric {
  id: string;
  title: string;
  value: string;
  trend: "up" | "down" | "stable";
  prediction: string;
  icon: string;
  color: string;
}

export function SmartDashboard() {
  const [metrics, setMetrics] = useState<SmartMetric[]>([
    {
      id: "air-quality",
      title: "Qualité de l'Air",
      value: "Excellente",
      trend: "up",
      prediction: "+5% cette semaine",
      icon: "🌿",
      color: "from-green-400 to-emerald-500"
    },
    {
      id: "energy",
      title: "Efficacité Énergétique",
      value: "87%",
      trend: "up",
      prediction: "Optimal à 14h-17h",
      icon: "⚡",
      color: "from-yellow-400 to-orange-500"
    },
    {
      id: "community",
      title: "Engagement Communauté",
      value: "142 actifs",
      trend: "up",
      prediction: "+12 nouveaux aujourd'hui",
      icon: "👥",
      color: "from-blue-400 to-cyan-500"
    },
    {
      id: "security",
      title: "Sécurité IA",
      value: "100%",
      trend: "stable",
      prediction: "Surveillance active 24/7",
      icon: "🔒",
      color: "from-purple-400 to-indigo-500"
    },
    {
      id: "transport",
      title: "Transport Intelligent",
      value: "23 min",
      trend: "down",
      prediction: "Route optimisée par IA",
      icon: "🚗",
      color: "from-cyan-400 to-blue-500"
    },
    {
      id: "wellness",
      title: "Bien-être Collectif",
      value: "92%",
      trend: "up",
      prediction: "Pics d'activité à 18h",
      icon: "💚",
      color: "from-emerald-400 to-green-500"
    }
  ]);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Simulate real-time data updates
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.id === "community" 
          ? `${142 + Math.floor(Math.random() * 20)} actifs`
          : metric.value
      })));
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return "↗️";
      case "down": return "↘️";
      default: return "➡️";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Quantum Time */}
      <HologramCard intensity="high" className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Tableau de Bord Quantique
            </h2>
            <p className="text-cyan-300">Analyse prédictive en temps réel • Powered by IA Quantique</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono text-cyan-400">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-sm text-gray-400">
              Synchronisation Quantique Active
            </div>
          </div>
        </div>
      </HologramCard>

      {/* Smart Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <HologramCard key={metric.id} intensity="medium" className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${metric.color} flex items-center justify-center text-2xl shadow-lg`}>
                {metric.icon}
              </div>
              <div className="text-right">
                <span className="text-2xl">{getTrendIcon(metric.trend)}</span>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-2">
              {metric.title}
            </h3>
            
            <div className="mb-3">
              <div className="text-3xl font-bold text-transparent bg-gradient-to-r bg-clip-text from-cyan-400 to-blue-500">
                {metric.value}
              </div>
            </div>
            
            <div className="text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                <span>{metric.prediction}</span>
              </div>
            </div>
            
            {/* Progress bar simulation */}
            <div className="mt-4 w-full bg-gray-700 rounded-full h-1">
              <div 
                className={`h-1 bg-gradient-to-r ${metric.color} rounded-full transition-all duration-1000`}
                style={{width: `${60 + Math.random() * 40}%`}}
              ></div>
            </div>
          </HologramCard>
        ))}
      </div>

      {/* Neural Activity Map */}
      <HologramCard intensity="high" className="p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <span className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse mr-3"></span>
          Carte d'Activité Neurale Communautaire
        </h3>
        
        <div className="grid grid-cols-4 gap-4">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-lg border border-cyan-400/20 flex items-center justify-center"
            >
              <div 
                className={`w-6 h-6 rounded-full bg-gradient-to-r ${
                  Math.random() > 0.7 ? 'from-cyan-400 to-blue-500' : 'from-gray-600 to-gray-700'
                } animate-pulse`}
                style={{animationDelay: `${Math.random() * 2}s`}}
              ></div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-sm text-gray-400 flex justify-between">
          <span>🔵 Zones actives: 12/16</span>
          <span>⚡ Efficacité réseau: 94%</span>
          <span>🧠 IA adaptative: Active</span>
        </div>
      </HologramCard>
    </div>
  );
}