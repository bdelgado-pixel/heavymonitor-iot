#!/bin/sh
set -eu
mkdir -p /backups
while true; do
  name="/backups/heavymonitor-$(date -u +%Y%m%dT%H%M%SZ).dump"
  if pg_dump -Fc -f "$name.part" && pg_restore --list "$name.part" >/dev/null; then
    mv "$name.part" "$name"
    echo "Respaldo completado: $name"
    find /backups -maxdepth 1 -name 'heavymonitor-*.dump' -type f -mtime +30 -delete
  else
    echo "ERROR: respaldo fallido; revisar almacenamiento y conexión" >&2
  fi
  sleep 86400
done
