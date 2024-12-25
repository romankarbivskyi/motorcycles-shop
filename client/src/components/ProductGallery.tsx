import { Image } from "../global/types.ts";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/scrollbar";
import { Navigation, Scrollbar } from "swiper/modules";

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
      className="flex-1"
    >
      {images.map((image, index) => (
        <SwiperSlide>
          <div className="p-10">
            <img
              src={`http://localhost:5000/static/${image.url}`}
              alt="Product image"
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
