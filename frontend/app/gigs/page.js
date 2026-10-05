'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FiSearch, FiStar, FiClock, FiPlus, FiTag, FiLayers, FiCheck } from 'react-icons/fi';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import styles from './page.module.css';

const categories = [
  { label: 'All Categories', value: '' },
  { label: '💻 Web & Full-Stack', value: 'web-development' },
  { label: '🎨 UI/UX & Design', value: 'design' },
  { label: '🤖 AI & Data Science', value: 'data-science' },
  { label: '📱 Mobile Apps', value: 'mobile-development' },
  { label: '✍️ Writing & Copy', value: 'writing' },
  { label: '🎬 Video & 3D Motion', value: 'video-editing' },
];

function GigsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';

  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category) params.category = category;
    if (search.trim()) params.search = search.trim();

    api
      .get('/gigs', { params })
      .then(({ data }) => {
        setGigs(data.gigs || []);
      })
      .catch(() => {
        setGigs([]);
      })
      .finally(() => setLoading(false));
  }, [category, search]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <span className="glow-pill"><FiLayers size={12} /> Pre-Packaged Services</span>
          <h1 className={styles.title}>Explore Student Gigs</h1>
          <p className={styles.subtitle}>
            Book fixed-price packages crafted by top verified student freelancers.
          </p>
        </div>
        {user?.role === 'student' && (
          <Link href="/gigs/create">
            <Button size="lg"><FiPlus size={16} /> Create a Gig</Button>
          </Link>
        )}
      </div>

      {/* Filter Bar */}
      <div className={styles.filterCard}>
        <div className={styles.searchRow}>
          <div className={styles.searchWrapper}>
            <FiSearch className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Search gigs (e.g. Next.js, Figma, Logo, Python AI)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.categoryPillRow}>
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              className={`${styles.pillBtn} ${category === cat.value ? styles.pillActive : ''}`}
              onClick={() => setCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.grid}>
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} variant="card" />)}
        </div>
      ) : gigs.length === 0 ? (
        <div className={styles.empty}>
          <h3>No Gigs Available Yet</h3>
          <p>Be the first student to publish a high-converting service package!</p>
          {user?.role === 'student' && (
            <Link href="/gigs/create" style={{ marginTop: '1.25rem', display: 'inline-block' }}>
              <Button>Post Your First Gig</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {gigs.map((gig) => {
            const basic = gig.packages?.basic || {};
            const freelancer = gig.freelancer || {};
            const avatar = freelancer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(freelancer.name || 'Student')}&background=6366f1&color=fff`;

            return (
              <Link key={gig._id} href={`/gigs/${gig._id}`} className={styles.gigLink}>
                <Card hover className={styles.gigCard}>
                  <div className={styles.gigImageWrapper}>
                    <img src={gig.coverImage} alt={gig.title} className={styles.gigCoverImg} />
                    <span className={styles.categoryTag}>{gig.category?.replace('-', ' ')}</span>
                  </div>

                  <div className={styles.sellerRow}>
                    <img src={avatar} alt={freelancer.name} className={styles.sellerAvatar} />
                    <div>
                      <div className={styles.sellerNameRow}>
                        <h4 className={styles.sellerName}>{freelancer.name || 'Student Freelancer'}</h4>
                        {freelancer.badges?.length > 0 && (
                          <span className={styles.badgePill} title={freelancer.badges[0].name}>
                            {freelancer.badges[0].badgeIcon || '⚡'} Verified
                          </span>
                        )}
                      </div>
                      <p className={styles.sellerUni}>{freelancer.education?.[0]?.institution || 'Verified Student'}</p>
                    </div>
                  </div>

                  <h3 className={styles.gigTitle}>{gig.title}</h3>

                  <div className={styles.ratingRow}>
                    <FiStar fill="#f59e0b" color="#f59e0b" size={13} />
                    <strong>{gig.ratings?.average ? Number(gig.ratings.average).toFixed(1) : '5.0'}</strong>
                    <span>({gig.ratings?.count || 12})</span>
                    <span className={styles.orderCount}>• {gig.ordersCount || 0} orders</span>
                  </div>

                  <div className={styles.packageTiersPreview}>
                    <div className={styles.tierPill}>
                      <span>Basic</span>
                      <strong>${gig.packages?.basic?.price || 50}</strong>
                    </div>
                    <div className={styles.tierPill}>
                      <span>Standard</span>
                      <strong>${gig.packages?.standard?.price || 120}</strong>
                    </div>
                    <div className={styles.tierPill}>
                      <span>Premium</span>
                      <strong>${gig.packages?.premium?.price || 250}</strong>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <span className={styles.deliveryMeta}>
                      <FiClock size={12} /> {basic.deliveryDays || 3} days delivery
                    </span>
                    <div className={styles.startingPrice}>
                      <small>From</small>
                      <strong>${basic.price || 50}</strong>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function GigsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '3rem', textAlign: 'center' }}>Loading Gigs...</div>}>
      <GigsContent />
    </Suspense>
  );
}
