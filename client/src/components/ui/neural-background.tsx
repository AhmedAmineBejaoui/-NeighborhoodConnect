export function NeuralBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Neural network connections */}
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1920 1080">
        <defs>
          <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#0080ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8000ff" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        
        {/* Animated neural connections */}
        <g stroke="url(#neuralGradient)" strokeWidth="1" fill="none">
          <path d="M100,200 Q300,100 500,300 T900,200" className="animate-pulse" />
          <path d="M200,400 Q600,300 800,500 T1200,400" className="animate-pulse" style={{animationDelay: '0.5s'}} />
          <path d="M400,600 Q700,500 1000,700 T1400,600" className="animate-pulse" style={{animationDelay: '1s'}} />
          <path d="M150,100 Q450,50 750,250 T1150,100" className="animate-pulse" style={{animationDelay: '1.5s'}} />
          <path d="M300,800 Q600,700 900,900 T1300,800" className="animate-pulse" style={{animationDelay: '2s'}} />
        </g>
        
        {/* Neural nodes */}
        <g fill="url(#neuralGradient)">
          <circle cx="100" cy="200" r="3" className="animate-ping" />
          <circle cx="500" cy="300" r="3" className="animate-ping" style={{animationDelay: '0.3s'}} />
          <circle cx="900" cy="200" r="3" className="animate-ping" style={{animationDelay: '0.6s'}} />
          <circle cx="200" cy="400" r="3" className="animate-ping" style={{animationDelay: '0.9s'}} />
          <circle cx="800" cy="500" r="3" className="animate-ping" style={{animationDelay: '1.2s'}} />
          <circle cx="1200" cy="400" r="3" className="animate-ping" style={{animationDelay: '1.5s'}} />
        </g>
      </svg>
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}