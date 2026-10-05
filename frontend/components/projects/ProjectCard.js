'use client';

import Link from 'next/link';
import { FiClock, FiDollarSign, FiTag, FiUserCheck, FiArrowUpRight } from 'react-icons/fi';
import Card from '@/components/ui/Card';
import styles from './ProjectCard.module.css';

export default function ProjectCard({ project }) {
  const formattedCategory = project.category?.replace('-', ' ') || 'General';
  const bidCount = project.bids?.length || 0;

  return (
    <Link href={`/projects/${project._id}`} className={styles.cardLink}>
      <Card hover className={styles.card}>
        <div className={styles.topRow}>
          <span className={styles.categoryBadge}>
            <FiTag size={12} />
            {formattedCategory}
          </span>
          <span className={`${styles.status} ${styles[project.status]}`}>
            {project.status?.replace('_', ' ')}
          </span>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>{project.title}</h3>
            <FiArrowUpRight className={styles.arrowIcon} />
          </div>
          <p className={styles.desc}>{project.description}</p>
        </div>

        <div className={styles.tags}>
          {project.skillsRequired?.slice(0, 4).map((skill) => (
            <span key={skill} className={styles.tag}>{skill}</span>
          ))}
          {project.skillsRequired?.length > 4 && (
            <span className={styles.moreTag}>+{project.skillsRequired.length - 4}</span>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.metaLeft}>
            <span className={styles.budget}>
              ${project.budget?.toLocaleString()}
            </span>
            <span className={styles.budgetLabel}>Fixed Price</span>
          </div>

          <div className={styles.metaRight}>
            <span className={styles.bidInfo}>
              <FiUserCheck size={14} />
              {bidCount} {bidCount === 1 ? 'proposal' : 'proposals'}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
