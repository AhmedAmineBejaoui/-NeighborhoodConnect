// Système de traduction français/anglais pour Hub Communautaire 2900

export type Language = 'fr' | 'en';

export interface Translations {
  // Navigation
  home: string;
  community: string;
  discussions: string;
  marketplace: string;
  events: string;
  profile: string;
  settings: string;
  
  // Authentication
  login: string;
  logout: string;
  register: string;
  email: string;
  password: string;
  name: string;
  welcome: string;
  
  // General
  loading: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  create: string;
  search: string;
  filter: string;
  
  // Landing Page - Futuristic 2900
  landingTitle: string;
  landingSubtitle: string;
  quantumPortalTitle: string;
  neuralNetworkTitle: string;
  aiAssistantTitle: string;
  connectToCommunity: string;
  
  // AI Assistant ARIA
  ariaWelcome: string;
  ariaHelp: string;
  askAria: string;
  
  // Theme & Language
  darkMode: string;
  lightMode: string;
  language: string;
  french: string;
  english: string;
  
  // Dashboard
  smartDashboard: string;
  quantumMetrics: string;
  neuralAnalytics: string;
  communityPulse: string;
  
  // Posts & Discussions
  createPost: string;
  discussions: string;
  announcements: string;
  marketplace: string;
  polls: string;
  
  // Time
  now: string;
  today: string;
  yesterday: string;
  thisWeek: string;
}

export const translations: Record<Language, Translations> = {
  fr: {
    // Navigation
    home: 'Accueil',
    community: 'Communauté',
    discussions: 'Discussions',
    marketplace: 'Marché',
    events: 'Événements',
    profile: 'Profil',
    settings: 'Paramètres',
    
    // Authentication
    login: 'Connexion',
    logout: 'Déconnexion',
    register: 'S\'inscrire',
    email: 'Email',
    password: 'Mot de passe',
    name: 'Nom',
    welcome: 'Bienvenue',
    
    // General
    loading: 'Chargement...',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    create: 'Créer',
    search: 'Rechercher',
    filter: 'Filtrer',
    
    // Landing Page - Futuristic 2900
    landingTitle: 'Hub Communautaire 2900',
    landingSubtitle: 'L\'avenir des communautés connectées avec IA et réalité quantique',
    quantumPortalTitle: 'Portail Quantique',
    neuralNetworkTitle: 'Réseau Neural',
    aiAssistantTitle: 'Assistant IA ARIA',
    connectToCommunity: 'Se Connecter à la Communauté',
    
    // AI Assistant ARIA
    ariaWelcome: 'Bonjour ! Je suis ARIA, votre assistant IA communautaire.',
    ariaHelp: 'Comment puis-je vous aider aujourd\'hui ?',
    askAria: 'Demander à ARIA',
    
    // Theme & Language
    darkMode: 'Mode Sombre',
    lightMode: 'Mode Clair',
    language: 'Langue',
    french: 'Français',
    english: 'English',
    
    // Dashboard
    smartDashboard: 'Tableau de Bord Intelligent',
    quantumMetrics: 'Métriques Quantiques',
    neuralAnalytics: 'Analytics Neural',
    communityPulse: 'Pouls Communautaire',
    
    // Posts & Discussions
    createPost: 'Créer un Post',
    announcements: 'Annonces',
    polls: 'Sondages',
    
    // Time
    now: 'maintenant',
    today: 'aujourd\'hui',
    yesterday: 'hier',
    thisWeek: 'cette semaine',
  },
  
  en: {
    // Navigation
    home: 'Home',
    community: 'Community',
    discussions: 'Discussions',
    marketplace: 'Marketplace',
    events: 'Events',
    profile: 'Profile',
    settings: 'Settings',
    
    // Authentication
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    welcome: 'Welcome',
    
    // General
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    search: 'Search',
    filter: 'Filter',
    
    // Landing Page - Futuristic 2900
    landingTitle: 'Community Hub 2900',
    landingSubtitle: 'The future of connected communities with AI and quantum reality',
    quantumPortalTitle: 'Quantum Portal',
    neuralNetworkTitle: 'Neural Network',
    aiAssistantTitle: 'AI Assistant ARIA',
    connectToCommunity: 'Connect to Community',
    
    // AI Assistant ARIA
    ariaWelcome: 'Hello! I\'m ARIA, your community AI assistant.',
    ariaHelp: 'How can I help you today?',
    askAria: 'Ask ARIA',
    
    // Theme & Language
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'Language',
    french: 'Français',
    english: 'English',
    
    // Dashboard
    smartDashboard: 'Smart Dashboard',
    quantumMetrics: 'Quantum Metrics',
    neuralAnalytics: 'Neural Analytics',
    communityPulse: 'Community Pulse',
    
    // Posts & Discussions
    createPost: 'Create Post',
    announcements: 'Announcements',
    polls: 'Polls',
    
    // Time
    now: 'now',
    today: 'today',
    yesterday: 'yesterday',
    thisWeek: 'this week',
  }
};

// Hook pour utiliser les traductions
export function useTranslations(language: Language = 'fr') {
  return translations[language];
}

// Fonction utilitaire pour obtenir une traduction
export function t(key: keyof Translations, language: Language = 'fr'): string {
  return translations[language][key] || translations.fr[key] || key;
}