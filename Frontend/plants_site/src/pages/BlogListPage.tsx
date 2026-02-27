// src/pages/BlogListPage.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import type { PostListItem } from '../types/blog';
import { useLanguageTheme } from '../contexts/LanguageThemeContext';
import BlogPostCard from '../components/blog/BlogPostCard';
import styles from './BlogListPage.module.css';

const BlogListPage: React.FC = () => {
  const { language } = useLanguageTheme();
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/api/blog/posts/');
        // Handle both paginated (results) and non-paginated responses
        const data = response.data.results || response.data;
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch blog posts:", err);
        setError(language === 'en' ? 'Failed to load blog posts. Please try again later.' : 'خطا در بارگذاری مطالب. لطفاً دوباره تلاش کنید.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [language]);

  if (loading) {
    return <div className={styles.loading}>{language === 'en' ? 'Loading posts...' : 'در حال بارگذاری مطالب...'}</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (posts.length === 0) {
    return <div className={styles.empty}>{language === 'en' ? 'No blog posts available.' : 'هیچ مطلبی موجود نیست.'}</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>{language === 'en' ? 'From the Blog' : 'وبلاگ'}</h1>
      <div className={styles.grid}>
        {posts.map(post => (
          <BlogPostCard key={post.id} post={post} language={language} />
        ))}
      </div>
    </div>
  );
};

export default BlogListPage;
