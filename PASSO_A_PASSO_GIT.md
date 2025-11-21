# 🚀 PASSO A PASSO: INSTALAR E CONFIGURAR GIT

**Tempo total:** 5-10 minutos  
**Dificuldade:** Fácil (apenas clicar "Next")

---

## 📋 OPÇÃO 1: INSTALAÇÃO MANUAL (RECOMENDADO)

### **PASSO 1: Baixar o Git**

1. **Clique neste link:** https://git-scm.com/download/win
2. O download começa automaticamente
3. Arquivo baixado: `Git-2.47.0-64-bit.exe` (ou versão mais recente)
4. Vai aparecer na pasta `Downloads`

---

### **PASSO 2: Instalar o Git**

1. **Abra a pasta Downloads**
2. **Duplo-clique** no arquivo `Git-2.47.0-64-bit.exe`
3. Se aparecer "Deseja permitir que este aplicativo faça alterações?": Clique **"Sim"**

---

### **PASSO 3: Telas de Instalação**

**Clique "Next" em todas estas telas:**

#### Tela 1: License (Licença)
- Apenas clique **"Next"**

#### Tela 2: Select Destination Location
- Deixe: `C:\Program Files\Git`
- Clique **"Next"**

#### Tela 3: Select Components
- **MARQUE estas opções:**
  - ✅ Windows Explorer integration
  - ✅ Git Bash Here
  - ✅ Git GUI Here
  - ✅ Associate .git* configuration files
  - ✅ Associate .sh files
- Clique **"Next"**

#### Tela 4: Select Start Menu Folder
- Deixe: `Git`
- Clique **"Next"**

#### Tela 5: Choosing the default editor
- Deixe: `Use Visual Studio Code as Git's default editor`
- Clique **"Next"**

#### Tela 6: Adjusting the name of the initial branch
- Deixe: `Let Git decide`
- Clique **"Next"**

#### Tela 7: Adjusting your PATH environment
- Deixe: `Git from the command line and also from 3rd-party software`
- Clique **"Next"**

#### Tela 8: Choosing the SSH executable
- Deixe: `Use bundled OpenSSH`
- Clique **"Next"**

#### Tela 9: Choosing HTTPS transport backend
- Deixe: `Use the OpenSSL library`
- Clique **"Next"**

#### Tela 10: Configuring the line ending conversions
- Deixe: `Checkout Windows-style, commit Unix-style line endings`
- Clique **"Next"**

#### Tela 11: Configuring the terminal emulator
- Deixe: `Use MinTTY`
- Clique **"Next"**

#### Tela 12: Choose the default behavior of git pull
- Deixe: `Default (fast-forward or merge)`
- Clique **"Next"**

#### Tela 13: Choose a credential helper
- Deixe: `Git Credential Manager`
- Clique **"Next"**

#### Tela 14: Configuring extra options
- ✅ Enable file system caching
- ✅ Enable symbolic links
- Clique **"Next"**

#### Tela 15: Configuring experimental options
- **NÃO MARQUE NADA**
- Clique **"Install"**

---

### **PASSO 4: Aguardar Instalação**

- Barra de progresso vai aparecer
- Aguarde 30-60 segundos
- Quando terminar, clique **"Finish"**

---

### **PASSO 5: FECHAR E REABRIR VS CODE**

**IMPORTANTE:** Git só funciona depois de reiniciar o VS Code

1. **Feche COMPLETAMENTE o VS Code**
   - Clique no **X vermelho** (canto superior direito)
   - ❌ NÃO apenas minimize
   - ❌ NÃO deixe rodando na bandeja

2. **Aguarde 5 segundos**

3. **Abra o VS Code novamente**
   - Clique no ícone do VS Code
   - Ou abra a pasta do projeto

---

### **PASSO 6: Verificar Instalação**

1. No VS Code, abra o **Terminal**:
   - Menu: `Terminal` → `New Terminal`
   - Ou pressione: `Ctrl + '` (aspas simples)

2. Digite este comando e pressione Enter:
```powershell
git --version
```

3. **Resultado esperado:**
```
git version 2.47.0.windows.1
```

