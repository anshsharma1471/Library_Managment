// Application State
let currentUser = null;
let books = [];
let users = [];
let transactions = [];
let categories = [];

// Initialize Application
function initApp() {
    console.log('=== Initializing Library Management System ===');
    initializeData();
    loadDataFromStorage();

    console.log('✓ Books loaded:', books.length);
    console.log('✓ Users loaded:', users.length);
    console.log('✓ Categories loaded:', categories.length);

    // Check if user is logged in
    const savedUser = localStorage.getItem('current_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        console.log('✓ Restored user session:', currentUser.name);
        showDashboard();
    } else {
        console.log('→ No saved session, showing login');
        showLogin();
    }
}

// Load data from localStorage
function loadDataFromStorage() {
    books = JSON.parse(localStorage.getItem('library_books') || '[]');
    users = JSON.parse(localStorage.getItem('library_users') || '[]');
    transactions = JSON.parse(localStorage.getItem('library_transactions') || '[]');
    categories = JSON.parse(localStorage.getItem('library_categories') || '[]');
}

// Save data to localStorage
function saveBooks() {
    localStorage.setItem('library_books', JSON.stringify(books));
}

function saveTransactions() {
    localStorage.setItem('library_transactions', JSON.stringify(transactions));
}

// Authentication
function login(email, password) {
    console.log('→ Login attempt:', email);
    console.log('  Available users:', users.length);

    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        console.log('✓ Login successful:', user.name, `(${user.role})`);
        currentUser = user;
        localStorage.setItem('current_user', JSON.stringify(user));
        showDashboard();
        return true;
    }
    console.log('✗ Login failed: Invalid credentials');
    console.log('  Tried:', email, '/', password);
    return false;
}

function logout() {
    console.log('→ Logging out:', currentUser?.name);
    currentUser = null;
    localStorage.removeItem('current_user');
    showLogin();
}

// UI State Management
function showLogin() {
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('dashboardPage').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('dashboardPage').classList.remove('hidden');

    // Update user info in header
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRole').textContent = currentUser.role;

    // Show appropriate dashboard
    if (currentUser.role === 'admin') {
        showAdminDashboard();
    } else {
        showStudentDashboard();
    }
}

function showAdminDashboard() {
    console.log('→ Showing admin dashboard');
    document.getElementById('adminContent').classList.remove('hidden');
    document.getElementById('studentContent').classList.add('hidden');

    renderAdminStats();
    renderAllBooks();
    renderAllTransactions();
}

function showStudentDashboard() {
    console.log('→ Showing student dashboard');
    document.getElementById('adminContent').classList.add('hidden');
    document.getElementById('studentContent').classList.remove('hidden');

    renderStudentStats();
    renderAvailableBooks();
    renderMyBooks();
}

// Render Admin Statistics
function renderAdminStats() {
    const totalBooks = books.reduce((sum, book) => sum + book.copies, 0);
    const availableBooks = books.reduce((sum, book) => sum + book.available, 0);
    const borrowedBooks = totalBooks - availableBooks;
    const activeStudents = new Set(
        transactions.filter(t => t.status === 'borrowed').map(t => t.userId)
    ).size;

    document.getElementById('totalBooks').textContent = totalBooks;
    document.getElementById('borrowedBooks').textContent = borrowedBooks;
    document.getElementById('availableBooks').textContent = availableBooks;
    document.getElementById('activeStudents').textContent = activeStudents;
}

// Render Student Statistics
function renderStudentStats() {
    const myTransactions = transactions.filter(
        t => t.userId === currentUser.id && t.status === 'borrowed'
    );

    const totalBorrowed = myTransactions.length;
    let totalFines = 0;
    let overdueCount = 0;

    myTransactions.forEach(t => {
        const fine = calculateFine(t.dueDate);
        totalFines += fine;
        if (fine > 0) overdueCount++;
    });

    document.getElementById('studentBorrowedBooks').textContent = totalBorrowed;
    document.getElementById('studentAvailableBooks').textContent = books.filter(b => b.available > 0).length;
    document.getElementById('studentOverdueBooks').textContent = overdueCount;
    document.getElementById('studentTotalFines').textContent = `₹${totalFines}`;
}

