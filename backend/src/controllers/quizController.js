const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification } = require('../services/notificationService');

const quizDatabase = {
  javascript: {
    title: 'JavaScript Core & Modern ES6+',
    category: 'web-development',
    timeLimit: 10,
    passingScore: 80,
    badgeIcon: '⚡',
    questions: [
      {
        id: 1,
        question: 'Which statement about JavaScript closures is correct?',
        options: [
          'A closure is a function that can only access global variables',
          'A closure is the combination of a function bundled together with references to its surrounding lexical environment',
          'Closures only exist in object-oriented JavaScript classes',
          'Closures cause automatic garbage collection immediately after execution',
        ],
        correctAnswer: 1,
      },
      {
        id: 2,
        question: 'What is the output of `console.log(typeof NaN)`?',
        options: ['"undefined"', '"number"', '"NaN"', '"object"'],
        correctAnswer: 1,
      },
      {
        id: 3,
        question: 'Which method creates a new array with all elements that pass the test implemented by the provided function?',
        options: ['Array.prototype.map()', 'Array.prototype.forEach()', 'Array.prototype.filter()', 'Array.prototype.reduce()'],
        correctAnswer: 2,
      },
      {
        id: 4,
        question: 'What is the key difference between `==` and `===` in JavaScript?',
        options: [
          '`==` checks both value and type, while `===` only checks value',
          '`===` performs type coercion before comparison',
          '`===` checks strict equality without type coercion, while `==` performs type coercion',
          'There is no difference in modern V8 engines',
        ],
        correctAnswer: 2,
      },
      {
        id: 5,
        question: 'How do Promises handle asynchronous operations compared to traditional callbacks?',
        options: [
          'Promises block the JavaScript event loop until resolved',
          'Promises provide cleaner chaining via `.then()`, `.catch()`, and avoid callback hell',
          'Promises can only handle synchronous data',
          'Promises run in separate OS threads without Node.js libuv',
        ],
        correctAnswer: 1,
      },
    ],
  },
  react: {
    title: 'React 18 & State Architecture',
    category: 'web-development',
    timeLimit: 10,
    passingScore: 80,
    badgeIcon: '⚛️',
    questions: [
      {
        id: 1,
        question: 'What is the primary purpose of the `useEffect` hook in React?',
        options: [
          'To mutate state synchronously before rendering',
          'To perform side effects such as data fetching, subscriptions, or DOM mutations after rendering',
          'To replace Redux for all global application state',
          'To compile JSX directly into WebAssembly',
        ],
        correctAnswer: 1,
      },
      {
        id: 2,
        question: 'What problem does `useCallback` solve in React applications?',
        options: [
          'It automatically debounces API requests',
          'It caches the result of expensive calculations',
          'It returns a memoized version of the callback function that only changes if dependencies change',
          'It forces a component re-render on every state update',
        ],
        correctAnswer: 2,
      },
      {
        id: 3,
        question: 'Why must React state never be mutated directly (e.g. `state.count = 5`)?',
        options: [
          'It throws a fatal syntax error in Node.js',
          'React relies on immutable state references to detect changes and trigger UI re-renders',
          'State mutations break HTML5 CSS stylesheet parsing',
          'React does not allow state to hold numbers',
        ],
        correctAnswer: 1,
      },
      {
        id: 4,
        question: 'What is the Virtual DOM in React?',
        options: [
          'A direct duplicate of the browser window object',
          'A lightweight in-memory representation of the real DOM used for reconciliation with minimal layout thrashing',
          'A Chrome DevTools extension',
          'A CSS Grid layout framework',
        ],
        correctAnswer: 1,
      },
      {
        id: 5,
        question: 'Which hook should you use to share values between deeply nested components without prop drilling?',
        options: ['useReducer', 'useContext', 'useLayoutEffect', 'useImperativeHandle'],
        correctAnswer: 1,
      },
    ],
  },
  python: {
    title: 'Python Backend & Data Engineering',
    category: 'data-science',
    timeLimit: 10,
    passingScore: 80,
    badgeIcon: '🐍',
    questions: [
      {
        id: 1,
        question: 'What is a Python generator and how is it created?',
        options: [
          'A function that uses `yield` instead of `return` to produce values lazily on demand',
          'A class constructor that initializes all list elements in RAM immediately',
          'A C-extension compiled with Cython',
          'A thread manager in the standard library',
        ],
        correctAnswer: 0,
      },
      {
        id: 2,
        question: 'What is the difference between a `list` and a `tuple` in Python?',
        options: [
          'Lists are immutable, while tuples are mutable',
          'Lists are mutable and can be modified; tuples are immutable and fixed in size',
          'Tuples can only store integers',
          'Lists cannot contain nested objects',
        ],
        correctAnswer: 1,
      },
      {
        id: 3,
        question: 'Which data structure in Python offers O(1) average time complexity for key lookups?',
        options: ['List', 'Tuple', 'Dictionary (dict) / Hash map', 'Deque'],
        correctAnswer: 2,
      },
      {
        id: 4,
        question: 'What is the purpose of the `*args` and `**kwargs` syntax in Python function definitions?',
        options: [
          'To enforce strict static type checking',
          'To accept variable numbers of positional arguments (*args) and keyword arguments (**kwargs)',
          'To import modules from external C-libraries',
          'To create recursive pointer references',
        ],
        correctAnswer: 1,
      },
      {
        id: 5,
        question: 'What does the `with` statement (context manager) guarantee in Python (e.g. `with open(...)`)?',
        options: [
          'Automatic error suppression without traceback',
          'Guaranteed cleanup and closing of resources even if exceptions occur',
          'Automatic multiprocessing execution',
          'Conversion of file contents to JSON',
        ],
        correctAnswer: 1,
      },
    ],
  },
  figma: {
    title: 'Figma UI/UX & Design Systems',
    category: 'design',
    timeLimit: 10,
    passingScore: 80,
    badgeIcon: '🎨',
    questions: [
      {
        id: 1,
        question: 'What does Figma Auto Layout allow designers to create?',
        options: [
          '3D WebGL mesh animations',
          'Dynamic components and frames that automatically grow or shrink with their content and padding',
          'Automated backend REST APIs',
          'Raster image compression',
        ],
        correctAnswer: 1,
      },
      {
        id: 2,
        question: 'What is a Component Variant in Figma?',
        options: [
          'A broken component instance',
          'A grouped set of related component states (e.g., button sizes, hover/active/disabled states) in a single master component',
          'A vector pencil tool',
          'A custom color palette export script',
        ],
        correctAnswer: 1,
      },
      {
        id: 3,
        question: 'In UX design, what is the key purpose of creating low-fidelity wireframes before high-fidelity mockups?',
        options: [
          'To choose exact brand hex colors and fonts',
          'To focus on layout, information hierarchy, and user flow without getting distracted by visual polish',
          'To write production React frontend code',
          'To generate SVG icons',
        ],
        correctAnswer: 1,
      },
      {
        id: 4,
        question: 'What are Figma Design Tokens (Variables)?',
        options: [
          'Cryptocurrency reward points for designers',
          'Reusable values (colors, spacing, typography, radii) that maintain consistent design systems across design and code',
          'Figma plugin subscriptions',
          'HTML iframe exports',
        ],
        correctAnswer: 1,
      },
      {
        id: 5,
        question: 'What accessibility contrast ratio is required by WCAG AA standard for normal body text?',
        options: ['At least 1.5:1', 'At least 3:1', 'At least 4.5:1', 'At least 10:1'],
        correctAnswer: 2,
      },
    ],
  },
};

