require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Gig = require('../models/Gig');
const connectDB = require('../config/db');

const SAMPLE_PROJECTS = [
  {
    title: 'Build a Next.js 14 SaaS Landing Page & Auth Flow',
    description:
      'We need an experienced student developer to build a modern Next.js 14 responsive landing page with dark mode, animations, and Stripe/Auth integration. Clean code and CSS modules required.',
    budget: 450,
    category: 'web-development',
    skillsRequired: ['Next.js', 'React', 'TypeScript', 'TailwindCSS'],
    status: 'open',
  },
  {
    title: 'Mobile App UI/UX Design System in Figma',
    description:
      'Early-stage AI startup needs a full mobile app UI kit (30 screens), interactive prototype, component library, and exportable design tokens.',
    budget: 350,
    category: 'design',
    skillsRequired: ['Figma', 'UI/UX', 'Mobile Design', 'Wireframing'],
    status: 'open',
  },
  {
    title: 'Python RAG Pipeline & OpenAI Chatbot Integration',
    description:
      'Build a document-question-answering chatbot using LangChain, OpenAI, and vector database embeddings. Provide FastAPI endpoints.',
    budget: 500,
    category: 'data-science',
    skillsRequired: ['Python', 'OpenAI', 'LangChain', 'FastAPI'],
    status: 'open',
  },
  {
    title: 'Social Media Growth & Tech Content Writing',
    description:
      'Write 5 technical blog posts on web development trends and create 10 infographic carousel posts for LinkedIn and Twitter.',
    budget: 200,
    category: 'writing',
    skillsRequired: ['Content Writing', 'SEO', 'Technical Writing'],
    status: 'open',
  },
];

