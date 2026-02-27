// src/pages/BlogDetailPage.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import type { PostDetail, PostListItem } from '../types/blog';
import { useLanguageTheme } from '../contexts/LanguageThemeContext';
import { formatDate } from '../utils/date';
import { blogService } from '../services/api';
import styles from './BlogDetailPage.module.css';

interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

interface Comment {
  id: number;
  author: string;
  content: string;
  created_at: string;
}

const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  // اگر در کانتکست خود theme را دارید می‌توانید استخراج کنید، در غیر این صورت فقط language کافیست
  const { language, theme } = useLanguageTheme();
  const isEn = language === 'en';

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<PostListItem[]>([]);
  
  const [parsedContent, setParsedContent] = useState<string>('');
  const [tableOfContents, setTableOfContents] = useState<TableOfContentsItem[]>([]);
  
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentCount, setCommentCount] = useState(0);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('');
  const contentRef = useRef<HTMLDivElement>(null);
  const isLoggedIn = !!localStorage.getItem('access_token');
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setBackendError(null);
        const response = await blogService.getPostBySlug(slug!);
        setPost(response);
        setLikes(response.likes_count || 0);
        setDislikes(response.dislikes_count || 0);
        setCommentCount(response.comments_count || 0);
      } catch (error) {
        console.error(`Failed to fetch post with slug ${slug}:`, error);
        setBackendError('Blog backend is not available. Please ensure the Django backend is running on http://localhost:8000');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      if (!post || post.tags.length === 0) return;
      try {
        const response = await blogService.getAllPosts({ tags: post.tags.join(','), limit: 5 });
        const filtered = (response.results || response)
          .filter((p: PostListItem) => p.slug !== slug)
          .slice(0, 4);
        setRelatedPosts(filtered || []);
      } catch (error) {
        console.error('Failed to fetch related posts:', error);
      }
    };

    fetchRelatedPosts();
  }, [post, slug]);

  useEffect(() => {
    const fetchComments = async () => {
      if (!post) return;
      try {
        const response = await blogService.getComments(post.slug);
        setComments(Array.isArray(response) ? response : (response.results || []));
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      }
    };

    fetchComments();
  }, [post]);

  useEffect(() => {
    if (!post?.content) return;

    // Use English content if available and language is English
    const contentToUse = isEn && post.content_en ? post.content_en : post.content;
    
    const cleanHtml = DOMPurify.sanitize(contentToUse);
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanHtml, 'text/html');

    const headings = doc.querySelectorAll('h1, h2, h3, h4');
    const toc: TableOfContentsItem[] = [];

    headings.forEach((heading, index) => {
      const id = `heading-${index}`;
      heading.id = id;
      toc.push({
        id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName.charAt(1)),
      });
    });

    setTableOfContents(toc);
    setParsedContent(doc.body.innerHTML);
  }, [post, isEn]);

  useEffect(() => {
    if (!contentRef.current || !parsedContent) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -60% 0px' }
    );

    const headings = contentRef.current.querySelectorAll('h1, h2, h3, h4');
    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [parsedContent]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>{language === 'fa' ? 'در حال بارگذاری...' : 'Loading post...'}</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles.notFound}>
        <span className={styles.notFoundIcon}>🌿</span>
        <h2>{language === 'fa' ? 'مطلب یافت نشد' : 'Post not found'}</h2>
        <Link to="/blog" className={styles.backLink}>
          {language === 'fa' ? 'بازگشت به وبلاگ' : 'Back to Blog'}
        </Link>
      </div>
    );
  }

  const publishDate = formatDate(post.publish, language);

  // Use English content if available and language is English
  const title = isEn && post.title_en ? post.title_en : post.title;
  const content = isEn && post.content_en ? post.content_en : post.content;
  const metaDescription = isEn && post.meta_description_en ? post.meta_description_en : post.meta_description;

  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(title);
  const shareLinks = {
    telegram: `https://t.me/share/url?url=${shareUrl}&text=${shareTitle}`,
    twitter: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`,
    whatsapp: `https://wa.me/?text=${shareTitle}%20${shareUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
  };

  const handleVote = async (type: 'like' | 'dislike') => {
    if (userVote === type) return;
    try {
      const response = await (type === 'like'
        ? blogService.likePost(post.slug)
        : blogService.dislikePost(post.slug));

      setLikes(response.likes_count);
      setDislikes(response.dislikes_count);
      setUserVote(response.user_has_liked ? 'like' : response.user_has_disliked ? 'dislike' : null);
    } catch (error) {
      console.error('Failed to submit vote:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await blogService.addComment(post.slug, { content: newComment });
      setNewComment('');
      setCommentCount(prev => prev + 1);
      const commentsResponse = await blogService.getComments(post.slug);
      setComments(Array.isArray(commentsResponse) ? commentsResponse : (commentsResponse.results || []));
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  return (
    <div className={`${styles.pageWrapper} ${theme === 'dark' ? styles.dark : ''}`} >
      {/* Hero Section */}
      <div className={styles.heroSection}>
        {post.cover_image && (
          <div className={styles.heroImage}>
            <img src={post.cover_image} alt={title} />
            <div className={styles.heroOverlay}></div>
          </div>
        )}
        <div className={styles.heroContent}>
          <Link to="/blog" className={styles.backButton}>
            <span>←</span> {isEn ? 'Back to Blog' : 'بازگشت به وبلاگ'}
          </Link>
          <h1 className={styles.heroTitle}>{title}</h1>
          <div className={styles.authorInfo}>
            <div className={styles.authorAvatar}>
              {post.author.first_name?.[0]}{post.author.last_name?.[0]}
            </div>
            <div className={styles.authorDetails}>
              <span className={styles.authorName}>
                {post.author.first_name} {post.author.last_name}
              </span>
              <div className={styles.metaInfo}>
                <time dateTime={post.publish}>{publishDate}</time>
                <span className={styles.metaDot}>•</span>
                <span className={styles.readTime}>👁 {post.view_count.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className={styles.categories}>
            {post.tags.map((tag) => (
              <span key={tag} className={styles.categoryTag}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* تغییرات گرید 3 ستونه در اینجا اعمال شده است */}
      <div className={styles.pageContainer}>
        
        {/* ستون اول: سایدبار فهرست مطالب */}
        <aside className={`${styles.sidebar} ${styles.tocSidebar}`}>
          <div className={styles.sidebarCard}>
            <h3 className={styles.sidebarTitle}>
              <span>📑</span> {isEn ? 'Contents' : 'فهرست'}
            </h3>
            {tableOfContents.length > 0 ? (
              <nav className={styles.tableOfContents}>
                <ul>
                  {tableOfContents.map((item) => (
                    <li
                      key={item.id}
                      className={`${styles.tocItem} ${activeSection === item.id ? styles.active : ''}`}
                      style={{ paddingInlineStart: `${(item.level - 1) * 0.75}rem` }}
                    >
                      <button onClick={() => scrollToHeading(item.id)} className={styles.tocLink}>
                        {item.text}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : (
              <p className={styles.sidebarEmpty}>
                {isEn ? 'No sections available' : 'بخشی موجود نیست'}
              </p>
            )}
          </div>
        </aside>

        {/* ستون وسط: محتوای اصلی مقاله و نظرات */}
        <article className={styles.mainContent}>
          {backendError && (
            <div className={styles.errorBanner}>
              <span className={styles.errorIcon}>⚠️</span>
              <div>
                <strong>{isEn ? 'Backend Not Available' : 'بک‌اند در دسترس نیست'}</strong>
                <p>{backendError}</p>
              </div>
            </div>
          )}

          <div
            ref={contentRef}
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: parsedContent }}
          />

          {/* Comments Section */}
          <div className={styles.commentsSection}>
            <div className={styles.commentsHeader}>
              <span className={styles.commentIcon}>💬</span>
              <h3 className={styles.commentsTitle}>
                {isEn ? `Comments (${commentCount})` : `نظرات (${commentCount})`}
              </h3>
            </div>

            {/* قسمت فرم نظرات با شرط ورود کاربر */}
            {isLoggedIn ? (
              <form onSubmit={handleAddComment} className={styles.addCommentForm}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={isEn ? 'Share your thoughts...' : 'نظرات خود را به اشتراک بگذارید...'}
                  className={styles.commentInput}
                  rows={4}
                  required
                />
                <button type="submit" className={styles.submitCommentBtn}>
                  {isEn ? 'Post Comment' : 'ارسال نظر'}
                </button>
              </form>
            ) : (
              <div className={styles.loginToComment}>
                <p>
                  {isEn 
                    ? 'You must be logged in to post a comment.' 
                    : 'برای ثبت نظر ابتدا باید وارد حساب کاربری خود شوید.'}
                </p>
                <div className={styles.authLinks}>
                  <Link to="/login" className={styles.loginBtn}>
                    {isEn ? 'Log in' : 'ورود'}
                  </Link>
                  <Link to="/register" className={styles.registerBtn}>
                    {isEn ? 'Register' : 'ثبت نام'}
                  </Link>
                </div>
              </div>
            )}

            <div className={styles.commentsList}>
              {comments.length === 0 ? (
                <div className={styles.noComments}>
                  <span>🌱</span>
                  <p>{isEn ? 'No comments yet. Be the first!' : 'هنوز نظری نیست. اولین باشید!'}</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className={styles.commentItem}>
                    <div className={styles.commentAvatar}>
                      {comment.author[0]?.toUpperCase() || 'A'}
                    </div>
                    <div className={styles.commentBody}>
                      <div className={styles.commentHeader}>
                        <span className={styles.commentAuthor}>{comment.author}</span>
                        <span className={styles.commentDate}>
                          {formatDate(comment.created_at, language)}
                        </span>
                      </div>
                      <p className={styles.commentContent}>{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </article>

        {/* ستون سوم: مقالات مرتبط و باکس لایک/اشتراک */}
        <aside className={`${styles.sidebar} ${styles.actionSidebar}`}>
          {/* مقالات مرتبط */}
          <div className={styles.sidebarCard}>
            <h3 className={styles.sidebarTitle}>
              <span>🌿</span> {isEn ? 'Related' : 'مرتبط'}
            </h3>
            {relatedPosts.length > 0 ? (
              <div className={styles.relatedPosts}>
                {relatedPosts.map((relatedPost) => {
                  const relatedTitle = isEn && relatedPost.title_en ? relatedPost.title_en : relatedPost.title;
                  return (
                    <Link
                      key={relatedPost.id}
                      to={`/blog/${relatedPost.slug}`}
                      className={styles.relatedPostCard}
                    >
                      {relatedPost.cover_image && (
                        <img
                          src={relatedPost.cover_image}
                          alt={relatedTitle}
                          className={styles.relatedPostImage}
                        />
                      )}
                      <h4 className={styles.relatedPostTitle}>{relatedTitle}</h4>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className={styles.sidebarEmpty}>
                {isEn ? 'No related articles' : 'مقاله مرتبط موجود نیست'}
              </p>
            )}
          </div>

          {/* باکس لایک و اشتراک گذاری */}
          <div className={`${styles.sidebarCard} ${styles.interactionCard}`}>
            <div className={styles.voteContainer}>
              <span className={styles.voteQuestion}>
                {isEn ? 'Was this helpful?' : 'آیا مفید بود؟'}
              </span>
              <div className={styles.voteButtons}>
                <button
                  onClick={() => handleVote('like')}
                  className={`${styles.voteBtn} ${userVote === 'like' ? styles.votedLike : ''}`}
                >
                  <span className={styles.voteIcon}>👍</span>
                  <span className={styles.voteCount}>{likes}</span>
                </button>
                <button
                  onClick={() => handleVote('dislike')}
                  className={`${styles.voteBtn} ${userVote === 'dislike' ? styles.votedDislike : ''}`}
                >
                  <span className={styles.voteIcon}>👎</span>
                  <span className={styles.voteCount}>{dislikes}</span>
                </button>
              </div>
            </div>

            <div className={styles.shareContainerSidebar}>
              <span className={styles.shareLabel}>{isEn ? 'Share:' : 'اشتراک:'}</span>
              <div className={styles.shareIcons}>
                <a href={shareLinks.telegram} target="_blank" rel="noopener noreferrer" className={`${styles.shareBtn} ${styles.telegram}`}>
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.361 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.062 3.345-.48.33-.913.493-1.302.481-.428-.014-1.252-.241-1.865-.44-.751-.244-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.119.098.152.228.166.331.016.115.033.373.028.589z"/></svg>
                </a>
                <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className={`${styles.shareBtn} ${styles.twitter}`}>
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className={`${styles.shareBtn} ${styles.whatsapp}`}>
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default BlogDetailPage;