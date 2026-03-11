import React, { useState } from 'react';
import { assets, cityList } from '../assets/assets';
import { useAppContext } from '../context/appContext';
import { motion } from 'framer-motion';

const Hero = () => {
  const [pickupLocation, setPickupLocation] = useState('');
  const { navigate, pickupDate, setPickupDate, returnDate, setReturnDate } = useAppContext();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/cars?pickupLocation=' + pickupLocation + '&pickupDate=' + pickupDate + '&returnDate=' + returnDate);
  };

  return (
    <section className="relative isolate overflow-hidden px-4 pb-18 pt-6 md:px-8 lg:px-12 xl:px-20">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[-8%] top-[-14%] h-[360px] w-[360px] rounded-full bg-amber-300/35 blur-3xl" />
        <div className="absolute right-[-10%] top-[12%] h-[420px] w-[420px] rounded-full bg-cyan-300/25 blur-3xl" />
        <div className="absolute bottom-[-14%] left-[22%] h-[320px] w-[320px] rounded-full bg-rose-300/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-[1500px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="relative overflow-hidden rounded-[2.4rem] border border-white/60 shadow-[0_30px_120px_rgba(15,23,42,0.18)]"
        >
          <img
            src={assets.hero_all_exotic_vehicles}
            alt="Exotic and luxury rental vehicles"
            className="h-[250px] w-full object-cover object-center md:h-[360px] xl:h-[430px]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.88)_0%,rgba(2,6,23,0.55)_42%,rgba(2,6,23,0.18)_72%,rgba(2,6,23,0.08)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.2),transparent_24%)]" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/25 to-transparent" />

          <div className="absolute inset-0 flex items-end p-6 md:p-10 xl:p-14">
            <div className="max-w-3xl text-white">
              <div className="inline-flex rounded-full border border-white/20 bg-black/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-white/90 backdrop-blur">
                VIP Mobility
              </div>

              <h1 className="mt-5 max-w-4xl font-serif text-4xl leading-[1.02] tracking-tight md:text-6xl xl:text-7xl">
                A simpler way to book premium cars.
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/80 md:text-lg">
                Luxury vehicles, discreet service, and an elegant booking experience for business, events, and private travel.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="relative z-10 mx-auto -mt-10 max-w-[1180px]"
        >
          <div className="rounded-[2rem] border border-white/70 bg-white/92 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-6">
            <form onSubmit={handleSearch} className="grid gap-4 xl:grid-cols-[1.2fr_1fr_1fr_auto]">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Pickup city</span>
                <select
                  required
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                >
                  <option value="">Select city</option>
                  {cityList.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Pickup date</span>
                <input
                  type="date"
                  value={pickupDate || ''}
                  onChange={(e) => setPickupDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                  required
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Return date</span>
                <input
                  type="date"
                  value={returnDate || ''}
                  onChange={(e) => setReturnDate(e.target.value)}
                  min={pickupDate || new Date().toISOString().split('T')[0]}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                  required
                />
              </label>

              <div className="flex items-end">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 text-sm font-semibold uppercase tracking-[0.18em] text-white xl:w-auto"
                >
                  <img src={assets.search_icon} alt="search" className="h-4 w-4 invert" />
                  Search
                </motion.button>
              </div>
            </form>

            <div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
              <div className="rounded-[1.4rem] bg-slate-50 px-4 py-3">Curated premium fleet</div>
              <div className="rounded-[1.4rem] bg-slate-50 px-4 py-3">Driver option during booking</div>
              <div className="rounded-[1.4rem] bg-slate-50 px-4 py-3">Simple, private reservation flow</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
