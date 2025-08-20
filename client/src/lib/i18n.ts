export const translations = {
  fr: {
    // Navigation
    "nav.feed": "Fil d'actualité",
    "nav.announcements": "Annonces",
    "nav.marketplace": "Marketplace",
    "nav.polls": "Sondages",
    "nav.services": "Services",
    "nav.moderation": "Modération",
    "nav.reports": "Signalements",
    "nav.hidden": "Contenu masqué",
    "nav.profile": "Profil",
    
    // Auth
    "auth.login": "Se connecter",
    "auth.register": "Créer un compte",
    "auth.logout": "Se déconnecter",
    "auth.email": "Email",
    "auth.password": "Mot de passe",
    "auth.name": "Nom",
    "auth.welcome": "Bienvenue !",
    "auth.loginSuccess": "Connexion réussie",
    "auth.loginError": "Email ou mot de passe incorrect",
    "auth.registerSuccess": "Compte créé avec succès !",
    "auth.registerError": "Une erreur est survenue",
    
    // Posts
    "post.create": "Créer un post",
    "post.title": "Titre",
    "post.body": "Contenu",
    "post.tags": "Tags",
    "post.publish": "Publier",
    "post.draft": "Brouillon",
    "post.like": "J'aime",
    "post.comment": "Commenter",
    "post.share": "Partager",
    "post.report": "Signaler",
    "post.comments": "commentaires",
    "post.noComments": "Aucun commentaire",
    "post.loadMore": "Charger plus",
    
    // Post types
    "postType.announcement": "Annonce",
    "postType.service": "Service",
    "postType.market": "À vendre",
    "postType.poll": "Sondage",
    
    // Comments
    "comment.add": "Ajouter un commentaire",
    "comment.reply": "Répondre",
    "comment.edit": "Modifier",
    "comment.delete": "Supprimer",
    "comment.report": "Signaler",
    
    // Notifications
    "notification.bell": "Notifications",
    "notification.markRead": "Marquer comme lu",
    "notification.markAllRead": "Tout marquer comme lu",
    "notification.empty": "Aucune notification",
    
    // Filters
    "filter.all": "Tous",
    "filter.announcements": "Annonces",
    "filter.services": "Services",
    "filter.marketplace": "Marketplace",
    "filter.polls": "Sondages",
    "filter.search": "Rechercher...",
    
    // Composer
    "composer.title": "Créer un nouveau post",
    "composer.selectType": "Type de post",
    "composer.titlePlaceholder": "Donnez un titre à votre post...",
    "composer.bodyPlaceholder": "Écrivez votre message...",
    "composer.tagsPlaceholder": "Ajoutez des tags séparés par des virgules...",
    "composer.price": "Prix",
    "composer.images": "Images",
    "composer.cancel": "Annuler",
    "composer.publish": "Publier",
    "composer.uploadImages": "Glissez-déposez vos images ou",
    "composer.selectFiles": "Choisir des fichiers",
    
    // Polls
    "poll.vote": "Voter",
    "poll.results": "Résultats",
    "poll.totalVotes": "Total des votants",
    "poll.participation": "Participation",
    "poll.hasVoted": "Vous avez voté",
    "poll.endingIn": "Se termine dans",
    
    // Reports
    "report.submit": "Signaler",
    "report.reason": "Raison du signalement",
    "report.reasonPlaceholder": "Pourquoi signalez-vous ce contenu ?",
    "report.reasons.spam": "Spam",
    "report.reasons.inappropriate": "Contenu inapproprié",
    "report.reasons.harassment": "Harcèlement",
    "report.reasons.false": "Fausses informations",
    "report.reasons.other": "Autre",
    
    // Moderation
    "moderation.hide": "Masquer",
    "moderation.show": "Afficher",
    "moderation.resolve": "Résoudre",
    "moderation.pending": "En attente",
    "moderation.resolved": "Résolu",
    
    // Marketplace
    "marketplace.price": "Prix",
    "marketplace.contact": "Contacter",
    "marketplace.sold": "Vendu",
    "marketplace.available": "Disponible",
    
    // Common
    "common.loading": "Chargement...",
    "common.error": "Une erreur est survenue",
    "common.save": "Enregistrer",
    "common.cancel": "Annuler",
    "common.delete": "Supprimer",
    "common.edit": "Modifier",
    "common.close": "Fermer",
    "common.back": "Retour",
    "common.next": "Suivant",
    "common.previous": "Précédent",
    "common.search": "Rechercher",
    "common.filter": "Filtrer",
    "common.sort": "Trier",
    "common.date": "Date",
    "common.author": "Auteur",
    "common.status": "Statut",
    
    // Time
    "time.now": "maintenant",
    "time.minute": "minute",
    "time.minutes": "minutes",
    "time.hour": "heure",
    "time.hours": "heures",
    "time.day": "jour",
    "time.days": "jours",
    "time.week": "semaine",
    "time.weeks": "semaines",
    "time.month": "mois",
    "time.months": "mois",
    "time.year": "année",
    "time.years": "années",
    "time.ago": "il y a",
    
    // Roles
    "role.admin": "Administrateur",
    "role.moderator": "Modérateur",
    "role.resident": "Résident",
    
    // Community
    "community.stats": "Statistiques de la communauté",
    "community.activeResidents": "Résidents actifs",
    "community.weeklyPosts": "Posts cette semaine",
    "community.activePolls": "Sondages actifs",
    "community.quickActions": "Actions rapides",
    "community.recentActivity": "Activité récente",
    
    // Theme
    "theme.light": "Thème clair",
    "theme.dark": "Thème sombre",
    "theme.system": "Système",
  },
  
  // English translations could be added here
  en: {
    // ... English translations
  }
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.fr;

let currentLanguage: Language = "fr";

export function setLanguage(lang: Language) {
  currentLanguage = lang;
}

export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  let translation = translations[currentLanguage][key] || key;
  
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), String(value));
    });
  }
  
  return translation;
}

export function getCurrentLanguage(): Language {
  return currentLanguage;
}
