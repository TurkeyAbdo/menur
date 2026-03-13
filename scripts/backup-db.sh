#!/bin/bash
# Manual database backup script
# Usage: ./scripts/backup-db.sh
#
# Requires: pg_dump installed locally
# The script reads DATABASE_URL from .env or .env.local

set -e

# Load env vars
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | grep DATABASE_URL | xargs)
fi
if [ -z "$DATABASE_URL" ] && [ -f .env ]; then
  export $(grep -v '^#' .env | grep DATABASE_URL | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL not found in .env or .env.local"
  exit 1
fi

BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="${BACKUP_DIR}/menur_${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

echo "Starting backup..."
pg_dump "$DATABASE_URL" --no-owner --no-acl > "$FILENAME"

# Compress
gzip "$FILENAME"
echo "Backup saved to ${FILENAME}.gz"

# Keep only last 10 backups
ls -t "${BACKUP_DIR}"/menur_*.sql.gz 2>/dev/null | tail -n +11 | xargs -r rm
echo "Old backups cleaned up (keeping last 10)"
