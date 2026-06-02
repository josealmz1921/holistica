"use client";

import Slider from "react-slick";
import Image from "next/image";

import styles from "./imageCarousel.module.css";


import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface ImageCarouselProps {
  images: string[];
}

export default function ImageCarousel({
  images,
}: ImageCarouselProps) {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    arrows: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  return (
    <div className={styles.carousel}>
      <Slider {...settings}>
        {images.map((image, index) => (
          <div key={index}>
            <div className={styles.imageWrapper}>
              <Image
                src={image}
                alt={`Imagen ${index + 1}`}
                fill
                className={styles.image}
                sizes="100vw"
              />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}