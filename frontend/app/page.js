'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiSearch,
  FiArrowRight,
  FiCheckCircle,
  FiShield,
  FiZap,
  FiStar,
  FiCode,
  FiLayout,
  FiCpu,
  FiSmartphone,
  FiTrendingUp,
  FiPenTool,
  FiVideo,
  FiDatabase,
  FiAward,
  FiClock,
  FiMessageSquare,
  FiDollarSign,
  FiCheck,
} from 'react-icons/fi';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

const categories = [
  {
    id: 'web-dev',
    title: 'Web & Full-Stack',
    category: 'web-development',
    desc: 'Next.js, React, Node.js, Python, MERN & APIs',
    count: '1,420+ Projects',
    icon: FiCode,
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80',
    color: '#6366f1',
  },
  {
    id: 'design',
    title: 'UI/UX & Brand Design',
    category: 'design',
    desc: 'Figma, App UI, Landing Pages & 3D Brand Assets',
    count: '980+ Projects',
    icon: FiLayout,
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&auto=format&fit=crop&q=80',
    color: '#ec4899',
  },
  {
    id: 'ai-data',
    title: 'AI & Data Science',
    category: 'data-science',
    desc: 'LLM Agents, Machine Learning, Python, RAG & SQL',
    count: '650+ Projects',
    icon: FiCpu,
    image: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80',
    color: '#8b5cf6',
  },
  {
    id: 'mobile',
    title: 'Mobile App Dev',
    category: 'mobile-development',
    desc: 'React Native, Flutter, iOS & Android Apps',
    count: '720+ Projects',
    icon: FiSmartphone,
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80',
    color: '#3b82f6',
  },
  {
    id: 'writing',
    title: 'Writing & Translation',
    category: 'writing',
    desc: 'Technical Docs, SEO Content, Pitch Decks & Copy',
    count: '430+ Projects',
    icon: FiPenTool,
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80',
    color: '#10b981',
  },
  {
    id: 'marketing',
    title: 'Growth & Marketing',
    category: 'marketing',
    desc: 'SEO Optimization, Social Ads, Funnels & Strategy',
    count: '390+ Projects',
    icon: FiTrendingUp,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    color: '#f59e0b',
  },
];

const featuredStudents = [
  {
    name: 'Alex Rivera',
    username: 'alexr_dev',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    university: 'Stanford University • CS \'25',
    title: 'Full-Stack Next.js & AI Engineer',
    rating: '5.0',
    reviews: 28,
    rate: 35,
    skills: ['Next.js', 'TypeScript', 'OpenAI', 'TailwindCSS'],
    badge: 'Top Rated Plus',
  },
  {
    name: 'Sarah Chen',
    username: 'sarahdesigns',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    university: 'MIT • Design & Media Lab',
    title: 'Product Designer & UI/UX Specialist',
    rating: '4.9',
    reviews: 42,
    rate: 40,
    skills: ['Figma', 'Design Systems', 'Wireframing', 'Prototyping'],
    badge: 'Rising Talent',
  },
  {
    name: 'Liam Vance',
    username: 'liam_cloud',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    university: 'UC Berkeley • EECS',
    title: 'Mobile & Cloud Backend Architect',
    rating: '5.0',
    reviews: 19,
    rate: 45,
    skills: ['React Native', 'Node.js', 'Docker', 'AWS'],
    badge: 'Verified Student',
  },
];

