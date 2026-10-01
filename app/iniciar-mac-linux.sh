#!/bin/sh
cd "$(dirname "$0")"
if ! command -v npm >/dev/null 2>&1; then
  echo "Node.js nao foi encontrado. Instale o Node.js LTS em https://nodejs.org/"
  exit 1
fi
if [ ! -d node_modules ]; then
  npm install
fi
npm run dev
