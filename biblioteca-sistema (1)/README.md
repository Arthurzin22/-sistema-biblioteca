# Sistema de Gerenciamento de Biblioteca

Este projeto implementa um sistema de gerenciamento de biblioteca com funcionalidades para bibliotecários e leitores.

## Estrutura do Projeto

```
library_system/
├── backend/             # Servidor Node.js com Express
│   ├── controllers/     # Lógica de negócio para as rotas
│   ├── models/          # Modelos de dados e interação com o banco de dados
│   ├── routes/          # Definição das rotas da API
│   ├── node_modules/    # Dependências do Node.js
│   ├── package.json
│   ├── package-lock.json
│   └── server.js        # Ponto de entrada do servidor
├── frontend/            # Interface do usuário (HTML, CSS, JavaScript)
│   ├── index.html       # Página de Login e Registro
│   ├── bibliotecario.html # Painel do Bibliotecário
│   ├── leitor.html      # Painel do Leitor
│   ├── style.css        # Estilos CSS
│   └── script.js        # Lógica JavaScript
└── database/            # Scripts SQL para o banco de dados
    └── schema.sql       # Definição do esquema do banco de dados
```

## Rotas da API (Backend - Node.js + Express)

### Usuários

- `POST /api/users/register` - Registrar um novo usuário (bibliotecário ou leitor)
- `POST /api/users/login` - Realizar login de usuário

### Livros

- `GET /api/books` - Listar todos os livros disponíveis
- `GET /api/books/:id` - Obter detalhes de um livro específico
- `POST /api/books` - Adicionar um novo livro ao catálogo (apenas bibliotecário)
- `PUT /api/books/:id` - Atualizar dados de um livro (apenas bibliotecário)
- `DELETE /api/books/:id` - Remover um livro do sistema (apenas bibliotecário)

### Empréstimos

- `GET /api/loans/user/:userId` - Listar os empréstimos ativos de um usuário (leitor)
- `GET /api/loans` - Visualizar todos os empréstimos (bibliotecário)
- `POST /api/loans` - Criar um novo empréstimo (apenas leitor)
- `PUT /api/loans/:id/return` - Marcar empréstimo como devolvido (apenas bibliotecário)
- `DELETE /api/loans/:id` - Cancelar (deletar) um empréstimo registrado (apenas bibliotecário)

## Esquema do Banco de Dados

### Tabela: `usuarios`

| Campo    | Tipo      | Restrições                                     |
|----------|-----------|------------------------------------------------|
| `id`     | INTEGER   | Chave primária, autoincrementada               |
| `nome`   | VARCHAR   | Obrigatório                                    |
| `email`  | VARCHAR   | Obrigatório, Único                             |
| `senha`  | VARCHAR   | Obrigatório                                    |
| `perfil` | ENUM      | Obrigatório, valores: 'bibliotecario' ou 'leitor'|

### Tabela: `livros`

| Campo                  | Tipo      | Restrições                                     |
|------------------------|-----------|------------------------------------------------|
| `id`                   | INTEGER   | Chave primária, autoincrementada               |
| `titulo`               | VARCHAR   | Obrigatório                                    |
| `autor`                | VARCHAR   | Obrigatório                                    |
| `ano_publicacao`       | INTEGER   | Opcional                                       |
| `quantidade_disponivel`| INTEGER   | Obrigatório, representa estoque                |

### Tabela: `emprestimos`

| Campo                  | Tipo      | Restrições                                     |
|------------------------|-----------|------------------------------------------------|
| `id`                   | INTEGER   | Chave primária, autoincrementada               |
| `livro_id`             | INTEGER   | Chave estrangeira (`livros.id`)                |
| `leitor_id`            | INTEGER   | Chave estrangeira (`usuarios.id`)              |
| `data_emprestimo`      | DATE      | Obrigatório                                    |
| `data_devolucao_prevista`| DATE      | Obrigatório                                    |
| `data_devolucao_real`  | DATE      | Opcional (preenchido quando devolvido)         |
| `status`               | ENUM      | Obrigatório; valores: 'ativo', 'devolvido', 'atrasado'|


