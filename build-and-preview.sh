#!/bin/bash

# Script para fazer build e iniciar todos os microfrontends em modo preview
# FIAP Grupo 30 - Tech Challenge 2

echo "🏦 ByteBank - Build e Preview de todos os projetos..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Diretório base
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Parar processos anteriores
echo "🧹 Parando processos anteriores..."
pkill -f "vite preview" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# Array com os projetos
PROJECTS=(
  "tech-challenge-2-base:9001"
  "tech-challenge-2-financeiro:9002"
  "tech-challenge-2-dashboard:9003"
  "root-config:9000"
)

# Função para fazer build de um projeto
build_project() {
  local project_name=$1
  local project_dir="$BASE_DIR/$project_name"
  
  echo -e "${YELLOW}🔨 Buildando $project_name...${NC}"
  cd "$project_dir"
  npm run build 2>&1 | tail -5
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build de $project_name concluído${NC}"
    return 0
  else
    echo -e "${RED}✗ Erro no build de $project_name${NC}"
    return 1
  fi
}

# Função para iniciar preview de um projeto
start_preview() {
  local project_info=$1
  local project_name=$(echo $project_info | cut -d: -f1)
  local project_port=$(echo $project_info | cut -d: -f2)
  local project_dir="$BASE_DIR/$project_name"
  
  echo -e "${GREEN}▶️  Iniciando preview $project_name na porta $project_port${NC}"
  
  cd "$project_dir"
  npm run preview > "$BASE_DIR/logs-preview-$project_name.log" 2>&1 &
  echo "   PID: $!"
}

# Build de todos os projetos
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Fase 1: Build dos projetos"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for project_info in "${PROJECTS[@]}"; do
  project_name=$(echo $project_info | cut -d: -f1)
  build_project "$project_name"
done
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Fase 2: Iniciando previews"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for project_info in "${PROJECTS[@]}"; do
  start_preview "$project_info"
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Todos os projetos foram buildados e iniciados!${NC}"
echo ""
echo "📋 URLs dos projetos:"
echo "   🏠 Root Config:  http://localhost:9000"
echo "   🏠 Dashboard:    http://localhost:9000/dashboard"
echo "   🏠 Financeiro:   http://localhost:9000/financeiro"
echo ""
echo "📋 URLs diretas dos MFEs:"
echo "   🧩 Base:         http://localhost:9001"
echo "   💰 Financeiro:   http://localhost:9002"
echo "   📊 Dashboard:    http://localhost:9003"
#echo ""echo "📝 Logs disponíveis em: $BASE_DIR/logs-preview-*.log"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
