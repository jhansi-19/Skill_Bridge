'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiDollarSign,
  FiUser,
  FiBriefcase,
  FiArrowRight,
} from 'react-icons/fi';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import styles from './page.module.css';

export default function DisputesMediationPage() {
  const user = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.addToast);

  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [selectedDecision, setSelectedDecision] = useState('refund_client');

  const fetchDisputes = () => {
    setLoading(true);
    api
      .get('/disputes')
      .then(({ data }) => setDisputes(data.disputes || []))
      .catch(() => setDisputes([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async (disputeId) => {
    try {
      await api.post(`/disputes/${disputeId}/resolve`, {
        decision: selectedDecision,
        adminDecisionNotes: decisionNotes || 'Admin arbitration resolution executed.',
      });
      addToast(`✅ Dispute resolved successfully (${selectedDecision.replace('_', ' ')})`, 'success');
      setResolvingId(null);
      setDecisionNotes('');
      fetchDisputes();
    } catch (err) {
      addToast(err.response?.data?.message || 'Resolution failed', 'error');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className={styles.page}>
        <Card className={styles.emptyCard}>
          <FiShield size={40} color="var(--accent)" />
          <h2>Admin Access Required</h2>
          <p>This mediation center is reserved for platform administrators to review escrow disputes.</p>
          <Link href="/login"><Button style={{ marginTop: '1rem' }}>Log in as Admin</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <span className="glow-pill"><FiShield size={12} /> Arbitration Portal</span>
          <h1 className={styles.title}>Dispute Resolution & Mediation Center</h1>
          <p className={styles.subtitle}>
            Review flagged contracts, examine party claims, and make binding escrow release or refund decisions.
          </p>
        </div>
      </div>

      {loading ? (
        <div className={styles.grid}>
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" />)}
        </div>
      ) : disputes.length === 0 ? (
        <Card className={styles.emptyCard}>
          <FiCheckCircle size={40} color="var(--success)" />
          <h3>No Open Disputes</h3>
          <p>All project contracts and milestone escrows are running smoothly with zero conflicts.</p>
        </Card>
      ) : (
        <div className={styles.grid}>
          {disputes.map((d) => {
            const isResolved = d.status.startsWith('resolved');
            const isModalOpen = resolvingId === d._id;

            return (
              <Card key={d._id} className={styles.disputeCard}>
                <div className={styles.topRow}>
                  <div className={styles.reasonBadge}>
                    <FiAlertTriangle size={14} />
                    <span>{d.reason?.replace('_', ' ').toUpperCase()}</span>
                  </div>
                  <span className={`${styles.statusBadge} ${styles[d.status]}`}>
                    {d.status?.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>

                <div className={styles.projectInfo}>
                  <h3 className={styles.projectTitle}>
                    <Link href={`/projects/${d.project?._id || d.project}`}>
                      {d.project?.title || 'Project Contract'}
                    </Link>
                  </h3>
                  <span className={styles.amountDispute}>
                    <FiDollarSign size={14} /> Disputed Escrow: <strong>${d.amountInDispute}</strong>
                  </span>
                </div>

                <div className={styles.partiesRow}>
                  <div className={styles.partyBox}>
                    <span className={styles.partyLabel}>Client:</span>
                    <p>{d.client?.name || 'Client'}</p>
                    <small>{d.client?.email}</small>
                  </div>
                  <div className={styles.partyBox}>
                    <span className={styles.partyLabel}>Student Freelancer:</span>
                    <p>{d.freelancer?.name || 'Freelancer'}</p>
                    <small>{d.freelancer?.email}</small>
                  </div>
                </div>

                <div className={styles.descBox}>
                  <strong>Claim Description:</strong>
                  <p>{d.description}</p>
                </div>

                {isResolved && (
                  <div className={styles.resolvedBox}>
                    <strong>Admin Ruling:</strong>
                    <p>{d.adminDecision}</p>
                  </div>
                )}

                {!isResolved && !isModalOpen && (
                  <Button onClick={() => setResolvingId(d._id)} full style={{ marginTop: '1rem' }}>
                    Arbitrate & Resolve Dispute
                  </Button>
                )}

                {/* Mediation Resolution Modal / Panel */}
                {isModalOpen && (
                  <div className={styles.decisionPanel}>
                    <h4>Execute Mediation Ruling</h4>
                    <div className={styles.radioGroup}>
                      <label className={styles.radioLabel}>
                        <input
                          type="radio"
                          name={`decision-${d._id}`}
                          value="refund_client"
                          checked={selectedDecision === 'refund_client'}
                          onChange={() => setSelectedDecision('refund_client')}
                        />
                        <span>Refund 100% Escrow (${d.amountInDispute}) to Client</span>
                      </label>
                      <label className={styles.radioLabel}>
                        <input
                          type="radio"
                          name={`decision-${d._id}`}
                          value="release_freelancer"
                          checked={selectedDecision === 'release_freelancer'}
                          onChange={() => setSelectedDecision('release_freelancer')}
                        />
                        <span>Award & Release Escrow (${d.amountInDispute}) to Student Freelancer</span>
                      </label>
                    </div>

                    <textarea
                      className={styles.notesInput}
                      placeholder="Enter binding arbitration decision notes for both parties..."
                      value={decisionNotes}
                      onChange={(e) => setDecisionNotes(e.target.value)}
                    />

                    <div className={styles.panelActions}>
                      <Button variant="secondary" onClick={() => setResolvingId(null)}>Cancel</Button>
                      <Button onClick={() => handleResolve(d._id)}>Confirm Ruling</Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
