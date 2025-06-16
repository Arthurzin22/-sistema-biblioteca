// Configuração da API
const API_BASE_URL = 'http://localhost:3000/api';

// Utilitários
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

function showMessage(message, type = 'info') {
    const container = document.getElementById('messageContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    container.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Funções de autenticação
function showLoginForm() {
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('registerForm').classList.remove('active');
}

function showRegisterForm() {
    document.getElementById('registerForm').classList.add('active');
    document.getElementById('loginForm').classList.remove('active');
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

// Event listeners para formulários de autenticação
document.addEventListener('DOMContentLoaded', function() {
    // Formulário de login
    const loginForm = document.getElementById('loginFormElement');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            try {
                const response = await fetch(`${API_BASE_URL}/users/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('token', result.token);
                    localStorage.setItem('user', JSON.stringify(result.user));
                    
                    // Redirecionar baseado no perfil
                    if (result.user.perfil === 'bibliotecario') {
                        window.location.href = '/bibliotecario';
                    } else {
                        window.location.href = '/leitor';
                    }
                } else {
                    showMessage(result.error, 'error');
                }
            } catch (error) {
                showMessage('Erro ao fazer login. Tente novamente.', 'error');
            }
        });
    }
    
    // Formulário de registro
    const registerForm = document.getElementById('registerFormElement');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            try {
                const response = await fetch(`${API_BASE_URL}/users/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    showMessage('Usuário cadastrado com sucesso! Faça login para continuar.', 'success');
                    showLoginForm();
                    registerForm.reset();
                } else {
                    showMessage(result.error, 'error');
                }
            } catch (error) {
                showMessage('Erro ao cadastrar usuário. Tente novamente.', 'error');
            }
        });
    }
});

// Funções do Dashboard do Bibliotecário
function showSection(sectionName) {
    // Remover classe active de todas as seções
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remover classe active de todos os links da sidebar
    document.querySelectorAll('.sidebar-nav li').forEach(li => {
        li.classList.remove('active');
    });
    
    // Ativar seção selecionada
    const targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Ativar link da sidebar
    event.target.closest('li').classList.add('active');
    
    // Atualizar título
    const titles = {
        'books': 'Gerenciar Livros',
        'loans': 'Empréstimos',
        'stats': 'Estatísticas',
        'catalog': 'Catálogo de Livros',
        'myLoans': 'Meus Empréstimos',
        'profile': 'Perfil'
    };
    
    document.getElementById('sectionTitle').textContent = titles[sectionName] || 'Dashboard';
}

// Funções de gerenciamento de livros
async function loadBooks() {
    try {
        const response = await fetch(`${API_BASE_URL}/books`);
        const books = await response.json();
        
        if (response.ok) {
            displayBooks(books);
            updateBookStats(books);
        } else {
            showMessage('Erro ao carregar livros', 'error');
        }
    } catch (error) {
        showMessage('Erro ao carregar livros', 'error');
    }
}

