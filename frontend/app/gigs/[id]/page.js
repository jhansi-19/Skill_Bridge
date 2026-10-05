'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiStar,
  FiClock,
  FiRepeat,
  FiCheck,
  FiShield,
  FiMessageSquare,
  FiUser,
  FiArrowLeft,
  FiAward,
} from 'react-icons/fi';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { normalizeId } from '@/lib/ids';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import MessageButton from '@/components/chat/MessageButton';
import styles from './page.module.css';

export default function GigDetailPage() {
  const params = useParams();
  const gigId = normalizeId(params.id);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.addToast);

  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTier, setActiveTier] = useState('standard'); // 'basic', 'standard', 'premium'
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    api
      .get(`/gigs/${gigId}`)
      .then(({ data }) => {
        setGig(data.gig);
      })
      .catch((err) => {
        addToast(err.response?.data?.message || 'Failed to load gig', 'error');
      })
      .finally(() => setLoading(false));
  }, [gigId, addToast]);

  const handleOrder = async () => {
    if (!user) {
      addToast('Please log in as a client to order this gig', 'error');
      router.push('/login');
      return;
    }

    if (user.role !== 'client' && user.role !== 'admin') {
      addToast('Only client accounts can order service gigs. Switch to client account.', 'error');
      return;
    }

    setOrdering(true);
    try {
      const { data } = await api.post(`/gigs/${gigId}/order`, { tier: activeTier });
      addToast('🎉 Gig ordered successfully! Project is now In Progress.', 'success');
      router.push(`/projects/${data.project._id}`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to place order', 'error');
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Skeleton variant="title" />
        <Skeleton variant="card" />
      </div>
    );
  }

  if (!gig) {
    return (
      <div className={styles.page}>
        <h2>Gig not found</h2>
        <Link href="/gigs"><Button style={{ marginTop: '1rem' }}>Back to Gigs</Button></Link>
      </div>
    );
  }

  const freelancer = gig.freelancer || {};
  const avatar = freelancer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(freelancer.name || 'Student')}&background=6366f1&color=fff&bold=true`;
  const currentPackage = gig.packages?.[activeTier] || gig.packages?.basic;

  return (
    <div className={styles.page}>
      <Link href="/gigs" className={styles.backLink}>
        <FiArrowLeft /> Back to All Gigs
      </Link>

      <div className={styles.layout}>
        {/* Main Content Column */}
        <div className={styles.mainColumn}>
          <span className={styles.categoryBadge}>{gig.category?.replace('-', ' ')}</span>
          <h1 className={styles.gigTitle}>{gig.title}</h1>

          {/* Seller Header Summary */}
          <div className={styles.sellerHeader}>
            <Link href={`/freelancers/${freelancer._id}`} className={styles.sellerAvatarLink}>
              <img src={avatar} alt={freelancer.name} className={styles.sellerAvatar} />
            </Link>
            <div>
              <div className={styles.sellerNameRow}>
                <Link href={`/freelancers/${freelancer._id}`} className={styles.sellerName}>
                  {freelancer.name}
                </Link>
                {freelancer.badges?.map((b) => (
                  <span key={b.name} className={styles.badgePill} title={b.name}>
                    {b.badgeIcon || '⚡'} Verified Expert
                  </span>
                ))}
              </div>
              <p className={styles.sellerUni}>{freelancer.education?.[0]?.institution || 'Verified Student'}</p>
            </div>
            <div className={styles.ratingBox}>
              <FiStar fill="#f59e0b" color="#f59e0b" size={16} />
              <strong>{gig.ratings?.average ? Number(gig.ratings.average).toFixed(1) : '5.0'}</strong>
              <span>({gig.ratings?.count || 12} reviews)</span>
            </div>
          </div>

          {/* Cover / Gallery Showcase */}
          <div className={styles.mediaShowcase}>
            <img src={gig.coverImage} alt={gig.title} className={styles.mainImage} />
          </div>

          {/* Description */}
          <div className={styles.descriptionSection}>
            <h2>About This Service</h2>
            <div className={styles.descBody}>{gig.description}</div>
          </div>

          {/* Tags */}
          {gig.tags?.length > 0 && (
            <div className={styles.tagsSection}>
              <h3>Technologies & Skills</h3>
              <div className={styles.tagList}>
                {gig.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* About the Student Freelancer */}
          <Card className={styles.aboutSellerCard}>
            <div className={styles.aboutSellerHeader}>
              <img src={avatar} alt={freelancer.name} className={styles.aboutAvatar} />
              <div>
                <h3>{freelancer.name}</h3>
                <p>{freelancer.education?.[0]?.institution || 'Verified University Student'}</p>
                <div className={styles.miniStats}>
                  <span><strong>{freelancer.completedProjects || 5}</strong> Completed Gigs</span>
                  <span>•</span>
                  <span><strong>${freelancer.hourlyRate || 35}/hr</strong> Rate</span>
                </div>
              </div>
            </div>
            {freelancer.bio && <p className={styles.aboutBio}>{freelancer.bio}</p>}
            <div className={styles.aboutActions}>
              <MessageButton recipientId={freelancer._id} label="Message Student" />
              <Link href={`/freelancers/${freelancer._id}`}>
                <Button variant="secondary">View Full Profile</Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Sticky 3-Tier Pricing Column */}
        <div className={styles.pricingColumn}>
          <div className={styles.pricingCard}>
            {/* Tabs */}
            <div className={styles.tabsHeader}>
              {['basic', 'standard', 'premium'].map((tier) => (
                <button
                  key={tier}
                  type="button"
                  className={`${styles.tabBtn} ${activeTier === tier ? styles.tabActive : ''}`}
                  onClick={() => setActiveTier(tier)}
                >
                  {tier.toUpperCase()}
                </button>
              ))}
            </div>

            <div className={styles.tabBody}>
              <div className={styles.priceRow}>
                <h3>{currentPackage?.title || 'Package Option'}</h3>
                <span className={styles.packagePrice}>${currentPackage?.price}</span>
              </div>

              <p className={styles.packageDesc}>{currentPackage?.description}</p>

              <div className={styles.metaRow}>
                <span className={styles.metaItem}>
                  <FiClock size={14} /> {currentPackage?.deliveryDays} Days Delivery
                </span>
                <span className={styles.metaItem}>
                  <FiRepeat size={14} /> {currentPackage?.revisions === 99 ? 'Unlimited' : currentPackage?.revisions} Revisions
                </span>
              </div>

              {/* Feature Checklist */}
              <div className={styles.featuresList}>
                {currentPackage?.features?.map((feat, idx) => (
                  <div key={idx} className={styles.featureItem}>
                    <FiCheck className={styles.checkIcon} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <Button
                full
                size="lg"
                disabled={ordering}
                onClick={handleOrder}
                className={styles.orderBtn}
              >
                {ordering ? 'Placing Order...' : `Order ${activeTier.toUpperCase()} ($${currentPackage?.price})`}
              </Button>

              <div className={styles.escrowGuarantee}>
                <FiShield size={16} />
                <span>Safe Payment Protection via Razorpay upon deliverable review.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
