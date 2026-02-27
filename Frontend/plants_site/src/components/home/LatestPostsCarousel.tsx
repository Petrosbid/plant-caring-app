// src/components/home/LatestPostsCarousel.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import type { PostListItem } from '../../types/blog';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import styles from './LatestPostsCarousel.module.css';

const LatestPostsCarousel: React.FC = () => {
  const [latestPosts, setLatestPosts] = useState<PostListItem[]>([]);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const response = await axios.get('/api/blog/posts/latest/');
        setLatestPosts(response.data);
      } catch (error) {
        console.error("Failed to fetch latest posts:", error);
      }
    };
    fetchLatest();
  }, []);

  if (latestPosts.length === 0) {
    return null; // Don't render anything if there are no posts
  }

  return (
    <div className={styles.carouselContainer}>
      <Swiper
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
        {latestPosts.map(post => (
          <SwiperSlide key={post.id} className={styles.slide}>
            <Link to={`/blog/${post.slug}`} className={styles.slideLink}>
              <div className={styles.slideContent}>
                {post.cover_image && <img src={post.cover_image} alt={post.title} className={styles.slideImage} />}
                <div className={styles.overlay}></div>
                <div className={styles.textContainer}>
                  <h3 className={styles.slideTitle}>{post.title}</h3>
                  <span className={styles.readMore}>Read More &rarr;</span>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default LatestPostsCarousel;
