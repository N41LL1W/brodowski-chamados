# 🛠️ Sistema de Gerenciamento de Chamados de TI - Prefeitura de Brodowski

Este é um sistema de help desk desenvolvido para a Prefeitura de Brodowski, focado em centralizar e gerenciar as solicitações de suporte de TI. O projeto utiliza **Next.js** com App Router e **Prisma** para gerenciamento de dados.

## 🚀 Funcionalidades Principais

O sistema está setorizado em rotas para diferentes perfis de acesso (atualmente abertas para testes):

* **Página Inicial (`/`):** Apresentação e direcionamento rápido para os setores.
* **Abertura de Chamado (`/novo-chamado`):** Formulário para que funcionários abram novos tickets de forma rápida.
* **Meus Chamados (`/meus-chamados`):** Visão de listagem dos chamados abertos (Futuramente, será filtrado por usuário).
* **Painel do Técnico (`/tecnico`):** Visão completa de todos os chamados, permitindo gerenciamento de status e prioridade.
* **Painel de Controle (`/controlador`):** Visão estratégica com indicadores e acompanhamento de desempenho (KPIs).

## ⚙️ Configuração e Instalação

Este é um projeto [Next.js](https://nextjs.org) em TypeScript.

### 1. Clonar o Repositório

```bash
git clone [https://www.youtube.com/watch?v=X49Wz3icO3E](https://www.youtube.com/watch?v=X49Wz3icO3E)
cd [NOME DA PASTA DO PROJETO]
2. Instalar Dependências
Instale as dependências do projeto (Next.js, React, Prisma, Tailwind, etc.):

Bash

npm install
# ou
yarn install
# ou
pnpm install
3. Configurar o Banco de Dados (SQLite com Prisma)
O projeto utiliza SQLite para testes locais. Você precisa gerar o cliente Prisma e criar o arquivo de banco de dados (dev.db).

Gerar o cliente Prisma e criar o DB:

Bash

npx prisma generate
npx prisma migrate dev --name init
Atenção: O comando migrate dev aplica o esquema (prisma/schema.prisma) e cria o arquivo dev.db.

4. Rodar o Servidor de Desenvolvimento
Execute o servidor local:

Bash

npm run dev
# ou
yarn dev
# ou
pnpm dev
Abra http://localhost:3000 no seu navegador para ver o resultado.

📚 Tecnologias Utilizadas
Framework: Next.js (App Router)

Linguagem: TypeScript

Banco de Dados: SQLite (em desenvolvimento)

ORM: Prisma

Estilização: Tailwind CSS