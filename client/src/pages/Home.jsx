import React, { useMemo, useState } from 'react';
import Hero from '../components/Hero.jsx';
import FeaturedSection from '../components/FeaturedSection.jsx';
import { useAppContext } from '../context/AppContext.jsx';
import { cityCoordinates } from '../assets/assets.js';

const Home = () => {
  const { cars } = useAppContext();
  const [selectedCarId, setSelectedCarId] = useState('');

  const locationInsights = useMemo(() => {
    const carsWithCoordinates = cars
      .filter((car) => car.location)
      .map((car) => {
        const coordinates = car.coordinates?.lat && car.coordinates?.lng
          ? car.coordinates
          : cityCoordinates[car.location] || null;

        return {
          ...car,
          coordinates,
        };
      })
      .filter((car) => car.coordinates?.lat && car.coordinates?.lng);

    const locationCounts = carsWithCoordinates.reduce((accumulator, car) => {
      if (!car.location || !car.coordinates) {
        return accumulator;
      }

      accumulator[car.location] = (accumulator[car.location] || 0) + 1;
      return accumulator;
    }, {});

    const rankedLocations = Object.entries(locationCounts)
      .sort(([, leftCount], [, rightCount]) => rightCount - leftCount)
      .map(([name, count]) => ({ name, count }));

    const latitudes = carsWithCoordinates.map((car) => car.coordinates.lat);
    const longitudes = carsWithCoordinates.map((car) => car.coordinates.lng);
    const minLat = latitudes.length ? Math.min(...latitudes) : 24;
    const maxLat = latitudes.length ? Math.max(...latitudes) : 49;
    const minLng = longitudes.length ? Math.min(...longitudes) : -125;
    const maxLng = longitudes.length ? Math.max(...longitudes) : -66;

    return {
      carsWithCoordinates,
      rankedLocations: rankedLocations.slice(0, 4),
      totalCars: cars.length,
      totalLocations: Object.keys(locationCounts).length || 1,
      bounds: {
        minLat,
        maxLat,
        minLng,
        maxLng,
      },
    };
  }, [cars]);

  const { carsWithCoordinates, rankedLocations, totalCars, totalLocations, bounds } = locationInsights;
  const selectedCar = carsWithCoordinates.find((car) => car._id === selectedCarId) || carsWithCoordinates[0] || null;

  const getMarkerPosition = (coordinates) => {
    const lngRange = Math.max(bounds.maxLng - bounds.minLng, 1);
    const latRange = Math.max(bounds.maxLat - bounds.minLat, 1);
    const left = ((coordinates.lng - bounds.minLng) / lngRange) * 100;
    const top = ((bounds.maxLat - coordinates.lat) / latRange) * 100;

    return {
      left: `${Math.min(Math.max(left, 8), 92)}%`,
      top: `${Math.min(Math.max(top, 10), 90)}%`,
    };
  };

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
                <h3 className="mt-3 font-serif text-3xl text-slate-950">See every car pinned on the map.</h3>
              </div>
              <div className="rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-950">
                {carsWithCoordinates.length || totalCars} live map pins
              </div>
            </div>

            <div className="grid gap-5 p-5 md:grid-cols-[1.2fr_0.8fr]">
              <div className="relative overflow-hidden rounded-[1.6rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_28%),linear-gradient(160deg,#f8fafc_0%,#eef2ff_34%,#fef3c7_100%)]">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:72px_72px]" />
                <div className="pointer-events-none absolute inset-x-10 top-[18%] h-[44%] rounded-[45%] border border-slate-300/45" />
                <div className="pointer-events-none absolute inset-x-16 bottom-[10%] h-[28%] rounded-[40%] border border-slate-300/35" />
                <div className="relative h-[380px] w-full">
                  {carsWithCoordinates.map((car, index) => {
                    const markerPosition = getMarkerPosition(car.coordinates);
                    const isSelected = selectedCar?._id === car._id;

                    return (
                      <button
                        key={car._id || `${car.location}-${index}`}
                        type="button"
                        onClick={() => setSelectedCarId(car._id)}
                        className="absolute -translate-x-1/2 -translate-y-1/2 text-left"
                        style={markerPosition}
                      >
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 border-white shadow-lg transition ${
                          isSelected ? 'scale-110 bg-amber-400' : 'bg-slate-950'
                        }`}>
                          <span className="h-2.5 w-2.5 rounded-full bg-white" />
                        </span>
                        <span className={`mt-2 block rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
                          isSelected ? 'bg-slate-950 text-white' : 'bg-white/92 text-slate-700'
                        }`}>
                          {car.brand} {car.model}
                        </span>
                      </button>
                    );
                  })}

                  <div className="absolute bottom-4 left-4 rounded-2xl bg-white/88 px-4 py-3 text-xs text-slate-600 shadow-sm backdrop-blur">
                    Exact marker positions are based on each car&apos;s saved latitude and longitude.
                  </div>
                </div>
              </div>

              <div className="rounded-[1.6rem] bg-slate-950 px-5 py-5 text-white">
                <p className="text-sm uppercase tracking-[0.24em] text-white/50">Live Coverage</p>
                <p className="mt-3 text-3xl font-semibold">{totalLocations}</p>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Every visible car is placed from its saved coordinates so guests can understand exactly where the fleet is distributed.
                </p>

                {selectedCar ? (
                  <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/45">Selected Car</p>
                    <h4 className="mt-3 text-xl font-semibold">{selectedCar.brand} {selectedCar.model}</h4>
                    <p className="mt-2 text-sm text-white/70">{selectedCar.location}</p>
                    <p className="mt-4 text-sm text-white/80">
                      {selectedCar.coordinates.lat.toFixed(6)}, {selectedCar.coordinates.lng.toFixed(6)}
                    </p>
                    <p className="mt-4 text-sm text-amber-200">
                      {selectedCar.category} • {selectedCar.transmission} • ${selectedCar.pricePerDay}/day
                    </p>
                  </div>
                ) : null}

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
