import React, { useMemo } from 'react';
import Hero from '../components/Hero.jsx';
import FeaturedSection from '../components/FeaturedSection.jsx';
import { useAppContext } from '../context/AppContext.jsx';
import { cityCoordinates } from '../assets/assets.js';

const Home = () => {
  const { cars, locations } = useAppContext();

  const locationInsights = useMemo(() => {
    const locationCounts = cars.reduce((accumulator, car) => {
      if (!car.location) {
        return accumulator;
      }

      accumulator[car.location] = (accumulator[car.location] || 0) + 1;
      return accumulator;
    }, {});

    const rankedLocations = Object.entries(locationCounts)
      .sort(([, leftCount], [, rightCount]) => rightCount - leftCount)
      .map(([name, count]) => {
        const liveLocation = locations.find((location) => location.name === name);
        const coordinates = liveLocation?.coordinates || cityCoordinates[name];

        return {
          name,
          count,
          coordinates,
        };
      });

    const primaryLocation = rankedLocations[0] || {
      name: 'New York',
      count: 0,
      coordinates: cityCoordinates['New York'],
    };

    return {
      primaryLocation,
      rankedLocations: rankedLocations.slice(0, 4),
      totalCars: cars.length,
      totalLocations: Object.keys(locationCounts).length || locations.length || 1,
    };
  }, [cars, locations]);

  const { primaryLocation, rankedLocations, totalCars, totalLocations } = locationInsights;
  const mapQuery = primaryLocation.coordinates
    ? `${primaryLocation.coordinates.lat},${primaryLocation.coordinates.lng}`
    : primaryLocation.name;

  return (
    <div className="relative overflow-hidden bg-[linear-gradient(180deg,#faf7f2_0%,#f8fafc_18%,#ffffff_52%,#f7f3ee_100%)]">
      <Hero />
      <FeaturedSection />
      <section className="px-4 pb-24 md:px-8 lg:px-12 xl:px-20">
        <div className="mx-auto max-w-[1500px] rounded-[2.4rem] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(247,244,238,0.98))] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] lg:p-8">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">Car Location</p>
                <h3 className="mt-3 font-serif text-3xl text-slate-950">Find where your next ride is waiting.</h3>
              </div>
              <div className="rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-950">
                {primaryLocation.count || totalCars} cars near {primaryLocation.name}
              </div>
            </div>

            <div className="grid gap-5 p-5 md:grid-cols-[1.2fr_0.8fr]">
              <div className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-slate-100">
                <iframe
                  title={`Map showing cars near ${primaryLocation.name}`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=12&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-[320px] w-full border-0"
                />
              </div>

              <div className="rounded-[1.6rem] bg-slate-950 px-5 py-5 text-white">
                <p className="text-sm uppercase tracking-[0.24em] text-white/50">Live Coverage</p>
                <p className="mt-3 text-3xl font-semibold">{totalLocations}</p>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Active pickup zones are synced with the fleet so guests can spot the nearest handoff point before they book.
                </p>

                <div className="mt-6 space-y-3">
                  {rankedLocations.map((location) => (
                    <div
                      key={location.name}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <div>
                        <p className="text-base font-medium">{location.name}</p>
                        <p className="text-xs uppercase tracking-[0.24em] text-white/45">Ready for pickup</p>
                      </div>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-sm">{location.count} cars</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
