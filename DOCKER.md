# ==================================
# DOCKER COMPOSE - INSTRUÇÕES DE USO
# ==================================

## DESENVOLVIMENTO
docker-compose up -d
docker-compose logs -f backend

## PRODUÇÃO
NODE_ENV=production docker-compose up -d

## COM PGADMIN (apenas dev)
docker-compose --profile dev up -d

## REBUILD
docker-compose build --no-cache
docker-compose up -d

## PARAR TUDO
docker-compose down

## LIMPAR VOLUMES (CUIDADO: apaga dados)
docker-compose down -v

## LOGS
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f postgres

## ACESSOS
- Backend: http://localhost:3000
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)
- PgAdmin: http://localhost:5050 (admin@elevare.com/admin) [apenas profile dev]

## HEALTH CHECKS
curl http://localhost:3000/health
curl http://localhost:3000/bi/metrics

## MIGRATIONS
docker-compose exec backend npm run migration:generate -- NomeDaMigration
docker-compose exec backend npm run migration:run

## BACKUP BANCO
docker-compose exec postgres pg_dump -U postgres elevare_iara > backup.sql

## RESTORE BANCO
cat backup.sql | docker-compose exec -T postgres psql -U postgres elevare_iara
