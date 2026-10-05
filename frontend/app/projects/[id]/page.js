'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import {
  FiCheckCircle,
  FiUploadCloud,
  FiAlertTriangle,
  FiExternalLink,
  FiDollarSign,
  FiClock,
  FiCreditCard,
  FiFileText,
  FiRotateCw,
  FiSend,
  FiX,
  FiShield,
} from 'react-icons/fi';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import MessageButton from '@/components/chat/MessageButton';
import styles from './page.module.css';

// Normalize any ID
function toStr(id) {
  if (!id) return '';
  if (typeof id === 'string') return id;
  if (typeof id === 'object' && id._id) return id._id.toString();
  return id.toString();
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id;
  const user = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.addToast);
  const router = useRouter();

  const [project, setProject] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Panels
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [deliverNotes, setDeliverNotes] = useState('');
  const [deliverAttachment, setDeliverAttachment] = useState('');

  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');

  // Razorpay Checkout Modal
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [razorpayOrder, setRazorpayOrder] = useState(null);
  const [paying, setPaying] = useState(false);
  const [selectedPayMethod, setSelectedPayMethod] = useState('card');

  // Completed payment record if paid
  const [paymentRecord, setPaymentRecord] = useState(null);

  const { register, handleSubmit, reset } = useForm();

  const loadData = () => {
    Promise.all([
      api.get(`/projects/${projectId}`),
      user ? api.get(`/projects/${projectId}/bids`).catch(() => ({ data: { bids: [] } })) : Promise.resolve({ data: { bids: [] } }),
      user ? api.get('/payments').catch(() => ({ data: { payments: [] } })) : Promise.resolve({ data: { payments: [] } }),
    ])
      .then(([projRes, bidsRes, paymentsRes]) => {
        const proj = projRes.data.project;
        setProject(proj);
        setBids(bidsRes.data.bids || []);

        // Find payment for this project if exists
        const payments = paymentsRes.data.payments || [];
        const foundPayment = payments.find((p) => toStr(p.project?._id || p.project) === toStr(proj._id));
        if (foundPayment) {
          setPaymentRecord(foundPayment);
        }
      })
      .catch((err) => addToast(err.response?.data?.message || 'Failed to load project', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (projectId) loadData();
  }, [projectId, user]);

  // ── 1. Submit Bid (Student) ──
  const onBid = async (data) => {
    try {
      await api.post(`/projects/${projectId}/bids`, {
        amount: parseFloat(data.amount),
        proposal: data.proposal,
        estimatedDelivery: parseInt(data.estimatedDelivery, 10),
      });
      addToast('🎉 Proposal submitted successfully!', 'success');
      reset();
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Bid failed', 'error');
    }
  };

  // ── 2. Hire Freelancer (Client) ──
  const hire = async (bidId) => {
    try {
      await api.post(`/projects/${projectId}/hire`, { bidId });
      addToast('✅ Student Freelancer hired! Project is now In Progress.', 'success');
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Hire failed', 'error');
    }
  };

  // ── 3. Submit Work Deliverables (Student) ──
  const handleSubmitDeliverable = async () => {
    if (!deliverNotes.trim()) {
      addToast('Please enter delivery summary notes', 'error');
      return;
    }
    try {
      await api.post(`/payments/${projectId}/deliverables`, {
        notes: deliverNotes,
        attachments: deliverAttachment ? [{ filename: 'Deliverable Link', url: deliverAttachment }] : [],
      });
      addToast('📦 Deliverable submitted! Client notified to review and pay via Razorpay.', 'success');
      setShowDeliverModal(false);
      setDeliverNotes('');
      setDeliverAttachment('');
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Submission failed', 'error');
    }
  };

  // ── 4. Request Revision (Client) ──
  const handleRequestRevision = async () => {
    if (!revisionNotes.trim()) {
      addToast('Please provide feedback for the requested changes', 'error');
      return;
    }
    try {
      await api.post(`/payments/${projectId}/revisions`, {
        revisionComment: revisionNotes,
      });
      addToast('🔄 Revision requested. Freelancer has been notified.', 'info');
      setShowRevisionModal(false);
      setRevisionNotes('');
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Revision request failed', 'error');
    }
  };

  // ── 5. Initiate Razorpay Checkout ──
  const initiateRazorpayPayment = async () => {
    setPaying(true);
    try {
      const { data } = await api.post('/payments/razorpay/order', {
        projectId,
        amount: project.budget,
      });

      setRazorpayOrder(data);
      setShowRazorpayModal(true);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to initiate Razorpay order', 'error');
    } finally {
      setPaying(false);
    }
  };

  // ── 6. Confirm Razorpay Payment (Testing Flow) ──
  const handleConfirmRazorpayPayment = async () => {
    setPaying(true);
    try {
      const paymentId = `pay_rzp_test_${Date.now()}`;
      const signature = `sig_test_${Math.random().toString(36).substring(2, 9)}`;

      const { data } = await api.post('/payments/razorpay/verify', {
        projectId,
        razorpay_order_id: razorpayOrder?.orderId || `order_test_${Date.now()}`,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        amount: project.budget,
      });

      addToast(`🎉 Payment of $${project.budget} transferred to freelancer via Razorpay!`, 'success');
      setShowRazorpayModal(false);
      setPaymentRecord(data.payment);
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Payment transfer failed', 'error');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Skeleton variant="title" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className={styles.page}>
        <Card style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Project not found</h2>
          <Link href="/projects">← Back to Projects</Link>
        </Card>
      </div>
    );
  }

  // Role detection
  const myId = toStr(user?._id);
  const clientId = toStr(project.client);
  const hiredId = toStr(project.hiredFreelancer);

  const isClient = !!myId && myId === clientId;
  const isHiredFreelancer = !!myId && myId === hiredId;
  const isStudent = user?.role === 'student';
  const isInProgress = project.status === 'in_progress';
  const isCompleted = project.status === 'completed';
  const isOpen = project.status === 'open';

  // Latest Deliverable
  const deliverablesList = project.deliverables || [];
  const latestDeliverable = deliverablesList[deliverablesList.length - 1];
  const hasSubmittedWork = deliverablesList.length > 0;
  const isPaid = project.paymentStatus === 'paid' || isCompleted;

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        {/* ── MAIN COLUMN ────────────────────────────────────────── */}
        <div className={styles.main}>
          {/* Header */}
          <div className={styles.topTitleRow}>
            <div>
              <span className={styles.categoryBadge}>
                {project.category?.replace(/-/g, ' ')}
              </span>
              <h1 className={styles.title}>{project.title}</h1>
            </div>
            <div className={styles.statusBadgeGroup}>
              {isPaid ? (
                <span className={`${styles.statusBadge} ${styles.statusCompleted}`}>
                  <FiCheckCircle size={13} /> Paid via Razorpay
                </span>
              ) : hasSubmittedWork ? (
                <span className={`${styles.statusBadge} ${styles.statusSubmitted}`}>
                  <FiUploadCloud size={13} /> Work Submitted
                </span>
              ) : (
                <span className={`${styles.statusBadge} ${styles['status_' + project.status] || styles.statusOpen}`}>
                  {project.status?.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>

          {/* Meta Bar */}
          <div className={styles.metaBar}>
            <div className={styles.metaItem}>
              <FiDollarSign size={15} />
              <span>Project Budget:</span>
              <strong>${project.budget?.toLocaleString()}</strong>
            </div>
            <div className={styles.metaItem}>
              <FiCreditCard size={15} />
              <span>Payment Gateway:</span>
              <strong>Razorpay (Test Mode)</strong>
            </div>
            <div className={styles.metaItem}>
              <FiClock size={15} />
              <span>Payment Status:</span>
              <strong style={{ color: isPaid ? 'var(--success)' : '#eab308' }}>
                {isPaid ? 'Paid & Completed' : hasSubmittedWork ? 'Awaiting Payment' : 'Pending Work'}
              </strong>
            </div>
          </div>

          {/* Overview */}
          <div className={styles.descBox}>
            <h3>Project Overview</h3>
            <p className={styles.desc}>{project.description}</p>
          </div>

          {/* Tags */}
          {project.skillsRequired?.length > 0 && (
            <div className={styles.tags}>
              {project.skillsRequired.map((s) => (
                <span key={s} className={styles.tag}>{s}</span>
              ))}
            </div>
          )}

          {/* ── WORK & RAZORPAY PAYMENT SECTION ──────────────────────── */}
          {(isInProgress || isCompleted) && (
            <div className={styles.workSection}>
              <div className={styles.sectionHeader}>
                <div>
                  <span className={styles.sectionPill}>
                    <FiCreditCard size={13} /> Work Delivery & Payment
                  </span>
                  <h2>Project Deliverables & Transfer</h2>
                </div>

                {/* Student: Submit Work Deliverable button */}
                {isHiredFreelancer && !isPaid && (
                  <Button onClick={() => setShowDeliverModal(true)}>
                    <FiUploadCloud size={15} /> Submit Deliverables
                  </Button>
                )}
              </div>

              {/* Case 1: Work Has Been Submitted */}
              {hasSubmittedWork ? (
                <Card className={styles.submissionCard}>
                  <div className={styles.submissionHeader}>
                    <div className={styles.submissionTitleRow}>
                      <span className={styles.checkIcon}>
                        <FiCheckCircle size={20} />
                      </span>
                      <div>
                        <h4>Submitted Work Deliverable</h4>
                        <small>
                          Submitted on {new Date(latestDeliverable.submittedAt).toLocaleDateString()} at{' '}
                          {new Date(latestDeliverable.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </small>
                      </div>
                    </div>

                    <span className={`${styles.deliverableStatus} ${styles['del_' + latestDeliverable.status]}`}>
                      {latestDeliverable.status?.replace('_', ' ')}
                    </span>
                  </div>

                  <div className={styles.submissionBody}>
                    <p className={styles.submissionNotes}>{latestDeliverable.notes}</p>

                    {latestDeliverable.attachments?.length > 0 && (
                      <div className={styles.attachmentRow}>
                        {latestDeliverable.attachments.map((att, i) => (
                          <a
                            key={i}
                            href={att.url}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.deliverableLink}
                          >
                            <FiExternalLink size={14} /> Open Deliverable: {att.url}
                          </a>
                        ))}
                      </div>
                    )}

                    {latestDeliverable.revisionComment && (
                      <div className={styles.revisionCommentBox}>
                        <strong><FiRotateCw size={13} /> Client Revision Notes:</strong>
                        <p>{latestDeliverable.revisionComment}</p>
                      </div>
                    )}
                  </div>

                  {/* ACTION BAR: Razorpay Payment or Revisions */}
                  <div className={styles.submissionActions}>
                    {/* CLIENT ACTIONS */}
                    {isClient && !isPaid && (
                      <div className={styles.clientActionButtons}>
                        <Button
                          variant="secondary"
                          onClick={() => setShowRevisionModal(true)}
                        >
                          <FiRotateCw size={14} /> Request Revision
                        </Button>

                        <button
                          type="button"
                          className={styles.razorpayPayBtn}
                          onClick={initiateRazorpayPayment}
                          disabled={paying}
                        >
                          <span className={styles.rzpIcon}>₹</span>
                          Pay ${project.budget} via Razorpay
                        </button>
                      </div>
                    )}

                    {/* STUDENT VIEW WHEN SUBMITTED */}
                    {isHiredFreelancer && !isPaid && (
                      <div className={styles.studentStatusBanner}>
                        <p>
                          ✅ Your deliverable is under client review. Once the client confirms, the payment of{' '}
                          <strong>${project.budget}</strong> will be transferred to your earnings via Razorpay.
                        </p>
                      </div>
                    )}

                    {/* ALREADY PAID */}
                    {isPaid && (
                      <div className={styles.paidSuccessBanner}>
                        <FiCheckCircle size={20} />
                        <div>
                          <strong>Payment of ${project.budget} completed via Razorpay!</strong>
                          <p>Funds transferred to student freelancer's earnings.</p>
                        </div>
                        {paymentRecord?._id && (
                          <Link href={`/invoices/${paymentRecord._id}`}>
                            <Button size="sm" variant="secondary">
                              <FiFileText size={13} /> View Invoice
                            </Button>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ) : (
                /* Case 2: In progress, waiting for first deliverable submission */
                <Card className={styles.waitingCard}>
                  <div className={styles.waitingIcon}>
                    <FiUploadCloud size={32} />
                  </div>
                  <h3>Work In Progress</h3>
                  <p>
                    {isHiredFreelancer
                      ? 'When you finish the tasks, click "Submit Deliverables" above with your notes and links (GitHub, Figma, Live URL) to request payment.'
                      : 'The student freelancer is currently working on this project. When they submit work, you can review it and transfer payment using Razorpay.'}
                  </p>
                  {isHiredFreelancer && (
                    <Button onClick={() => setShowDeliverModal(true)} style={{ marginTop: '1rem' }}>
                      <FiUploadCloud size={14} /> Submit Work Now
                    </Button>
                  )}
                </Card>
              )}
            </div>
          )}

          {/* ── PROPOSALS SECTION (Only visible when project is Open) ── */}
          {isOpen && isClient && (
            <div className={styles.bidsSection}>
              <h2>Received Proposals ({bids.length})</h2>
              {bids.length === 0 ? (
                <Card className={styles.emptyCard}>
                  <p>No proposals received yet. Interested student freelancers will submit bids soon.</p>
                </Card>
              ) : (
                <div className={styles.bidsGrid}>
                  {bids.map((bid) => (
                    <Card key={bid._id} className={styles.bidCard}>
                      <div className={styles.bidHeader}>
                        <div>
                          <h4>{bid.freelancer?.name || 'Student Freelancer'}</h4>
                          <p className={styles.bidUni}>
                            {bid.freelancer?.education?.[0]?.institution || 'University Student'}
                          </p>
                        </div>
                        <div className={styles.bidTerms}>
                          <strong>${bid.amount}</strong>
                          <small>{bid.estimatedDelivery} days delivery</small>
                        </div>
                      </div>
                      <p className={styles.proposalText}>{bid.proposal}</p>
                      <div className={styles.bidFooter}>
                        <MessageButton
                          recipientId={bid.freelancer?._id || bid.freelancer}
                          projectId={projectId}
                          label="Chat"
                        />
                        <Button size="sm" onClick={() => hire(bid._id)}>
                          Hire & Start Work
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── SIDEBAR ────────────────────────────────────────────── */}
        <div className={styles.sidebar}>
          {/* Client Info Card */}
          {user && !isClient && project.client && (
            <Card className={styles.sideCard}>
              <h3>Project Client</h3>
              <p className={styles.ownerName}>{project.client.name || 'Client'}</p>
              <p className={styles.ownerCompany}>{project.client.companyName || 'Verified Client'}</p>
              <MessageButton
                recipientId={project.client._id || project.client}
                projectId={projectId}
                full
                label="Message Client"
              />
            </Card>
          )}

          {/* Hired Freelancer Card */}
          {project.hiredFreelancer && (
            <Card className={styles.sideCard}>
              <h3>Hired Student Talent</h3>
              <p className={styles.ownerName}>{project.hiredFreelancer.name || 'Student'}</p>
              <p className={styles.ownerCompany}>
                {project.hiredFreelancer.education?.[0]?.institution || 'Verified Student'}
              </p>
              <MessageButton
                recipientId={project.hiredFreelancer._id || project.hiredFreelancer}
                projectId={projectId}
                full
                label="Direct Chat"
              />
            </Card>
          )}

          {/* Student: Submit Bid Form when open */}
          {isStudent && isOpen && !isHiredFreelancer && (
            <Card className={styles.sideCard}>
              <h3>Submit a Proposal</h3>
              <form className={styles.bidForm} onSubmit={handleSubmit(onBid)}>
                <Input
                  label="Your Bid Amount ($)"
                  type="number"
                  placeholder="300"
                  {...register('amount', { required: true })}
                />
                <Input
                  label="Delivery Time (days)"
                  type="number"
                  placeholder="7"
                  {...register('estimatedDelivery', { required: true })}
                />
                <Input
                  label="Proposal / Pitch"
                  textarea
                  placeholder="Explain why you are the best fit for this project..."
                  {...register('proposal', { required: true })}
                />
                <Button type="submit" full size="lg">Send Proposal</Button>
              </form>
            </Card>
          )}

          {/* Client: Razorpay Payment Card */}
          {isClient && isInProgress && (
            <Card className={styles.sideCard}>
              <div className={styles.payCardHeader}>
                <div className={styles.razorpayBadge}>RAZORPAY</div>
                <h3>Payment Transfer</h3>
              </div>
              <p className={styles.payCardDesc}>
                Once the student submits their completed work, review it and pay via Razorpay test mode.
              </p>

              <div className={styles.payAmountRow}>
                <span>Payable Amount:</span>
                <strong>${project.budget}</strong>
              </div>

              {hasSubmittedWork && !isPaid ? (
                <button
                  type="button"
                  className={styles.razorpayPayBtnFull}
                  onClick={initiateRazorpayPayment}
                  disabled={paying}
                >
                  Pay ${project.budget} via Razorpay
                </button>
              ) : isPaid ? (
                <div className={styles.paidPill}>
                  <FiCheckCircle size={14} /> Paid & Transferred
                </div>
              ) : (
                <div className={styles.pendingWorkPill}>
                  <FiClock size={14} /> Awaiting Work Submission
                </div>
              )}
            </Card>
          )}

          {/* Project Summary */}
          <Card className={styles.sideCard}>
            <h3>Project Summary</h3>
            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span>Status</span>
                <strong style={{ textTransform: 'capitalize' }}>
                  {isPaid ? 'Completed & Paid' : project.status?.replace('_', ' ')}
                </strong>
              </div>
              <div className={styles.infoRow}>
                <span>Budget</span>
                <strong>${project.budget}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Payment</span>
                <strong>{isPaid ? 'Transferred' : 'Upon Delivery'}</strong>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── MODAL 1: SUBMIT WORK DELIVERABLES (STUDENT) ─────────── */}
      {showDeliverModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeliverModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2><FiUploadCloud size={20} /> Submit Completed Work</h2>
              <button className={styles.modalClose} onClick={() => setShowDeliverModal(false)}>
                <FiX size={18} />
              </button>
            </div>
            <p className={styles.modalSubtitle}>
              Provide details of your completed work and links (GitHub repo, Figma, Google Drive, live URL) for client review.
            </p>

            <div className={styles.modalForm}>
              <label className={styles.modalLabel}>Work Summary & Notes *</label>
              <textarea
                className={styles.modalTextarea}
                placeholder="Detail what was completed, how to test/view the work, etc..."
                value={deliverNotes}
                onChange={(e) => setDeliverNotes(e.target.value)}
                rows={4}
              />

              <label className={styles.modalLabel} style={{ marginTop: '1rem' }}>
                Live URL / GitHub Repo / Figma Link
              </label>
              <input
                className={styles.modalInput}
                placeholder="https://github.com/username/project"
                value={deliverAttachment}
                onChange={(e) => setDeliverAttachment(e.target.value)}
              />

              <div className={styles.modalActions}>
                <Button variant="secondary" onClick={() => setShowDeliverModal(false)}>Cancel</Button>
                <Button onClick={handleSubmitDeliverable}>
                  <FiSend size={14} /> Submit for Review
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: REQUEST REVISION (CLIENT) ──────────────────── */}
      {showRevisionModal && (
        <div className={styles.modalOverlay} onClick={() => setShowRevisionModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2><FiRotateCw size={20} /> Request Deliverable Changes</h2>
              <button className={styles.modalClose} onClick={() => setShowRevisionModal(false)}>
                <FiX size={18} />
              </button>
            </div>
            <p className={styles.modalSubtitle}>
              Explain specifically what changes or additions the student freelancer needs to make.
            </p>

            <div className={styles.modalForm}>
              <textarea
                className={styles.modalTextarea}
                placeholder="Enter your revision feedback here..."
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                rows={5}
              />

              <div className={styles.modalActions}>
                <Button variant="secondary" onClick={() => setShowRevisionModal(false)}>Cancel</Button>
                <Button onClick={handleRequestRevision}>Send Revision Feedback</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: RAZORPAY TEST PAYMENT POPUP (CLIENT) ───────── */}
      {showRazorpayModal && (
        <div className={styles.modalOverlay} onClick={() => setShowRazorpayModal(false)}>
          <div className={styles.rzpModalContent} onClick={(e) => e.stopPropagation()}>
            {/* Razorpay Brand Header */}
            <div className={styles.rzpHeader}>
              <div className={styles.rzpBrandRow}>
                <span className={styles.rzpLogoText}>Razorpay</span>
                <span className={styles.rzpTestBadge}>TEST MODE</span>
              </div>
              <button className={styles.rzpCloseBtn} onClick={() => setShowRazorpayModal(false)}>
                <FiX size={18} />
              </button>
            </div>

            <div className={styles.rzpOrderSummary}>
              <div className={styles.rzpMerchant}>SkillBridge Marketplace</div>
              <div className={styles.rzpProjectTitle}>{project.title}</div>
              <div className={styles.rzpAmountRow}>
                <span>Amount Payable</span>
                <div className={styles.rzpAmount}>
                  ${project.budget} <small>(≈ ₹{project.budget * 83})</small>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className={styles.rzpBody}>
              <div className={styles.rzpMethodTabs}>
                <button
                  type="button"
                  className={`${styles.rzpMethodTab} ${selectedPayMethod === 'card' ? styles.rzpMethodTabActive : ''}`}
                  onClick={() => setSelectedPayMethod('card')}
                >
                  <FiCreditCard size={15} /> Card
                </button>
                <button
                  type="button"
                  className={`${styles.rzpMethodTab} ${selectedPayMethod === 'upi' ? styles.rzpMethodTabActive : ''}`}
                  onClick={() => setSelectedPayMethod('upi')}
                >
                  📱 UPI / QR
                </button>
                <button
                  type="button"
                  className={`${styles.rzpMethodTab} ${selectedPayMethod === 'netbanking' ? styles.rzpMethodTabActive : ''}`}
                  onClick={() => setSelectedPayMethod('netbanking')}
                >
                  🏦 NetBanking
                </button>
              </div>

              {selectedPayMethod === 'card' && (
                <div className={styles.rzpMockCard}>
                  <div className={styles.mockInputLabel}>Test Card Number</div>
                  <div className={styles.mockInput}>4111 •••• •••• 1111 (Visa Test)</div>
                  <div className={styles.mockCardRow}>
                    <div>
                      <div className={styles.mockInputLabel}>Expiry</div>
                      <div className={styles.mockInput}>12/28</div>
                    </div>
                    <div>
                      <div className={styles.mockInputLabel}>CVV</div>
                      <div className={styles.mockInput}>123</div>
                    </div>
                  </div>
                </div>
              )}

              {selectedPayMethod === 'upi' && (
                <div className={styles.rzpMockCard}>
                  <div className={styles.mockInputLabel}>Test UPI ID</div>
                  <div className={styles.mockInput}>success@razorpay</div>
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    Instant auto-approved UPI simulator for testing.
                  </small>
                </div>
              )}

              {selectedPayMethod === 'netbanking' && (
                <div className={styles.rzpMockCard}>
                  <div className={styles.mockInputLabel}>Select Bank</div>
                  <select className={styles.rzpSelect} defaultValue="HDFC">
                    <option value="HDFC">HDFC Bank (Test)</option>
                    <option value="ICICI">ICICI Bank (Test)</option>
                    <option value="SBI">State Bank of India (Test)</option>
                    <option value="AXIS">Axis Bank (Test)</option>
                  </select>
                </div>
              )}

              <div className={styles.rzpSecurityNote}>
                <FiShield size={13} />
                <span>Simulated Razorpay Test Environment. No real funds will be deducted.</span>
              </div>

              <button
                type="button"
                className={styles.rzpSubmitBtn}
                onClick={handleConfirmRazorpayPayment}
                disabled={paying}
              >
                {paying ? 'Processing Payment...' : `Complete Test Payment • $${project.budget}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
