'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiBell, FiMoon, FiSun, FiMenu, FiPlusCircle, FiSearch, FiCompass, FiBriefcase, FiUsers, FiLayers, FiShield, FiAward } from 'react-icons/fi';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useTheme } from '@/providers/ThemeProvider';
import Button from '@/components/ui/Button';
import styles from './Header.module.css';

const categories = [
  { label: 'Programming & Tech', href: '/projects?category=web-development' },
  { label: 'Graphics & Design', href: '/projects?category=design' },
  { label: 'AI & Data Science', href: '/projects?category=data-science' },
  { label: 'Mobile Apps', href: '/projects?category=mobile-development' },
  { label: 'Writing & Translation', href: '/projects?category=writing' },
  { label: 'Digital Marketing', href: '/projects?category=marketing' },
];

export default function Header({ onMenuClick }) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className={styles.header}>
      <div className={styles.mainNav}>
        <div className={styles.inner}>
          <div className={styles.left}>
            <Link href="/" className={styles.logo}>
              <div className={styles.logoIcon}>
                <span>SB</span>
              </div>
              <div className={styles.logoText}>
                <span className={styles.brandTitle}>Skill<span className="gradient-text">Bridge</span></span>
                <span className={styles.brandSub}>Student Talent Hub</span>
              </div>
            </Link>

            <nav className={styles.nav}>
              <Link href="/projects" className={styles.navLink}>
                <FiBriefcase className={styles.navIcon} />
                <span>Projects</span>
              </Link>
              <Link href="/gigs" className={styles.navLink}>
                <FiLayers className={styles.navIcon} />
                <span>Gigs</span>
              </Link>
              <Link href="/freelancers" className={styles.navLink}>
                <FiUsers className={styles.navIcon} />
                <span>Talent</span>
              </Link>
              <Link href="/skills/assessment" className={styles.navLink}>
                <FiAward className={styles.navIcon} />
                <span>Skill Badges</span>
              </Link>
              {isAuthenticated && (
                <Link href="/dashboard" className={styles.navLink}>
                  <FiCompass className={styles.navIcon} />
                  <span>Dashboard</span>
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link href="/admin/disputes" className={styles.navLink}>
                  <FiShield className={styles.navIcon} />
                  <span>Disputes</span>
                </Link>
              )}
            </nav>
          </div>

          <div className={styles.actions}>
            {user?.role === 'student' && (
              <Link href="/gigs/create" className={styles.postBtn}>
                <Button size="sm" variant="secondary">
                  <FiPlusCircle size={15} /> Create Gig
                </Button>
              </Link>
            )}

            {user?.role === 'client' && (
              <Link href="/projects/create" className={styles.postBtn}>
                <Button size="sm" variant="secondary">
                  <FiPlusCircle size={15} /> Post Project
                </Button>
              </Link>
            )}

            <button className={styles.iconBtn} onClick={toggleTheme} aria-label="Toggle theme" title="Toggle theme">
              {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {isAuthenticated ? (
              <>
                <Link href="/notifications" className={styles.iconBtn} title="Notifications">
                  <FiBell size={18} />
                  {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
                </Link>
                <Link href="/messages" className={styles.navLink}>Messages</Link>
                <Link href="/settings" className={styles.userProfileBtn}>
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff`}
                    alt={user?.name}
                    className={styles.userAvatar}
                  />
                  <span className={styles.userName}>{user?.name?.split(' ')[0]}</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
                <Link href="/signup"><Button size="sm">Join as Student / Client</Button></Link>
              </>
            )}

            {onMenuClick && (
              <button className={`${styles.iconBtn} ${styles.menuBtn}`} onClick={onMenuClick}>
                <FiMenu size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.subBar}>
        <div className={styles.subBarInner}>
          {categories.map((cat) => (
            <Link key={cat.label} href={cat.href} className={styles.subLink}>
              {cat.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
