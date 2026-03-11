import React from 'react';
import Hero from '../components/Hero.jsx';
import FeaturedSection from '../components/FeaturedSection.jsx';

const Home = () => {
  return (
    <div className="relative overflow-hidden bg-[linear-gradient(180deg,#faf7f2_0%,#f8fafc_18%,#ffffff_52%,#f7f3ee_100%)]">
      <Hero />
      <FeaturedSection />
      <section className="px-4 pb-24 md:px-8 lg:px-12 xl:px-20">
        <div className="mx-auto grid max-w-[1500px] gap-6 rounded-[2.4rem] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(247,244,238,0.98))] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] md:grid-cols-3 md:p-8">
          <div className="rounded-[1.8rem] bg-slate-950 px-6 py-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/45">VIP Service</p>
            <h3 className="mt-4 font-serif text-3xl">Reserved for premium travel.</h3>
          </div>
          <div className="rounded-[1.8rem] border border-slate-200 bg-white px-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Discreet</p>
            <p className="mt-3 text-lg leading-8 text-slate-700">Clean interface, fast reservations, and a premium fleet without visual noise.</p>
          </div>
          <div className="rounded-[1.8rem] border border-slate-200 bg-white px-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Tailored</p>
            <p className="mt-3 text-lg leading-8 text-slate-700">Choose dates, contact details, chauffeur preference, and event notes in one booking flow.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
