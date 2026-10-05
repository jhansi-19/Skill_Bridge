'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import styles from '../layout.module.css';

export default function MyBidsPage() {
  const [bids, setBids] = useState([]);

  useEffect(() => {
    api.get('/bids/my').then(({ data }) => setBids(data.bids));
  }, []);

  return (
    <>
      <h1 className={styles.pageTitle}>My Bids</h1>
      {bids.map((bid) => (
        <Card key={bid._id} style={{ marginBottom: '0.75rem' }}>
          <Link href={`/projects/${bid.project?._id}`}>
            <strong>{bid.project?.title}</strong>
          </Link>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            ${bid.amount} — {bid.estimatedDelivery} days — <span style={{ color: 'var(--accent)' }}>{bid.status}</span>
          </p>
        </Card>
      ))}
    </>
  );
}
