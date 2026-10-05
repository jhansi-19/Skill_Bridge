'use client';

import { motion } from 'framer-motion';
import styles from './Card.module.css';

export default function Card({ children, hover, glass, className = '', ...motionProps }) {
  const classes = [
    styles.card,
    hover && styles.hover,
    glass && styles.glass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.div
      className={classes}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
