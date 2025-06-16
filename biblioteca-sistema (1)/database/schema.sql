CREATE DATABASE IF NOT EXISTS biblioteca;
USE biblioteca;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    perfil ENUM('bibliotecario', 'leitor') NOT NULL
);

-- Tabela de livros
CREATE TABLE IF NOT EXISTS livros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(255) NOT NULL,
    ano_publicacao INT,
    quantidade_disponivel INT NOT NULL DEFAULT 0
);

-- Tabela de empréstimos
CREATE TABLE IF NOT EXISTS emprestimos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    livro_id INT NOT NULL,
    leitor_id INT NOT NULL,
    data_emprestimo DATE NOT NULL,
    data_devolucao_prevista DATE NOT NULL,
    data_devolucao_real DATE,
    status ENUM('ativo', 'devolvido', 'atrasado') NOT NULL DEFAULT 'ativo',
    FOREIGN KEY (livro_id) REFERENCES livros(id) ON DELETE CASCADE,
    FOREIGN KEY (leitor_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Inserir alguns dados de exemplo
INSERT INTO usuarios (nome, email, senha, perfil) VALUES 
('Admin Bibliotecário', 'admin@biblioteca.com', '$2b$10$example_hash', 'bibliotecario'),
('João Leitor', 'joao@email.com', '$2b$10$example_hash', 'leitor');

INSERT INTO livros (titulo, autor, ano_publicacao, quantidade_disponivel) VALUES 
('Dom Casmurro', 'Machado de Assis', 1899, 5),
('O Cortiço', 'Aluísio Azevedo', 1890, 3),
('Iracema', 'José de Alencar', 1865, 2),
('O Guarani', 'José de Alencar', 1857, 4),
('Senhora', 'José de Alencar', 1875, 3);

