import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { PostListItem } from "../../types/blog";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import baseStyles from "./CarouselBase.module.css";
import cardStyles from "./PopularBlogsCarousel.module.css";
import { blogService } from "../../services/api";
import { useLanguageTheme } from "../../contexts/LanguageThemeContext";

const PopularBlogsCarousel: React.FC = () => {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const { language } = useLanguageTheme();
  const isEn = language === "en";

  useEffect(() => {
    blogService.getPopularPosts(10).then(setPosts).catch(console.error);
  }, []);

  if (posts.length === 0) return null;

  return (
    <div className={baseStyles.carouselContainer}>
      <Swiper
        key={language}
        modules={[Navigation, Pagination, A11y, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 30 },
        }}
      >
        {posts.map((post) => {
          const title = isEn && post.title_en ? post.title_en : post.title;
          const excerpt = (isEn && post.excerpt_en ? post.excerpt_en : post.meta_description) || post.excerpt;

          return (
            <SwiperSlide key={post.id} className={baseStyles.slide}>
              <Link
                to={`/blog/${post.slug}`}
                className={baseStyles.slideLink}
                onMouseEnter={() => setHoveredId(post.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className={baseStyles.slideContent}>
                  {post.cover_image && (
                    <img
                      src={post.cover_image}
                      alt={title}
                      className={baseStyles.slideImage}
                    />
                  )}
                  <div className={baseStyles.overlay} />
                  <div className={baseStyles.textContainer}>
                    <h3 className={baseStyles.slideTitle}>{title}</h3>
                    {hoveredId === post.id && (
                      <div className={cardStyles.excerptCard}>
                        <p className={cardStyles.excerptText}>{excerpt}</p>
                        <div className={cardStyles.statsRow}>
                          <span>❤️ {post.likes_count ?? 0}</span>
                          <span>👁️ {post.view_count ?? 0}</span>
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

export default PopularBlogsCarousel;