import React, { useState, useEffect } from "react";
import { blogService } from "../../services/api";
import { Link } from "react-router-dom";
import type { PostListItem } from "../../types/blog";
import { Swiper, SwiperSlide } from "swiper/react";
import {Pagination, A11y, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import styles from "./LatestPostsCarousel.module.css";
import { useLanguageTheme } from "../../contexts/LanguageThemeContext";

const LatestPostsCarousel: React.FC = () => {
  const [latestPosts, setLatestPosts] = useState<PostListItem[]>([]);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const { language } = useLanguageTheme();
  const isEn = language === "en";

  useEffect(() => {
    let ignore = false;
    const fetchLatest = async () => {
      try {
        const data = await blogService.getLatestPosts();
        if (!ignore) {
          setLatestPosts(data);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Failed to fetch latest posts:", error);
        }
      }
    };
    fetchLatest();
    return () => {
      ignore = true;
    };
  }, []);

  if (latestPosts.length === 0) return null;

  return (
    <div className={styles.carouselContainer}>
      <Swiper
        key={language} 
        modules={[ Pagination, A11y, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 30 },
        }}
      >
        {latestPosts.map((post) => {
          const title = isEn && post.title_en ? post.title_en : post.title;
          const excerpt =
            (isEn && post.excerpt_en
              ? post.excerpt_en
              : post.meta_description) || post.excerpt;

          return (
            <SwiperSlide key={post.id} className={styles.slide}>
              <Link
                to={`/blog/${post.slug}`}
                className={styles.slideLink}
                onMouseEnter={() => setHoveredCard(post.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className={styles.slideContent}>
                  {post.cover_image && (
                    <img
                      src={post.cover_image}
                      alt={title}
                      className={styles.slideImage}
                    />
                  )}
                  <div className={styles.overlay} />
                  <div className={styles.textContainer}>
                    <h3 className={styles.slideTitle}>
                      {title}
                      <span className={styles.arrow}></span>
                    </h3>
                    {hoveredCard === post.id && (
                      <div className={styles.excerptCard}>
                        <p className={styles.excerptText}>{excerpt}</p>
                        <div className={styles.statsRow}>
                          <span>❤️ {post.likes_count ?? 0}</span>
                          <span>👁️ {post.view_count  ?? 0}</span>
                          <span>💬 {post.comments_count ?? 0}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default LatestPostsCarousel;