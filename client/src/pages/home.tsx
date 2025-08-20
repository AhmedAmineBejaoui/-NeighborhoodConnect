import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { NeuralBackground } from "@/components/ui/neural-background";
import { HologramCard } from "@/components/ui/hologram-card";
import { AIAssistant } from "@/components/futuristic/ai-assistant";
import { SmartDashboard } from "@/components/futuristic/smart-dashboard";
import { QuantumPortal } from "@/components/futuristic/quantum-portal";

export default function Home() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 relative overflow-hidden">
      <NeuralBackground />
      {/* Futuristic Navigation */}
      <nav className="relative z-10 bg-black/40 backdrop-blur-xl border-b border-cyan-400/30 shadow-2xl shadow-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/50">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Hub Communautaire ∞
                </h1>
                <div className="text-xs text-cyan-300/70">Powered by Quantum AI • 2900 Edition</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-sm font-medium text-cyan-100">
                  Bienvenue, {user?.name}
                </span>
                <div className="text-xs text-cyan-300/60">Neural ID: {user?.id?.slice(-6) || "######"}</div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="text-sm border-red-400/50 text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:border-red-400"
              >
                Déconnexion Quantique
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Communauté Quantique Active
          </h2>
          <p className="text-xl text-cyan-100/80 max-w-2xl mx-auto">
            Intelligence collective augmentée • Prédictions AI • Connexions neurales temps réel
          </p>
        </div>

        {/* Smart Dashboard */}
        <SmartDashboard />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Future Feature Cards */}
          <HologramCard intensity="high" className="p-6">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-green-500/30">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L11.5 4.5L15.5 8.5H14L7 15.5V22H9V16L12.5 12.5L15 15V22H17V13.5L15 11.5L16.5 10H21Z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              🧠 Discussions Neurales
            </h3>
            <p className="text-cyan-100/70">
              IA augmentée pour des conversations plus profondes et pertinentes
            </p>
          </HologramCard>

          <HologramCard intensity="high" className="p-6">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L21 5V11C21 16.55 17.16 21.74 12 23C6.84 21.74 3 16.55 3 11V5L12 1ZM12 7C10.6 7 9.2 8.6 9.2 10V11.5C9.2 12.9 10.6 14.5 12 14.5S14.8 12.9 14.8 11.5V10C14.8 8.6 13.4 7 12 7Z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              ⚡ Événements Prédictifs
            </h3>
            <p className="text-cyan-100/70">
              IA qui prédit et organise les événements parfaits selon les besoins communautaires
            </p>
          </HologramCard>

          <HologramCard intensity="high" className="p-6">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-yellow-500/30">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L11.5 4.5L15.5 8.5H14L7 15.5V22H9V16L12.5 12.5L15 15V22H17V13.5L15 11.5L16.5 10H21Z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              🔮 Marketplace Quantique
            </h3>
            <p className="text-cyan-100/70">
              Commerce intelligent avec blockchain sécurisée et prédiction de prix par IA
            </p>
          </HologramCard>
        </div>

      </main>

      {/* Futuristic Features */}
      <AIAssistant />
      <QuantumPortal />
    </div>
  );
}