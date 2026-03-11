import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import 'swiper/css';

const showcaseCars = [
  {
    name: 'Tesla Model S',
    description: 'A sleek all-electric luxury sedan built for long-range comfort, fast acceleration, and premium everyday travel.',
    image: assets.main_car,
  },
  {
    name: 'Jaguar F-Type R',
    description: 'A dramatic performance coupe with sharp styling, quick response, and a driving experience made for enthusiasts.',
    image: assets.car_image1,
  },
  {
    name: 'Range Rover Sport',
    description: 'A refined high-performance SUV that blends road presence, premium comfort, and confident long-distance capability.',
    image: assets.car_image3,
  },
  {
    name: 'Maserati GranTurismo',
    description: 'An elegant grand tourer designed for style-first arrivals, powerful cruising, and unmistakable Italian character.',
    image: assets.car_image4,
  },
  {
    name: 'Mercedes S-Class',
    description: 'A flagship luxury sedan focused on quiet cabin comfort, executive detail, and a first-class passenger experience.',
    image: assets.car_image2,
  },
];

const FeaturedSection = () => {
  const navigate = useNavigate();
  const swiperRef = useRef(null);

  return (
    <section className="px-4 py-24 md:px-8 lg:px-12 xl:px-20">
      <div className="mx-auto max-w-[1500px]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-[2.6rem] border border-white/55 bg-[linear-gradient(135deg,rgba(255,255,255,0.85),rgba(242,248,255,0.88),rgba(255,248,241,0.9))] px-5 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl md:px-8 md:py-10"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-slate-500">Arrive In Style</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                Choose from our prestigious collection of world-class vehicles.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
                Explore an editorial-style showcase of premium sedans, coupes, and SUVs designed for standout arrivals.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start lg:self-auto">
              <button
                type="button"
                onClick={() => swiperRef.current?.slidePrev()}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                aria-label="Previous cars"
              >
                <img src={assets.arrow_icon} alt="" className="h-4 w-4 rotate-180 opacity-80" />
              </button>
              <button
                type="button"
                onClick={() => swiperRef.current?.slideNext()}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-white shadow-[0_14px_32px_rgba(15,23,42,0.18)] transition hover:bg-slate-800"
                aria-label="Next cars"
              >
                <img src={assets.arrow_icon} alt="" className="h-4 w-4 invert" />
              </button>
            </div>
          </div>

          <div className="mt-10">
            <Swiper
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              spaceBetween={20}
              speed={700}
              slidesPerView={1.1}
              breakpoints={{
                480: { slidesPerView: 1.35 },
                640: { slidesPerView: 2 },
                900: { slidesPerView: 3 },
                1200: { slidesPerView: 4 },
              }}
            >
              {showcaseCars.map((car, index) => (
                <SwiperSlide key={car.name}>
                  <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.04 }}
                    className="flex h-full flex-col rounded-[2rem] border border-slate-200/80 bg-white/92 p-5 text-center shadow-[0_16px_50px_rgba(15,23,42,0.06)]"
                  >
                    <div className="flex min-h-[190px] items-center justify-center rounded-[1.6rem] bg-[linear-gradient(180deg,#f8fafc_0%,#eef4ff_100%)] p-4">
                      <img
                        src={car.image}
                        alt={car.name}
                        className="h-[130px] w-full object-contain object-center drop-shadow-[0_24px_35px_rgba(15,23,42,0.16)] md:h-[150px]"
                      />
                    </div>

                    <div className="mt-6 flex flex-1 flex-col">
                      <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
                        {car.name}
                      </h3>
                      <p className="mt-4 text-sm leading-7 text-slate-600">
                        {car.description}
                      </p>
                    </div>
                  </motion.article>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <div className="mt-10 flex justify-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                navigate('/cars');
                window.scrollTo(0, 0);
              }}
              className="inline-flex items-center justify-center gap-3 rounded-full bg-emerald-600 px-8 py-3 text-sm font-semibold text-white shadow-[0_16px_45px_rgba(5,150,105,0.22)] transition hover:bg-emerald-700"
            >
              View All Vehicles
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedSection;