✅ **Se aparecer a versão = SUCESSO!**  
❌ **Se aparecer erro = Reinicie o VS Code novamente**

---

## 📋 OPÇÃO 2: INSTALAÇÃO AUTOMÁTICA (Windows 10/11)

### **PASSO 1: Abrir PowerShell como Administrador**

1. Clique no **Menu Iniciar** (ícone Windows)
2. Digite: `PowerShell`
3. **Clique com botão direito** em "Windows PowerShell"
4. Selecione: **"Executar como administrador"**
5. Se perguntar "Deseja permitir?": Clique **"Sim"**

---

### **PASSO 2: Executar Comando de Instalação**

1. **Copie este comando** (clique no ícone de copiar):
```powershell
winget install --id Git.Git -e --source winget
```

2. **Cole no PowerShell** (clique com botão direito)

3. Pressione **Enter**

4. Se perguntar "Do you agree?": Digite `Y` e Enter

5. Aguarde 1-2 minutos

6. Quando aparecer "Successfully installed", **feche o PowerShell**

---

### **PASSO 3: Reiniciar VS Code**

1. **Feche COMPLETAMENTE o VS Code** (X vermelho)
2. Aguarde 5 segundos
3. **Abra o VS Code novamente**
4. Verifique com `git --version` (deve funcionar)

---

## 🔧 DEPOIS DE INSTALAR: CONFIGURAR GIT

### **PASSO 7: Configurar Nome e Email**

No terminal do VS Code, execute:

```powershell
git config --global user.name "Seu Nome Completo"
git config --global user.email "seu.email@exemplo.com"
```

**Exemplo:**
```powershell
git config --global user.name "Carine Marques"
git config --global user.email "carine@elevare.com.br"
```

---

### **PASSO 8: Verificar Configuração**

```powershell
git config --global --list
```

**Deve mostrar:**
```
user.name=Carine Marques
user.email=carine@elevare.com.br
```

✅ **Configuração completa!**

---

## 🚀 PRÓXIMO PASSO: FAZER PRIMEIRO COMMIT

Agora que o Git está instalado, você pode fazer o primeiro commit:

### **OPÇÃO A: Via Terminal (comandos prontos)**

```powershell
# Ir para pasta do projeto
cd C:\Users\Carine\Downloads\pacote_final_consolidado_stalkspot\pacote_final_consolidado\backend

# Inicializar repositório local
git init

# Adicionar todos os arquivos
git add .

# Criar primeiro commit
git commit -m "feat: Elevare Backend - configuração inicial completa"

# Renomear branch para 'main'
git branch -M main

# Conectar ao GitHub
git remote add origin https://github.com/Carine01/meu-backend.git

# Enviar para GitHub (vai pedir login)
git push -u origin main
```

---

### **OPÇÃO B: Via Interface do VS Code**

1. **Abra Source Control** (ícone de ramificação à esquerda, ou `Ctrl+Shift+G`)

2. Clique em **"Initialize Repository"**

3. Na aba "Changes", clique no **"+"** ao lado de "Changes" (para adicionar todos)

4. Digite mensagem do commit: `feat: Elevare Backend - configuração inicial`

5. Clique no **✓** (commit)

6. Clique nos **três pontos** (...) → **"Remote"** → **"Add Remote"**

7. Cole a URL: `https://github.com/Carine01/meu-backend.git`

8. Clique nos **três pontos** (...) → **"Push"** → **"Push to..."** → **"origin"**

9. Se pedir login do GitHub:
   - Username: `Carine01`
   - Password: Use um **Personal Access Token** (não a senha normal)

---

## 🔐 CRIAR PERSONAL ACCESS TOKEN (se necessário)

Se o Git pedir senha ao fazer push:

1. **Vá para:** https://github.com/settings/tokens

2. Clique em **"Generate new token"** → **"Generate new token (classic)"**

3. Configure:
   - **Note:** `VS Code - Elevare Backend`
   - **Expiration:** `90 days`
   - **Scopes:** Marque apenas:
     - ✅ `repo` (todos os sub-itens)
     - ✅ `workflow`