const testimonials = [
  {
    quote: 'We hired a student freelancer from SkillBridge to build our MVP in Next.js. She delivered in 10 days with cleaner code than our previous agency. Saved us thousands!',
    client: 'David Miller',
    role: 'Founder, LaunchFast.io',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    project: 'SaaS Dashboard MVP',
    stars: 5,
  },
  {
    quote: 'As a university student, SkillBridge helped me earn over $4,500 between semesters while building a killer portfolio. The escrow payment guarantee gives me complete peace of mind.',
    client: 'Elena Rostova',
    role: 'CS Major, Student Freelancer',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    project: 'Completed 14 Client Gigs',
    stars: 5,
  },
];

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/projects?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push('/projects');
    }
  };

  return (
    <div className={styles.homeContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroGlowOverlay} />
        <div className={styles.heroGrid}>
          <div className={styles.heroLeft}>
            <motion.div
              className={styles.heroBadge}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className={styles.heroBadgeDot} />
              🎓 The #1 Freelance Marketplace for University Talent
            </motion.div>

            <motion.h1
              className={styles.heroHeading}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Find top <span className="gradient-text">student freelancers</span> for your next big project
            </motion.h1>

            <motion.p
              className={styles.heroSubtitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Hire vetted university prodigies in web dev, AI, mobile apps, and design. Get high-quality work done at student-friendly rates with 100% escrow protection.
            </motion.p>

            <motion.form
              className={styles.searchBar}
              onSubmit={handleSearchSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search services (e.g. 'Next.js developer', 'Figma design', 'Python AI')..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchBtn}>
                Search
              </button>
            </motion.form>

            <motion.div
              className={styles.popularTags}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <span className={styles.popularLabel}>Popular:</span>
              <Link href="/projects?category=web-development" className={styles.tagPill}>Next.js</Link>
              <Link href="/projects?category=design" className={styles.tagPill}>Figma UI/UX</Link>
              <Link href="/projects?category=data-science" className={styles.tagPill}>AI Agents</Link>
              <Link href="/projects?category=mobile-development" className={styles.tagPill}>React Native</Link>
            </motion.div>

            <div className={styles.trustBadges}>
              <div className={styles.trustItem}>
                <FiCheckCircle className={styles.trustIcon} />
                <span>Zero Risk Escrow</span>
              </div>
              <div className={styles.trustItem}>
                <FiShield className={styles.trustIcon} />
                <span>100% Verified Students</span>
              </div>
              <div className={styles.trustItem}>
                <FiZap className={styles.trustIcon} />
                <span>Fast 24-hr Turnaround</span>
              </div>
            </div>
          </div>

          <motion.div
            className={styles.heroRight}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className={styles.showcaseCard}>
              <div className={styles.showcaseHeader}>
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80"
                  alt="Student Freelancer"
                  className={styles.showcaseAvatar}
                />
                <div className={styles.showcaseMeta}>
                  <div className={styles.showcaseNameRow}>
                    <h4>Alex Rivera</h4>
                    <span className={styles.verifiedMiniBadge}><FiCheck size={10} /></span>
                  </div>
                  <p className={styles.showcaseUni}>Stanford University • Computer Science</p>
                  <div className={styles.showcaseRating}>
                    <FiStar fill="#f59e0b" color="#f59e0b" size={13} />
                    <strong>5.0</strong>
                    <span>(28 completed projects)</span>
                  </div>
                </div>
              </div>

              <div className={styles.showcasePreviewBox}>
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80"
                  alt="Dashboard Project Preview"
                  className={styles.showcasePreviewImg}
                />
                <div className={styles.showcaseGlowBadge}>
                  <FiDollarSign size={14} /> $1,250 Escrow Funded
                </div>
              </div>

              <div className={styles.showcaseStatsRow}>
                <div>
                  <span className={styles.statMiniLabel}>Completed Delivery</span>
                  <span className={styles.statMiniVal}>⚡ 4 Days Ahead</span>
                </div>
                <div>
                  <span className={styles.statMiniLabel}>Client Satisfaction</span>
                  <span className={styles.statMiniVal}>⭐️ 100% Positive</span>
                </div>
                <Link href="/freelancers" className={styles.showcaseCta}>
                  Hire Alex <FiArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Floating micro badges */}
            <motion.div
              className={`${styles.floatingWidget} ${styles.floatWidgetTop}`}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className={styles.widgetIcon}><FiShield size={18} /></div>
              <div>
                <strong>Milestone Escrow</strong>
                <p>Funds released only upon approval</p>
              </div>
            </motion.div>

            <motion.div
              className={`${styles.floatingWidget} ${styles.floatWidgetBottom}`}
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              <div className={styles.widgetIconEmerald}><FiZap size={18} /></div>
              <div>
                <strong>Live Workrooms</strong>
                <p>Real-time chat & file collaboration</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* University Campus Logos / Social Proof Banner */}
      <section className={styles.campusBanner}>
        <div className={styles.campusInner}>
          <p className={styles.campusTitle}>Trusted student talent from world-leading universities</p>
          <div className={styles.campusGrid}>
            <span className={styles.campusPill}>🏛️ Stanford</span>
            <span className={styles.campusPill}>🎓 MIT</span>
            <span className={styles.campusPill}>🏛️ UC Berkeley</span>
            <span className={styles.campusPill}>🎓 Oxford</span>
            <span className={styles.campusPill}>🏛️ Cambridge</span>
            <span className={styles.campusPill}>🎓 IIT Bombay</span>
            <span className={styles.campusPill}>🏛️ Harvard</span>
          </div>
        </div>
      </section>

      {/* Explore by Category Section */}
      <section className={styles.sectionContainer}>
        <div className={styles.sectionHeaderRow}>
          <div>
            <span className="glow-pill">Browse Categories</span>
            <h2 className={styles.sectionHeading}>Explore popular freelance services</h2>
            <p className={styles.sectionSub}>Find specialized student prodigies ready to tackle your tasks.</p>
          </div>
          <Link href="/projects" className={styles.viewAllLink}>
            All Categories <FiArrowRight />
          </Link>
        </div>

        <div className={styles.categoryGrid}>
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.id}
                className={styles.categoryCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
              >
                <Link href={`/projects?category=${cat.category}`} className={styles.categoryCardLink}>
                  <div className={styles.categoryImgWrapper}>
                    <img src={cat.image} alt={cat.title} className={styles.categoryImg} />
                    <div className={styles.categoryOverlay} />
                    <div className={styles.categoryIconBadge}>
                      <Icon size={20} />
                    </div>
                  </div>
                  <div className={styles.categoryContent}>
                    <h3 className={styles.categoryTitle}>{cat.title}</h3>
                    <p className={styles.categoryDesc}>{cat.desc}</p>
                    <div className={styles.categoryFooter}>
                      <span className={styles.categoryCount}>{cat.count}</span>
                      <span className={styles.exploreArrow}><FiArrowRight size={14} /></span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Featured Student Talent Spotlight */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeaderRow}>
            <div>
              <span className="glow-pill">Top Rated Talent</span>
              <h2 className={styles.sectionHeading}>Hire vetted student freelancers</h2>
              <p className={styles.sectionSub}>Passionate, driven, and equipped with the latest modern toolchains.</p>
            </div>
            <Link href="/freelancers" className={styles.viewAllLink}>
              View All Freelancers <FiArrowRight />
            </Link>
          </div>

          <div className={styles.talentGrid}>
            {featuredStudents.map((student, i) => (
              <motion.div
                key={student.name}
                className={styles.talentCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={styles.talentBanner}>
                  <span className={styles.talentBadge}>{student.badge}</span>
                </div>
                <div className={styles.talentBody}>
                  <img src={student.avatar} alt={student.name} className={styles.talentAvatar} />
                  <h3 className={styles.talentName}>{student.name}</h3>
                  <p className={styles.talentUni}>{student.university}</p>
                  <p className={styles.talentTitle}>{student.title}</p>

                  <div className={styles.talentRating}>
                    <FiStar fill="#f59e0b" color="#f59e0b" size={14} />
                    <strong>{student.rating}</strong>
                    <span>({student.reviews} reviews)</span>
                  </div>

                  <div className={styles.talentSkills}>
                    {student.skills.map((s) => (
                      <span key={s} className={styles.talentSkillPill}>{s}</span>
                    ))}
                  </div>

                  <div className={styles.talentFooter}>
                    <div className={styles.talentPrice}>
                      <span>Starting at</span>
                      <strong>${student.rate}<span>/hr</span></strong>
                    </div>
                    <Link href="/freelancers">
                      <Button size="sm">View Profile</Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose SkillBridge */}
      <section className={styles.sectionContainer}>
        <div className={styles.centerHeading}>
          <span className="glow-pill">Why SkillBridge</span>
          <h2 className={styles.sectionHeading}>A whole new standard for freelance collaboration</h2>
          <p className={styles.sectionSub}>Built from the ground up to empower both innovative businesses and student builders.</p>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.featureBox}>
            <div className={styles.featureIconWrap}>
              <FiAward size={24} />
            </div>
            <h3>Vetted Student Prodigies</h3>
            <p>Access ambitious talent trained in modern tech stacks: React 18, Next.js, AI workflows, and Figma.</p>
          </div>

          <div className={styles.featureBox}>
            <div className={styles.featureIconWrap}>
              <FiShield size={24} />
            </div>
            <h3>Instant Razorpay Payments</h3>
            <p>Payments are transferred directly and safely via Razorpay once work deliverables are submitted and reviewed.</p>
          </div>

          <div className={styles.featureBox}>
            <div className={styles.featureIconWrap}>
              <FiMessageSquare size={24} />
            </div>
            <h3>Real-Time Live Workrooms</h3>
            <p>Direct chat, typing indicators, file sharing, and instant notifications keep your project on schedule.</p>
          </div>

          <div className={styles.featureBox}>
            <div className={styles.featureIconWrap}>
              <FiDollarSign size={24} />
            </div>
            <h3>0% Student Commission</h3>
            <p>Unlike predatory platforms taking 20%, students keep what they earn and clients get unbeatable rates.</p>
          </div>
        </div>
      </section>

      {/* How it Works Guide */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionContainer}>
          <div className={styles.centerHeading}>
            <span className="glow-pill">How It Works</span>
            <h2 className={styles.sectionHeading}>Simple, fast, and transparent</h2>
            <p className={styles.sectionSub}>From posting your vision to final delivery in four easy steps.</p>
          </div>

          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>01</div>
              <h4>Post Your Project</h4>
              <p>Describe your requirements, deliverables, timeline, and budget in under 2 minutes.</p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>02</div>
              <h4>Receive Student Bids</h4>
              <p>Compare proposals, review verified student portfolios, ratings, and university backgrounds.</p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>03</div>
              <h4>Hire & Collaborate</h4>
              <p>Select your preferred student freelancer, share instructions, and track work progress.</p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>04</div>
              <h4>Review & Pay with Razorpay</h4>
              <p>Inspect the submitted work, transfer payment instantly via Razorpay, and download your invoice.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.sectionContainer}>
        <div className={styles.centerHeading}>
          <span className="glow-pill">Success Stories</span>
          <h2 className={styles.sectionHeading}>Loved by startups and students alike</h2>
        </div>

        <div className={styles.testimonialGrid}>
          {testimonials.map((t, idx) => (
            <div key={idx} className={styles.testimonialCard}>
              <div className={styles.starRow}>
                {[...Array(t.stars)].map((_, s) => (
                  <FiStar key={s} fill="#f59e0b" color="#f59e0b" size={16} />
                ))}
              </div>
              <p className={styles.testimonialQuote}>"{t.quote}"</p>
              <div className={styles.testimonialUser}>
                <img src={t.avatar} alt={t.client} className={styles.testimonialAvatar} />
                <div>
                  <h4 className={styles.testimonialName}>{t.client}</h4>
                  <p className={styles.testimonialRole}>{t.role}</p>
                  <span className={styles.testimonialProject}>{t.project}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Big Impact Call to Action Banner */}
      <section className={styles.ctaBannerSection}>
        <div className={styles.ctaCard}>
          <div className={styles.ctaGlow} />
          <h2 className={styles.ctaHeading}>Ready to start your next big project?</h2>
          <p className={styles.ctaDesc}>
            Join thousands of founders, businesses, and ambitious students bridging the gap between talent and opportunity.
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/signup">
              <Button size="lg">Create Free Account</Button>
            </Link>
            <Link href="/projects">
              <Button variant="secondary" size="lg">Explore Open Projects</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
