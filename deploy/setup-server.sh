#!/usr/bin/env bash
# One-time setup of WedVibe on a fresh Ubuntu 22.04/24.04 server (e.g. Oracle Cloud Always Free).
# Safe to run again: it skips anything already done.
#
#   bash setup-server.sh wedvibe.duckdns.org
#
# Before running, copy your database and uploads to the server's home folder (see deploy/README.md):
#   ~/wedvibe.db   and   ~/uploads/
# Without them the script creates an empty database with the templates and an admin login.
set -euo pipefail

DOMAIN="${1:?Usage: bash setup-server.sh <your-domain, e.g. wedvibe.duckdns.org>}"
REPO="https://github.com/SwethaSugi/WedVibe.git"
APP="/home/ubuntu/wedvibe"
SRV="/srv/wedvibe"
DATA="$SRV/data"
BACKUPS="$SRV/backups"
WHATSAPP_NUMBER="919751421162"

step() { printf '\n\033[1;35m==> %s\033[0m\n' "$1"; }

step "Installing system packages"
sudo apt-get update -y
echo iptables-persistent iptables-persistent/autosave_v4 boolean true | sudo debconf-set-selections
echo iptables-persistent iptables-persistent/autosave_v6 boolean true | sudo debconf-set-selections
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y git curl sqlite3 openssl gnupg debian-keyring debian-archive-keyring apt-transport-https iptables-persistent

step "Installing Node.js 22"
if ! command -v node >/dev/null || [[ "$(node -v)" != v22* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
node -v

step "Installing Caddy (web server with free automatic HTTPS)"
if ! command -v caddy >/dev/null; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  sudo apt-get update -y
  sudo apt-get install -y caddy
fi

step "Opening web ports 80 and 443 in the server firewall"
# Oracle's Ubuntu images reject everything except SSH; add ACCEPT rules before the REJECT rule.
for port in 80 443; do
  if ! sudo iptables -C INPUT -p tcp --dport "$port" -m state --state NEW -j ACCEPT 2>/dev/null; then
    reject_line=$(sudo iptables -L INPUT --line-numbers | awk '/REJECT/ {print $1; exit}')
    sudo iptables -I INPUT "${reject_line:-1}" -p tcp --dport "$port" -m state --state NEW -j ACCEPT
  fi
done
sudo netfilter-persistent save

step "Preparing folders"
sudo mkdir -p "$DATA/uploads/music" "$BACKUPS"
sudo chown -R ubuntu:ubuntu "$SRV"
chmod 755 "$SRV" "$DATA" "$DATA/uploads"
chmod 700 "$BACKUPS"

# Database and uploads copied from your computer to the home folder are moved into place once.
if [ -f "$HOME/wedvibe.db" ] && [ ! -f "$DATA/wedvibe.db" ]; then
  mv "$HOME/wedvibe.db" "$DATA/wedvibe.db"
  echo "Moved your database into $DATA"
fi
if [ -d "$HOME/uploads" ]; then
  cp -rn "$HOME/uploads/." "$DATA/uploads/"
  rm -rf "$HOME/uploads"
  echo "Moved your uploads into $DATA/uploads"
fi

step "Downloading the WedVibe code"
if [ -d "$APP/.git" ]; then
  git -C "$APP" pull --ff-only
else
  git clone "$REPO" "$APP"
fi
# Uploads are saved to public/uploads; point it at the data folder so code updates never touch them.
if [ -d "$APP/public/uploads" ] && [ ! -L "$APP/public/uploads" ]; then
  cp -rn "$APP/public/uploads/." "$DATA/uploads/" || true
  rm -rf "$APP/public/uploads"
fi
ln -sfn "$DATA/uploads" "$APP/public/uploads"

step "Writing settings (.env)"
if [ ! -f "$APP/.env" ]; then
  cat > "$APP/.env" <<EOF
DATABASE_URL="file:$DATA/wedvibe.db"
JWT_SECRET="$(openssl rand -hex 32)"
NEXT_PUBLIC_APP_URL=https://$DOMAIN
NEXT_PUBLIC_ORDER_MODE=whatsapp
NEXT_PUBLIC_SUPPORT_WHATSAPP=$WHATSAPP_NUMBER
NEXT_PUBLIC_SUPPORT_EMAIL=
NEXT_PUBLIC_BUSINESS_ADDRESS=
WHATSAPP_PROVIDER=mock
PAYMENT_PROVIDER=mock
ADMIN_USERNAME=admin
ADMIN_PASSWORD=
EOF
  chmod 600 "$APP/.env"
  echo "Created $APP/.env"
else
  echo "Keeping existing $APP/.env"
fi

step "Installing app dependencies and preparing the database"
cd "$APP"
npm ci
if [ -f "$DATA/wedvibe.db" ]; then
  npx prisma db push --skip-generate
else
  npx prisma db push --skip-generate
  echo "No database copied: adding templates and an admin login…"
  npx prisma db seed
fi

step "Building the website (this takes a few minutes)"
npm run build

step "Starting WedVibe as a service (auto-starts on reboot, restarts if it crashes)"
sudo cp "$APP/deploy/wedvibe.service" /etc/systemd/system/wedvibe.service
sudo systemctl daemon-reload
sudo systemctl enable wedvibe
sudo systemctl restart wedvibe

step "Configuring HTTPS for $DOMAIN"
sed "s/__DOMAIN__/$DOMAIN/" "$APP/deploy/Caddyfile" | sudo tee /etc/caddy/Caddyfile >/dev/null
sudo systemctl reload caddy || sudo systemctl restart caddy

step "Scheduling daily backups (08:00 India time)"
chmod +x "$APP/deploy/backup.sh" "$APP/deploy/update.sh"
echo "30 2 * * * ubuntu $APP/deploy/backup.sh >> $BACKUPS/backup.log 2>&1" | sudo tee /etc/cron.d/wedvibe-backup >/dev/null
"$APP/deploy/backup.sh"

step "Done"
sleep 3
if curl -fsS -o /dev/null http://127.0.0.1:3000; then echo "WedVibe is running."; else echo "WedVibe did not answer yet; check: sudo journalctl -u wedvibe -n 50"; fi
echo "Open https://$DOMAIN in your browser (HTTPS can take a minute the first time)."
