'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useToastStore } from '@/store/toastStore';
import styles from '../layout.module.css';

export default function MyProjectsPage() {
  const [projects, setProjects] = useState([]);
  const addToast = useToastStore((s) => s.addToast);

  const load = () => api.get('/projects/my/list').then(({ data }) => setProjects(data.projects));

  useEffect(() => {
    load();
  }, []);

  const publish = async (id) => {
    try {
      await api.post(`/projects/${id}/publish`);
      addToast('Project published!', 'success');
      load();
    } catch (err) {
      addToast(err.response?.data?.message || 'Publish failed', 'error');
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className={styles.pageTitle}>My Projects</h1>
        <Link href="/projects/create"><Button>Post New</Button></Link>
      </div>
      {projects.length === 0 ? (
        <Card>
          <p style={{ color: 'var(--text-secondary)' }}>You have not posted any projects yet.</p>
          <Link href="/projects/create" style={{ marginTop: '1rem', display: 'inline-block' }}>
            <Button>Post your first project</Button>
          </Link>
        </Card>
      ) : (
        projects.map((p) => (
          <Card key={p._id} style={{ marginBottom: '0.75rem' }}>
            <Link href={`/projects/${p._id}`}><strong>{p.title}</strong></Link>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
              ${p.budget} — {p.status} — {p.hiredFreelancer ? `Hired: ${p.hiredFreelancer.name}` : 'No hire yet'}
            </p>
            {p.status === 'draft' && (
              <Button size="sm" style={{ marginTop: '0.75rem' }} onClick={() => publish(p._id)}>
                Publish to browse page
              </Button>
            )}
          </Card>
        ))
      )}
    </>
  );
}
