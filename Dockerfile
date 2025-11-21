# Multi-stage Dockerfile otimizado para Cloud Run
# Projeto: Elevare Backend

# ============================================
# STAGE 1: Build
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar apenas package files primeiro (cache layer)
COPY package*.json ./

# Instalar TODAS as dependências (incluindo devDependencies para build)
RUN npm ci && npm cache clean --force

# Copiar código fonte
COPY . .

# Build do TypeScript
RUN npm run build

# ============================================
# STAGE 2: Production
# ============================================
FROM node:20-alpine

# Instalar dumb-init para gerenciamento de processos
RUN apk add --no-cache dumb-init

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copiar package files
COPY --from=builder /app/package*.json ./

# Instalar APENAS dependências de produção
RUN npm ci --only=production && npm cache clean --force

# Copiar código buildado
COPY --from=builder /app/dist ./dist

# Mudar ownership para usuário não-root
RUN chown -R nodejs:nodejs /app

# Trocar para usuário não-root
USER nodejs

# Variáveis de ambiente
ENV NODE_ENV=production

# Expor porta (Cloud Run injeta PORT automaticamente)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 8080) + '/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Executar com dumb-init para gerenciamento correto de sinais
CMD ["dumb-init", "node", "dist/main.js"]
