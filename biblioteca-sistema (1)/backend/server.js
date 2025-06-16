const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'biblioteca_secret_key_2024';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Configuração do banco de dados
const db = mysql.createConnection({
    host: 'localhost',
    user: 'biblioteca_user',
    password: 'biblioteca_pass',
    database: 'biblioteca'
});

// Conectar ao banco de dados
db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados MySQL');
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token de acesso requerido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
};

// Middleware de autorização para bibliotecário
const requireLibrarian = (req, res, next) => {
    if (req.user.perfil !== 'bibliotecario') {
        return res.status(403).json({ error: 'Acesso negado. Apenas bibliotecários podem realizar esta ação.' });
    }
    next();
};

// Middleware de autorização para leitor
const requireReader = (req, res, next) => {
    if (req.user.perfil !== 'leitor') {
        return res.status(403).json({ error: 'Acesso negado. Apenas leitores podem realizar esta ação.' });
    }
    next();
};

// ROTAS DE USUÁRIOS

// Registro de usuário
app.post('/api/users/register', async (req, res) => {
    try {
        const { nome, email, senha, perfil } = req.body;

        if (!nome || !email || !senha || !perfil) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        if (!['bibliotecario', 'leitor'].includes(perfil)) {
            return res.status(400).json({ error: 'Perfil deve ser "bibliotecario" ou "leitor"' });
        }

        // Verificar se o email já existe
        db.query('SELECT id FROM usuarios WHERE email = ?', [email], async (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }

            if (results.length > 0) {
                return res.status(400).json({ error: 'Email já cadastrado' });
            }

            // Hash da senha
            const hashedPassword = await bcrypt.hash(senha, 10);

            // Inserir usuário
            db.query(
                'INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)',
                [nome, email, hashedPassword, perfil],
                (err, results) => {
                    if (err) {
                        return res.status(500).json({ error: 'Erro ao cadastrar usuário' });
                    }

                    res.status(201).json({ 
                        message: 'Usuário cadastrado com sucesso',
                        userId: results.insertId 
                    });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Login de usuário
app.post('/api/users/login', (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }

        db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }

            if (results.length === 0) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            const user = results[0];
            const isValidPassword = await bcrypt.compare(senha, user.senha);

            if (!isValidPassword) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            // Gerar token JWT
            const token = jwt.sign(
                { 
                    id: user.id, 
                    email: user.email, 
                    perfil: user.perfil,
                    nome: user.nome 
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Login realizado com sucesso',
                token,
                user: {
                    id: user.id,
                    nome: user.nome,
                    email: user.email,
                    perfil: user.perfil
                }
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ROTAS DE LIVROS

// Listar todos os livros
app.get('/api/books', (req, res) => {
    db.query('SELECT * FROM livros ORDER BY titulo', (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar livros' });
        }
        res.json(results);
    });
});

// Obter detalhes de um livro específico
app.get('/api/books/:id', (req, res) => {
    const { id } = req.params;

    db.query('SELECT * FROM livros WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar livro' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }

        res.json(results[0]);
    });
});

// Adicionar novo livro (apenas bibliotecário)
app.post('/api/books', authenticateToken, requireLibrarian, (req, res) => {
    const { titulo, autor, ano_publicacao, quantidade_disponivel } = req.body;

    if (!titulo || !autor || quantidade_disponivel === undefined) {
        return res.status(400).json({ error: 'Título, autor e quantidade são obrigatórios' });
    }

    db.query(
        'INSERT INTO livros (titulo, autor, ano_publicacao, quantidade_disponivel) VALUES (?, ?, ?, ?)',
        [titulo, autor, ano_publicacao || null, quantidade_disponivel],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao adicionar livro' });
            }

            res.status(201).json({
                message: 'Livro adicionado com sucesso',
                bookId: results.insertId
            });
        }
    );
});

// Atualizar livro (apenas bibliotecário)
app.put('/api/books/:id', authenticateToken, requireLibrarian, (req, res) => {
    const { id } = req.params;
    const { titulo, autor, ano_publicacao, quantidade_disponivel } = req.body;

    if (!titulo || !autor || quantidade_disponivel === undefined) {
        return res.status(400).json({ error: 'Título, autor e quantidade são obrigatórios' });
    }

    db.query(
        'UPDATE livros SET titulo = ?, autor = ?, ano_publicacao = ?, quantidade_disponivel = ? WHERE id = ?',
        [titulo, autor, ano_publicacao || null, quantidade_disponivel, id],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao atualizar livro' });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Livro não encontrado' });
            }

            res.json({ message: 'Livro atualizado com sucesso' });
        }
    );
});

// Remover livro (apenas bibliotecário)
app.delete('/api/books/:id', authenticateToken, requireLibrarian, (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM livros WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao remover livro' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }

        res.json({ message: 'Livro removido com sucesso' });
    });
});

// ROTAS DE EMPRÉSTIMOS