// Render All Books (Admin)
function renderAllBooks() {
    const container = document.getElementById('allBooksGrid');
    const searchTerm = document.getElementById('adminSearch')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('adminCategoryFilter')?.value || 'all';

    let filteredBooks = books.filter(book => {
        const matchesSearch =
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.isbn.includes(searchTerm) ||
            book.id.toLowerCase().includes(searchTerm);

        const matchesCategory = categoryFilter === 'all' || book.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    if (filteredBooks.length === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📚</div>
        <p>No books found</p>
      </div>
    `;
        return;
    }

    container.innerHTML = filteredBooks.map(book => `
    <div class="book-card">
      <div class="book-header">
        <span class="book-id">${book.id}</span>
        <span class="availability-badge ${book.available > 0 ? 'available' : 'unavailable'}">
          ${book.available}/${book.copies} Available
        </span>
      </div>
      <h3 class="book-title">${book.title}</h3>
      <p class="book-author">by ${book.author}</p>
      <div class="book-meta">
        <div class="meta-item">
          <span class="meta-label">Category</span>
          <span class="meta-value">${book.category}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">ISBN</span>
          <span class="meta-value">${book.isbn}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Publisher</span>
          <span class="meta-value">${book.publisher}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Year</span>
          <span class="meta-value">${book.year}</span>
        </div>
      </div>
      <p class="book-description">${book.description}</p>
      <div class="book-actions">
        <button class="btn btn-secondary btn-small" onclick="editBook('${book.id}')">
          ✏️ Edit
        </button>
        <button class="btn btn-danger btn-small" onclick="deleteBook('${book.id}')">
          🗑️ Delete
        </button>
      </div>
    </div>
  `).join('');
}

// Render Available Books (Student)
function renderAvailableBooks() {
    const container = document.getElementById('availableBooksGrid');
    const searchTerm = document.getElementById('studentSearch')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('studentCategoryFilter')?.value || 'all';

    let filteredBooks = books.filter(book => {
        const matchesSearch =
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.category.toLowerCase().includes(searchTerm);

        const matchesCategory = categoryFilter === 'all' || book.category === categoryFilter;
        const isAvailable = book.available > 0;

        return matchesSearch && matchesCategory && isAvailable;
    });

    if (filteredBooks.length === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📚</div>
        <p>No books available</p>
      </div>
    `;
        return;
    }

    container.innerHTML = filteredBooks.map(book => `
    <div class="book-card">
      <div class="book-header">
        <span class="book-id">${book.id}</span>
        <span class="availability-badge available">
          ${book.available} Available
        </span>
      </div>
      <h3 class="book-title">${book.title}</h3>
      <p class="book-author">by ${book.author}</p>
      <div class="book-meta">
        <div class="meta-item">
          <span class="meta-label">Category</span>
          <span class="meta-value">${book.category}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">ISBN</span>
          <span class="meta-value">${book.isbn}</span>
        </div>
      </div>
      <p class="book-description">${book.description}</p>
      <div class="book-actions">
        <button class="btn btn-success btn-small" onclick="borrowBook('${book.id}')">
          📖 Borrow Book
        </button>
      </div>
    </div>
  `).join('');
}

// Render My Books (Student)
function renderMyBooks() {
    const container = document.getElementById('myBooksTable');
    const myTransactions = transactions.filter(
        t => t.userId === currentUser.id && t.status === 'borrowed'
    );

    if (myTransactions.length === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📕</div>
        <p>You haven't borrowed any books yet</p>
      </div>
    `;
        return;
    }

    const rows = myTransactions.map(t => {
        const book = books.find(b => b.id === t.bookId);
        const fine = calculateFine(t.dueDate);
        const isOverdue = fine > 0;

        return `
      <tr>
        <td>${book?.title || 'Unknown'}</td>
        <td>${book?.author || 'Unknown'}</td>
        <td>${new Date(t.borrowDate).toLocaleDateString()}</td>
        <td>
          <span class="${isOverdue ? 'badge-error' : 'badge-success'} badge">
            ${new Date(t.dueDate).toLocaleDateString()}
          </span>
        </td>
        <td>
          ${fine > 0 ? `<span class="badge badge-error">₹${fine}</span>` : `<span class="badge badge-success">₹0</span>`}
        </td>
        <td>
          <button class="btn btn-primary btn-small" onclick="returnBook('${t.id}')">
            Return Book
          </button>
        </td>
      </tr>
    `;
    }).join('');

    container.innerHTML = `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Book Title</th>
            <th>Author</th>
            <th>Borrowed Date</th>
            <th>Due Date</th>
            <th>Fine</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

// Render All Transactions (Admin)
function renderAllTransactions() {
    const container = document.getElementById('allTransactionsTable');

    if (transactions.length === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📊</div>
        <p>No transactions yet</p>
      </div>
    `;
        return;
    }

    const rows = transactions.slice().reverse().slice(0, 20).map(t => {
        const book = books.find(b => b.id === t.bookId);
        const user = users.find(u => u.id === t.userId);
        const fine = t.status === 'borrowed' ? calculateFine(t.dueDate) : 0;

        return `
      <tr>
        <td>${t.id}</td>
        <td>${book?.title || 'Unknown'}</td>
        <td>${user?.name || 'Unknown'}</td>
        <td>${new Date(t.borrowDate).toLocaleDateString()}</td>
        <td>${new Date(t.dueDate).toLocaleDateString()}</td>
        <td>
          <span class="badge ${t.status === 'borrowed' ? 'badge-warning' : 'badge-success'}">
            ${t.status}
          </span>
        </td>
        <td>${fine > 0 ? `₹${fine}` : '-'}</td>
      </tr>
    `;
    }).join('');

    container.innerHTML = `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Book</th>
            <th>Student</th>
            <th>Borrowed</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Fine</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

// Book Management Functions
function showAddBookModal() {
    document.getElementById('bookModalTitle').textContent = 'Add New Book';
    document.getElementById('bookForm').reset();
    document.getElementById('bookId').value = '';
    populateCategorySelect();
    document.getElementById('bookModal').classList.add('active');
}

function editBook(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    document.getElementById('bookModalTitle').textContent = 'Edit Book';
    document.getElementById('bookId').value = book.id;
    document.getElementById('bookISBN').value = book.isbn;
    document.getElementById('bookTitle').value = book.title;
    document.getElementById('bookAuthor').value = book.author;
    document.getElementById('bookCategory').value = book.category;
    document.getElementById('bookPublisher').value = book.publisher;
    document.getElementById('bookYear').value = book.year;
    document.getElementById('bookCopies').value = book.copies;
    document.getElementById('bookDescription').value = book.description;

    populateCategorySelect();
    document.getElementById('bookModal').classList.add('active');
}

function saveBook() {
    const bookId = document.getElementById('bookId').value;
    const isbn = document.getElementById('bookISBN').value;
    const title = document.getElementById('bookTitle').value;
    const author = document.getElementById('bookAuthor').value;
    const category = document.getElementById('bookCategory').value;
    const publisher = document.getElementById('bookPublisher').value;
    const year = parseInt(document.getElementById('bookYear').value);
    const copies = parseInt(document.getElementById('bookCopies').value);
    const description = document.getElementById('bookDescription').value;

    if (bookId) {
        // Edit existing book
        const book = books.find(b => b.id === bookId);
        if (book) {
            const diff = copies - book.copies;
            book.isbn = isbn;
            book.title = title;
            book.author = author;
            book.category = category;
            book.publisher = publisher;
            book.year = year;
            book.copies = copies;
            book.available += diff;
            book.description = description;
        }
    } else {
        // Add new book
        const newBook = {
            id: getNextBookId(),
            isbn,
            title,
            author,
            category,
            publisher,
            year,
            copies,
            available: copies,
            description
        };
        books.push(newBook);
    }

    saveBooks();
    closeModal('bookModal');
    renderAllBooks();
    renderAdminStats();
}

function deleteBook(bookId) {
    if (confirm('Are you sure you want to delete this book?')) {
        books = books.filter(b => b.id !== bookId);
        saveBooks();
        renderAllBooks();
        renderAdminStats();
    }
}

function populateCategorySelect() {
    const select = document.getElementById('bookCategory');
    select.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

// Borrowing Functions
function borrowBook(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book || book.available === 0) {
        alert('This book is not available');
        return;
    }

    // Check if student already has this book
    const alreadyBorrowed = transactions.find(
        t => t.userId === currentUser.id && t.bookId === bookId && t.status === 'borrowed'
    );

    if (alreadyBorrowed) {
        alert('You have already borrowed this book');
        return;
    }

    if (confirm(`Borrow "${book.title}"? Due date will be ${getDueDate()}`)) {
        const transaction = {
            id: getNextTransactionId(),
            bookId: book.id,
            userId: currentUser.id,
            borrowDate: new Date().toISOString().split('T')[0],
            dueDate: getDueDate(),
            status: 'borrowed'
        };

        transactions.push(transaction);
        book.available--;

        saveBooks();
        saveTransactions();

        alert(`Book "${book.title}" borrowed successfully!`);
        showStudentDashboard();
    }
}

function returnBook(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    const fine = calculateFine(transaction.dueDate);
    let message = `Return this book?`;
    if (fine > 0) {
        message = `This book is overdue. Fine: ₹${fine}. Return this book?`;
    }

    if (confirm(message)) {
        transaction.status = 'returned';
        transaction.returnDate = new Date().toISOString().split('T')[0];
        transaction.fine = fine;

        const book = books.find(b => b.id === transaction.bookId);
        if (book) {
            book.available++;
        }

        saveBooks();
        saveTransactions();

        alert('Book returned successfully!');
        showStudentDashboard();
    }
}

// Modal Functions
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, setting up event listeners...');

    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            if (login(email, password)) {
                loginForm.reset();
                document.getElementById('loginError').classList.remove('active');
            } else {
                document.getElementById('loginError').classList.add('active');
            }
        });
    }

    // Book Form
    const bookForm = document.getElementById('bookForm');
    if (bookForm) {
        bookForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveBook();
        });
    }

    // Logout Button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Add Book Button
    const addBookBtn = document.getElementById('addBookBtn');
    if (addBookBtn) {
        addBookBtn.addEventListener('click', showAddBookModal);
    }

    // Search and Filter
    const adminSearch = document.getElementById('adminSearch');
    if (adminSearch) {
        adminSearch.addEventListener('input', renderAllBooks);
    }

    const adminCategoryFilter = document.getElementById('adminCategoryFilter');
    if (adminCategoryFilter) {
        adminCategoryFilter.addEventListener('change', renderAllBooks);
    }

    const studentSearch = document.getElementById('studentSearch');
    if (studentSearch) {
        studentSearch.addEventListener('input', renderAvailableBooks);
    }

    const studentCategoryFilter = document.getElementById('studentCategoryFilter');
    if (studentCategoryFilter) {
        studentCategoryFilter.addEventListener('change', renderAvailableBooks);
    }

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });

    // Initialize
    console.log('Starting app initialization...');
    initApp();
});
