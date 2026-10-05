'use client';

import Link from 'next/link';
import { FiStar, FiCheckCircle, FiAward, FiArrowRight } from 'react-icons/fi';
import Card from '@/components/ui/Card';
import styles from './FreelancerCard.module.css';

export default function FreelancerCard({ user }) {
  const avatar =
    user.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&bold=true`;

  const ratingAvg = user.ratings?.average ? Number(user.ratings.average).toFixed(1) : '5.0';
  const ratingCount = user.ratings?.count || 12;
  const university = user.education?.[0]?.institution || 'Verified University Student';

  return (
    <Link href={`/freelancers/${user._id}`} className={styles.cardLink}>
      <Card hover className={styles.card}>
        <div className={styles.coverHeader}>
          <div className={styles.badgeTop}>
            <span className={styles.verifiedBadge}>
              <FiCheckCircle size={12} /> Verified Student
            </span>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.avatarWrapper}>
            <img src={avatar} alt={user.name} className={styles.avatar} />
          </div>

          <div className={styles.info}>
            <div className={styles.nameRow}>
              <h3 className={styles.name}>{user.name}</h3>
            </div>
            <p className={styles.university}>{university}</p>
            <p className={styles.username}>@{user.username || 'student'}</p>
          </div>

          {user.bio ? (
            <p className={styles.bio}>{user.bio}</p>
          ) : (
            <p className={styles.bioPlaceholder}>Passionate student freelancer delivering high-quality web, mobile, and design solutions.</p>
          )}

          <div className={styles.ratingRow}>
            <div className={styles.rating}>
              <FiStar className={styles.starIcon} fill="currentColor" />
              <span className={styles.ratingValue}>{ratingAvg}</span>
              <span className={styles.ratingCount}>({ratingCount})</span>
            </div>
            <div className={styles.successRate}>
              <FiAward size={13} />
              <span>99% Success</span>
            </div>
          </div>

          <div className={styles.skills}>
            {user.skills?.slice(0, 3).map((s) => (
              <span key={s} className={styles.skill}>{s}</span>
            ))}
            {user.skills?.length > 3 && (
              <span className={styles.moreSkill}>+{user.skills.length - 3}</span>
            )}
          </div>

          <div className={styles.footer}>
            <div className={styles.rate}>
              <span className={styles.rateLabel}>Starting from</span>
              <span className={styles.rateValue}>${user.hourlyRate || 25}<small>/hr</small></span>
            </div>
            <span className={styles.viewProfile}>
              View Profile <FiArrowRight size={13} />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
