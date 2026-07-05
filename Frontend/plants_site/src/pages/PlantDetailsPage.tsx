// PlantDetailsPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import {m, AnimatePresence} from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import DOMPurify from 'dompurify';
import { FiDroplet, FiSun, FiThermometer, FiCloud, FiGlobe, FiGitBranch, FiScissors, FiShare2, FiArrowLeft, FiHeart, FiBookmark, FiEye } from 'react-icons/fi';
import type { Plant, PlantComment } from '../types';
import { plantService, gardenService, commentService, favouriteService } from '../services/api';
import { useUserPlants } from '../hooks/useUserPlants';
import { useLanguageTheme } from '../contexts/LanguageThemeContext';
import { formatDate } from '../utils/date';
import { LoaderGooeyBlobs } from '../components/animation/gooey-loader';
import styles from '../assets/css/PlantDetailsPage.module.css';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface PlantDetailsPageProps {
  plantId?: string;
  navigateTo?: (page: string, params?: Record<string, string>) => void;
}

const PlantDetailsPage: React.FC<PlantDetailsPageProps> = ({ plantId, navigateTo }) => {
  const { language, theme } = useLanguageTheme();
  const isEn = language === 'en';

  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userPlants } = useUserPlants();

  // Garden state
  const [isInGarden, setIsInGarden] = useState(false);
  const [userPlantId, setUserPlantId] = useState<number | null>(null);
  const [gardenActionLoading, setGardenActionLoading] = useState(false);

  // Favorite state
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [favLoading, setFavLoading] = useState(false);

  // Comments state
  const [comments, setComments] = useState<PlantComment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Related plants
  const [relatedPlants, setRelatedPlants] = useState<Plant[]>([]);

  // Content parsing
  const [parsedContent, setParsedContent] = useState('');
  const [tableOfContents, setTableOfContents] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeSection, setActiveSection] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = !!localStorage.getItem('access_token');

  // Fetch plant
  useEffect(() => {
    const fetchPlant = async () => {
      try {
        setLoading(true);
        const id = parseInt(plantId!, 10);
        const data = await plantService.getPlantById(id);
        setPlant(data);
        setIsFavorited(data.is_favourited || false);
        setFavoriteCount(data.favourite_count || 0);
        setCommentCount(data.comment_count || 0);

        // پردازش محتوا
        const contentHtml = isEn && data.description_en ? data.description_en : data.description;
        const cleaned = DOMPurify.sanitize(contentHtml);
        const parser = new DOMParser();
        const doc = parser.parseFromString(cleaned, 'text/html');
        const headings = doc.querySelectorAll('h2, h3, h4');
        const toc: { id: string; text: string; level: number }[] = [];
        headings.forEach((h, i) => {
          const id = `sec-${i}`;
          h.id = id;
          toc.push({ id, text: h.textContent || '', level: parseInt(h.tagName.charAt(1)) });
        });
        setTableOfContents(toc);
        setParsedContent(doc.body.innerHTML);

        // گیاهان مشابه
        const related = await plantService.getRelatedPlants?.(data.id) ?? [];
        setRelatedPlants(related.slice(0,4));

        // کامنت‌ها
        const commentsData = await commentService.getComments(data.id);
        setComments(commentsData);
      } catch {
        setError(isEn ? 'Failed to load plant.' : 'خطا در بارگذاری گیاه.');
      } finally {
        setLoading(false);
      }
    };
    if (plantId) fetchPlant();
  }, [plantId, isEn]);

  // Check garden membership
  useEffect(() => {
    if (plant) {
      const found = userPlants.find(up => up.plant === plant.id);
      setIsInGarden(!!found);
      setUserPlantId(found?.id || null);
    }
  }, [plant, userPlants]);

  // Intersection Observer for TOC
  useEffect(() => {
    if (!contentRef.current || tableOfContents.length === 0) return;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-100px 0px -60% 0px' }
    );
    const headings = contentRef.current.querySelectorAll('h2, h3, h4');
    headings.forEach(h => observer.observe(h));
    return () => observer.disconnect();
  }, [parsedContent, tableOfContents]);

  // Handlers
  const handleGardenToggle = async () => {
    if (!plant || gardenActionLoading) return;

    setGardenActionLoading(true);
    const wasInGarden = isInGarden;

    // Optimistic update
    setIsInGarden(!wasInGarden);
    setPlant(prev => prev ? { ...prev, garden_count: prev.garden_count + (wasInGarden ? -1 : 1) } : prev);

    try {
      if (wasInGarden && userPlantId) {
        await gardenService.removeUserPlant(userPlantId);
        setUserPlantId(null);
      } else {
        const response = await gardenService.addUserPlant({ plant: plant.id });
        setUserPlantId(response.id);
      }
    } catch (err: any) {
      setIsInGarden(wasInGarden);
      setPlant(prev => prev ? { ...prev, garden_count: prev.garden_count + (wasInGarden ? 1 : -1) } : prev);
      console.error('Garden toggle failed:', err);
      alert('عملیات با خطا مواجه شد');
    } finally {
      setGardenActionLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!plant || favLoading) return;

    setFavLoading(true);
    const wasFavorited = isFavorited;

    setIsFavorited(!wasFavorited);
    setFavoriteCount(prev => prev + (wasFavorited ? -1 : 1));

    try {
      if (wasFavorited) {
        await favouriteService.removeFavourite(plant.id);
      } else {
        await favouriteService.addFavourite(plant.id);
      }
    } catch (err) {
      setIsFavorited(wasFavorited);
      setFavoriteCount(prev => prev + (wasFavorited ? 1 : -1));
      console.error('Favorite toggle failed:', err);
    } finally {
      setFavLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: plant?.farsi_name || '',
          text: plant?.scientific_name || '',
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(isEn ? 'Link copied!' : 'لینک کپی شد!');
    }
  };

  const scrollToHeading = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await commentService.addComment(plant!.id, newComment);
      setNewComment('');
      setComments(prev => [res, ...prev]);
      setCommentCount(prev => prev + 1);
    } catch (err) {
      console.error('Failed to add comment', err);
    }
  };

  const handleReply = async (parentId: number) => {
    if (!replyContent.trim()) return;
    try {
      await commentService.addComment(plant!.id, replyContent, parentId);
      setReplyTo(null);
      setReplyContent('');
      const refreshed = await commentService.getComments(plant!.id);
      setComments(refreshed);
      setCommentCount(prev => prev + 1);
    } catch (err) {
      console.error('Reply failed', err);
    }
  };

  if (loading) return <div className={styles.loadingContainer}><LoaderGooeyBlobs size={40} color="#10b981" /></div>;
  if (error || !plant) return (
    <div className={styles.notFound}>
      <span className={styles.notFoundIcon}>🌿</span>
      <h2>{error || (isEn ? 'Plant not found' : 'گیاه یافت نشد')}</h2>
      <button onClick={() => navigateTo?.('library')} className={styles.backLink}>← {isEn ? 'Back to Library' : 'بازگشت به کتابخانه'}</button>
    </div>
  );

  const displayName = isEn ? (plant.english_name || plant.farsi_name) : plant.farsi_name;
  const galleryImages = plant.primary_image ? [plant.primary_image] : [];

  const careItems = [
    { icon: <FiDroplet />, title: isEn ? 'Water' : 'آب', value: isEn ? (plant.watering_frequency_en || plant.watering_frequency) : plant.watering_frequency },
    { icon: <FiSun />, title: isEn ? 'Light' : 'نور', value: isEn ? (plant.light_requirements_en || plant.light_requirements) : plant.light_requirements },
    { icon: '🌱', title: isEn ? 'Fertilizer' : 'کود', value: isEn ? (plant.fertilizer_schedule_en || plant.fertilizer_schedule) : plant.fertilizer_schedule },
    { icon: <FiThermometer />, title: isEn ? 'Temp' : 'دما', value: isEn ? (plant.temperature_range_en || plant.temperature_range) : plant.temperature_range },
    { icon: <FiCloud />, title: isEn ? 'Humidity' : 'رطوبت', value: isEn ? (plant.humidity_level_en || plant.humidity_level) : plant.humidity_level },
    { icon: <FiGlobe />, title: isEn ? 'Soil' : 'خاک', value: isEn ? (plant.soil_type_en || plant.soil_type) : plant.soil_type },
    { icon: <FiGitBranch />, title: isEn ? 'Propagation' : 'تکثیر', value: isEn ? (plant.propagation_methods_en || plant.propagation_methods) : plant.propagation_methods },
    { icon: <FiScissors />, title: isEn ? 'Pruning' : 'هرس', value: plant.pruning_info },
  ].filter(item => item.value);

  const toxicityLabel = plant.is_toxic ? (isEn ? 'Toxic' : 'سمی') : (isEn ? 'Non-toxic' : 'غیرسمی');
  const difficultyLabel = plant.care_difficulty_display ? (isEn ? plant.care_difficulty_display.en : plant.care_difficulty_display.fa) : plant.care_difficulty;

  return (
    <div className={`${styles.pageWrapper} ${theme === 'dark' ? styles.dark : ''}`}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        {galleryImages.length > 0 && (
          <Swiper modules={[Navigation, Pagination, Autoplay]} navigation pagination={{ clickable: true }} autoplay={{ delay: 5000 }} loop className={styles.heroSwiper}>
            {galleryImages.map((img, i) => (
              <SwiperSlide key={i}>
                <img src={img} alt={displayName} className={styles.heroImage} />
                <div className={styles.heroOverlay} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
        <div className={styles.heroContent}>
          <button onClick={() => navigateTo?.('library')} className={styles.backButton}>
            <FiArrowLeft /> {isEn ? 'Back to Library' : 'بازگشت'}
          </button>
          <h1 className={styles.heroTitle}>{displayName}</h1>
          <p className={styles.scientificName}><em>{plant.scientific_name}</em></p>
          {(isEn ? (plant.other_names_en || plant.other_names) : (plant.other_names || plant.other_names_en)) && (
            <p className={styles.otherNames}>
              {isEn ? 'Also known as: ' : 'نام‌های دیگر: '}
              <span>{isEn ? (plant.other_names_en || plant.other_names) : (plant.other_names || plant.other_names_en)}</span>
            </p>
          )}
          <div className={styles.statsRow}>
            <span className={styles.stat}><FiEye /> {plant.view_count.toLocaleString()}</span>
            <span className={styles.stat}><FiHeart /> {favoriteCount.toLocaleString()}</span>
            <span className={styles.stat}><FiBookmark /> {plant.garden_count?.toLocaleString() || 0}</span>
          </div>
          <div className={styles.tags}>
            <span className={`${styles.tag} ${plant.is_toxic ? styles.danger : styles.success}`}>{toxicityLabel}</span>
            <span className={styles.tag}>{difficultyLabel}</span>
          </div>
        </div>
      </div>

      <div className={styles.pageContainer}>
        <aside className={`${styles.sidebar} ${styles.tocSidebar}`}>
          <div className={styles.sidebarCard}>
            <h3 className={styles.sidebarTitle}>📑 {isEn ? 'Contents' : 'فهرست'}</h3>
            {tableOfContents.length > 0 ? (
              <nav className={styles.tableOfContents}>
                {tableOfContents.map(item => (
                  <button
                    key={item.id}
                    className={`${styles.tocLink} ${activeSection === item.id ? styles.active : ''}`}
                    style={{ paddingLeft: `${(item.level - 1) * 0.75}rem` }}
                    onClick={() => scrollToHeading(item.id)}
                  >
                    {item.text}
                  </button>
                ))}
              </nav>
            ) : (
              <p className={styles.sidebarEmpty}>{isEn ? 'No sections' : 'بخشی موجود نیست'}</p>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <article className={styles.mainContent}>
          {/* Quick Care Grid */}
          <div className={styles.quickCareGrid}>
            {careItems.map((item, i) => (
              <m.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={styles.careCard}
              >
                <span className={styles.careIcon}>{item.icon}</span>
                <h4 className={styles.careTitle}>{item.title}</h4>
                <p className={styles.careValue}>{item.value}</p>
              </m.div>
            ))}
          </div>

          <div
            ref={contentRef}
            className={`${styles.richContent} prose`}
            dangerouslySetInnerHTML={{ __html: parsedContent }}
          />

          <div className={styles.commentsSection}>
            <div className={styles.commentsHeader}>
              <span>💬</span>
              <h3>{isEn ? `Comments (${commentCount})` : `نظرات (${commentCount})`}</h3>
            </div>

            {isLoggedIn ? (
              <form onSubmit={handleAddComment} className={styles.addCommentForm}>
                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder={isEn ? 'Share your thoughts...' : 'نظر خود را بنویسید...'}
                  rows={3}
                  required
                />
                <button type="submit" className={styles.submitBtn}>{isEn ? 'Post' : 'ارسال'}</button>
              </form>
            ) : (
              <div className={styles.loginPrompt}>
                <p>{isEn ? 'Please login to comment.' : 'برای ثبت نظر وارد شوید.'}</p>
                <button onClick={() => navigateTo?.('login')} className={styles.loginBtn}>{isEn ? 'Log in' : 'ورود'}</button>
              </div>
            )}

            <div className={styles.commentsList}>
              <AnimatePresence>
                {comments.length === 0 ? (
                  <p className={styles.noComments}>🌱 {isEn ? 'No comments yet.' : 'هنوز نظری نیست.'}</p>
                ) : (
                  comments.map(comment => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      isEn={isEn}
                      depth={0}
                      replyTo={replyTo}
                      setReplyTo={setReplyTo}
                      replyContent={replyContent}
                      setReplyContent={setReplyContent}
                      handleReply={handleReply}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </article>

        {/* Right Sidebar - Actions & Related */}
        <aside className={`${styles.sidebar} ${styles.actionSidebar}`}>
          <div className={styles.sidebarCard}>
            <h3 className={styles.sidebarTitle}>🌿 {isEn ? 'Actions' : 'عملیات'}</h3>
            <div className={styles.actionButtons}>
              <m.button whileTap={{ scale: 0.95 }} onClick={handleFavoriteToggle} disabled={favLoading} className={`${styles.actionBtn} ${isFavorited ? styles.favorited : ''}`}>
                <FiHeart className={isFavorited ? 'text-red-500 fill-red-500' : ''} />
                {isEn ? (isFavorited ? 'Favorited' : 'Favorite') : (isFavorited ? 'حذف علاقه' : 'علاقه‌مندی')}
              </m.button>
              <m.button whileTap={{ scale: 0.95 }} onClick={handleGardenToggle} disabled={gardenActionLoading} className={`${styles.actionBtn} ${isInGarden ? styles.inGarden : ''}`}>
                <FiBookmark />
                {isEn ? (isInGarden ? 'In Garden' : 'Add to Garden') : (isInGarden ? 'در باغچه' : 'افزودن به باغچه')}
              </m.button>
              <m.button whileTap={{ scale: 0.95 }} onClick={handleShare} className={styles.actionBtn}>
                <FiShare2 /> {isEn ? 'Share' : 'اشتراک'}
              </m.button>
            </div>
          </div>

          <div className={styles.sidebarCard}>
            <h3 className={styles.sidebarTitle}>🌺 {isEn ? 'Similar Plants' : 'گیاهان مشابه'}</h3>
            {relatedPlants.length > 0 ? (
              <div className={styles.relatedGrid}>
                {relatedPlants.map(rp => (
                  <button key={rp.id} onClick={() => navigateTo?.('plantDetail', { plantId: String(rp.id) })} className={styles.relatedCard}>
                    {rp.primary_image && <img src={rp.primary_image} alt={rp.farsi_name} className={styles.relatedImage} />}
                    <span className={styles.relatedName}>{isEn ? (rp.english_name || rp.farsi_name) : rp.farsi_name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className={styles.sidebarEmpty}>{isEn ? 'No similar plants' : 'گیاه مشابهی یافت نشد'}</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

const CommentItem: React.FC<{
  comment: PlantComment;
  isEn: boolean;
  depth: number;
  replyTo: number | null;
  setReplyTo: (id: number | null) => void;
  replyContent: string;
  setReplyContent: (val: string) => void;
  handleReply: (parentId: number) => void;
}> = ({ comment, isEn, depth, replyTo, setReplyTo, replyContent, setReplyContent, handleReply }) => {
  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`${styles.commentItem} ${depth > 0 ? styles.nestedComment : ''}`}
      style={{ marginLeft: depth * 1.5 + 'rem' }}
    >
      <div className={styles.commentAvatar}>{comment.user_name[0]?.toUpperCase()}</div>
      <div className={styles.commentBody}>
        <div className={styles.commentHeader}>
          <strong>{comment.user_name}</strong>
          <span className={styles.commentDate}>{formatDate(comment.created_at, isEn ? 'en' : 'fa')}</span>
        </div>
        <p className={styles.commentText}>{comment.content}</p>
        <button
          onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
          className={styles.replyBtn}
        >
          {isEn ? 'Reply' : 'پاسخ'}
        </button>
        {replyTo === comment.id && (
          <div className={styles.replyForm}>
            <textarea
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              placeholder={isEn ? 'Write a reply...' : 'پاسخ خود را بنویسید...'}
              rows={2}
            />
            <button onClick={() => handleReply(comment.id)} className={styles.submitBtn}>{isEn ? 'Send' : 'ارسال'}</button>
          </div>
        )}
        {comment.replies && comment.replies.map(reply => (
          <CommentItem
            key={reply.id}
            comment={reply}
            isEn={isEn}
            depth={depth + 1}
            replyTo={replyTo}
            setReplyTo={setReplyTo}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            handleReply={handleReply}
          />
        ))}
      </div>
    </m.div>
  );
};

export default PlantDetailsPage;