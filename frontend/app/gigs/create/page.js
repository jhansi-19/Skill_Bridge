'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FiLayers, FiDollarSign, FiClock, FiPlus } from 'react-icons/fi';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import styles from './page.module.css';

export default function CreateGigPage() {
  const user = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.addToast);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      category: 'web-development',
      basicPrice: 50,
      basicDays: 2,
      basicFeatures: '1 Responsive Page, Source Code Included',
      standardPrice: 150,
      standardDays: 5,
      standardFeatures: '5 Pages, Database Setup, API Integration',
      premiumPrice: 350,
      premiumDays: 10,
      premiumFeatures: 'Full SaaS App, Stripe Integration, Admin Dashboard, Deployment',
    },
  });

  const onSubmit = async (data) => {
    if (!user || user.role !== 'student') {
      addToast('Only student freelancer accounts can publish gigs', 'error');
      return;
    }

    setLoading(true);
    try {
      const gigPayload = {
        title: data.title,
        category: data.category,
        description: data.description,
        coverImage:
          data.coverImage ||
          'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
        tags: data.tags
          ? data.tags.split(',').map((t) => t.trim())
          : ['Next.js', 'React'],
        packages: {
          basic: {
            title: data.basicTitle || 'Basic Package',
            description: data.basicDesc || 'Essential starter deliverables',
            price: parseFloat(data.basicPrice),
            deliveryDays: parseInt(data.basicDays, 10),
            revisions: 2,
            features: data.basicFeatures.split(',').map((f) => f.trim()),
          },
          standard: {
            title: data.standardTitle || 'Standard Package',
            description: data.standardDesc || 'Complete project deliverables for growing startups',
            price: parseFloat(data.standardPrice),
            deliveryDays: parseInt(data.standardDays, 10),
            revisions: 4,
            features: data.standardFeatures.split(',').map((f) => f.trim()),
          },
          premium: {
            title: data.premiumTitle || 'Premium Pro Package',
            description: data.premiumDesc || 'End-to-end full-scale enterprise delivery with priority support',
            price: parseFloat(data.premiumPrice),
            deliveryDays: parseInt(data.premiumDays, 10),
            revisions: 99,
            features: data.premiumFeatures.split(',').map((f) => f.trim()),
          },
        },
      };

      const { data: resData } = await api.post('/gigs', gigPayload);
      addToast('🎉 Service Gig published successfully to the marketplace!', 'success');
      router.push(`/gigs/${resData.gig._id}`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create gig', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className="glow-pill"><FiLayers size={12} /> Publish a Gig</span>
        <h1 className={styles.title}>Create a 3-Tier Service Gig</h1>
        <p className={styles.subtitle}>
          Package your student skills into fixed-price tiers (Basic, Standard, Premium) that clients can order in 1 click.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* Basic Info */}
        <Card className={styles.sectionCard}>
          <h2>1. Service Overview</h2>
          <Input
            label="Gig Title"
            placeholder="e.g. I will build a modern Next.js 14 web application"
            {...register('title', { required: true })}
          />

          <div className={styles.inputGroup}>
            <label className={styles.label}>Category</label>
            <select className={styles.select} {...register('category')}>
              <option value="web-development">Web & Full-Stack Development</option>
              <option value="design">UI/UX & Brand Design</option>
              <option value="data-science">AI, ML & Data Science</option>
              <option value="mobile-development">Mobile App Development</option>
              <option value="writing">Technical Writing & Translation</option>
              <option value="marketing">Growth & Marketing</option>
              <option value="video-editing">Video Editing & Animation</option>
            </select>
          </div>

          <Input
            label="Full Description"
            textarea
            placeholder="Describe what makes your service unique, your technical stack, and your process..."
            {...register('description', { required: true })}
          />

          <Input
            label="Cover Image URL (Optional)"
            placeholder="https://images.unsplash.com/..."
            {...register('coverImage')}
          />

          <Input
            label="Search Tags (comma-separated)"
            placeholder="Next.js, React, Node.js, MongoDB"
            {...register('tags')}
          />
        </Card>

        {/* 3 Tier Packages */}
        <Card className={styles.sectionCard}>
          <h2>2. Package Pricing Tiers</h2>
          <p className={styles.sectionHint}>
            Set your deliverables for Basic, Standard, and Premium packages.
          </p>

          <div className={styles.tiersGrid}>
            {/* Basic */}
            <div className={styles.tierBox}>
              <div className={styles.tierHeader}>
                <span className={styles.tierTag}>Tier 1</span>
                <h3>Basic</h3>
              </div>
              <Input label="Title" placeholder="Starter Page" {...register('basicTitle')} />
              <Input label="Description" placeholder="1 page responsive..." {...register('basicDesc')} />
              <Input label="Price ($)" type="number" {...register('basicPrice', { required: true })} />
              <Input label="Delivery (Days)" type="number" {...register('basicDays', { required: true })} />
              <Input label="Features (comma-separated)" {...register('basicFeatures')} />
            </div>

            {/* Standard */}
            <div className={`${styles.tierBox} ${styles.tierStandard}`}>
              <div className={styles.tierHeader}>
                <span className={styles.tierTagPrimary}>Tier 2 (Popular)</span>
                <h3>Standard</h3>
              </div>
              <Input label="Title" placeholder="Standard Web App" {...register('standardTitle')} />
              <Input label="Description" placeholder="Up to 5 pages with auth..." {...register('standardDesc')} />
              <Input label="Price ($)" type="number" {...register('standardPrice', { required: true })} />
              <Input label="Delivery (Days)" type="number" {...register('standardDays', { required: true })} />
              <Input label="Features (comma-separated)" {...register('standardFeatures')} />
            </div>

            {/* Premium */}
            <div className={styles.tierBox}>
              <div className={styles.tierHeader}>
                <span className={styles.tierTag}>Tier 3</span>
                <h3>Premium</h3>
              </div>
              <Input label="Title" placeholder="Full-Stack Pro SaaS" {...register('premiumTitle')} />
              <Input label="Description" placeholder="Complete platform with payments..." {...register('premiumDesc')} />
              <Input label="Price ($)" type="number" {...register('premiumPrice', { required: true })} />
              <Input label="Delivery (Days)" type="number" {...register('premiumDays', { required: true })} />
              <Input label="Features (comma-separated)" {...register('premiumFeatures')} />
            </div>
          </div>
        </Card>

        <div className={styles.formFooter}>
          <Button size="lg" type="submit" disabled={loading}>
            {loading ? 'Publishing...' : '🚀 Publish Gig to Marketplace'}
          </Button>
        </div>
      </form>
    </div>
  );
}
