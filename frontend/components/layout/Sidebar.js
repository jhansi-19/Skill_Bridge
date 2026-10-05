'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiGrid,
  FiFolder,
  FiMessageSquare,
  FiBell,
  FiSettings,
  FiUsers,
  FiBarChart2,
  FiFlag,
  FiLayers,
  FiAward,
  FiShield,
} from 'react-icons/fi';
import { useAuthStore } from '@/store/authStore';
import styles from './Sidebar.module.css';

const studentLinks = [
  { href: '/dashboard', label: 'Overview', icon: FiGrid },
  { href: '/gigs', label: 'Explore Gigs', icon: FiLayers },
  { href: '/gigs/create', label: 'Publish Gig', icon: FiLayers },
  { href: '/skills/assessment', label: 'Skill Badges', icon: FiAward },
  { href: '/projects', label: 'Browse Projects', icon: FiFolder },
  { href: '/dashboard/bids', label: 'My Bids', icon: FiFolder },
  { href: '/messages', label: 'Messages', icon: FiMessageSquare },
  { href: '/notifications', label: 'Notifications', icon: FiBell },
  { href: '/settings', label: 'Settings', icon: FiSettings },
];

const clientLinks = [
  { href: '/dashboard', label: 'Overview', icon: FiGrid },
  { href: '/projects/create', label: 'Post Project', icon: FiFolder },
  { href: '/gigs', label: 'Order Gigs', icon: FiLayers },
  { href: '/dashboard/projects', label: 'My Projects', icon: FiFolder },
  { href: '/freelancers', label: 'Student Talent', icon: FiUsers },
  { href: '/messages', label: 'Messages', icon: FiMessageSquare },
  { href: '/notifications', label: 'Notifications', icon: FiBell },
  { href: '/settings', label: 'Settings', icon: FiSettings },
];

const adminLinks = [
  { href: '/admin', label: 'Analytics', icon: FiBarChart2 },
  { href: '/admin/disputes', label: 'Mediation Disputes', icon: FiShield },
  { href: '/admin/users', label: 'Users', icon: FiUsers },
  { href: '/admin/reports', label: 'Reports', icon: FiFlag },
];

export default function Sidebar({ mobileOpen }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  const links =
    user?.role === 'admin'
      ? adminLinks
      : user?.role === 'client'
        ? clientLinks
        : studentLinks;

  return (
    <aside className={`${styles.sidebar} ${mobileOpen ? styles.mobileOpen : ''}`}>
      <nav className={styles.nav}>
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.link} ${pathname === href || pathname.startsWith(href + '/') ? styles.active : ''}`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
