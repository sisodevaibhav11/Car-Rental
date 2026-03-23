import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { assets, cityCoordinates, cityList } from '../assets/assets';
import { useAppContext } from '../context/AppContext';

const Hero = () => {
  const [pickupLocation, setPickupLocation] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const { navigate, pickupDate, setPickupDate, returnDate, setReturnDate, locations } = useAppContext();

  const availableLocations = useMemo(() => {
    if (locations.length > 0) {
      return locations;
    }

    return cityList.map((name) => ({
      name,
      coordinates: cityCoordinates[name] || null,
    }));
  }, [locations]);

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(`/cars?pickupLocation=${pickupLocation}&pickupDate=${pickupDate}&returnDate=${returnDate}`);
  };

  const calculateDistance = (first, second) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const latDiff = toRad(second.lat - first.lat);
    const lngDiff = toRad(second.lng - first.lng);
    const a =
      Math.sin(latDiff / 2) ** 2 +
      Math.cos(toRad(first.lat)) * Math.cos(toRad(second.lat)) * Math.sin(lngDiff / 2) ** 2;

    return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Location access is not supported in this browser');
      return;
    }

    if (availableLocations.length === 0) {
      toast.error('No live rental locations are available right now');
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const matchesWithCoordinates = availableLocations.filter((location) => location.coordinates?.lat && location.coordinates?.lng);
        if (matchesWithCoordinates.length === 0) {
          setIsDetectingLocation(false);
          toast.error('Live location matching is unavailable for current inventory');
          return;
        }

        const nearestLocation = matchesWithCoordinates.reduce((nearest, location) => {
          const distance = calculateDistance(
            { lat: coords.latitude, lng: coords.longitude },
            location.coordinates
          );

          if (!nearest || distance < nearest.distance) {
            return { ...location, distance };
          }

          return nearest;
        }, null);

        if (nearestLocation?.name) {
          setPickupLocation(nearestLocation.name);
          toast.success(`Nearest rental location selected: ${nearestLocation.name}`);
        } else {
          toast.error('Unable to match your current location');
        }

        setIsDetectingLocation(false);
      },
      (error) => {
        setIsDetectingLocation(false);
        toast.error(error.message || 'Unable to detect your current location');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  return (
    <section className="px-4 pb-8 pt-6 md:px-8 lg:px-12 xl:px-20">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <img
            src={assets.hero_all_exotic_vehicles}
            alt="Exotic and luxury rental vehicles"
            className="h-[220px] w-full object-cover object-center md:h-[320px]"
          />

          <div className="grid gap-6 p-6 md:p-8">
            <div>
              <p className="text-sm font-medium text-slate-500">Car Rental Demo</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                Book a car in a simple and clear flow.
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Search by city and dates, choose a car, complete the booking form, and track the booking status in one place.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-5xl">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <form onSubmit={handleSearch} className="grid gap-4 xl:grid-cols-[1.2fr_1fr_1fr_auto]">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Pickup city</span>
                <div className="mt-2 space-y-2">
                  <select
                    required
                    value={pickupLocation}
                    onChange={(event) => setPickupLocation(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                  >
                    <option value="">Select city</option>
                    {availableLocations.map((location) => (
                      <option key={location.name} value={location.name}>{location.name}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={useCurrentLocation}
                    disabled={isDetectingLocation}
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isDetectingLocation ? 'Detecting Location...' : 'Use My Current Location'}
                  </button>
                </div>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Pickup date</span>
                <input
                  type="date"
                  value={pickupDate || ''}
                  onChange={(event) => setPickupDate(event.target.value)}
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
                  onChange={(event) => setReturnDate(event.target.value)}
                  min={pickupDate || new Date().toISOString().split('T')[0]}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                  required
                />
              </label>

              <div className="flex items-end">
                <button className="inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 xl:w-auto">
                  <img src={assets.search_icon} alt="search" className="h-4 w-4 invert" />
                  Search
                </button>
              </div>
            </form>

            <div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
              <div className="rounded-[1.4rem] bg-slate-50 px-4 py-3">Simple search</div>
              <div className="rounded-[1.4rem] bg-slate-50 px-4 py-3">Clear booking form</div>
              <div className="rounded-[1.4rem] bg-slate-50 px-4 py-3">Easy booking tracking</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
