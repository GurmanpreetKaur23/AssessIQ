const Question = require('../models/Question');

const SEED_QUESTIONS = [
  // Difficulty 1 — easy
  { text: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyperlink and Text Markup Language', 'Home Tool Markup Language'], correct_option: 'A', explanation: 'HTML = Hyper Text Markup Language, the standard markup language for web pages.', topic: 'Web Basics', subtopic: 'HTML', difficulty: 1 },
  { text: 'Which symbol is used for single-line comments in JavaScript?', options: ['/* */', '//', '#', '--'], correct_option: 'B', explanation: '// starts a single-line comment in JavaScript.', topic: 'Programming', subtopic: 'JavaScript', difficulty: 1 },
  { text: 'What is the output of 2 + "2" in JavaScript?', options: ['4', '22', 'NaN', 'Error'], correct_option: 'B', explanation: 'JS coerces 2 to string and concatenates: "2" + "2" = "22".', topic: 'Programming', subtopic: 'JavaScript', difficulty: 1 },
  { text: 'Which tag is used to define an unordered list in HTML?', options: ['<ol>', '<li>', '<ul>', '<list>'], correct_option: 'C', explanation: '<ul> defines an unordered (bulleted) list.', topic: 'Web Basics', subtopic: 'HTML', difficulty: 1 },
  { text: 'What does CSS stand for?', options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style Syntax', 'Colorful Style Sheets'], correct_option: 'B', explanation: 'CSS = Cascading Style Sheets, used to style HTML documents.', topic: 'Web Basics', subtopic: 'CSS', difficulty: 1 },

  // Difficulty 2
  { text: 'Which data structure follows FIFO (First In First Out) order?', options: ['Stack', 'Queue', 'Tree', 'Graph'], correct_option: 'B', explanation: 'A Queue follows FIFO — the first element added is the first removed.', topic: 'Data Structures', subtopic: 'Queue', difficulty: 2 },
  { text: 'What is the time complexity of binary search?', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], correct_option: 'C', explanation: 'Binary search halves the search space each step → O(log n).', topic: 'Algorithms', subtopic: 'Searching', difficulty: 2 },
  { text: 'In Python, which keyword is used to define a function?', options: ['function', 'def', 'func', 'define'], correct_option: 'B', explanation: 'Python uses the `def` keyword to declare a function.', topic: 'Programming', subtopic: 'Python', difficulty: 2 },
  { text: 'Which HTTP method is used to send data to a server to create a resource?', options: ['GET', 'DELETE', 'PUT', 'POST'], correct_option: 'D', explanation: 'POST is used to submit data to the server to create a new resource.', topic: 'Web Basics', subtopic: 'HTTP', difficulty: 2 },
  { text: 'What does the `this` keyword refer to inside a regular function in JavaScript?', options: ['The global object', 'The function itself', 'undefined', 'The parent function'], correct_option: 'A', explanation: 'In non-strict mode, `this` in a regular function refers to the global object (window in browsers).', topic: 'Programming', subtopic: 'JavaScript', difficulty: 2 },

  // Difficulty 3
  { text: 'What is the worst-case time complexity of quicksort?', options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'], correct_option: 'C', explanation: 'Quicksort degrades to O(n²) when the pivot is always the min/max element.', topic: 'Algorithms', subtopic: 'Sorting', difficulty: 3 },
  { text: 'Which of these is NOT a principle of Object-Oriented Programming?', options: ['Encapsulation', 'Polymorphism', 'Compilation', 'Inheritance'], correct_option: 'C', explanation: 'OOP principles are Encapsulation, Polymorphism, Inheritance, and Abstraction. Compilation is not one of them.', topic: 'Programming', subtopic: 'OOP', difficulty: 3 },
  { text: 'What is a closure in JavaScript?', options: ['A function that returns another function', 'A variable that cannot be changed', 'A function with access to its outer scope variables even after the outer function has returned', 'An immediately invoked function'], correct_option: 'C', explanation: 'A closure is a function that retains access to variables from its lexical scope even after the outer function has finished executing.', topic: 'Programming', subtopic: 'JavaScript', difficulty: 3 },
  { text: 'In a relational database, what does a foreign key do?', options: ['Uniquely identifies each row', 'Indexes a column for faster search', 'Links two tables together by referencing the primary key of another table', 'Encrypts sensitive data'], correct_option: 'C', explanation: 'A foreign key creates a link between two tables by referencing the primary key of another table.', topic: 'Databases', subtopic: 'SQL', difficulty: 3 },
  { text: 'Which React hook is used to perform side effects?', options: ['useState', 'useContext', 'useEffect', 'useReducer'], correct_option: 'C', explanation: 'useEffect runs side effects (data fetching, subscriptions, DOM mutations) after render.', topic: 'Web Basics', subtopic: 'React', difficulty: 3 },

  // Difficulty 4
  { text: 'What is the purpose of the `useCallback` hook in React?', options: ['To memoize a value', 'To memoize a function so it is not recreated on every render', 'To fetch data on component mount', 'To manage global state'], correct_option: 'B', explanation: 'useCallback returns a memoized version of the callback function, preventing unnecessary re-renders of child components.', topic: 'Web Basics', subtopic: 'React', difficulty: 4 },
  { text: 'What is a deadlock in operating systems?', options: ['A process that runs indefinitely', 'Two or more processes waiting for each other to release resources, causing all to be stuck', 'A memory leak that crashes the system', 'A CPU scheduling algorithm'], correct_option: 'B', explanation: 'A deadlock occurs when two or more processes each hold a resource and wait for the other to release theirs.', topic: 'Systems', subtopic: 'OS', difficulty: 4 },
  { text: 'Which sorting algorithm is stable and has O(n log n) average and worst case?', options: ['Quicksort', 'Heapsort', 'Merge Sort', 'Selection Sort'], correct_option: 'C', explanation: 'Merge Sort is stable and guarantees O(n log n) in all cases.', topic: 'Algorithms', subtopic: 'Sorting', difficulty: 4 },
  { text: 'In the CAP theorem, what does "P" stand for?', options: ['Performance', 'Partition Tolerance', 'Persistence', 'Parallelism'], correct_option: 'B', explanation: 'CAP = Consistency, Availability, Partition Tolerance. P stands for Partition Tolerance.', topic: 'Databases', subtopic: 'Distributed Systems', difficulty: 4 },
  { text: 'What does the `async/await` syntax in JavaScript rely on under the hood?', options: ['Callbacks', 'Observables', 'Promises', 'Web Workers'], correct_option: 'C', explanation: 'async/await is syntactic sugar over Promises — await pauses execution until the Promise resolves.', topic: 'Programming', subtopic: 'JavaScript', difficulty: 4 },

  // Difficulty 5 — hard
  { text: 'What is the space complexity of depth-first search (DFS) on a graph with V vertices and E edges?', options: ['O(V + E)', 'O(V)', 'O(E)', 'O(1)'], correct_option: 'B', explanation: 'DFS uses a stack (recursion stack) proportional to the depth, which is at most O(V) in the worst case.', topic: 'Algorithms', subtopic: 'Graph', difficulty: 5 },
  { text: 'Which concurrency issue occurs when a thread reads a stale cached value of a shared variable instead of the latest value?', options: ['Race condition', 'Deadlock', 'Visibility problem', 'Starvation'], correct_option: 'C', explanation: 'A visibility problem occurs when one thread\'s write to a shared variable is not visible to another thread due to CPU caching.', topic: 'Systems', subtopic: 'Concurrency', difficulty: 5 },
  { text: 'In database isolation levels, which level prevents dirty reads but allows non-repeatable reads?', options: ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'Serializable'], correct_option: 'B', explanation: 'Read Committed prevents dirty reads but does not prevent non-repeatable reads.', topic: 'Databases', subtopic: 'SQL', difficulty: 5 },
  { text: 'What is the primary advantage of a skip list over a balanced BST?', options: ['Lower memory usage', 'Easier to implement with comparable average-case complexity', 'Better worst-case complexity', 'Supports more data types'], correct_option: 'B', explanation: 'Skip lists are simpler to implement than balanced BSTs and achieve O(log n) average case with simpler balancing logic.', topic: 'Data Structures', subtopic: 'Advanced', difficulty: 5 },
  { text: 'Which design pattern ensures a class has only one instance and provides a global access point to it?', options: ['Factory', 'Observer', 'Singleton', 'Prototype'], correct_option: 'C', explanation: 'The Singleton pattern restricts instantiation of a class to a single instance.', topic: 'Programming', subtopic: 'Design Patterns', difficulty: 5 },
];

async function seedQuestions() {
  try {
    const count = await Question.countDocuments();
    if (count > 0) return; // already seeded
    await Question.insertMany(SEED_QUESTIONS);
    console.log(`Seeded ${SEED_QUESTIONS.length} sample questions`);
  } catch (err) {
    console.error('Seed error:', err.message);
  }
}

module.exports = seedQuestions;