const seed = async () => {
  await connectDB();

  // 1. Admin
  let admin = await User.findOne({ email: 'admin@skillbridge.com' }).select('+password');
  if (!admin) {
    admin = await User.create({
      name: 'Admin Moderator',
      username: 'admin',
      email: 'admin@skillbridge.com',
      password: 'admin123456',
      role: 'admin',
      isVerified: true,
    });
    console.log('Admin created: admin@skillbridge.com / admin123456');
  } else {
    // Reset password in case it was changed or seeded incorrectly before
    admin.password = 'admin123456';
    admin.role = 'admin';
    admin.isVerified = true;
    await admin.save(); // triggers bcrypt pre-save hook
    console.log('Admin password reset: admin@skillbridge.com / admin123456');
  }

  // 2. User Student: gudellijhansi6@gmail.com
  let studentUser = await User.findOne({ email: 'gudellijhansi6@gmail.com' });
  if (!studentUser) {
    studentUser = await User.create({
      name: 'Jhansi Gudelli',
      username: 'jhansi_dev',
      email: 'gudellijhansi6@gmail.com',
      password: 'password123',
      role: 'student',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      skills: ['Next.js', 'React', 'Node.js', 'Python', 'Figma', 'TypeScript'],
      bio: 'Final year CS student & Full-Stack Freelancer. Specialized in building fast Next.js web applications, responsive UI/UX design, and AI integrations.',
      hourlyRate: 35,
      education: [
        {
          institution: 'Stanford University (Campus Ambassador)',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startYear: 2022,
          endYear: 2026,
        },
      ],
      badges: [
        {
          name: 'JavaScript Core & Modern ES6+ Verified Expert',
          category: 'web-development',
          score: 100,
          badgeIcon: '⚡',
          earnedAt: new Date(),
        },
        {
          name: 'React 18 & State Architecture Verified Expert',
          category: 'web-development',
          score: 95,
          badgeIcon: '⚛️',
          earnedAt: new Date(),
        },
      ],
      portfolio: [
        {
          title: 'DevCollab — Real-time Code Workspace',
          description: 'A full-stack collaboration platform with interactive code editor, WebRTC video calling, and live compilation.',
          image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
          liveUrl: 'https://github.com',
          githubUrl: 'https://github.com',
          technologies: ['Next.js', 'Socket.IO', 'TailwindCSS'],
        },
        {
          title: 'FinTrack — Smart Banking Dashboard UI',
          description: 'Comprehensive financial dashboard featuring interactive spending charts, dark mode, and transaction tracking.',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
          figmaEmbedUrl: 'https://www.figma.com',
          liveUrl: 'https://github.com',
          technologies: ['Figma', 'UI/UX', 'Design System'],
        },
      ],
    });
    console.log('Student created: gudellijhansi6@gmail.com / password123');
  }

  // 3. User Client: bhargavigudelli41@gmail.com
  let clientUser = await User.findOne({ email: 'bhargavigudelli41@gmail.com' });
  if (!clientUser) {
    clientUser = await User.create({
      name: 'Bhargavi Gudelli',
      username: 'bhargavi_client',
      email: 'bhargavigudelli41@gmail.com',
      password: 'password123',
      role: 'client',
      isVerified: true,
      companyName: 'Gudelli Ventures & Labs',
      companyDescription: 'Building innovative consumer AI products and hiring top university talent.',
    });
    console.log('Client created: bhargavigudelli41@gmail.com / password123');
  }

  // 4. Sample Gigs for student
  const gigCount = await Gig.countDocuments();
  if (gigCount === 0) {
    await Gig.create([
      {
        title: 'I will build a high-performance Next.js full-stack web application',
        freelancer: studentUser._id,
        category: 'web-development',
        description: 'Get a production-grade full-stack web app built with Next.js 14, React 18, MongoDB / PostgreSQL, and clean responsive CSS.',
        coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
        tags: ['Next.js', 'React', 'Full-Stack', 'Node.js', 'MongoDB'],
        packages: {
          basic: {
            title: 'Starter Landing Page',
            description: '1 responsive landing page with clean animations, contact form, and mobile optimization.',
            price: 60,
            deliveryDays: 2,
            revisions: 2,
            features: ['1 Page', 'Responsive Design', 'Source Code Included', 'SEO Optimized'],
          },
          standard: {
            title: 'Standard Dynamic Web App',
            description: 'Up to 5 pages with user authentication, database integration, and API connection.',
            price: 180,
            deliveryDays: 5,
            revisions: 4,
            features: ['5 Pages', 'User Authentication', 'Database Setup', 'Responsive Design', 'API Integration'],
          },
          premium: {
            title: 'Full-Stack Pro SaaS Platform',
            description: 'Complete web application with Stripe payments, admin dashboard, realtime chat, and deployment.',
            price: 380,
            deliveryDays: 10,
            revisions: 99,
            features: ['Full Web App', 'Stripe Payments', 'Admin Dashboard', 'Realtime Features', 'Deployment & CI/CD', 'Priority Support'],
          },
        },
      },
      {
        title: 'I will design modern UI/UX for your mobile app or SaaS in Figma',
        freelancer: studentUser._id,
        category: 'design',
        description: 'Clean, pixel-perfect user interface design in Figma with complete component design systems, wireframes, and interactive prototypes.',
        coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop&q=80',
        tags: ['Figma', 'UI/UX', 'Mobile App', 'Prototype', 'Design System'],
        packages: {
          basic: {
            title: 'App Concept (3 Screens)',
            description: '3 high-fidelity mobile or web screens with component styles in Figma.',
            price: 45,
            deliveryDays: 2,
            revisions: 2,
            features: ['3 Screens', 'Figma Source File', 'Responsive Layout'],
          },
          standard: {
            title: 'Full App Flow (10 Screens)',
            description: '10 core application screens with user flow and clickable Figma prototype.',
            price: 140,
            deliveryDays: 4,
            revisions: 4,
            features: ['10 Screens', 'Clickable Prototype', 'Design System Library', 'Figma Source File'],
          },
          premium: {
            title: 'Complete Design System (25+ Screens)',
            description: 'Complete UI/UX kit for iOS and Android, design tokens, light/dark mode, and developer handoff.',
            price: 320,
            deliveryDays: 8,
            revisions: 99,
            features: ['25+ Screens', 'Full Design Tokens', 'Light & Dark Mode', 'Interactive Prototype', 'Developer Handoff Guide'],
          },
        },
      },
    ]);
    console.log('Created sample 3-tier Gigs');
  }

  // 5. Sample Projects
  const openCount = await Project.countDocuments({ status: 'open' });
  if (openCount === 0) {
    await Project.insertMany(
      SAMPLE_PROJECTS.map((project) => ({
        ...project,
        client: clientUser._id,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }))
    );
    console.log(`Created ${SAMPLE_PROJECTS.length} sample open projects`);
  }

  // 6. In-Progress Demo Project (for testing work delivery & Razorpay payment)
  const inProgressCount = await Project.countDocuments({ status: 'in_progress' });
  if (inProgressCount === 0) {
    await Project.create({
      title: '🛠 Full-Stack React SaaS Dashboard & API',
      description:
        'Live project for testing work delivery and Razorpay payment transfer. Student freelancer (jhansi) submits work deliverables. Client (bhargavi) reviews the work and transfers payment instantly using Razorpay test mode!',
      budget: 350,
      category: 'web-development',
      skillsRequired: ['React', 'Node.js', 'MongoDB', 'TailwindCSS'],
      client: clientUser._id,
      hiredFreelancer: studentUser._id,
      status: 'in_progress',
      paymentStatus: 'unpaid',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      deliverables: [
        {
          notes: 'Completed the dashboard responsive UI and connected the REST APIs. Check the live demo link and let me know if any revisions are needed!',
          attachments: [
            {
              filename: 'Live Dashboard Preview',
              url: 'https://github.com/jhansi-dev/react-dashboard-demo',
            },
          ],
          status: 'submitted',
          submittedAt: new Date(),
        },
      ],
      milestones: [
        {
          title: 'Full Dashboard Implementation & API Integration',
          description: 'Frontend React UI, authentication, and REST API integration.',
          amount: 350,
          status: 'submitted',
        },
      ],
    });
    console.log('✅ Created demo project for work submission & Razorpay payment (client=bhargavi, student=jhansi)');
  }

  console.log('✅ Seeding completed successfully!');
  process.exit(0);
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});

