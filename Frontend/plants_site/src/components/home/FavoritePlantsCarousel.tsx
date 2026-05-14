import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import baseStyles from "./CarouselBase.module.css";
import cardStyles from "./FavoritePlantsCarousel.module.css";
import { plantService } from "../../services/api";
import { useLanguageTheme } from "../../contexts/LanguageThemeContext";
import type { Plant } from "../../types";

const FavoritePlantsCarousel: React.FC = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const { language } = useLanguageTheme();
  const isEn = language === "en";

  useEffect(() => {
    plantService.getFavoritePlants(10).then(setPlants).catch(console.error);
  }, []);

  if (plants.length === 0) return null;

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
        {plants.map((plant) => {
          const name = isEn ? plant.english_name || plant.farsi_name : plant.farsi_name;
          const toxicity = plant.is_toxic
            ? isEn ? "Toxic" : "سمی"
            : isEn ? "Non‑toxic" : "غیرسمی";
          const difficulty = plant.care_difficulty_display?.[language] || plant.care_difficulty;

          return (
            <SwiperSlide key={plant.id} className={baseStyles.slide}>
              <Link to={`/plant/${plant.id}`} className={baseStyles.slideLink}>
                <div className={baseStyles.slideContent}>
                  {plant.primary_image ? (
                    <img src={plant.primary_image} alt={name} className={baseStyles.slideImage} />
                  ) : (
                    <div className={cardStyles.placeholderImage}>🌿</div>
                  )}
                  <div className={baseStyles.overlay} />
                  <div className={baseStyles.textContainer}>
                    <h3 className={baseStyles.slideTitle}>{name}</h3>
                    <div className={cardStyles.infoRow}>
                      <span className={cardStyles.difficulty}>{difficulty}</span>
                      <span className={cardStyles.toxicity}>{toxicity}</span>
                    </div>
                    <div className={cardStyles.stats}>
                      <span>❤️ {plant.favourite_count}</span>
                      <span>👁️ {plant.view_count}</span>
                    </div>
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

export default FavoritePlantsCarousel;