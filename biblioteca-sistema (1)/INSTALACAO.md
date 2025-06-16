# Sistema de Gerenciamento de Biblioteca - BiblioTech

## Descrição

Este é um sistema completo de gerenciamento de biblioteca desenvolvido com Node.js, Express, MySQL, HTML, CSS e JavaScript. O sistema permite o controle de empréstimos de livros com diferentes tipos de usuários: bibliotecários e leitores.

## Funcionalidades

### Para Bibliotecários:
- Gerenciar catálogo de livros (adicionar, editar, remover)
- Visualizar todos os empréstimos
- Aprovar devoluções de livros
- Controlar estoque de livros

### Para Leitores:
- Visualizar catálogo de livros disponíveis
- Solicitar empréstimos
- Acompanhar seus empréstimos ativos
- Solicitar devoluções

## Tecnologias Utilizadas

- **Backend**: Node.js + Express
- **Banco de Dados**: MySQL
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Autenticação**: JWT (JSON Web Tokens)
- **Criptografia**: bcrypt para senhas

## Pré-requisitos

- Node.js (versão 14 ou superior)
- MySQL Server
- npm (Node Package Manager)

## Instalação e Configuração

### 1. Instalar MySQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# Iniciar o serviço
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 2. Configurar o Banco de Dados

```bash
# Acessar MySQL como root
sudo mysql

# Executar os comandos SQL:
CREATE DATABASE IF NOT EXISTS biblioteca;
CREATE USER IF NOT EXISTS 'biblioteca_user'@'localhost' IDENTIFIED BY 'biblioteca_pass';
GRANT ALL PRIVILEGES ON biblioteca.* TO 'biblioteca_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Executar o script de criação das tabelas
mysql -u biblioteca_user -pbiblioteca_pass biblioteca < database/schema.sql
```

### 3. Instalar Dependências do Node.js

```bash
cd backend
npm install
```

### 4. Iniciar o Servidor

```bash
cd backend
node server.js
```

O servidor estará disponível em: http://localhost:3000

## Estrutura do Projeto

```
library_system/
├── backend/                 # Servidor Node.js
│   ├── controllers/         # Lógica de negócio
│   ├── models/              # Modelos de dados
│   ├── routes/              # Rotas da API
│   ├── node_modules/        # Dependências
│   ├── package.json         # Configuração do projeto
│   └── server.js            # Arquivo principal do servidor
├── frontend/                # Interface do usuário
│   ├── index.html           # Página de login/registro
│   ├── bibliotecario.html   # Painel do bibliotecário
│   ├── leitor.html          # Painel do leitor
│   ├── style.css            # Estilos CSS
│   └── script.js            # JavaScript do frontend
├── database/                # Scripts do banco de dados
│   └── schema.sql           # Criação das tabelas
└── README.md                # Este arquivo
```

## API Endpoints

### Usuários
- `POST /api/users/register` - Registrar usuário
- `POST /api/users/login` - Fazer login

### Livros
- `GET /api/books` - Listar livros
- `GET /api/books/:id` - Obter livro específico
- `POST /api/books` - Adicionar livro (bibliotecário)
- `PUT /api/books/:id` - Atualizar livro (bibliotecário)
- `DELETE /api/books/:id` - Remover livro (bibliotecário)

### Empréstimos
- `GET /api/loans` - Listar todos os empréstimos (bibliotecário)
- `GET /api/loans/user/:userId` - Empréstimos de um usuário
- `POST /api/loans` - Criar empréstimo (leitor)
- `PUT /api/loans/:id/return` - Marcar como devolvido (bibliotecário)
- `DELETE /api/loans/:id` - Cancelar empréstimo (bibliotecário)

## Usuários de Teste

O sistema já vem com alguns dados de exemplo:

### Bibliotecário:
- Email: admin@biblioteca.com
- Senha: admin123

### Leitor:
- Email: joao@email.com
- Senha: 123456

## Livros de Exemplo

O sistema inclui alguns livros clássicos da literatura brasileira:
- Dom Casmurro - Machado de Assis
- O Cortiço - Aluísio Azevedo
- Iracema - José de Alencar
- O Guarani - José de Alencar
- Senhora - José de Alencar

## Segurança

- Senhas são criptografadas com bcrypt
- Autenticação via JWT tokens
- Middleware de autorização para diferentes tipos de usuário
- Validação de dados de entrada

## Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop
- Tablets
- Smartphones

## Suporte

Para dúvidas ou problemas, consulte a documentação ou entre em contato com o desenvolvedor.

## Licença

Este projeto foi desenvolvido para fins educacionais.