// Listar empréstimos de um usuário específico
app.get('/api/loans/user/:userId', authenticateToken, (req, res) => {
    const { userId } = req.params;

    // Verificar se o usuário está tentando acessar seus próprios empréstimos ou se é bibliotecário
    if (req.user.id != userId && req.user.perfil !== 'bibliotecario') {
        return res.status(403).json({ error: 'Acesso negado' });
    }

    const query = `
        SELECT e.*, l.titulo, l.autor, u.nome as leitor_nome
        FROM emprestimos e
        JOIN livros l ON e.livro_id = l.id
        JOIN usuarios u ON e.leitor_id = u.id
        WHERE e.leitor_id = ?
        ORDER BY e.data_emprestimo DESC
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar empréstimos' });
        }
        res.json(results);
    });
});

// Listar todos os empréstimos (apenas bibliotecário)
app.get('/api/loans', authenticateToken, requireLibrarian, (req, res) => {
    const query = `
        SELECT e.*, l.titulo, l.autor, u.nome as leitor_nome
        FROM emprestimos e
        JOIN livros l ON e.livro_id = l.id
        JOIN usuarios u ON e.leitor_id = u.id
        ORDER BY e.data_emprestimo DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar empréstimos' });
        }
        res.json(results);
    });
});

// Criar novo empréstimo (apenas leitor)
app.post('/api/loans', authenticateToken, requireReader, (req, res) => {
    const { livro_id } = req.body;
    const leitor_id = req.user.id;

    if (!livro_id) {
        return res.status(400).json({ error: 'ID do livro é obrigatório' });
    }

    // Verificar se o livro existe e está disponível
    db.query('SELECT * FROM livros WHERE id = ?', [livro_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }

        const livro = results[0];

        if (livro.quantidade_disponivel <= 0) {
            return res.status(400).json({ error: 'Livro não disponível para empréstimo' });
        }

        // Calcular datas
        const dataEmprestimo = new Date().toISOString().split('T')[0];
        const dataDevolucaoPrevista = new Date();
        dataDevolucaoPrevista.setDate(dataDevolucaoPrevista.getDate() + 14); // 14 dias para devolução
        const dataDevolucaoPrevisiaStr = dataDevolucaoPrevista.toISOString().split('T')[0];

        // Criar empréstimo
        db.query(
            'INSERT INTO emprestimos (livro_id, leitor_id, data_emprestimo, data_devolucao_prevista, status) VALUES (?, ?, ?, ?, ?)',
            [livro_id, leitor_id, dataEmprestimo, dataDevolucaoPrevisiaStr, 'ativo'],
            (err, results) => {
                if (err) {
                    return res.status(500).json({ error: 'Erro ao criar empréstimo' });
                }

                // Diminuir quantidade disponível
                db.query(
                    'UPDATE livros SET quantidade_disponivel = quantidade_disponivel - 1 WHERE id = ?',
                    [livro_id],
                    (err) => {
                        if (err) {
                            return res.status(500).json({ error: 'Erro ao atualizar estoque' });
                        }

                        res.status(201).json({
                            message: 'Empréstimo criado com sucesso',
                            loanId: results.insertId
                        });
                    }
                );
            }
        );
    });
});

// Marcar empréstimo como devolvido (apenas bibliotecário)
app.put('/api/loans/:id/return', authenticateToken, requireLibrarian, (req, res) => {
    const { id } = req.params;

    // Buscar o empréstimo
    db.query('SELECT * FROM emprestimos WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Empréstimo não encontrado' });
        }

        const emprestimo = results[0];

        if (emprestimo.status === 'devolvido') {
            return res.status(400).json({ error: 'Empréstimo já foi devolvido' });
        }

        const dataDevolucaoReal = new Date().toISOString().split('T')[0];

        // Atualizar empréstimo
        db.query(
            'UPDATE emprestimos SET status = ?, data_devolucao_real = ? WHERE id = ?',
            ['devolvido', dataDevolucaoReal, id],
            (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Erro ao atualizar empréstimo' });
                }

                // Aumentar quantidade disponível
                db.query(
                    'UPDATE livros SET quantidade_disponivel = quantidade_disponivel + 1 WHERE id = ?',
                    [emprestimo.livro_id],
                    (err) => {
                        if (err) {
                            return res.status(500).json({ error: 'Erro ao atualizar estoque' });
                        }

                        res.json({ message: 'Devolução registrada com sucesso' });
                    }
                );
            }
        );
    });
});

// Cancelar empréstimo (apenas bibliotecário)
app.delete('/api/loans/:id', authenticateToken, requireLibrarian, (req, res) => {
    const { id } = req.params;

    // Buscar o empréstimo
    db.query('SELECT * FROM emprestimos WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Empréstimo não encontrado' });
        }

        const emprestimo = results[0];

        // Deletar empréstimo
        db.query('DELETE FROM emprestimos WHERE id = ?', [id], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao cancelar empréstimo' });
            }

            // Se o empréstimo estava ativo, aumentar quantidade disponível
            if (emprestimo.status === 'ativo') {
                db.query(
                    'UPDATE livros SET quantidade_disponivel = quantidade_disponivel + 1 WHERE id = ?',
                    [emprestimo.livro_id],
                    (err) => {
                        if (err) {
                            console.error('Erro ao atualizar estoque:', err);
                        }
                    }
                );
            }

            res.json({ message: 'Empréstimo cancelado com sucesso' });
        });
    });
});

// Rota para servir as páginas HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/bibliotecario', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/bibliotecario.html'));
});

app.get('/leitor', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/leitor.html'));
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;

