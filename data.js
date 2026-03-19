// Sample Data for Bharat Institute of Technology Library Management System

// Book Categories
const CATEGORIES = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'English Literature',
  'Management',
  'General Knowledge'
];

// Sample Books Data
const SAMPLE_BOOKS = [
  {
    id: 'B001',
    isbn: '978-0-13-468599-1',
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    category: 'Computer Science',
    publisher: 'MIT Press',
    year: 2022,
    copies: 5,
    available: 5,
    description: 'Comprehensive introduction to algorithms and data structures'
  },
  {
    id: 'B002',
    isbn: '978-0-13-235088-4',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    category: 'Computer Science',
    publisher: 'Prentice Hall',
    year: 2008,
    copies: 3,
    available: 2,
    description: 'A handbook of agile software craftsmanship'
  },
  {
    id: 'B003',
    isbn: '978-0-07-338314-5',
    title: 'Higher Engineering Mathematics',
    author: 'B.S. Grewal',
    category: 'Mathematics',
    publisher: 'Khanna Publishers',
    year: 2020,
    copies: 10,
    available: 8,
    description: 'Comprehensive mathematics for engineering students'
  },
  {
    id: 'B004',
    isbn: '978-0-13-110362-7',
    title: 'Physics for Scientists and Engineers',
    author: 'Raymond A. Serway',
    category: 'Physics',
    publisher: 'Cengage Learning',
    year: 2019,
    copies: 8,
    available: 6,
    description: 'Modern physics textbook with practical applications'
  },
  {
    id: 'B005',
    isbn: '978-0-13-467809-3',
    title: 'Database System Concepts',
    author: 'Abraham Silberschatz',
    category: 'Computer Science',
    publisher: 'McGraw-Hill',
    year: 2020,
    copies: 4,
    available: 3,
    description: 'Comprehensive guide to database management systems'
  },
  {
    id: 'B006',
    isbn: '978-0-13-601970-1',
    title: 'Digital Electronics',
    author: 'Morris Mano',
    category: 'Electronics',
    publisher: 'Pearson',
    year: 2018,
    copies: 6,
    available: 5,
    description: 'Fundamentals of digital logic design'
  },
  {
    id: 'B007',
    isbn: '978-0-07-352954-0',
    title: 'Engineering Mechanics',
    author: 'Ferdinand Beer',
    category: 'Mechanical Engineering',
    publisher: 'McGraw-Hill',
    year: 2019,
    copies: 7,
    available: 4,
    description: 'Statics and dynamics for mechanical engineers'
  },
  {
    id: 'B008',
    isbn: '978-0-13-063085-2',
    title: 'Artificial Intelligence: A Modern Approach',
    author: 'Stuart Russell',
    category: 'Computer Science',
    publisher: 'Pearson',
    year: 2021,
    copies: 5,
    available: 3,
    description: 'Comprehensive introduction to AI concepts and techniques'
  },
  {
    id: 'B009',
    isbn: '978-1-59327-928-8',
    title: 'Python Crash Course',
    author: 'Eric Matthes',
    category: 'Computer Science',
    publisher: 'No Starch Press',
    year: 2023,
    copies: 6,
    available: 6,
    description: 'A hands-on introduction to programming with Python'
  },
  {
    id: 'B010',
    isbn: '978-0-19-852663-6',
    title: 'Organic Chemistry',
    author: 'Paula Bruice',
    category: 'Chemistry',
    publisher: 'Pearson',
    year: 2020,
    copies: 5,
    available: 4,
    description: 'Modern approach to organic chemistry'
  }
];

// Sample Users Data
const SAMPLE_USERS = [
  {
    id: 'ADM001',
    name: 'Admin User',
    email: 'admin@bit.edu.in',
    password: 'admin123',
    role: 'admin',
    department: 'Library'
  },
  {
    id: 'STU001',
    name: 'Rahul Sharma',
    email: 'rahul@bit.edu.in',
    password: 'student123',
    role: 'student',
    department: 'Computer Science',
    year: '3rd Year'
  },
  {
    id: 'STU002',
    name: 'Priya Patel',
    email: 'priya@bit.edu.in',
    password: 'student123',
    role: 'student',
    department: 'Electronics',
    year: '2nd Year'
  },
  {
    id: 'STU003',
    name: 'Amit Kumar',
    email: 'amit@bit.edu.in',
    password: 'student123',
    role: 'student',
    department: 'Mechanical Engineering',
    year: '4th Year'
  },
  {
    id: 'STU004',
    name: 'Sneha Reddy',
    email: 'sneha@bit.edu.in',
    password: 'student123',
    role: 'student',
    department: 'Computer Science',
    year: '3rd Year'
  }
];

// Initialize Data in LocalStorage
function initializeData() {
  // Check if data already exists
  if (!localStorage.getItem('library_books')) {
    localStorage.setItem('library_books', JSON.stringify(SAMPLE_BOOKS));
  }
  
  if (!localStorage.getItem('library_users')) {
    localStorage.setItem('library_users', JSON.stringify(SAMPLE_USERS));
  }
  
  if (!localStorage.getItem('library_transactions')) {
    localStorage.setItem('library_transactions', JSON.stringify([]));
  }
  
  if (!localStorage.getItem('library_categories')) {
    localStorage.setItem('library_categories', JSON.stringify(CATEGORIES));
  }
}

// Helper function to get next book ID
function getNextBookId() {
  const books = JSON.parse(localStorage.getItem('library_books') || '[]');
  if (books.length === 0) return 'B001';
  
  const ids = books.map(b => parseInt(b.id.substring(1)));
  const maxId = Math.max(...ids);
  return 'B' + String(maxId + 1).padStart(3, '0');
}

// Helper function to get next transaction ID
function getNextTransactionId() {
  const transactions = JSON.parse(localStorage.getItem('library_transactions') || '[]');
  if (transactions.length === 0) return 'T001';
  
  const ids = transactions.map(t => parseInt(t.id.substring(1)));
  const maxId = Math.max(...ids);
  return 'T' + String(maxId + 1).padStart(3, '0');
}

// Fine calculation (Rs. 5 per day after due date)
const FINE_PER_DAY = 5;
const BORROW_DURATION_DAYS = 14;

function calculateFine(dueDate) {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = today - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays > 0) {
    return diffDays * FINE_PER_DAY;
  }
  return 0;
}

function getDueDate() {
  const today = new Date();
  today.setDate(today.getDate() + BORROW_DURATION_DAYS);
  return today.toISOString().split('T')[0];
}
