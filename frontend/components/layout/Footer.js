import Link from 'next/link';
import { FiShield, FiLock, FiCheckCircle, FiGlobe, FiGithub, FiTwitter, FiLinkedin, FiInstagram, FiMail } from 'react-icons/fi';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Top trust bar */}
      <div className={styles.trustBar}>
        <div className={styles.trustInner}>
          <div className={styles.trustPill}>
            <FiShield className={styles.trustIcon} />
            <div>
              <strong>Instant Razorpay Payments</strong>
              <p>Safe transfer upon work completion</p>
            </div>
          </div>

          <div className={styles.trustPill}>
            <FiCheckCircle className={styles.trustIcon} />
            <div>
              <strong>Verified Student Prodigies</strong>
              <p>Active university student accounts</p>
            </div>
          </div>

          <div className={styles.trustPill}>
            <FiLock className={styles.trustIcon} />
            <div>
              <strong>Bank-Grade Security</strong>
              <p>Razorpay & JWT 256-bit encryption</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>SB</div>
            <span className={styles.logoText}>Skill<span className="gradient-text">Bridge</span></span>
          </Link>
          <p className={styles.brandDesc}>
            The premier freelance marketplace built exclusively for university students and ambitious businesses. Connect, collaborate with real-time tools, and grow securely.
          </p>
          <div className={styles.socials}>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"><FiTwitter /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><FiLinkedin /></a>
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub"><FiGithub /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><FiInstagram /></a>
          </div>
        </div>

        <div className={styles.column}>
          <h4>Categories</h4>
          <Link href="/projects?category=web-development">Web & Full-Stack</Link>
          <Link href="/projects?category=design">UI/UX & Brand Design</Link>
          <Link href="/projects?category=data-science">AI & Data Science</Link>
          <Link href="/projects?category=mobile-development">Mobile App Dev</Link>
          <Link href="/projects?category=writing">Technical Writing</Link>
          <Link href="/projects?category=marketing">Growth Marketing</Link>
        </div>

        <div className={styles.column}>
          <h4>For Clients</h4>
          <Link href="/projects/create">Post a Project</Link>
          <Link href="/freelancers">Browse Student Talent</Link>
          <Link href="/projects">View Marketplace</Link>
          <Link href="/dashboard">Client Dashboard</Link>
          <Link href="/messages">Live Workrooms</Link>
        </div>

        <div className={styles.column}>
          <h4>For Students</h4>
          <Link href="/signup">Join as Student</Link>
          <Link href="/projects">Explore Student Gigs</Link>
          <Link href="/settings">Build Your Portfolio</Link>
          <Link href="/dashboard">Earnings & Escrow</Link>
          <Link href="#">Student Ambassador Program</Link>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <p>&copy; {new Date().getFullYear()} SkillBridge Inc. All rights reserved.</p>
          <div className={styles.bottomLinks}>
            <Link href="#">Privacy Policy</Link>
            <span className={styles.dot}>•</span>
            <Link href="#">Terms of Service</Link>
            <span className={styles.dot}>•</span>
            <Link href="#">Trust & Safety</Link>
            <span className={styles.dot}>•</span>
            <Link href="#">Contact Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
