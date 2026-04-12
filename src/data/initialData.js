// Mantrixa — Initial Data
export const ADMIN_CREDENTIALS = {
  email: 'admin@mantrixa.dev',
  password: 'MantrixaAdmin@2024'
};

export const INITIAL_COURSES = [
  {
    id: 'devops-fundamentals',
    title: 'DevOps Engineering Fundamentals',
    subtitle: 'CI/CD, Docker, Kubernetes & Cloud Pipelines',
    description: 'Master the art of DevOps from scratch. Learn containerization with Docker, orchestration with Kubernetes, CI/CD pipelines with Jenkins and GitHub Actions, and deploy to AWS/Azure. Taught by practising MNC DevOps engineers.',
    icon: '⚙️',
    color: '#00ff88',
    level: 'Beginner → Intermediate',
    duration: '10 Weeks',
    price: 2999,
    originalPrice: 5999,
    enrolled: 142,
    rating: 4.9,
    category: 'DevOps',
    tags: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Linux'],
    outcomes: [
      'Build and manage Docker containers',
      'Deploy apps on Kubernetes clusters',
      'Set up automated CI/CD pipelines',
      'Monitor systems with Prometheus & Grafana',
      'Work with cloud infrastructure (AWS/Azure)'
    ],
    curriculum: [
      { week: 1, topic: 'Linux & Shell Scripting Fundamentals', notes: '' },
      { week: 2, topic: 'Git & Version Control Deep Dive', notes: '' },
      { week: 3, topic: 'Docker — Containers & Images', notes: '' },
      { week: 4, topic: 'Docker Compose & Networking', notes: '' },
      { week: 5, topic: 'Kubernetes Architecture', notes: '' },
      { week: 6, topic: 'Kubernetes Deployments & Services', notes: '' },
      { week: 7, topic: 'CI/CD with GitHub Actions', notes: '' },
      { week: 8, topic: 'Jenkins Pipelines', notes: '' },
      { week: 9, topic: 'AWS / Azure Cloud Basics', notes: '' },
      { week: 10, topic: 'Monitoring & Production Readiness', notes: '' }
    ],
    isActive: true
  },
  {
    id: 'sre-mastery',
    title: 'Site Reliability Engineering (SRE)',
    subtitle: 'Reliability, Observability & Incident Management',
    description: 'Learn SRE practices from engineers who run production systems at scale. Covers SLOs/SLAs, error budgets, on-call management, incident response, and building reliable distributed systems.',
    icon: '🔭',
    color: '#00d4ff',
    level: 'Intermediate',
    duration: '8 Weeks',
    price: 3499,
    originalPrice: 6999,
    enrolled: 89,
    rating: 4.8,
    category: 'SRE',
    tags: ['Observability', 'Prometheus', 'Grafana', 'SLOs', 'Incident Response'],
    outcomes: [
      'Define and measure SLOs, SLIs, and error budgets',
      'Set up full observability stacks',
      'Handle on-call and incident response',
      'Build self-healing automation',
      'Capacity planning and load testing'
    ],
    curriculum: [
      { week: 1, topic: 'SRE Principles & Google SRE Book Overview', notes: '' },
      { week: 2, topic: 'SLOs, SLIs, SLAs & Error Budgets', notes: '' },
      { week: 3, topic: 'Observability: Metrics, Logs, Traces', notes: '' },
      { week: 4, topic: 'Prometheus & Grafana Stack', notes: '' },
      { week: 5, topic: 'Incident Management & Postmortems', notes: '' },
      { week: 6, topic: 'Chaos Engineering & Game Days', notes: '' },
      { week: 7, topic: 'Toil Reduction & Automation', notes: '' },
      { week: 8, topic: 'Capacity Planning & Production Readiness', notes: '' }
    ],
    isActive: true
  },
  {
    id: 'python-industry',
    title: 'Python for Industry Professionals',
    subtitle: 'Scripting, APIs, Automation & Data',
    description: 'Beyond basic Python — learn how Python is actually used in MNC environments. From REST API development with FastAPI, to automation scripts, data pipelines, and scripting DevOps workflows.',
    icon: '🐍',
    color: '#7c3aed',
    level: 'Beginner → Advanced',
    duration: '12 Weeks',
    price: 2499,
    originalPrice: 4999,
    enrolled: 210,
    rating: 4.9,
    category: 'Python',
    tags: ['Python', 'FastAPI', 'Automation', 'Data', 'REST APIs'],
    outcomes: [
      'Write production-quality Python code',
      'Build REST APIs with FastAPI',
      'Automate repetitive tasks and workflows',
      'Process and analyse data with Pandas',
      'Integrate Python into DevOps pipelines'
    ],
    curriculum: [
      { week: 1, topic: 'Python Fundamentals & Environment Setup', notes: '' },
      { week: 2, topic: 'OOP & Advanced Python Concepts', notes: '' },
      { week: 3, topic: 'File I/O & Exception Handling', notes: '' },
      { week: 4, topic: 'REST APIs with FastAPI', notes: '' },
      { week: 5, topic: 'Database Integration (PostgreSQL)', notes: '' },
      { week: 6, topic: 'Automation Scripts & OS Module', notes: '' },
      { week: 7, topic: 'Testing with pytest', notes: '' },
      { week: 8, topic: 'Pandas & Data Processing', notes: '' },
      { week: 9, topic: 'Web Scraping & Requests', notes: '' },
      { week: 10, topic: 'Async Python & Concurrency', notes: '' },
      { week: 11, topic: 'Docker + Python in Production', notes: '' },
      { week: 12, topic: 'Capstone Project', notes: '' }
    ],
    isActive: true
  },
  {
    id: 'react-industry',
    title: 'React.js for Modern Web Development',
    subtitle: 'Hooks, State Management & Production Patterns',
    description: 'Learn React the way it is built in product companies. Not just tutorials — you will learn architecture patterns, performance optimisation, testing, and how React teams in MNCs actually work.',
    icon: '⚛️',
    color: '#ff6b35',
    level: 'Beginner → Advanced',
    duration: '10 Weeks',
    price: 2799,
    originalPrice: 5599,
    enrolled: 178,
    rating: 4.8,
    category: 'React',
    tags: ['React', 'Redux', 'TypeScript', 'Testing', 'Next.js'],
    outcomes: [
      'Build complex React applications from scratch',
      'Master hooks and context API patterns',
      'State management with Redux Toolkit',
      'Test React components with Jest & RTL',
      'Deploy React apps to production'
    ],
    curriculum: [
      { week: 1, topic: 'React Fundamentals & JSX', notes: '' },
      { week: 2, topic: 'Components, Props & State', notes: '' },
      { week: 3, topic: 'useEffect & Lifecycle Deep Dive', notes: '' },
      { week: 4, topic: 'Advanced Hooks & Custom Hooks', notes: '' },
      { week: 5, topic: 'Context API & Global State', notes: '' },
      { week: 6, topic: 'Redux Toolkit', notes: '' },
      { week: 7, topic: 'React Router & Navigation', notes: '' },
      { week: 8, topic: 'Performance Optimisation', notes: '' },
      { week: 9, topic: 'Testing React Applications', notes: '' },
      { week: 10, topic: 'Next.js & Production Deployment', notes: '' }
    ],
    isActive: true
  }
];

