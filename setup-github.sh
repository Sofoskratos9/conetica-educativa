#!/bin/bash

# Script para configurar y subir Conética Educativa a GitHub
# Uso: ./setup-github.sh TU_USUARIO_GITHUB

set -e

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Configurando GitHub para Conética Educativa${NC}\n"

# Verificar que se proporcionó el usuario de GitHub
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Debes proporcionar tu usuario de GitHub${NC}"
    echo -e "${YELLOW}Uso: ./setup-github.sh TU_USUARIO_GITHUB${NC}"
    exit 1
fi

GITHUB_USER=$1
REPO_URL="https://github.com/${GITHUB_USER}/conetica-educativa.git"

echo -e "${YELLOW}📝 Configuración:${NC}"
echo -e "   Usuario: ${GITHUB_USER}"
echo -e "   Repositorio: ${REPO_URL}\n"

# Verificar que estamos en un repositorio git
if [ ! -d .git ]; then
    echo -e "${RED}❌ Error: No estás en un repositorio git${NC}"
    exit 1
fi

# Verificar estado del repositorio
echo -e "${BLUE}🔍 Verificando estado del repositorio...${NC}"
git status

# Agregar remote origin
echo -e "\n${BLUE}🔗 Agregando repositorio remoto...${NC}"
if git remote | grep -q "^origin$"; then
    echo -e "${YELLOW}⚠️  Remote 'origin' ya existe. Actualizando URL...${NC}"
    git remote set-url origin $REPO_URL
else
    git remote add origin $REPO_URL
fi

# Verificar remote
echo -e "\n${GREEN}✅ Remote configurado:${NC}"
git remote -v

# Instrucciones finales
echo -e "\n${GREEN}✅ Configuración completada!${NC}\n"
echo -e "${YELLOW}📋 Próximos pasos:${NC}"
echo -e "   1. Asegúrate de haber creado el repositorio en GitHub:"
echo -e "      ${REPO_URL}"
echo -e "\n   2. Ejecuta el siguiente comando para subir el código:"
echo -e "      ${BLUE}git push -u origin main${NC}"
echo -e "\n   3. Si te pide autenticación, usa tu Personal Access Token"
echo -e "      (no tu contraseña de GitHub)\n"
echo -e "${GREEN}🎉 ¡Listo para subir a GitHub!${NC}\n"
