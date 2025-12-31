#!/bin/bash

# Script para parar todos os microfrontends ByteBank
# FIAP Grupo 30 - Tech Challenge 2

echo "🛑 ByteBank - Parando todos os projetos..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Diretório base
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Array com os projetos
PROJECTS=(
  "root-config"
  "tech-challenge-2-base"
  "tech-challenge-2-financeiro"
  "tech-challenge-2-dashboard"
)

# Parar todos os processos
for project_name in "${PROJECTS[@]}"; do
  pid_file="$BASE_DIR/pid-$project_name.txt"
  if [ -f "$pid_file" ]; then
    pid=$(cat "$pid_file")
    if ps -p $pid > /dev/null 2>&1; then
      echo -e "${RED}⏹️  Parando $project_name (PID: $pid)${NC}"
      kill $pid 2>/dev/null
      rm "$pid_file"
    else
      echo "   $project_name já estava parado"
      rm "$pid_file"
    fi
  fi
done

# Limpar logs antigos (opcional)
# rm -f "$BASE_DIR"/logs-*.log

echo ""
echo -e "${GREEN}✅ Todos os projetos foram parados!${NC}"
