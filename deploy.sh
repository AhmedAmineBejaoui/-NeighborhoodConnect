#!/bin/bash

# Script de déploiement pour l'application TODO Multi-tier

echo "🚀 Déploiement de l'application TODO Multi-tier"

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker d'abord."
    exit 1
fi

# Vérifier si Docker Compose (V2) est disponible
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose n'est pas disponible. Installe-le via Docker."
    exit 1
fi

# Utiliser la commande correcte (compose v2)
DC="docker compose"

# Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
$DC down

# Construire et démarrer les conteneurs
echo "🔨 Construction des images Docker..."
$DC build

echo "🎯 Démarrage des services..."
$DC up -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 10

# Vérifier l'état des services
echo "📊 État des services :"
$DC ps

echo ""
echo "✅ Application déployée avec succès !"
echo "🌐 Frontend: http://localhost:80 (via Nginx)"
echo "🔧 Application directe: http://localhost:3000"
echo "🗄️ Base de données: localhost:5432"
echo ""
echo "📋 Commandes utiles :"
echo "  - Voir les logs: docker compose logs -f"
echo "  - Arrêter: docker compose down"
echo "  - Redémarrer: docker compose restart"
echo ""
echo "🔍 Pour tester l'API :"
echo "  curl http://localhost:3000/api/todos"

