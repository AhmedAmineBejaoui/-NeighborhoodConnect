#!/bin/sh
set -e

echo "Initializing Prisma database..."
npx prisma db push --skip-generate 2>&1 || true

echo "Starting Next.js server..."
exec node server.js