export const INITIAL_EXAMS = [
  {
    id: 'devops-exam-1',
    courseId: 'devops-fundamentals',
    title: 'DevOps Week 1-5 Assessment',
    duration: 30,
    passingScore: 70,
    questions: [
      {
        id: 'q1',
        question: 'What command is used to list all running Docker containers?',
        options: ['docker ps', 'docker list', 'docker show', 'docker run --list'],
        correct: 0
      },
      {
        id: 'q2',
        question: 'Which Kubernetes resource is responsible for maintaining a set of replica Pods running at any given time?',
        options: ['Service', 'Deployment', 'ReplicaSet', 'Pod'],
        correct: 2
      },
      {
        id: 'q3',
        question: 'In CI/CD, what does "CD" stand for?',
        options: ['Code Deployment', 'Continuous Deployment/Delivery', 'Container Docker', 'Cloud Distribution'],
        correct: 1
      },
      {
        id: 'q4',
        question: 'Which command builds a Docker image from a Dockerfile?',
        options: ['docker create', 'docker compile', 'docker build', 'docker make'],
        correct: 2
      },
      {
        id: 'q5',
        question: 'What file format does Kubernetes use for configuration?',
        options: ['JSON only', 'YAML or JSON', 'TOML', 'XML'],
        correct: 1
      }
    ]
  },
  {
    id: 'python-exam-1',
    courseId: 'python-industry',
    title: 'Python Fundamentals Assessment',
    duration: 25,
    passingScore: 75,
    questions: [
      {
        id: 'q1',
        question: 'Which of the following is a mutable data type in Python?',
        options: ['tuple', 'str', 'list', 'int'],
        correct: 2
      },
      {
        id: 'q2',
        question: 'What does the `@property` decorator do in Python?',
        options: ['Makes a method static', 'Allows a method to be accessed like an attribute', 'Creates a class method', 'Marks a method as abstract'],
        correct: 1
      },
      {
        id: 'q3',
        question: 'What is the output of: `print(type([]) == list)`?',
        options: ['False', 'TypeError', 'True', 'None'],
        correct: 2
      },
      {
        id: 'q4',
        question: 'Which HTTP method should a FastAPI route use for creating a new resource?',
        options: ['GET', 'POST', 'PUT', 'DELETE'],
        correct: 1
      },
      {
        id: 'q5',
        question: 'In Python, what does `*args` represent in a function signature?',
        options: ['Keyword arguments', 'A single argument', 'Variable positional arguments', 'Default arguments'],
        correct: 2
      }
    ]
  },
  {
    id: 'react-exam-1',
    courseId: 'react-industry',
    title: 'React Core Concepts Assessment',
    duration: 25,
    passingScore: 70,
    questions: [
      {
        id: 'q1',
        question: 'Which hook is used to run side effects in a functional component?',
        options: ['useState', 'useEffect', 'useContext', 'useReducer'],
        correct: 1
      },
      {
        id: 'q2',
        question: 'What is the purpose of the `key` prop in a React list?',
        options: ['To style list items', 'To help React identify which items changed', 'To set the list order', 'To disable re-renders'],
        correct: 1
      },
      {
        id: 'q3',
        question: 'What does React.memo() do?',
        options: ['Memoizes state values', 'Prevents a component from re-rendering unless props change', 'Creates a memory cache', 'Stores values between renders'],
        correct: 1
      },
      {
        id: 'q4',
        question: 'In React Router v6, which component wraps all route definitions?',
        options: ['<Switch>', '<Routes>', '<Router>', '<BrowserRouter>'],
        correct: 1
      },
      {
        id: 'q5',
        question: 'What is the correct way to update state based on the previous state in React?',
        options: ['setState(state + 1)', 'setState(prev => prev + 1)', 'state = state + 1', 'updateState(state++)'],
        correct: 1
      }
    ]
  }
];

