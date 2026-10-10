#!/usr/bin/env bash
# Puts the latest code from GitHub live: backup first, then download, build and restart.
#   bash ~/wedvibe/deploy/update.sh
set -euo pipefail

APP="/home/ubuntu/wedvibe"
cd "$APP"

echo "==> Backing up first"
"$APP/deploy/backup.sh"

echo "==> Downloading the latest code"
git pull --ff-only

echo "==> Installing dependencies and applying database changes"
npm ci
npx prisma db push --skip-generate

echo "==> Building"
npm run build

echo "==> Restarting"
sudo systemctl restart wedvibe
sleep 3
systemctl is-active wedvibe && echo "WedVibe updated and running."
