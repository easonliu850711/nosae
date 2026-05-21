#!/bin/bash
# Nosae Site Deployment Script
# Run on Taiwan server (japan.studio-imori.com) via SSH
# Usage: bash deploy-nosae.sh

set -e

SITE_DIR="/root/nosae-site"
REPO_DIR="/root/nosae-git"

echo "🌸 Deploying Nosae Site..."
cd "$REPO_DIR" || { echo "Repo not found at $REPO_DIR"; exit 1; }

git pull origin main

# Build
npm ci
npm run build

# Copy standalone build to site dir
rm -rf "$SITE_DIR"/*
cp -r .next/standalone/* "$SITE_DIR/"
cp -r .next/static "$SITE_DIR/.next/static/"
cp -r public/* "$SITE_DIR/" 2>/dev/null || true

# Restart PM2
pm2 restart nosae-site --update-env

echo "✅ Nosae site deployed!"
