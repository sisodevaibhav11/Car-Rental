import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { assets } from '../../assets/assets';
import Title from '../../components/owner/Title';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal.jsx';

const ManageCars = () => {
  const { currency, isOwner, axios } = useAppContext();
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', confirmText: 'Confirm', variant: 'primary', action: null });
  const [isActionLoading, setIsActionLoading] = useState(false);
  const isListed = (car) => car.isListed !== false;
  const visibleCars = useMemo(() => cars.filter((car) => isListed(car)).length, [cars]);
  const protectedCars = useMemo(() => cars.filter((car) => !isListed(car) || !car.isAvailable).length, [cars]);

  const formatDate = (date) => (date ? new Date(date).toISOString().split('T')[0] : '');

  const fetchOwnerCars = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      }

      const { data } = await axios.get('/api/owner/cars');
      if (data.success) {
        setCars(data.cars);
      } else {
        !silent && toast.error(data.message);
      }
    } catch (error) {
      !silent && toast.error(error.message);
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
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
  }, [fetchOwnerCars, isOwner]);

  return (
    <div className="min-h-full px-2 py-2 md:px-4">
      <Title
        title="Manage Cars"
        subTitle="View your cars, check status, and control whether customers can see them."
        eyebrow="Cars"
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-sm">
          {isLoading ? 'Loading fleet...' : `${cars.length} cars in your owner account`}
        </div>
        <button
          type="button"
          onClick={() => fetchOwnerCars()}
          disabled={isLoading}
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Refreshing...' : 'Refresh list'}
        </button>
      </div>

      <div className="mt-4 grid gap-5 md:grid-cols-3">
        <div className="rounded-[1.8rem] border border-white/55 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Total Cars</p>
          <p className="mt-3 text-4xl font-semibold text-slate-950">{isLoading ? '...' : cars.length}</p>
          <p className="mt-1 text-sm text-slate-500">cars added</p>
        </div>
        <div className="rounded-[1.8rem] border border-white/55 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Visible Cars</p>
          <p className="mt-3 text-4xl font-semibold text-emerald-600">{isLoading ? '...' : visibleCars}</p>
          <p className="mt-1 text-sm text-slate-500">shown to customers</p>
        </div>
        <div className="rounded-[1.8rem] border border-white/55 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Hidden Or Unavailable</p>
          <p className="mt-3 text-4xl font-semibold text-amber-600">{isLoading ? '...' : protectedCars}</p>
          <p className="mt-1 text-sm text-slate-500">hidden or unavailable</p>
        </div>
      </div>

      <div className="mt-6 rounded-[2rem] border border-white/55 bg-white/82 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-4">
        <div className="grid gap-4">
          {!isLoading && cars.length === 0 && (
            <div className="rounded-[1.8rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
              No cars found yet. Add your first car to start receiving bookings.
            </div>
          )}
          {cars.map((car, index) => (
            <div
              key={index}
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
                  <p className="mt-2 text-sm text-slate-500">Main action: decide if customers should see this car.</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isListed(car) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                      {isListed(car) ? 'Visible' : 'Hidden'}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${car.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {car.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                    {car.unavailableUntil && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Until {formatDate(car.unavailableUntil)}</span>}
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Price</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{currency}{car.pricePerDay}</p>
                <p className="text-sm text-slate-500">per day</p>
              </div>

              <div className="flex flex-col justify-between gap-3">
                <button
                  type="button"
                  onClick={() => openConfirm({
                    title: isListed(car) ? 'Hide this car?' : 'Show this car?',
                    message: isListed(car) ? `${car.brand} ${car.model} will not be shown to customers.` : `${car.brand} ${car.model} will be shown to customers again.`,
                    confirmText: isListed(car) ? 'Hide Car' : 'Show Car',
                    variant: 'warning',
                    action: () => toggleAvailability(car._id),
                  })}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                >
                  <img src={isListed(car) ? assets.eye_close_icon : assets.eye_icon} alt="" className="h-4 w-4" />
                  {isListed(car) ? 'Hide from customers' : 'Show to customers'}
                </button>
                <button
                  type="button"
                  onClick={() => openConfirm({
                    title: 'Delete this car?',
                    message: `${car.brand} ${car.model} will be removed from your list.`,
                    confirmText: 'Delete Car',
                    variant: 'danger',
                    action: () => deleteCar(car._id),
                  })}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                >
                  <img src={assets.delete_icon} alt="" className="h-4 w-4" />
                  Delete listing
                </button>
              </div>
            </div>
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
