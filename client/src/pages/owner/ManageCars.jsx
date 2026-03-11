import React, { useCallback, useEffect, useState } from 'react';
import { assets } from '../../assets/assets';
import Title from '../../components/owner/Title';
import { useAppContext } from '../../context/appContext';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import { motion } from 'framer-motion';

const ManageCars = () => {
  const { currency, isOwner, axios } = useAppContext();
  const [cars, setCars] = useState([]);
  const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', confirmText: 'Confirm', variant: 'primary', action: null });
  const [isActionLoading, setIsActionLoading] = useState(false);

  const formatDate = (date) => (date ? new Date(date).toISOString().split('T')[0] : '');

  const fetchOwnerCars = useCallback(async (silent = false) => {
    try {
      const { data } = await axios.get('/api/owner/cars');
      if (data.success) {
        setCars(data.cars);
      } else {
        !silent && toast.error(data.message);
      }
    } catch (error) {
      !silent && toast.error(error.message);
    }
  }, [axios]);

  const toggleAvailability = async (carId) => {
    try {
      const { data } = await axios.post('/api/owner/toggle-cars', { carId });
      if (data.success) {
        toast.success(data.message);
        fetchOwnerCars();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteCar = async (carId) => {
    try {
      const { data } = await axios.post('/api/owner/delete-cars', { carId });
      if (data.success) {
        toast.success(data.message);
        fetchOwnerCars();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const openConfirm = ({ title, message, confirmText, variant, action }) => setConfirmState({ open: true, title, message, confirmText, variant, action });

  const closeConfirm = () => {
    if (isActionLoading) return;
    setConfirmState((prev) => ({ ...prev, open: false, action: null }));
  };

  const handleConfirm = async () => {
    if (!confirmState.action) return;
    setIsActionLoading(true);
    try {
      await confirmState.action();
      setConfirmState((prev) => ({ ...prev, open: false, action: null }));
    } finally {
      setIsActionLoading(false);
    }
  };

  useEffect(() => {
    if (!isOwner) return undefined;
    fetchOwnerCars();
    const intervalId = setInterval(() => fetchOwnerCars(true), 10000);
    return () => clearInterval(intervalId);
  }, [fetchOwnerCars, isOwner]);

  return (
    <div className="min-h-full px-2 py-2 md:px-4">
      <Title
        title="Manage Luxury Fleet"
        subTitle="Oversee visibility, pricing position, and inventory health for every premium vehicle in your showroom."
        eyebrow="Fleet Control"
      />

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <div className="rounded-[1.8rem] border border-white/55 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Inventory</p>
          <p className="mt-3 text-4xl font-semibold text-slate-950">{cars.length}</p>
          <p className="mt-1 text-sm text-slate-500">listed vehicles</p>
        </div>
        <div className="rounded-[1.8rem] border border-white/55 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Visible Now</p>
          <p className="mt-3 text-4xl font-semibold text-emerald-600">{cars.filter((car) => car.isAvailable).length}</p>
          <p className="mt-1 text-sm text-slate-500">ready for new VIP requests</p>
        </div>
        <div className="rounded-[1.8rem] border border-white/55 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Protected</p>
          <p className="mt-3 text-4xl font-semibold text-amber-600">{cars.filter((car) => !car.isAvailable).length}</p>
          <p className="mt-1 text-sm text-slate-500">currently hidden or reserved</p>
        </div>
      </div>

      <div className="mt-6 rounded-[2rem] border border-white/55 bg-white/82 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-4">
        <div className="grid gap-4">
          {cars.map((car, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="grid gap-5 rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] p-5 lg:grid-cols-[1.1fr_0.55fr_0.6fr]"
            >
              <div className="flex gap-4">
                <img src={car.image} alt="" className="h-28 w-32 rounded-[1.4rem] object-cover shadow-sm" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-semibold text-slate-900">{car.brand} {car.model}</h3>
                    <span className="rounded-full bg-slate-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white">{car.category}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{car.location} - {car.year} - {car.transmission}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${car.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {car.isAvailable ? 'Available Now' : 'Unavailable'}
                    </span>
                    {!car.isAvailable && car.unavailableUntil && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Until {formatDate(car.unavailableUntil)}</span>}
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Commercials</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{currency}{car.pricePerDay}</p>
                <p className="text-sm text-slate-500">per day</p>
              </div>

              <div className="flex flex-col justify-between gap-3">
                <button
                  type="button"
                  onClick={() => openConfirm({
                    title: car.isAvailable ? 'Hide this car from bookings?' : 'Make this car visible again?',
                    message: car.isAvailable ? `Guests will not see ${car.brand} ${car.model} until you restore visibility.` : `${car.brand} ${car.model} will be returned to the public luxury inventory.`,
                    confirmText: car.isAvailable ? 'Hide Car' : 'Show Car',
                    variant: 'warning',
                    action: () => toggleAvailability(car._id),
                  })}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                >
                  <img src={car.isAvailable ? assets.eye_close_icon : assets.eye_icon} alt="" className="h-4 w-4" />
                  {car.isAvailable ? 'Hide from Search' : 'Restore Visibility'}
                </button>
                <button
                  type="button"
                  onClick={() => openConfirm({
                    title: 'Remove this premium listing?',
                    message: `${car.brand} ${car.model} will be removed from active inventory and no longer appear for bookings.`,
                    confirmText: 'Remove Listing',
                    variant: 'danger',
                    action: () => deleteCar(car._id),
                  })}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                >
                  <img src={assets.delete_icon} alt="" className="h-4 w-4" />
                  Remove Listing
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        variant={confirmState.variant}
        onClose={closeConfirm}
        onConfirm={handleConfirm}
        loading={isActionLoading}
      />
    </div>
  );
};

export default ManageCars;
