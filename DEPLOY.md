
# Guia de Deploy (GitHub + Vercel)

Este projeto está configurado para ser facilmente implantado na Vercel, utilizando Vite para o frontend e Vercel Serverless Functions para o backend (API do ClickUp).

## Passo 1: Preparar o Projeto Localmente

1. **Baixe o projeto**: Utilize a opção de download disponível na plataforma onde você está desenvolvendo.
2. **Abra no VSCode**: Extraia os arquivos e abra a pasta no Visual Studio Code.
3. **Instale as dependências**:
   Abra o terminal e execute:
   ```bash
   npm install
   ```

## Passo 2: Configurar o Repositório Git

1. **Inicialize o Git**:
   ```bash
   git init
   ```
2. **Adicione os arquivos**:
   ```bash
   git add .
   ```
3. **Faça o primeiro commit**:
   ```bash
   git commit -m "Initial commit"
   ```
4. **Crie um repositório no GitHub**:
   - Vá para [github.com/new](https://github.com/new).
   - Dê um nome ao repositório (ex: `dashboard-clickup`).
   - Não inicialize com README ou .gitignore (já temos).
5. **Conecte e envie**:
   Siga as instruções do GitHub para "push an existing repository from the command line":
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   git branch -M main
   git push -u origin main
   ```

## Passo 3: Deploy na Vercel

1. Crie uma conta ou faça login em [vercel.com](https://vercel.com).
2. Clique em **"Add New..."** -> **"Project"**.
3. Selecione **"Import"** ao lado do repositório que você acabou de criar no GitHub.
4. **Configure o Projeto**:
   - **Framework Preset**: A Vercel deve detectar "Vite" automaticamente. Se não, selecione "Vite".
   - **Root Directory**: `./` (padrão).
   - **Environment Variables**:
     Você **PRECISA** adicionar a variável de ambiente para o token do ClickUp.
     - Name: `CLICKUP_API_TOKEN`
     - Value: `pk_87908883_PNJX99ZBG343SRG53Z7AKLEKLBOQCOQU` (ou o token atualizado).
5. Clique em **"Deploy"**.

## Passo 4: Verificar

Após o deploy, a Vercel fornecerá uma URL (ex: `https://dashboard-clickup.vercel.app`).
Acesse e verifique se os dados estão carregando. A API do ClickUp será acessada via `/api/clickup/...` que agora é uma Serverless Function.

## Observações

- O arquivo `server.ts` é usado apenas para desenvolvimento local (`npm run dev`). Na Vercel, a pasta `api/` assume o papel do backend.
- Se precisar testar localmente simulando a Vercel, você pode usar `vercel dev` (precisa instalar a CLI da Vercel: `npm i -g vercel`).
