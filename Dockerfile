# Étape de build pour l'application Next.js
FROM node:18-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de package
COPY package*.json ./

# Installer les dépendances (inclure devDependencies pendant l'étape de build)
# PostCSS/Tailwind build plugins (like @tailwindcss/postcss) are in devDependencies
# and must be available during `next build`.
# Ajout d'une boucle de retries pour rendre npm ci plus résilient aux erreurs réseau.
RUN set -eux; \
    npm config set fetch-retries 5; \
    npm config set fetch-retry-factor 3; \
    npm config set fetch-retry-mintimeout 20000; \
    npm config set fetch-retry-maxtimeout 120000; \
    for i in 1 2 3 4 5; do \
        npm ci && break; \
        if [ "$i" -eq 5 ]; then \
            echo "npm ci failed after $i attempts" >&2; \
            exit 1; \
        fi; \
        echo "npm ci failed (attempt $i/5). Retrying in 5s..." >&2; \
        sleep 5; \
    done

# Copier le reste du code
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Construire l'application
RUN npm run build

# Étape de production
FROM node:18-alpine AS runner

# Définir le répertoire de travail
WORKDIR /app

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier les fichiers construits
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Créer le répertoire pour la base de données
RUN mkdir -p /app/db && chown -R nextjs:nodejs /app/db

# Copier le script d'initialisation et le rendre exécutable
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Changer de propriétaire
RUN chown -R nextjs:nodejs /app

# Utiliser l'utilisateur non-root
USER nextjs

# Exposer le port
EXPOSE 3000

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Démarrer l'application
CMD ["/app/docker-entrypoint.sh"]