export const INTERVIEW_QUESTIONS = {
  'devops-fundamentals': [
    'Can you explain the difference between Docker and a Virtual Machine?',
    'What is a Kubernetes Pod and how is it different from a container?',
    'Walk me through how you would set up a CI/CD pipeline from scratch.',
    'What are the 12-factor app principles and why do they matter for DevOps?',
    'How would you handle a production deployment that went wrong?'
  ],
  'sre-mastery': [
    'What is an SLO and how do you calculate an error budget?',
    'Describe your approach to a P1 incident. Walk me through your process.',
    'What is the difference between monitoring and observability?',
    'How do you decide when to stop feature development to work on reliability?',
    'What is toil and how would you systematically reduce it?'
  ],
  'python-industry': [
    'What is the difference between a list and a tuple in Python?',
    'Explain how Python\'s GIL affects multi-threaded applications.',
    'How would you design a REST API using FastAPI?',
    'What are Python decorators and can you write a simple example?',
    'How do you manage dependencies in a Python project for production?'
  ],
  'react-industry': [
    'Explain the React component lifecycle with hooks.',
    'What is the difference between useCallback and useMemo?',
    'How would you manage global state in a large React application?',
    'What are React portals and when would you use them?',
    'How do you optimise a React app that is rendering slowly?'
  ]
};
