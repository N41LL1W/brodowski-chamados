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
git clone [https://aws.amazon.com/pt/what-is/repo/](https://aws.amazon.com/pt/what-is/repo/)
cd [NOME DA PASTA DO PROJETO]
2. Instalar Dependências
Instale as dependências do projeto, incluindo as bibliotecas de autenticação:

Bash

npm install
npm install next-auth bcrypt
npm install -D @types/bcrypt
3. Configurar o Banco de Dados e Autenticação (SQLite com Prisma)
O projeto utiliza SQLite para testes locais. Você precisa gerar o cliente Prisma e aplicar as alterações do esquema (incluindo o campo passwordHash no modelo User).

Gerar o cliente Prisma e aplicar migrações:

Bash

npx prisma generate
npx prisma migrate dev --name add_auth_tables_and_password_hash
Atenção: O comando migrate dev aplica o esquema (prisma/schema.prisma) e cria/atualiza o arquivo dev.db.

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

Autenticação: NextAuth.js (Auth.js)

Segurança: bcrypt

Banco de Dados: SQLite (em desenvolvimento)

ORM: Prisma

Estilização: Tailwind CSS