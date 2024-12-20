import { Image } from "../types/global.ts";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/scrollbar";
import { A11y, Navigation, Pagination, Scrollbar } from "swiper/modules";

interface ProductGalleryProps {
  images: Image[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  return (
    <Swiper
      modules={[Navigation, Scrollbar]}
      spaceBetween={50}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
      scrollbar={{ draggable: true }}
      onSwiper={(swiper) => console.log(swiper)}
      onSlideChange={() => console.log("slide change")}
    >
      {images.map((image, index) => (
        <SwiperSlide>
          <img
            src={`http://localhost:5000/static/${image.url}`}
            alt="Product image"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
