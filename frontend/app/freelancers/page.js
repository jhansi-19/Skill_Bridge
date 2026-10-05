'use client';

import { useEffect, useState } from 'react';
import { FiSearch, FiUsers, FiAward } from 'react-icons/fi';
import api from '@/lib/api';
import FreelancerCard from '@/components/freelancers/FreelancerCard';
import Skeleton from '@/components/ui/Skeleton';
import styles from '../projects/page.module.css';

const popularSkills = [
  'All Skills',
  'Next.js',
  'React',
  'Python',
  'Figma',
  'Node.js',
  'AI & ML',
  'React Native',
  'TailwindCSS',
];

const mockTopFreelancers = [
  {
    _id: 'mock-1',
    name: 'Alex Rivera',
    username: 'alexr_dev',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    education: [{ institution: "Stanford University • CS '25" }],
    bio: 'Full-stack Next.js developer & AI engineer. Built 15+ production apps with clean architecture.',
    ratings: { average: 5.0, count: 28 },
    hourlyRate: 35,
    skills: ['Next.js', 'TypeScript', 'OpenAI', 'React'],
  },
  {
    _id: 'mock-2',
    name: 'Sarah Chen',
    username: 'sarahdesigns',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    education: [{ institution: 'MIT • Design & Media Lab' }],
    bio: 'UI/UX specialist with 4+ years creating intuitive mobile interfaces, SaaS design systems, and pitch decks.',
    ratings: { average: 4.9, count: 42 },
    hourlyRate: 40,
    skills: ['Figma', 'UI/UX', 'Design Systems', 'Wireframing'],
  },
  {
    _id: 'mock-3',
    name: 'Liam Vance',
    username: 'liam_cloud',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    education: [{ institution: 'UC Berkeley • EECS' }],
    bio: 'Mobile and backend architect specializing in high-concurrency Node.js microservices and Flutter apps.',
    ratings: { average: 5.0, count: 19 },
    hourlyRate: 45,
    skills: ['React Native', 'Node.js', 'Docker', 'AWS'],
  },
  {
    _id: 'mock-4',
    name: 'Priya Sharma',
    username: 'priya_ai',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    education: [{ institution: 'IIT Bombay • AI & Data Science' }],
    bio: 'Data scientist and LLM developer. Experienced in fine-tuning open-source models, LangChain, and RAG pipelines.',
    ratings: { average: 4.95, count: 24 },
    hourlyRate: 50,
    skills: ['Python', 'PyTorch', 'LangChain', 'SQL'],
  },
  {
    _id: 'mock-5',
    name: 'Marcus Brody',
    username: 'marcus_copy',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    education: [{ institution: 'Oxford University • English Literature' }],
    bio: 'High-converting copywriter and technical writer for YC startups and fast-growing tech publications.',
    ratings: { average: 4.88, count: 31 },
    hourlyRate: 30,
    skills: ['Copywriting', 'SEO', 'Technical Writing', 'Content'],
  },
  {
    _id: 'mock-6',
    name: 'Chloe Zhang',
    username: 'chloe_motion',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    education: [{ institution: 'Harvard University • Visual Arts' }],
    bio: '3D Animator & After Effects designer. Crafting eye-catching brand motion graphics and viral social video ads.',
    ratings: { average: 5.0, count: 16 },
    hourlyRate: 38,
    skills: ['After Effects', 'Blender', 'Video Editing', 'Motion'],
  },
];

export default function FreelancersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('All Skills');

  useEffect(() => {
    setLoading(true);
    api
      .get('/users/freelancers', { params: { search: search.trim() } })
      .then(({ data }) => {
        if (data?.users && data.users.length > 0) {
          setUsers(data.users);
        } else {
          // Fallback to rich curated student pool if db is empty
          const filtered = mockTopFreelancers.filter((f) => {
            const matchesSearch =
              !search ||
              f.name.toLowerCase().includes(search.toLowerCase()) ||
              f.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
              f.bio.toLowerCase().includes(search.toLowerCase());
            return matchesSearch;
          });
          setUsers(filtered);
        }
      })
      .catch(() => {
        setUsers(mockTopFreelancers);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [search]);

  const displayedUsers = users.filter((u) => {
    if (selectedSkill === 'All Skills') return true;
    return u.skills?.some((s) => s.toLowerCase() === selectedSkill.toLowerCase());
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <span className="glow-pill"><FiUsers size={12} /> Student Talent</span>
          <h1 className={styles.title}>Discover Vetted Student Freelancers</h1>
          <p className={styles.subtitle}>
            Top-tier university developers, designers, and creators ready for hire.
          </p>
        </div>
      </div>

      <div className={styles.filterCard}>
        <div className={styles.searchRow}>
          <div className={styles.searchWrapper}>
            <FiSearch className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Search freelancers by name, university, or skill (e.g. Next.js, Figma, Python)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.categoryPillRow}>
          {popularSkills.map((skill) => (
            <button
              key={skill}
              type="button"
              className={`${styles.pillBtn} ${selectedSkill === skill ? styles.pillActive : ''}`}
              onClick={() => setSelectedSkill(skill)}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.grid}>
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} variant="card" />)}
        </div>
      ) : displayedUsers.length === 0 ? (
        <div className={styles.empty}>
          <h3>No student freelancers match your search</h3>
          <p>Try searching for a different keyword or skill tag.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {displayedUsers.map((u) => <FreelancerCard key={u._id} user={u} />)}
        </div>
      )}
    </div>
  );
}
