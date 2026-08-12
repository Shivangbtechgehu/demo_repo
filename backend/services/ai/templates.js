/**
 * Role-specific roadmap templates.
 *
 * Each template defines a curated set of milestones for a known target role.
 * Templates are matched against the targetRole string (case-insensitive, partial match).
 * Missing skills are injected as dedicated skill-learning milestones.
 *
 * Schema per milestone:
 * {
 *   title:       string,
 *   description: string,
 *   durationDays: number,
 *   resources:   string[],
 * }
 */

const ROLE_TEMPLATES = {
  'full-stack developer': {
    intro: 'A structured path to becoming a Full-Stack Developer, covering both frontend and backend fundamentals.',
    phases: [
      {
        title: 'Foundations — HTML, CSS & Git',
        description: 'Master the building blocks of the web. Learn semantic HTML, responsive CSS layouts, and version control with Git.',
        durationDays: 10,
        resources: ['MDN Web Docs (HTML)', 'CSS Tricks', 'Pro Git Book (free)'],
      },
      {
        title: 'JavaScript Fundamentals',
        description: 'Learn core JavaScript — variables, functions, DOM manipulation, async/await, and ES6+ syntax.',
        durationDays: 14,
        resources: ['javascript.info', 'Eloquent JavaScript (free)', 'FreeCodeCamp JS curriculum'],
      },
      {
        title: 'Frontend Framework (React)',
        description: 'Build dynamic UIs with React — components, hooks, state management, and React Router.',
        durationDays: 14,
        resources: ['React official docs', 'Scrimba React course', 'Full Stack Open (React section)'],
      },
      {
        title: 'Backend Development (Node.js + Express)',
        description: 'Build REST APIs with Node.js and Express. Learn routing, middleware, authentication, and error handling.',
        durationDays: 14,
        resources: ['Node.js official docs', 'Express.js guide', 'Full Stack Open (backend section)'],
      },
      {
        title: 'Database Design (MongoDB)',
        description: 'Design and query MongoDB databases. Understand schemas, indexes, aggregations, and Mongoose ODM.',
        durationDays: 7,
        resources: ['MongoDB University (free)', 'Mongoose docs', 'MongoDB data modelling guide'],
      },
    ],
  },

  'backend developer': {
    intro: 'A focused path to becoming a Backend Developer, emphasising APIs, databases, and system design.',
    phases: [
      {
        title: 'Programming Fundamentals',
        description: 'Solidify your understanding of data structures, algorithms, and clean code principles.',
        durationDays: 10,
        resources: ['CS50 (free)', 'Clean Code by Robert C. Martin', 'LeetCode easy problems'],
      },
      {
        title: 'RESTful API Design',
        description: 'Learn REST principles, HTTP methods, status codes, versioning, and API documentation with OpenAPI.',
        durationDays: 7,
        resources: ['RESTful API Design guide', 'Swagger/OpenAPI docs', 'Postman learning center'],
      },
      {
        title: 'Node.js & Express Deep Dive',
        description: 'Build production-grade APIs — middleware, authentication, rate limiting, and error handling.',
        durationDays: 14,
        resources: ['Node.js official docs', 'Express best practices', 'NodeBestPractices GitHub repo'],
      },
      {
        title: 'Database Engineering',
        description: 'Learn both SQL and NoSQL databases. Understand indexing, transactions, and query optimisation.',
        durationDays: 10,
        resources: ['PostgreSQL tutorial', 'MongoDB University (free)', 'Use The Index, Luke (free)'],
      },
      {
        title: 'Security & Authentication',
        description: 'Implement JWT authentication, password hashing, input validation, and OWASP security practices.',
        durationDays: 7,
        resources: ['OWASP Top 10', 'JWT.io introduction', 'Helmet.js docs'],
      },
    ],
  },

  'frontend developer': {
    intro: 'A focused path to becoming a Frontend Developer, covering UI, UX, accessibility, and modern tooling.',
    phases: [
      {
        title: 'HTML & CSS Mastery',
        description: 'Deep dive into semantic HTML5, CSS3 layouts (Flexbox, Grid), and responsive design.',
        durationDays: 10,
        resources: ['MDN Web Docs', 'CSS Tricks complete guide', 'Kevin Powell CSS on YouTube'],
      },
      {
        title: 'JavaScript & DOM',
        description: 'Master JavaScript including the DOM API, events, async programming, and browser APIs.',
        durationDays: 14,
        resources: ['javascript.info', 'You Don\'t Know JS (free)', 'FreeCodeCamp JS algorithms'],
      },
      {
        title: 'React Development',
        description: 'Build component-based UIs with React, hooks, context, and React Query for data fetching.',
        durationDays: 14,
        resources: ['React official docs', 'Epic React by Kent C. Dodds', 'Scrimba React course'],
      },
      {
        title: 'Styling & Design Systems',
        description: 'Learn Tailwind CSS, CSS-in-JS, and how to build a consistent design system.',
        durationDays: 7,
        resources: ['Tailwind CSS docs', 'Storybook.js docs', 'Refactoring UI book'],
      },
      {
        title: 'Performance & Accessibility',
        description: 'Optimise your apps for speed and ensure they meet WCAG accessibility standards.',
        durationDays: 5,
        resources: ['web.dev performance', 'a11y project', 'Chrome DevTools performance'],
      },
    ],
  },

  'data scientist': {
    intro: 'A systematic path to becoming a Data Scientist, from statistics to machine learning deployment.',
    phases: [
      {
        title: 'Python for Data Science',
        description: 'Learn Python programming fundamentals and key data science libraries: NumPy, Pandas, and Matplotlib.',
        durationDays: 14,
        resources: ['Python.org tutorial', 'Kaggle Python course (free)', 'Python Data Science Handbook (free)'],
      },
      {
        title: 'Statistics & Probability',
        description: 'Understand descriptive statistics, distributions, hypothesis testing, and Bayesian thinking.',
        durationDays: 10,
        resources: ['Khan Academy Statistics', 'StatQuest on YouTube', 'Think Stats (free book)'],
      },
      {
        title: 'Machine Learning Fundamentals',
        description: 'Learn supervised and unsupervised learning algorithms using scikit-learn.',
        durationDays: 14,
        resources: ['scikit-learn docs', 'Andrew Ng ML course (Coursera)', 'Kaggle ML intro'],
      },
      {
        title: 'Data Visualisation & EDA',
        description: 'Master exploratory data analysis and storytelling with Seaborn, Plotly, and Tableau.',
        durationDays: 7,
        resources: ['Seaborn docs', 'Plotly docs', 'Storytelling with Data book'],
      },
      {
        title: 'Deep Learning Basics',
        description: 'Introduction to neural networks using TensorFlow or PyTorch.',
        durationDays: 14,
        resources: ['fast.ai (free)', 'TensorFlow tutorials', 'Deep Learning Specialisation (Coursera)'],
      },
    ],
  },

  'devops engineer': {
    intro: 'A practical path to DevOps engineering, covering CI/CD, containers, cloud, and infrastructure automation.',
    phases: [
      {
        title: 'Linux & Shell Scripting',
        description: 'Master Linux administration, bash scripting, file systems, and process management.',
        durationDays: 10,
        resources: ['The Linux Command Line (free)', 'OverTheWire Bandit', 'Linux Journey'],
      },
      {
        title: 'Docker & Containerisation',
        description: 'Build, ship, and run applications in containers. Learn Dockerfile, volumes, and networking.',
        durationDays: 7,
        resources: ['Docker official docs', 'Play with Docker (free labs)', 'Docker Deep Dive (book)'],
      },
      {
        title: 'CI/CD Pipelines',
        description: 'Build automated build, test, and deploy pipelines using GitHub Actions or GitLab CI.',
        durationDays: 7,
        resources: ['GitHub Actions docs', 'GitLab CI docs', 'CI/CD with Docker guide'],
      },
      {
        title: 'Kubernetes Fundamentals',
        description: 'Deploy and manage containerised applications with Kubernetes — pods, services, deployments.',
        durationDays: 14,
        resources: ['Kubernetes.io docs', 'KodeKloud K8s course', 'Play with Kubernetes'],
      },
      {
        title: 'Cloud Infrastructure (AWS/Azure/GCP)',
        description: 'Learn cloud provider fundamentals — compute, storage, networking, and IAM.',
        durationDays: 14,
        resources: ['AWS Free Tier', 'Cloud Guru free tier', 'Terraform getting started'],
      },
    ],
  },

  'ui/ux designer': {
    intro: 'A structured path to becoming a UI/UX Designer, from design fundamentals to prototyping and user research.',
    phases: [
      {
        title: 'Design Fundamentals',
        description: 'Learn visual design principles — typography, colour theory, spacing, and layout.',
        durationDays: 7,
        resources: ['Design for Hackers (book)', 'Canva Design School', 'Google Material Design guidelines'],
      },
      {
        title: 'User Research & UX Strategy',
        description: 'Conduct user interviews, create personas, define user journeys, and validate assumptions.',
        durationDays: 7,
        resources: ['NN/g UX articles (free)', 'User Interviews research guide', 'Just Enough Research (book)'],
      },
      {
        title: 'Wireframing & Prototyping',
        description: 'Create low and high fidelity wireframes and interactive prototypes using Figma.',
        durationDays: 10,
        resources: ['Figma official tutorials', 'Figma community files', 'Wireframing guide by UXPin'],
      },
      {
        title: 'Figma & Design Systems',
        description: 'Build reusable component libraries and consistent design systems in Figma.',
        durationDays: 7,
        resources: ['Figma Design System guide', 'Atomic Design (free online)', 'Google Material Design kit'],
      },
      {
        title: 'Usability Testing',
        description: 'Plan, run, and analyse usability tests. Iterate designs based on user feedback.',
        durationDays: 5,
        resources: ['Nielsen Norman Group usability', 'Maze.co user testing tool', 'Usability.gov methods'],
      },
    ],
  },
};

/**
 * Find the best matching template for a given target role.
 * Returns null if no template matches.
 *
 * @param {string} targetRole
 * @returns {object|null}
 */
function findTemplate(targetRole) {
  const normalized = String(targetRole || '').toLowerCase().trim();

  // Exact key match first
  if (ROLE_TEMPLATES[normalized]) return ROLE_TEMPLATES[normalized];

  // Partial match — check if any template key appears in the role string
  const match = Object.keys(ROLE_TEMPLATES).find(
    (key) => normalized.includes(key) || key.includes(normalized)
  );

  return match ? ROLE_TEMPLATES[match] : null;
}

module.exports = { ROLE_TEMPLATES, findTemplate };
