import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HologramCard } from "@/components/ui/hologram-card";
import { Input } from "@/components/ui/input";

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Bonjour ! Je suis ARIA, votre assistant communautaire IA. Comment puis-je vous aider aujourd'hui ?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "Excellente question ! En tant qu'IA communautaire, je peux vous aider avec les événements à venir, les services de quartier, ou répondre à vos questions sur la vie de la communauté.",
        "J'ai analysé les tendances de votre quartier. Il y a beaucoup d'activité autour des jardins communautaires et des événements familiaux. Souhaitez-vous que je vous connecte avec d'autres résidents intéressés ?",
        "Basé sur votre profil et vos préférences, je recommande de participer au groupe de discussion 'Technologies Durables' qui se réunit demain à 19h.",
        "Je peux vous aider à organiser un événement, trouver des services locaux, ou même prédire les meilleures heures pour utiliser les espaces communs basé sur l'analyse des données communautaires."
      ];
      
      const response = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {/* AI Assistant Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/25 border border-cyan-400/50"
      >
        <div className="relative">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 7C13.4 7 14.8 8.6 14.8 10V11.5C14.8 12.9 13.4 14.5 12 14.5S9.2 12.9 9.2 11.5V10C9.2 8.6 10.6 7 12 7ZM7.5 17.25C7.5 15.75 9.5 14.5 12 14.5S16.5 15.75 16.5 17.25V18H7.5V17.25Z"/>
          </svg>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </Button>

      {/* AI Assistant Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <HologramCard intensity="high" className="w-full max-w-md h-96 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-cyan-400/30">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">AI</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">ARIA</h3>
                  <p className="text-xs text-cyan-300">Assistant IA Communautaire</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white h-8 w-8 p-0"
              >
                ✕
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-2xl text-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'bg-gray-800/50 text-cyan-100 border border-cyan-400/30'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-800/50 border border-cyan-400/30 p-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-cyan-400/30">
              <div className="flex space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Posez votre question..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="bg-gray-800/50 border-cyan-400/30 text-white placeholder-gray-400 focus:border-cyan-400"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                >
                  →
                </Button>
              </div>
            </div>
          </HologramCard>
        </div>
      )}
    </>
  );
}