4. Clique em **"Generate token"**

5. **COPIE O TOKEN** (aparece uma vez só!)
   - Formato: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

6. **Cole este token** quando o Git pedir a senha

7. **Salve o token** em lugar seguro (você vai precisar de novo)

---

## ❌ PROBLEMAS COMUNS E SOLUÇÕES

### **Problema 1: "git: comando não encontrado" após instalar**

**Causa:** VS Code não foi reiniciado

**Solução:**
1. Feche COMPLETAMENTE o VS Code (X vermelho)
2. Aguarde 10 segundos
3. Abra novamente
4. Teste `git --version` novamente

---

### **Problema 2: "Permission denied" ao instalar**

**Causa:** PowerShell não está como administrador

**Solução:**
1. Feche o PowerShell
2. Abra novamente **como administrador** (botão direito → "Executar como administrador")
3. Execute o comando novamente

---

### **Problema 3: "winget: comando não encontrado"**

**Causa:** Windows desatualizado ou winget não instalado

**Solução:** Use a **OPÇÃO 1** (instalação manual) em vez da automática

---

### **Problema 4: Git pede senha mas não aceita**

**Causa:** GitHub desabilitou autenticação por senha

**Solução:** Use **Personal Access Token** (instruções acima)

---

### **Problema 5: "fatal: not a git repository"**

**Causa:** Você não está na pasta correta

**Solução:**
```powershell
# Vá para a pasta correta
cd C:\Users\Carine\Downloads\pacote_final_consolidado_stalkspot\pacote_final_consolidado\backend

# Verifique se está certo
pwd

# Inicialize o git
git init
```

---

### **Problema 6: "fatal: remote origin already exists"**

**Causa:** Remote já foi adicionado antes

**Solução:**
```powershell
# Remover remote antigo
git remote remove origin

# Adicionar novamente
git remote add origin https://github.com/Carine01/meu-backend.git
```

---

## ✅ CHECKLIST FINAL

Antes de fazer o push, confirme:

- [ ] Git instalado: `git --version` funciona
- [ ] Nome configurado: `git config user.name` retorna seu nome
- [ ] Email configurado: `git config user.email` retorna seu email
- [ ] Pasta correta: `pwd` mostra `.../backend`
- [ ] Repositório inicializado: pasta `.git` existe
- [ ] Arquivos adicionados: `git status` mostra "Changes to be committed"
- [ ] Commit criado: `git log` mostra seu commit
- [ ] Remote configurado: `git remote -v` mostra URL do GitHub
- [ ] Token salvo (se necessário)

---

## 🎯 RESULTADO ESPERADO

Após executar `git push -u origin main`:

```
Enumerating objects: 150, done.
Counting objects: 100% (150/150), done.
Delta compression using up to 8 threads
Compressing objects: 100% (120/120), done.
Writing objects: 100% (150/150), 45.23 KiB | 2.26 MiB/s, done.
Total 150 (delta 25), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (25/25), done.
To https://github.com/Carine01/meu-backend.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

✅ **Se ver isso = SUCESSO TOTAL!**

Agora vá para: https://github.com/Carine01/meu-backend/actions

O deploy automático já começou! 🚀

---

## 📞 PRÓXIMO PASSO

Depois do push bem-sucedido:

1. **Monitorar deploy:** https://github.com/Carine01/meu-backend/actions
2. **Aguardar 8-12 minutos**
3. **URL do serviço aparecerá nos logs**
4. **Testar:** `curl https://elevare-backend-xxxxx-uc.a.run.app/health`

---

## 🆘 SE TRAVAR EM ALGUM PASSO

1. **Leia a mensagem de erro completa**
2. **Procure na seção "Problemas Comuns" acima**
3. **Se não encontrar:** Copie o erro completo e consulte:
   - GitHub Docs: https://docs.github.com/get-started
   - Git Docs: https://git-scm.com/doc

---

**Última atualização:** 21/11/2025  
**Testado em:** Windows 10/11, VS Code 1.85+  
**Tempo estimado:** 5-10 minutos

**Boa sorte! 🚀**
