import React, { useMemo, useState } from 'react';
import Title from '../../components/owner/Title';
import { assets } from '../../assets/assets';
import toast from 'react-hot-toast';
import { useAppContext } from '../../context/AppContext';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import { motion } from 'framer-motion';

const AddCar = () => {
  const { currency, axios } = useAppContext();

  const [image, setImage] = useState(null);
  const [car, setCar] = useState({
    brand: '',
    model: '',
    year: 0,
    pricePerDay: 0,
    category: '',
    transmission: '',
    fuel_type: '',
    seating_capacity: 0,
    location: '',
    coordinates: {
      lat: null,
      lng: null,
    },
    description: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const mapQuery = useMemo(() => {
    if (Number.isFinite(car.coordinates?.lat) && Number.isFinite(car.coordinates?.lng)) {
      return `${car.coordinates.lat},${car.coordinates.lng}`;
    }

    return car.location || 'India';
  }, [car.coordinates?.lat, car.coordinates?.lng, car.location]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Location access is not supported in this browser');
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCar((currentCar) => ({
          ...currentCar,
          coordinates: {
            lat: Number(coords.latitude.toFixed(6)),
            lng: Number(coords.longitude.toFixed(6)),
          },
        }));
        setIsDetectingLocation(false);
        toast.success('Current map location captured');
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

  const submitCar = async () => {
    if (isLoading) return null;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('carData', JSON.stringify(car));

      const { data } = await axios.post('/api/owner/add-car', formData);
      if (data.success) {
        toast.success(data.message);
        setCar({
          brand: '',
          model: '',
          year: 0,
          pricePerDay: 0,
          category: '',
          transmission: '',
          fuel_type: '',
          seating_capacity: 0,
          location: '',
          coordinates: {
            lat: null,
            lng: null,
          },
          description: '',
        });
        setImage(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!Number.isFinite(car.coordinates?.lat) || !Number.isFinite(car.coordinates?.lng)) {
      toast.error('Use current location on the map before publishing the car');
      return;
    }

    setShowConfirm(true);
  };

  const fieldClassName = 'mt-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100';

  return (
    <div className="min-h-full px-2 py-2 md:px-4">
      <Title
        title="Add a Flagship Vehicle"
        subTitle="Design a premium listing with strong visuals, precise pricing, and polished details that match a VIP-only rental experience."
        eyebrow="Fleet Expansion"
      />

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_0.75fr]">
        <motion.form
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={onSubmitHandler}
          className="rounded-[2rem] border border-white/55 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Vehicle Media</p>
              <div className="mt-4 flex flex-col gap-4 rounded-[1.7rem] border border-dashed border-slate-300 bg-slate-50/80 p-5 md:flex-row md:items-center">
                <label htmlFor="car-image" className="cursor-pointer">
                  <img
                    src={image ? URL.createObjectURL(image) : assets.upload_icon}
                    alt=""
                    className="h-28 w-28 rounded-[1.5rem] border border-slate-200 bg-white object-cover p-3 shadow-sm"
                  />
                  <input type="file" id="car-image" accept="image/*" hidden onChange={(e) => setImage(e.target.files[0])} />
                </label>
                <div>
                  <p className="text-lg font-semibold text-slate-900">Upload a hero image</p>
                  <p className="mt-1 max-w-md text-sm leading-7 text-slate-500">
                    Use a premium front-three-quarter shot. A strong image materially improves VIP conversion.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Brand</label>
              <input type="text" required placeholder="Rolls-Royce, Bentley, Porsche..." className={fieldClassName} value={car.brand} onChange={(e) => setCar({ ...car, brand: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Model</label>
              <input type="text" required placeholder="Cullinan, Continental GT, 911..." className={fieldClassName} value={car.model} onChange={(e) => setCar({ ...car, model: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Year</label>
              <input type="number" required placeholder="2025" className={fieldClassName} value={car.year} onChange={(e) => setCar({ ...car, year: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Daily Price ({currency})</label>
              <input type="number" required placeholder="1500" className={fieldClassName} value={car.pricePerDay} onChange={(e) => setCar({ ...car, pricePerDay: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Category</label>
              <select onChange={(e) => setCar({ ...car, category: e.target.value })} value={car.category} className={fieldClassName}>
                <option value="">Select category</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Van">Van</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Transmission</label>
              <select onChange={(e) => setCar({ ...car, transmission: e.target.value })} value={car.transmission} className={fieldClassName}>
                <option value="">Select transmission</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
                <option value="Semi-Automatic">Semi-Automatic</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Fuel Type</label>
              <select onChange={(e) => setCar({ ...car, fuel_type: e.target.value })} value={car.fuel_type} className={fieldClassName}>
                <option value="">Select fuel type</option>
                <option value="Gas">Gas</option>
                <option value="Diesel">Diesel</option>
                <option value="Petrol">Petrol</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Seating Capacity</label>
              <input type="number" required placeholder="4" className={fieldClassName} value={car.seating_capacity} onChange={(e) => setCar({ ...car, seating_capacity: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Location</label>
              <input
                type="text"
                required
                placeholder="Enter city or area name"
                className={fieldClassName}
                value={car.location}
                onChange={(e) => setCar({ ...car, location: e.target.value })}
              />
              <div className="mt-4 grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
                <div className="rounded-[1.7rem] border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-sm font-semibold text-slate-900">Choose on map with current location</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Use your device GPS to pin the car's exact position. This gives the homepage map proper coordinates to show where the car is located.
                  </p>
                  <button
                    type="button"
                    onClick={useCurrentLocation}
                    disabled={isDetectingLocation}
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isDetectingLocation ? 'Detecting Location...' : 'Use Current Location'}
                  </button>

                  <div className="mt-4 rounded-[1.3rem] border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
                    <p className="font-medium text-slate-900">Saved coordinates</p>
                    <p className="mt-2">Latitude: {Number.isFinite(car.coordinates?.lat) ? car.coordinates.lat : 'Not selected yet'}</p>
                    <p className="mt-1">Longitude: {Number.isFinite(car.coordinates?.lng) ? car.coordinates.lng : 'Not selected yet'}</p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-sm">
                  <iframe
                    title="Car location preview map"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=13&output=embed`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-[320px] w-full border-0"
                  />
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea rows={6} required placeholder="Describe the comfort, performance, exclusivity, and ideal VIP use case." className={fieldClassName} value={car.description} onChange={(e) => setCar({ ...car, description: e.target.value })} />
            </div>
          </div>

          <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            <img src={assets.tick_icon} alt="" />
            {isLoading ? 'Publishing...' : 'Publish Luxury Listing'}
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="rounded-[2rem] border border-white/55 bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#172554] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Listing Blueprint</p>
          <h3 className="mt-2 text-2xl font-semibold">Premium presentation tips</h3>
          <div className="mt-6 space-y-4">
            {[
              'Lead with prestige brands, trim story, and comfort details.',
              'Set pricing to reflect exclusivity, not volume discounting.',
              'Use city-specific positioning for chauffeur, event, and VIP transfer demand.',
            ].map((tip) => (
              <div key={tip} className="rounded-[1.4rem] border border-white/10 bg-white/8 p-4 text-sm leading-7 text-white/75">
                {tip}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-[1.6rem] border border-amber-300/20 bg-amber-300/10 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">Preview Tone</p>
            <p className="mt-2 text-lg font-medium text-white">Only for guests who expect presence, comfort, and arrival impact.</p>
          </div>
        </motion.div>
      </div>

      <ConfirmModal
        open={showConfirm}
        title="Publish this car listing?"
        message="The vehicle will go live in your premium inventory and become visible to high-value renters on the platform."
        confirmText="Publish Listing"
        variant="primary"
        onClose={() => !isLoading && setShowConfirm(false)}
        onConfirm={submitCar}
        loading={isLoading}
      />
    </div>
  );
};

export default AddCar;