function displayBooks(books) {
    const tbody = document.getElementById('booksTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.id}</td>
            <td>${book.titulo}</td>
            <td>${book.autor}</td>
            <td>${book.ano_publicacao || 'N/A'}</td>
            <td>${book.quantidade_disponivel}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-warning" onclick="editBook(${book.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteBook(${book.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateBookStats(books) {
    const totalBooks = books.length;
    const availableBooks = books.reduce((sum, book) => sum + book.quantidade_disponivel, 0);
    
    const totalBooksEl = document.getElementById('totalBooks');
    const availableBooksEl = document.getElementById('availableBooks');
    
    if (totalBooksEl) totalBooksEl.textContent = totalBooks;
    if (availableBooksEl) availableBooksEl.textContent = availableBooks;
}

function showAddBookModal() {
    document.getElementById('modalTitle').textContent = 'Adicionar Livro';
    document.getElementById('bookForm').reset();
    document.getElementById('bookId').value = '';
    showModal();
}

async function editBook(bookId) {
    try {
        const response = await fetch(`${API_BASE_URL}/books/${bookId}`);
        const book = await response.json();
        
        if (response.ok) {
            document.getElementById('modalTitle').textContent = 'Editar Livro';
            document.getElementById('bookId').value = book.id;
            document.getElementById('bookTitle').value = book.titulo;
            document.getElementById('bookAuthor').value = book.autor;
            document.getElementById('bookYear').value = book.ano_publicacao || '';
            document.getElementById('bookQuantity').value = book.quantidade_disponivel;
            showModal();
        } else {
            showMessage('Erro ao carregar dados do livro', 'error');
        }
    } catch (error) {
        showMessage('Erro ao carregar dados do livro', 'error');
    }
}

async function deleteBook(bookId) {
    if (!confirm('Tem certeza que deseja excluir este livro?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('Livro excluído com sucesso', 'success');
            loadBooks();
        } else {
            showMessage(result.error, 'error');
        }
    } catch (error) {
        showMessage('Erro ao excluir livro', 'error');
    }
}

function showModal() {
    document.getElementById('bookModal').classList.add('active');
    document.getElementById('modalOverlay').classList.add('active');
}

function closeBookModal() {
    document.getElementById('bookModal').classList.remove('active');
    document.getElementById('modalOverlay').classList.remove('active');
}

// Event listener para formulário de livro
document.addEventListener('DOMContentLoaded', function() {
    const bookForm = document.getElementById('bookForm');
    if (bookForm) {
        bookForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            const bookId = document.getElementById('bookId').value;
            
            // Converter quantidade para número
            data.quantidade_disponivel = parseInt(data.quantidade_disponivel);
            if (data.ano_publicacao) {
                data.ano_publicacao = parseInt(data.ano_publicacao);
            }
            
            try {
                const url = bookId ? `${API_BASE_URL}/books/${bookId}` : `${API_BASE_URL}/books`;
                const method = bookId ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method: method,
                    headers: getAuthHeaders(),
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    showMessage(bookId ? 'Livro atualizado com sucesso' : 'Livro adicionado com sucesso', 'success');
                    closeBookModal();
                    loadBooks();
                } else {
                    showMessage(result.error, 'error');
                }
            } catch (error) {
                showMessage('Erro ao salvar livro', 'error');
            }
        });
    }
});

// Funções de empréstimos
async function loadLoans() {
    try {
        const response = await fetch(`${API_BASE_URL}/loans`, {
            headers: getAuthHeaders()
        });
        
        const loans = await response.json();
        
        if (response.ok) {
            displayLoans(loans);
        } else {
            showMessage('Erro ao carregar empréstimos', 'error');
        }
    } catch (error) {
        showMessage('Erro ao carregar empréstimos', 'error');
    }
}

function displayLoans(loans) {
    const tbody = document.getElementById('loansTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    loans.forEach(loan => {
        const row = document.createElement('tr');
        const statusClass = `status-${loan.status}`;
        
        row.innerHTML = `
            <td>${loan.id}</td>
            <td>${loan.leitor_nome}</td>
            <td>${loan.titulo}</td>
            <td>${formatDate(loan.data_emprestimo)}</td>
            <td>${formatDate(loan.data_devolucao_prevista)}</td>
            <td><span class="status-badge ${statusClass}">${loan.status}</span></td>
            <td>
                <div class="action-buttons">
                    ${loan.status === 'ativo' ? `
                        <button class="btn btn-sm btn-success" onclick="returnLoan(${loan.id})">
                            <i class="fas fa-check"></i> Devolver
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-danger" onclick="deleteLoan(${loan.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function returnLoan(loanId) {
    if (!confirm('Confirmar devolução do livro?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/loans/${loanId}/return`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('Devolução registrada com sucesso', 'success');
            loadLoans();
            loadBooks(); // Atualizar estoque
        } else {
            showMessage(result.error, 'error');
        }
    } catch (error) {
        showMessage('Erro ao registrar devolução', 'error');
    }
}

async function deleteLoan(loanId) {
    if (!confirm('Tem certeza que deseja cancelar este empréstimo?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/loans/${loanId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('Empréstimo cancelado com sucesso', 'success');
            loadLoans();
            loadBooks(); // Atualizar estoque
        } else {
            showMessage(result.error, 'error');
        }
    } catch (error) {
        showMessage('Erro ao cancelar empréstimo', 'error');
    }
}

// Funções do Dashboard do Leitor
async function loadCatalog() {
    try {
        const response = await fetch(`${API_BASE_URL}/books`);
        const books = await response.json();
        
        if (response.ok) {
            displayCatalog(books);
            updateCatalogStats(books);
        } else {
            showMessage('Erro ao carregar catálogo', 'error');
        }
    } catch (error) {
        showMessage('Erro ao carregar catálogo', 'error');
    }
}

function displayCatalog(books) {
    const grid = document.getElementById('booksGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    books.forEach(book => {
        const isAvailable = book.quantidade_disponivel > 0;
        const card = document.createElement('div');
        card.className = 'book-card';
        card.onclick = () => showBookDetails(book);
        
        card.innerHTML = `
            <div class="book-card-header">
                <div class="book-icon">
                    <i class="fas fa-book"></i>
                </div>
                <div class="book-info">
                    <h4>${book.titulo}</h4>
                    <p>${book.autor}</p>
                </div>
            </div>
            <div class="book-meta">
                <span>Ano: ${book.ano_publicacao || 'N/A'}</span>
                <div class="availability ${isAvailable ? 'available' : 'unavailable'}">
                    <i class="fas fa-circle"></i>
                    ${book.quantidade_disponivel} disponível(is)
                </div>
            </div>
            <div class="book-actions">
                <button class="btn btn-primary btn-sm" ${!isAvailable ? 'disabled' : ''}>
                    <i class="fas fa-handshake"></i>
                    ${isAvailable ? 'Solicitar Empréstimo' : 'Indisponível'}
                </button>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

function updateCatalogStats(books) {
    const totalAvailable = books.reduce((sum, book) => sum + book.quantidade_disponivel, 0);
    
    const totalBooksEl = document.getElementById('totalBooksAvailable');
    if (totalBooksEl) totalBooksEl.textContent = totalAvailable;
}

function showBookDetails(book) {
    document.getElementById('detailsTitle').textContent = book.titulo;
    document.getElementById('detailsAuthor').textContent = book.autor;
    document.getElementById('detailsYear').textContent = book.ano_publicacao || 'N/A';
    document.getElementById('detailsQuantity').textContent = book.quantidade_disponivel;
    
    const loanBtn = document.getElementById('loanBookBtn');
    if (book.quantidade_disponivel > 0) {
        loanBtn.disabled = false;
        loanBtn.onclick = () => requestLoan(book.id);
    } else {
        loanBtn.disabled = true;
    }
    
    document.getElementById('bookDetailsModal').classList.add('active');
    document.getElementById('modalOverlay').classList.add('active');
}

function closeBookDetailsModal() {
    document.getElementById('bookDetailsModal').classList.remove('active');
    document.getElementById('modalOverlay').classList.remove('active');
}

async function requestLoan(bookId) {
    try {
        const response = await fetch(`${API_BASE_URL}/loans`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ livro_id: bookId })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('Empréstimo solicitado com sucesso!', 'success');
            closeBookDetailsModal();
            loadCatalog();
            loadMyLoans();
            updateStats();
        } else {
            showMessage(result.error, 'error');
        }
    } catch (error) {
        showMessage('Erro ao solicitar empréstimo', 'error');
    }
}

async function loadMyLoans() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/loans/user/${user.id}`, {
            headers: getAuthHeaders()
        });
        
        const loans = await response.json();
        
        if (response.ok) {
            displayMyLoans(loans);
        } else {
            showMessage('Erro ao carregar meus empréstimos', 'error');
        }
    } catch (error) {
        showMessage('Erro ao carregar meus empréstimos', 'error');
    }
}

function displayMyLoans(loans) {
    const tbody = document.getElementById('myLoansTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    loans.forEach(loan => {
        const row = document.createElement('tr');
        const statusClass = `status-${loan.status}`;
        
        row.innerHTML = `
            <td>${loan.titulo}</td>
            <td>${loan.autor}</td>
            <td>${formatDate(loan.data_emprestimo)}</td>
            <td>${formatDate(loan.data_devolucao_prevista)}</td>
            <td><span class="status-badge ${statusClass}">${loan.status}</span></td>
            <td>
                ${loan.status === 'ativo' ? `
                    <button class="btn btn-sm btn-warning" onclick="requestReturn(${loan.id})">
                        <i class="fas fa-undo"></i> Solicitar Devolução
                    </button>
                ` : '-'}
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function requestReturn(loanId) {
    showMessage('Solicitação de devolução enviada! Aguarde a aprovação do bibliotecário.', 'info');
}

async function updateStats() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/loans/user/${user.id}`, {
            headers: getAuthHeaders()
        });
        
        const loans = await response.json();
        
        if (response.ok) {
            const activeLoans = loans.filter(loan => loan.status === 'ativo').length;
            const totalLoans = loans.length;
            const returnedLoans = loans.filter(loan => loan.status === 'devolvido').length;
            const pendingReturns = loans.filter(loan => loan.status === 'ativo').length;
            
            const myActiveLoansEl = document.getElementById('myActiveLoans');
            const totalLoansCountEl = document.getElementById('totalLoansCount');
            const activeLoansCountEl = document.getElementById('activeLoansCount');
            const returnedLoansCountEl = document.getElementById('returnedLoansCount');
            const pendingReturnsEl = document.getElementById('pendingReturns');
            
            if (myActiveLoansEl) myActiveLoansEl.textContent = activeLoans;
            if (totalLoansCountEl) totalLoansCountEl.textContent = totalLoans;
            if (activeLoansCountEl) activeLoansCountEl.textContent = activeLoans;
            if (returnedLoansCountEl) returnedLoansCountEl.textContent = returnedLoans;
            if (pendingReturnsEl) pendingReturnsEl.textContent = pendingReturns;
        }
    } catch (error) {
        console.error('Erro ao atualizar estatísticas:', error);
    }
}

// Funções de filtro
function filterLoans(status) {
    // Atualizar botões ativos
    document.querySelectorAll('.filter-buttons .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filtrar linhas da tabela
    const rows = document.querySelectorAll('#loansTableBody tr');
    rows.forEach(row => {
        const statusCell = row.querySelector('.status-badge');
        if (status === 'all' || statusCell.textContent.trim() === status) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function filterMyLoans(status) {
    // Atualizar botões ativos
    document.querySelectorAll('.filter-buttons .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filtrar linhas da tabela
    const rows = document.querySelectorAll('#myLoansTableBody tr');
    rows.forEach(row => {
        const statusCell = row.querySelector('.status-badge');
        if (status === 'all' || statusCell.textContent.trim() === status) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Funções de busca
document.addEventListener('DOMContentLoaded', function() {
    const searchBooks = document.getElementById('searchBooks');
    if (searchBooks) {
        searchBooks.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#booksTableBody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
    
    const searchCatalog = document.getElementById('searchCatalog');
    if (searchCatalog) {
        searchCatalog.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.book-card');
            
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
});

