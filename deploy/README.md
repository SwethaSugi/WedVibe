# Putting WedVibe live on a server

Works on any Ubuntu 22.04/24.04 server, including **Oracle Cloud Always Free** (Ampere A1,
2 OCPU / 12 GB). Commands marked **(your PC)** run in Windows PowerShell; **(server)** run after
connecting with `ssh`.

| On the server | What it is |
|---|---|
| `/home/ubuntu/wedvibe` | The code (from GitHub) |
| `/srv/wedvibe/data/wedvibe.db` | The database: templates, prices, invitations, songs, admin login |
| `/srv/wedvibe/data/uploads/` | Uploaded photos and songs |
| `/srv/wedvibe/backups/` | Daily backups, last 14 days |

Code updates never touch `/srv/wedvibe/data`.

## 1. Point your address at the server

**Free DuckDNS address:** sign in at duckdns.org, create a sub-domain (e.g. `wedvibe`), put the
server's **public IP** in the "current ip" box and click **update ip**. Your address is then
`wedvibe.duckdns.org`.

**Own domain (e.g. wedvibe.in):** in your domain provider's DNS settings add an **A record**:
name `@` → the server's public IP (and optionally `www` → the same IP).

## 2. Connect to the server (your PC)

Oracle gave you a private key file when creating the server. Put it in `C:\Users\<you>\.ssh\`,
e.g. `C:\Users\SWE\.ssh\wedvibe.key`. Windows' ssh refuses keys other users can read, so lock it
down once:

```powershell
$key = "$env:USERPROFILE\.ssh\wedvibe.key"
icacls $key /inheritance:r
icacls $key /grant:r "$($env:USERNAME):(R)"
```

Then connect (replace `SERVER_IP`):

```powershell
ssh -i $env:USERPROFILE\.ssh\wedvibe.key ubuntu@SERVER_IP
```

Type `yes` the first time. Type `exit` to leave.

## 3. Copy your data to the server (your PC)

This copies your templates, prices, offers, songs and admin login (the local database) and the
uploaded songs/photos. Run in a **new** PowerShell window, not inside ssh:

```powershell
$key = "$env:USERPROFILE\.ssh\wedvibe.key"
scp -i $key D:\BuisnessApp\WeddingApp\prisma\dev.db ubuntu@SERVER_IP:~/wedvibe.db
scp -i $key -r D:\BuisnessApp\WeddingApp\public\uploads ubuntu@SERVER_IP:~/
```

(Skip this to start with an empty database; the setup then adds the templates and prints a new
admin password.)

## 4. Run the setup (server)

Replace the address with yours:

```bash
curl -fsSL https://raw.githubusercontent.com/SwethaSugi/WedVibe/main/deploy/setup-server.sh -o setup-server.sh
bash setup-server.sh wedvibe.duckdns.org
```

It takes about 5–10 minutes and ends with "WedVibe is running". Open `https://<your address>`.
The admin panel is at `https://<your address>/admin` with your existing admin login.

Optional: add your support email/address in `~/wedvibe/.env`
(`NEXT_PUBLIC_SUPPORT_EMAIL`, `NEXT_PUBLIC_BUSINESS_ADDRESS`), then run the update below so they
appear on the site.

## Everyday commands (server)

| Task | Command |
|---|---|
| Put the latest GitHub code live (backs up first) | `bash ~/wedvibe/deploy/update.sh` |
| Is the site running? | `systemctl status wedvibe` |
| Recent app logs | `sudo journalctl -u wedvibe -n 100` |
| Restart the site | `sudo systemctl restart wedvibe` |
| Back up now | `bash ~/wedvibe/deploy/backup.sh` |
| List backups | `ls -lh /srv/wedvibe/backups` |

Download a backup to your PC (your PC):

```powershell
scp -i $env:USERPROFILE\.ssh\wedvibe.key ubuntu@SERVER_IP:/srv/wedvibe/backups/wedvibe-2026-10-11.db .
```

## If something goes wrong

- **Site doesn't open at all:** check the Oracle security list allows TCP 80 and 443
  (Networking → your subnet → Default Security List → Ingress Rules), and that your address
  points to the server's IP (`ping wedvibe.duckdns.org`).
- **"Not secure" / certificate error:** the address must point to the server before Caddy can
  get the free certificate. Fix the DNS, then `sudo systemctl restart caddy`.
- **Admin login doesn't stay logged in:** open the site with `https://`, not `http://` or the IP.
- **Site shows an error page:** `sudo journalctl -u wedvibe -n 100` shows why.
