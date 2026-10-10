#!/usr/bin/env bash
# Daily backup of the WedVibe database and uploaded photos/songs. Keeps the last 14 days.
# Runs every morning from /etc/cron.d/wedvibe-backup (set up by setup-server.sh).
set -euo pipefail

DATA="/srv/wedvibe/data"
BACKUPS="/srv/wedvibe/backups"
STAMP="$(date +%F)"

mkdir -p "$BACKUPS"
# sqlite's .backup makes a consistent copy even while the site is running.
sqlite3 "$DATA/wedvibe.db" ".backup '$BACKUPS/wedvibe-$STAMP.db'"
tar -czf "$BACKUPS/uploads-$STAMP.tar.gz" -C "$DATA" uploads
find "$BACKUPS" -type f \( -name 'wedvibe-*.db' -o -name 'uploads-*.tar.gz' \) -mtime +14 -delete

echo "$(date '+%F %T') backup done: wedvibe-$STAMP.db, uploads-$STAMP.tar.gz"
