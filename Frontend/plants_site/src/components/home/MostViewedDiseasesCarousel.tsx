import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import baseStyles from "./CarouselBase.module.css";
import cardStyles from "./MostViewedDiseasesCarousel.module.css";
import { diseaseService } from "../../services/api";
import { useLanguageTheme } from "../../contexts/LanguageThemeContext";
import type { Disease } from "../../types";

const MostViewedDiseasesCarousel: React.FC = () => {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const { language } = useLanguageTheme();
  const isEn = language === "en";

  useEffect(() => {
    diseaseService.getMostViewedDiseases(10).then(setDiseases).catch(console.error);
  }, []);

  if (diseases.length === 0) return null;

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
        {diseases.map((disease) => {
          const name = isEn ? disease.name : disease.name_fa || disease.name;
          const severity = disease.severity_level;
          const severityLabel =
            severity === "low"
              ? isEn ? "Low" : "کم"
              : severity === "medium"
              ? isEn ? "Medium" : "متوسط"
              : severity === "high"
              ? isEn ? "High" : "زیاد"
              : severity === "critical"
              ? isEn ? "Critical" : "بحرانی"
              : "";

          return (
            <SwiperSlide key={disease.id} className={baseStyles.slide}>
              <Link to={`/disease/${disease.id}`} className={baseStyles.slideLink}>
                <div className={baseStyles.slideContent}>
                  {disease.image ? (
                    <img
                      src={disease.image}
                      alt={name}
                      className={baseStyles.slideImage}
                    />
                  ) : (
                    <div className={cardStyles.diseaseBackground}>
                      <span className={cardStyles.diseaseIcon}>🦠</span>
                    </div>
                  )}
                  <div className={baseStyles.overlay} />
                  <div className={baseStyles.textContainer}>
                    <h3 className={baseStyles.slideTitle}>{name}</h3>
                    <div className={cardStyles.infoRow}>
                      <span className={cardStyles.severityBadge}>{severityLabel}</span>
                    </div>
                    <div className={cardStyles.stats}>
                      <span>👁️ {disease.view_count}</span>
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

export default MostViewedDiseasesCarousel;