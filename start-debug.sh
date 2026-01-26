#!/bin/bash
# Script para iniciar el servidor con debugging habilitado
# Ejecuta este script en una terminal y luego usa "Attach to Server" en VS Code

cd "$(dirname "$0")"

# Limpiar cualquier proceso anterior en el puerto de debugging
lsof -ti:9229 | xargs kill -9 2>/dev/null || true

# Limpiar cache de Node.js si existe
rm -rf .node_cache 2>/dev/null

# Iniciar con debugging y source maps habilitados
# Nota: Asegúrate de guardar todos los archivos antes de iniciar el debug
NODE_ENV=development PORT=3000 /Users/raulalonso/.nvm/versions/node/v22.16.0/bin/node \
  --inspect=0.0.0.0:9229 \
  --enable-source-maps \
  --no-warnings \
  src/app.js