exports.getQuizzes = asyncHandler(async (req, res) => {
  const quizzes = Object.keys(quizDatabase).map((key) => {
    const q = quizDatabase[key];
    return {
      topicId: key,
      title: q.title,
      category: q.category,
      timeLimit: q.timeLimit,
      passingScore: q.passingScore,
      questionsCount: q.questions.length,
      badgeIcon: q.badgeIcon,
    };
  });

  res.json({ success: true, quizzes });
});

exports.getQuizByTopic = asyncHandler(async (req, res) => {
  const { topic } = req.params;
  const quiz = quizDatabase[topic.toLowerCase()];

  if (!quiz) throw new ApiError(404, 'Quiz topic not found');

  // Strip correct answers when sending to client
  const clientQuestions = quiz.questions.map((q) => ({
    id: q.id,
    question: q.question,
    options: q.options,
  }));

  res.json({
    success: true,
    quiz: {
      topicId: topic,
      title: quiz.title,
      category: quiz.category,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
      questions: clientQuestions,
      badgeIcon: quiz.badgeIcon,
    },
  });
});

exports.submitQuiz = asyncHandler(async (req, res) => {
  const { topic } = req.params;
  const { answers } = req.body; // e.g. { "1": 1, "2": 1, ... }
  const quiz = quizDatabase[topic.toLowerCase()];

  if (!quiz) throw new ApiError(404, 'Quiz topic not found');
  if (!answers || typeof answers !== 'object') {
    throw new ApiError(400, 'Answers object is required');
  }

  let correctCount = 0;
  const total = quiz.questions.length;
  const review = [];

  quiz.questions.forEach((q) => {
    const userAnswer = answers[q.id];
    const isCorrect = userAnswer === q.correctAnswer;
    if (isCorrect) correctCount++;
    review.push({
      id: q.id,
      question: q.question,
      userAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect,
    });
  });

  const scorePercentage = Math.round((correctCount / total) * 100);
  const passed = scorePercentage >= quiz.passingScore;

  let badgeAwarded = null;

  if (passed) {
    const user = await User.findById(req.user._id);
    const badgeName = `${quiz.title} Verified Expert`;

    // Check if user already has this badge
    const existingIndex = user.badges.findIndex((b) => b.category === quiz.category && b.name === badgeName);
    const newBadge = {
      name: badgeName,
      category: quiz.category,
      score: scorePercentage,
      earnedAt: new Date(),
      badgeIcon: quiz.badgeIcon,
    };

    if (existingIndex >= 0) {
      user.badges[existingIndex] = newBadge;
    } else {
      user.badges.push(newBadge);
    }

    await user.save();
    badgeAwarded = newBadge;

    const io = req.app.get('io');
    await createNotification({
      userId: req.user._id,
      title: `🏆 New Badge Earned: ${badgeName}!`,
      message: `Congratulations! You scored ${scorePercentage}% and earned the Verified Expert badge.`,
      type: 'badge',
      link: `/settings`,
      io,
    });
  }

  res.json({
    success: true,
    passed,
    score: scorePercentage,
    correctCount,
    totalQuestions: total,
    badgeAwarded,
    review,
  });
});
