'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FiPrinter, FiArrowLeft, FiCheckCircle, FiShield, FiFileText } from 'react-icons/fi';
import api from '@/lib/api';
import { normalizeId } from '@/lib/ids';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import styles from './page.module.css';

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = normalizeId(params.id);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/payments/invoices/${invoiceId}`)
      .then(({ data }) => setInvoice(data.invoice))
      .catch((err) => setError(err.response?.data?.message || 'Invoice not found'))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Skeleton variant="card" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className={styles.page}>
        <h2>{error || 'Invoice not found'}</h2>
        <Link href="/dashboard"><Button style={{ marginTop: '1rem' }}>Back to Dashboard</Button></Link>
      </div>
    );
  }

  const formattedDate = new Date(invoice.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className={styles.page}>
      <div className={styles.topActions}>
        <Link href="/dashboard" className={styles.backLink}>
          <FiArrowLeft /> Back to Dashboard
        </Link>
        <Button onClick={handlePrint} size="sm">
          <FiPrinter size={15} /> Download / Print PDF
        </Button>
      </div>

      <div className={styles.invoiceCard} id="printable-invoice">
        {/* Invoice Header */}
        <div className={styles.header}>
          <div className={styles.brand}>
            <div className={styles.logoIcon}>SB</div>
            <div>
              <h2 className={styles.brandTitle}>SkillBridge Inc.</h2>
              <p className={styles.brandSub}>Student Freelance Marketplace</p>
            </div>
          </div>
          <div className={styles.invoiceMeta}>
            <span className={styles.statusBadge}><FiCheckCircle size={13} /> {invoice.status}</span>
            <h3 className={styles.invoiceNumber}>{invoice.invoiceNumber}</h3>
            <p className={styles.invoiceDate}>Issue Date: {formattedDate}</p>
          </div>
        </div>

        {/* Client & Freelancer Address Info */}
        <div className={styles.addressGrid}>
          <div className={styles.addressBox}>
            <span className={styles.addressLabel}>Billed To (Client):</span>
            <h4>{invoice.client?.name || 'Valued Client'}</h4>
            <p>{invoice.client?.company}</p>
            <p>{invoice.client?.email}</p>
          </div>

          <div className={styles.addressBox}>
            <span className={styles.addressLabel}>Issued By (Student Freelancer):</span>
            <h4>{invoice.freelancer?.name || 'Student Freelancer'}</h4>
            <p>{invoice.freelancer?.institution}</p>
            <p>{invoice.freelancer?.email}</p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Payment Type</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>{invoice.project?.title || 'Freelance Service Delivery'}</strong>
                  <p className={styles.tableSub}>Direct Freelance Service Delivery • Razorpay Gateway</p>
                </td>
                <td style={{ textTransform: 'capitalize' }}>{invoice.project?.category?.replace('-', ' ')}</td>
                <td style={{ textTransform: 'uppercase' }}>{invoice.type}</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>${invoice.amount?.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Invoice Totals */}
        <div className={styles.totalsSection}>
          <div className={styles.paymentMethodBox}>
            <FiShield className={styles.shieldIcon} />
            <div>
              <strong>Payment Method:</strong>
              <p>{invoice.paymentMethod || 'Razorpay Payment Gateway (Test Mode)'}</p>
              <p className={styles.smallNote}>0% Student Platform Commission Guaranteed.</p>
            </div>
          </div>

          <div className={styles.totalsList}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <strong>${invoice.amount?.toFixed(2)}</strong>
            </div>
            <div className={styles.totalRow}>
              <span>Student Platform Fee</span>
              <strong style={{ color: 'var(--success)' }}>$0.00 (Free)</strong>
            </div>
            <div className={`${styles.totalRow} ${styles.grandTotal}`}>
              <span>Total Paid</span>
              <span>${invoice.totalAmount?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p>Thank you for supporting student freelancers on SkillBridge.</p>
          <p className={styles.legalText}>This document serves as an official electronic receipt for services rendered and payment transferred via Razorpay.</p>
        </div>
      </div>
    </div>
  );
}
