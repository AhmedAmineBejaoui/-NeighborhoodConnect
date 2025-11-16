# 🧪 Guide de Test pour l'Application TODO Multi-tier

## 📋 Checklist de Test

### ✅ 1. Vérification des fichiers de configuration

#### Dockerfile
- [ ] Vérifier que le Dockerfile est correctement structuré
- [ ] Vérifier les étapes de build (builder et runner)
- [ ] Vérifier la gestion des utilisateurs non-root
- [ ] Vérifier l'exposition du port 3000

#### docker-compose.yml
- [ ] Vérifier la définition des 3 services (app, db, nginx)
- [ ] Vérifier la configuration des volumes
- [ ] Vérifier la configuration du réseau
- [ ] Vérifier les variables d'environnement

#### nginx.conf
- [ ] Vérifier la configuration du reverse proxy
- [ ] Vérifier l'upstream vers l'application
- [ ] Vérifier les headers de proxy

### ✅ 2. Test de l'application Next.js

#### Développement local
```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Tester l'application sur http://localhost:3000
```

#### Tests fonctionnels
- [ ] La page se charge correctement
- [ ] Le formulaire de création de tâche fonctionne
- [ ] La liste des tâches s'affiche
- [ ] La modification d'une tâche fonctionne
- [ ] La suppression d'une tâche fonctionne
- [ ] Le marquage comme complété fonctionne

#### Tests API
```bash
# Test GET /api/todos
curl http://localhost:3000/api/todos

# Test POST /api/todos
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test task","priority":"HIGH"}'

# Test PUT /api/todos/[id]
curl -X PUT http://localhost:3000/api/todos/[ID] \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# Test DELETE /api/todos/[id]
curl -X DELETE http://localhost:3000/api/todos/[ID]
```

### ✅ 3. Test avec Docker Compose

#### Prérequis
- [ ] Docker installé
- [ ] Docker Compose installé

#### Déploiement
```bash
# Construire et démarrer les services
docker-compose up --build

# Vérifier l'état des services
docker-compose ps

# Vérifier les logs
docker-compose logs -f
```

#### Tests d'intégration
- [ ] L'application démarre correctement
- [ ] La base de données est accessible
- [ ] Le reverse proxy Nginx fonctionne
- [ ] L'application est accessible via http://localhost:80
- [ ] L'API est fonctionnelle

#### Tests de persistance
- [ ] Créer des tâches via l'interface
- [ ] Arrêter et redémarrer les conteneurs
- [ ] Vérifier que les données sont toujours présentes

### ✅ 4. Tests de performance

#### Tests de charge
```bash
# Installer Apache Bench
sudo apt-get install apache2-utils

# Test de charge sur l'API
ab -n 100 -c 10 http://localhost:3000/api/todos

# Test de charge sur le frontend
ab -n 100 -c 10 http://localhost:80/
```

#### Monitoring
- [ ] Surveiller l'utilisation CPU/Mémoire
- [ ] Vérifier les temps de réponse
- [ ] Surveiller les logs d'erreurs

### ✅ 5. Tests de sécurité

#### Tests de base
- [ ] Vérifier que l'utilisateur non-root est utilisé
- [ ] Vérifier que les ports sont correctement configurés
- [ ] Vérifier que les variables sensibles sont bien gérées

#### Tests de l'API
- [ ] Tester les requêtes invalides
- [ ] Tester les injections SQL
- [ ] Vérifier la validation des entrées

## 📊 Résultats Attendus

### Performance
- Temps de réponse < 200ms pour l'API
- Utilisation CPU < 50% en charge normale
- Utilisation mémoire < 512MB pour l'application

### Fiabilité
- Application disponible 99% du temps
- Redémarrage automatique en cas d'erreur
- Persistance des données garantie

### Sécurité
- Aucune exposition de données sensibles
- Utilisateur non-root dans les conteneurs
- Isolation réseau correcte

## 🐛 Dépannage

### Problèmes courants
1. **Port déjà utilisé**
   ```bash
   # Vérifier les ports utilisés
   netstat -tulpn | grep :80
   netstat -tulpn | grep :3000
   ```

2. **Problème de base de données**
   ```bash
   # Vérifier les logs de la base de données
   docker-compose logs db
   ```

3. **Problème de réseau**
   ```bash
   # Vérifier la connectivité entre conteneurs
   docker-compose exec app ping db
   ```

4. **Problème de permissions**
   ```bash
   # Vérifier les permissions des volumes
   docker-compose exec app ls -la /app/db
   ```

## 📝 Rapport de Test

### Test réussi ✅
- [ ] Application Next.js fonctionnelle
- [ ] API REST complète
- [ ] Intégration Docker réussie
- [ ] Persistance des données
- [ ] Reverse proxy opérationnel

### Tests à améliorer ⚠️
- [ ] Tests de charge automatisés
- [ ] Tests de sécurité approfondis
- [ ] Monitoring avancé
- [ ] Tests de montée en charge

---

*Ce guide de test doit être utilisé comme référence lors de la validation finale du projet multi-tier.*