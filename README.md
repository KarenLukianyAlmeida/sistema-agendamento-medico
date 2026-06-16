# 🩺 Sistema de Agendamento Médico - API Backend

Este é o projeto backend de um **Sistema de Agendamento de Consultas Médicas**, desenvolvido como parte do CTeSP de Tecnologias e Programação de Sistemas de Informação (TPSI) no **Instituto Politécnico da Maia (IPMAIA)**.

A API foi construída seguindo as melhores práticas de arquitetura em Node.js com TypeScript, utilizando o Prisma ORM para a persistência de dados e implementando o controlo de acessos baseado em perfis (**RBAC - Role-Based Access Control**).

---

## 🚀 Funcionalidades Principais

* **Autenticação & Registo Autónomo:** Registo público de Pacientes (`PATIENT`) e Login centralizado com geração de Tokens JWT.
* **Gestão de Utilizadores (Admin):** Criação, listagem, atualização e eliminação de utilizadores protegida por perfil administrador (`ADMIN`).
* **Gestão de Disponibilidades:** Médicos (`DOCTOR`) gerem os seus próprios horários sem interferir na agenda de terceiros.
* **Agendamento de Consultas:** Marcação de consultas associando Pacientes a horários livres, com regras estritas de conflito e alteração de estado.
* **Segurança Avançada:** Bloqueio de rotas duplicadas e prevenção de "fraude de Body" (um médico criar horários para outro médico).

---

## 🏗️ Arquitetura do Projeto

O projeto adota uma estrutura limpa baseada na separação de responsabilidades (Rotas, Controladores e Serviços):

```text
src/
 ├── controllers/     # Camada de Adaptação (Recebe req, extrai dados, chama o service e responde)
 ├── middlewares/     # Camada de Segurança (Validação de Tokens JWT e verificação de Roles)
 ├── routes/          # Definição dos Endpoints e portas de entrada da API
 ├── services/        # Camada de Domínio/Negócio (Validações estritas, chaves únicas e regras do sistema)
 ├── prisma/          # Ligação centralizada do Prisma Client
 └── server.ts        # Ponto de entrada da aplicação Express

```
## 🛠️ Tecnologias Utilizadas

* **Runtime:** Node.js
* **Linguagem:** TypeScript
* **Framework Web:** Express
* **Base de Dados & ORM:** SQLite (via Prisma ORM)
* **Segurança & Criptografia:** JWT (JsonWebToken) e Bcrypt
* **Monitorização de Ficheiros:** Nodemon + ts-node

---

## 🗺️ Mapa de Rotas da API

### 🔑 Autenticação e Registo (Público)
* `POST /auth/register` -> Registo autónomo de um novo Paciente.
* `POST /auth/login` -> Autenticação de utilizadores (Devolve o Token JWT).

### 🛡️ Administração de Utilizadores (Privado - Apenas ADMIN)
* `POST /users` -> Criação de utilizadores com qualquer Role (Médicos, Admins).
* `GET /users` -> Listar todos os utilizadores do sistema.
* `PUT /users/:id` -> Atualizar dados de um utilizador.
* `DELETE /users/:id` -> Eliminar um utilizador.

### 🩺 Gestão de Especialidades e Médicos (Privado - Apenas ADMIN)
* `POST /specialities` -> Registar uma nova especialidade médica.
* `POST /doctors` -> Criar o perfil profissional de um médico associando-o a uma especialidade.

### 📅 Horários e Disponibilidades (Privado - DOCTOR / ADMIN)
* `POST /availabilities` -> Criar um slot de tempo livre (Se for Médico, o sistema ignora o Body e força a criação para o seu próprio perfil).
* `GET /availabilities/free` -> Listar todos os horários que estão disponíveis para marcação (Público/Paciente).
* `GET /availabilities/doctor/:doctorId` -> Listar todas as disponibilidades de um médico específico.

### 📝 Agendamentos de Consultas (Privado - Autenticado)
* `POST /appointments` -> Reservar uma consulta associando um Paciente a um horário livre.
* `PATCH /appointments/:id/cancel` -> Cancelar um agendamento existente (Apenas o próprio Paciente dono da consulta ou um Admin).

---

## 🏃‍♂️ Como Executar o Projeto Localmente

### 1. Clonar o Repositório e Instalar Dependências
```bash
cd sistema-agendamento-medico
npm install
```
### 2. Configurar as Variáveis de Ambiente
Cria um ficheiro .env na raiz do teu projeto e configura a ligação à tua base de dados e a chave secreta do JWT:

Fragmento do código
```Bash
DATABASE_URL="file:./dev.db" # Ou a string do teu PostgreSQL
JWT_SECRET="MinhaChaveSecretaEUltraSegura2026!"
```

### 3. Executar as Migrações do Prisma
Prepara as tabelas na tua base de dados:

```Bash
npx prisma migrate dev
```
### 4. Povoar a Base de Dados (Seed)
Executa o script de Seed para criar automaticamente os utilizadores de teste (Admin, Médicos, Pacientes e Horários):

```Bash
npx prisma db seed
```
### 🔑 Credenciais de Teste Comuns do Seed:

Admin: admin@clinica.com | Palavra-passe: Password123!

Médico: carlos@clinica.com | Palavra-passe: Password123!

Paciente: karen@paciente.com | Palavra-passe: Password123!

### 5. Iniciar o Servidor de Desenvolvimento
```Bash
npm run dev
O servidor ficará ativo em: http://localhost:3000.
```
---

### 🧪 Como Testar no Postman
Importe o ficheiro da Coleção (.json) e o ficheiro de Ambiente (Environment) fornecidos na pasta do projeto.

Ative o Ambiente EnvAgendaMedica no canto superior direito do Postman.

Execute o pedido POST /auth/login com o utilizador desejado.

O Postman está configurado com um script automático que captura o token da resposta e o injeta nas rotas protegidas. Não é necessário copiar e colar tokens manualmente!
