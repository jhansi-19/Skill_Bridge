'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FiSearch, FiPlus, FiBriefcase, FiLayers, FiLock } from 'react-icons/fi';
import { useProjectStore } from '@/store/projectStore';
import { useAuthStore } from '@/store/authStore';
import { useDebounce } from '@/hooks/useDebounce';
import api from '@/lib/api';
import ProjectCard from '@/components/projects/ProjectCard';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import styles from './page.module.css';

const categoryPills = [
  { label: 'All Categories', value: '' },
  { label: '💻 Web & Full-Stack', value: 'web-development' },
  { label: '🎨 UI/UX & Design', value: 'design' },
  { label: '🤖 AI & Data Science', value: 'data-science' },
  { label: '📱 Mobile Apps', value: 'mobile-development' },
  { label: '✍️ Writing & Docs', value: 'writing' },
  { label: '📈 Growth & Marketing', value: 'marketing' },
];

function ProjectsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';
  const initialTab = searchParams.get('tab') === 'workrooms' ? 'my_workrooms' : 'open';

  const { projects, fetchProjects, isLoading, error } = useProjectStore();
  const user = useAuthStore((s) => s.user);

  // Tab: 'open' or 'my_workrooms'
  const [activeTab, setActiveTab] = useState(initialTab);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const debouncedSearch = useDebounce(search);

  // My workrooms (in_progress projects where user is client or hired freelancer)
  const [myWorkrooms, setMyWorkrooms] = useState([]);
  const [workroomsLoading, setWorkroomsLoading] = useState(false);

  // Fetch open projects
  useEffect(() => {
    if (activeTab === 'open') {
      const params = { status: 'open' };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (category) params.category = category;
      fetchProjects(params);
    }
  }, [debouncedSearch, category, fetchProjects, activeTab]);

  // Fetch in-progress workrooms
  useEffect(() => {
    if (activeTab === 'my_workrooms' && user) {
      setWorkroomsLoading(true);

      if (user.role === 'client' || user.role === 'admin') {
        // Client: their own posted projects that are in_progress
        api.get('/projects/my/list')
          .then((res) => {
            const all = res.data.projects || [];
            setMyWorkrooms(all.filter((p) => p.status === 'in_progress'));
          })
          .catch(() => setMyWorkrooms([]))
          .finally(() => setWorkroomsLoading(false));
      } else {
        // Student: projects where they are the hired freelancer
        api.get('/projects/my/hired')
          .then((res) => {
            const all = res.data.projects || [];
            setMyWorkrooms(all.filter((p) => p.status === 'in_progress'));
          })
          .catch(() => setMyWorkrooms([]))
          .finally(() => setWorkroomsLoading(false));
      }
    }
  }, [activeTab, user]);

  const loading = activeTab === 'open' ? isLoading : workroomsLoading;
  const displayProjects = activeTab === 'open' ? projects : myWorkrooms;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <span className="glow-pill"><FiBriefcase size={12} /> Marketplace</span>
          <h1 className={styles.title}>
            {activeTab === 'open' ? 'Explore Open Projects' : 'My Active Workrooms'}
          </h1>
          <p className={styles.subtitle}>
            {activeTab === 'open'
              ? 'Browse high-impact projects posted by businesses looking for student talent.'
              : 'View and manage all your in-progress projects and milestones.'}
          </p>
        </div>
        {user?.role === 'client' && (
          <Link href="/projects/create">
            <Button size="lg"><FiPlus size={16} /> Post a Project</Button>
          </Link>
        )}
      </div>

      {/* Tab Switcher */}
      <div className={styles.tabRow}>
        <button
          className={`${styles.tab} ${activeTab === 'open' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('open')}
        >
          <FiBriefcase size={15} /> Open Projects
        </button>
        {user && (
          <button
            className={`${styles.tab} ${activeTab === 'my_workrooms' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('my_workrooms')}
          >
            <FiLock size={15} /> My Workrooms
            {myWorkrooms.length > 0 && (
              <span className={styles.tabBadge}>{myWorkrooms.length}</span>
            )}
          </button>
        )}
      </div>

      {/* Filter Bar — only on open tab */}
      {activeTab === 'open' && (
        <div className={styles.filterCard}>
          <div className={styles.searchRow}>
            <div className={styles.searchWrapper}>
              <FiSearch className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="Search by keyword, tech stack (e.g. Next.js, Python, Figma)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className={styles.selectWrapper}>
              <select
                className={styles.selectInput}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="web-development">Web Development</option>
                <option value="mobile-development">Mobile Development</option>
                <option value="design">UI/UX & Design</option>
                <option value="writing">Writing & Translation</option>
                <option value="marketing">Digital Marketing</option>
                <option value="data-science">Data Science & AI</option>
              </select>
            </div>
          </div>

          <div className={styles.categoryPillRow}>
            {categoryPills.map((pill) => (
              <button
                key={pill.value}
                type="button"
                className={`${styles.pillBtn} ${category === pill.value ? styles.pillActive : ''}`}
                onClick={() => setCategory(pill.value)}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Workrooms info banner */}
      {activeTab === 'my_workrooms' && !loading && myWorkrooms.length === 0 && user && (
        <div className={styles.workroomBanner}>
          <FiLock size={20} />
          <div>
            <strong>No active workrooms yet</strong>
            <p>
              {user.role === 'client'
                ? 'Post a project, receive proposals, and hire a student freelancer to start a workroom.'
                : 'Browse open projects and submit proposals. Once hired, your workroom appears here.'}
            </p>
          </div>
          <Link href={user.role === 'client' ? '/projects/create' : '/projects?tab=open'}>
            <Button size="sm">{user.role === 'client' ? 'Post Project' : 'Browse Projects'}</Button>
          </Link>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className={styles.grid}>
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" />)}
        </div>
      ) : error && activeTab === 'open' ? (
        <div className={styles.empty}>
          <p>{error}</p>
          <p style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>
            Make sure the backend is running on port 5000 and MongoDB is connected.
          </p>
        </div>
      ) : displayProjects.length === 0 && activeTab === 'open' ? (
        <div className={styles.empty}>
          <h3>No matching projects found</h3>
          <p>Try adjusting your search criteria or explore other categories.</p>
          {user?.role === 'client' && (
            <Link href="/projects/create" style={{ marginTop: '1.25rem', display: 'inline-block' }}>
              <Button>Post the First Project</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {displayProjects.map((p) => (
            <ProjectCard key={p._id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '3rem', textAlign: 'center' }}>Loading projects...</div>}>
      <ProjectsContent />
    </Suspense>
  );
}
