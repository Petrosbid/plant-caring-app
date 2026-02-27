// src/components/blog/BlogPostCard.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { PostListItem } from '../../types/blog';
import { formatDate } from '../../utils/date';
import styles from './BlogPostCard.module.css';

interface BlogPostCardProps {
  post: PostListItem;
  language: 'en' | 'fa';
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post, language }) => {
  const publishDate = formatDate(post.publish, language);
  const isEn = language === 'en';
  
  // Use English content if available and language is English
  const title = isEn && post.title_en ? post.title_en : post.title;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={styles.card}
    >
      <Link to={`/blog/${post.slug}`} className={styles.link}>
        <div className={styles.imageContainer}>
          {post.cover_image && <img src={post.cover_image} alt={title} className={styles.coverImage} />}
        </div>
        <div className={styles.content}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.excerpt}>{post.excerpt}</p>
          <div className={styles.meta}>
            <span>{post.author.first_name} {post.author.last_name}</span>
            <span>&bull;</span>
            <time dateTime={post.publish}>{publishDate}</time>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default BlogPostCard;
