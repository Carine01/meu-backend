# Checklist de Deploy — meu-backend

1. Preencha o arquivo `.env` com as variáveis reais (baseado em `.env.example`).
2. Escolha o provedor de cloud (ex: Heroku, Render, Railway, AWS, GCP, Azure).
3. Crie o ambiente de produção e configure as variáveis de ambiente.
4. Faça o build do projeto:
   npm run build
5. Rode as migrações (se houver):
   npm run migration:run
6. Inicie o servidor:
   npm run start:prod
7. Teste os endpoints principais.
8. Configure monitoramento e alertas (opcional).
9. Documente endpoints e credenciais de acesso.

Dúvidas? Consulte o README ou abra uma issue no GitHub.
