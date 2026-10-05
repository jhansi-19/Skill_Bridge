'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  FiStar,
  FiAward,
  FiExternalLink,
  FiGithub,
  FiFigma,
  FiVideo,
  FiCheckCircle,
  FiDollarSign,
  FiArrowLeft,
} from 'react-icons/fi';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import MessageButton from '@/components/chat/MessageButton';
import { normalizeId } from '@/lib/ids';
import styles from './page.module.css';

export default function FreelancerProfilePage() {
  const params = useParams();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const profileId = normalizeId(rawId) || rawId;
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!profileId) return;

    Promise.all([
      api.get(`/users/${profileId}`),
      api.get(`/users/${profileId}/reviews`).catch(() => ({ data: { reviews: [] } })),
    ])
      .then(([userRes, reviewsRes]) => {
        setUser(userRes.data.user);
        setReviews(reviewsRes.data.reviews || []);
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Could not load freelancer profile');
      });
  }, [profileId]);

  if (error) {
    return (
      <div className={styles.page}>
        <p style={{ color: 'var(--text-muted)' }}>{error}</p>
        <Link href="/freelancers"><Button style={{ marginTop: '1rem' }}>Back to Talent</Button></Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.page}>
        <Skeleton variant="card" />
      </div>
    );
  }

  const avatar =
    user.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&bold=true`;

  return (
    <div className={styles.page}>
      <Link href="/freelancers" className={styles.backLink}>
        <FiArrowLeft /> Back to Talent Marketplace
      </Link>

      {/* Profile Banner & Summary Card */}
      <Card className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <img src={avatar} alt={user.name} className={styles.avatar} />
          <div className={styles.profileInfo}>
            <div className={styles.nameRow}>
              <h1>{user.name}</h1>
              <span className={styles.verifiedStudentBadge}>
                <FiCheckCircle size={13} /> Verified Student
              </span>
            </div>
            <p className={styles.uniText}>{user.education?.[0]?.institution || 'University Student'}</p>
            <p className={styles.username}>@{user.username || 'student'}</p>

            <div className={styles.ratingRow}>
              <FiStar fill="#f59e0b" color="#f59e0b" size={16} />
              <strong>{user.ratings?.average ? Number(user.ratings.average).toFixed(1) : '5.0'}</strong>
              <span>({user.ratings?.count || 12} reviews)</span>
              <span>•</span>
              <span className={styles.rateHighlight}>Starting from <strong>${user.hourlyRate || 25}/hr</strong></span>
            </div>

            <div className={styles.ctaRow}>
              <MessageButton recipientId={user._id} label="Message Student" />
            </div>
          </div>
        </div>

        {user.bio && <p className={styles.bioText}>{user.bio}</p>}

        {/* Skills */}
        {user.skills?.length > 0 && (
          <div className={styles.skillsSection}>
            <h4>Skills & Technologies</h4>
            <div className={styles.skillsList}>
              {user.skills.map((s) => (
                <span key={s} className={styles.skillTag}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Verified Badges */}
        {user.badges?.length > 0 && (
          <div className={styles.badgesSection}>
            <h4>Verified Skill Badges</h4>
            <div className={styles.badgesList}>
              {user.badges.map((b, idx) => (
                <div key={idx} className={styles.badgeCard}>
                  <span className={styles.badgeIcon}>{b.badgeIcon || '⚡'}</span>
                  <div>
                    <strong>{b.name}</strong>
                    <p>Scored {b.score}% on SkillBridge Exam</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Rich Portfolio Showcases */}
      {user.portfolio?.length > 0 && (
        <div className={styles.portfolioSection}>
          <div className={styles.sectionHeader}>
            <span className="glow-pill">Rich Media</span>
            <h2>Featured Portfolio Projects</h2>
          </div>

          <div className={styles.portfolioGrid}>
            {user.portfolio.map((p, i) => (
              <Card key={i} hover className={styles.portfolioCard}>
                {p.image && (
                  <div className={styles.portfolioImgWrapper}>
                    <img src={p.image} alt={p.title} className={styles.portfolioImg} />
                  </div>
                )}
                <div className={styles.portfolioContent}>
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>

                  <div className={styles.portfolioTechList}>
                    {p.technologies?.map((tech) => (
                      <span key={tech} className={styles.techPill}>{tech}</span>
                    ))}
                  </div>

                  <div className={styles.portfolioLinks}>
                    {p.liveUrl && (
                      <a href={p.liveUrl} target="_blank" rel="noreferrer" className={styles.linkBtn}>
                        <FiExternalLink size={14} /> Live Demo
                      </a>
                    )}
                    {p.githubUrl && (
                      <a href={p.githubUrl} target="_blank" rel="noreferrer" className={styles.linkBtn}>
                        <FiGithub size={14} /> GitHub Repo
                      </a>
                    )}
                    {p.figmaEmbedUrl && (
                      <a href={p.figmaEmbedUrl} target="_blank" rel="noreferrer" className={styles.linkBtn}>
                        <FiFigma size={14} /> Figma Prototype
                      </a>
                    )}
                    {p.videoUrl && (
                      <a href={p.videoUrl} target="_blank" rel="noreferrer" className={styles.linkBtn}>
                        <FiVideo size={14} /> Walkthrough Video
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className={styles.reviewsSection}>
        <h2>Client Reviews & Testimonials</h2>
        {reviews.length === 0 ? (
          <Card className={styles.emptyReviews}>
            <p>No reviews yet. Hire this student freelancer to leave the first review!</p>
          </Card>
        ) : (
          <div className={styles.reviewsGrid}>
            {reviews.map((r) => (
              <Card key={r._id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <strong>{r.reviewer?.name || 'Verified Client'}</strong>
                  <div className={styles.reviewStars}>
                    {[...Array(r.rating || 5)].map((_, s) => (
                      <FiStar key={s} fill="#f59e0b" color="#f59e0b" size={14} />
                    ))}
                  </div>
                </div>
                <p className={styles.reviewComment}>{r.comment}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
