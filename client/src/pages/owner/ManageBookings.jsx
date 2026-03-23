import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Title from '../../components/owner/Title';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal.jsx';

const ManageBookings = () => {
  const { currency, axios, fetchCars } = useAppContext();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', confirmText: 'Confirm', variant: 'primary', bookingId: null, status: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const pendingCount = useMemo(() => bookings.filter((booking) => booking.status === 'pending').length, [bookings]);
  const confirmedCount = useMemo(() => bookings.filter((booking) => booking.status === 'confirmed').length, [bookings]);
  const projectedRevenue = useMemo(() => bookings.reduce((total, booking) => total + booking.price, 0), [bookings]);
  const formatPaymentMethod = (method) => {
    if (method === 'upi') return 'UPI';
    if (method === 'card') return 'Card';
    return 'Cash';
  };

  const fetchOwnerBookings = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      }

      const { data } = await axios.get('/api/bookings/owner');
      if (data.success) {
        setBookings(data.bookings);
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

  const changeBookingStatus = async (bookingId, status) => {
    try {
      setIsUpdating(true);
      const { data } = await axios.post('/api/bookings/change-status', { bookingId, status });
      if (data.success) {
        toast.success(data.message);
        fetchOwnerBookings();
        fetchCars(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const openStatusConfirm = (booking, status) => {
    const statusCopy = status === 'confirmed' ? 'confirm' : 'cancel';
    setConfirmState({
      open: true,
      title: `${statusCopy.charAt(0).toUpperCase() + statusCopy.slice(1)} this booking?`,
      message: `You are about to ${statusCopy} the booking for ${booking.car.brand} ${booking.car.model} from ${booking.pickupDate.split('T')[0]} to ${booking.returnDate.split('T')[0]}.`,
      confirmText: status === 'confirmed' ? 'Confirm Booking' : 'Cancel Booking',
      variant: status === 'confirmed' ? 'primary' : 'danger',
      bookingId: booking._id,
      status,
    });
  };

  const closeConfirm = () => {
    if (isUpdating) return;
    setConfirmState((prev) => ({ ...prev, open: false, bookingId: null, status: '' }));
  };

  const handleConfirm = async () => {
    if (!confirmState.bookingId || !confirmState.status) return;
    await changeBookingStatus(confirmState.bookingId, confirmState.status);
    setConfirmState((prev) => ({ ...prev, open: false, bookingId: null, status: '' }));
  };

  useEffect(() => {
    fetchOwnerBookings();
  }, [fetchOwnerBookings]);

  return (
    <div className="min-h-full px-2 py-2 md:px-4">
      <Title
        title="Manage Bookings"
        subTitle="Check booking requests and update their status."
        eyebrow="Bookings"
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-sm">
          {isLoading ? 'Loading bookings...' : `${bookings.length} bookings found`}
        </div>
        <button
          type="button"
          onClick={() => fetchOwnerBookings()}
          disabled={isLoading}
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Refreshing...' : 'Refresh bookings'}
        </button>
      </div>

      <div className="mt-4 grid gap-5 md:grid-cols-3">
        <div className="rounded-[1.8rem] border border-white/55 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Pending</p>
          <p className="mt-3 text-4xl font-semibold text-slate-950">{isLoading ? '...' : pendingCount}</p>
        </div>
        <div className="rounded-[1.8rem] border border-white/55 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Confirmed</p>
          <p className="mt-3 text-4xl font-semibold text-emerald-600">{isLoading ? '...' : confirmedCount}</p>
        </div>
        <div className="rounded-[1.8rem] border border-white/55 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Revenue</p>
          <p className="mt-3 text-4xl font-semibold text-slate-950">{isLoading ? '...' : `${currency}${projectedRevenue}`}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {!isLoading && bookings.length === 0 && (
          <div className="rounded-[1.8rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
            No bookings yet. Incoming requests will show up here for review.
          </div>
        )}
        {bookings.map((booking, index) => (
          <div
            key={index}
            className="rounded-[2rem] border border-white/55 bg-white/82 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl"
          >
            <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr_0.55fr]">
              <div className="flex gap-4">
                <img src={booking.car.image} alt="" className="h-28 w-32 rounded-[1.4rem] object-cover shadow-sm" />
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Car</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">{booking.car.brand} {booking.car.model}</h3>
                  <p className="mt-2 text-sm text-slate-500">{booking.car.location}</p>
                  <p className="mt-2 text-sm text-slate-500">Main action: confirm or cancel this request.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white">
                      {formatPaymentMethod(booking.paymentMethod)}
                    </span>
                    <span className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] ${
                      booking.paymentStatus === 'paid'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {booking.paymentStatus || 'pending'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Trip Dates</p>
                <p className="mt-3 text-lg font-semibold text-slate-900">{booking.pickupDate.split('T')[0]} to {booking.returnDate.split('T')[0]}</p>
                <p className="mt-2 text-sm text-slate-500">Requested on {booking.createdAt.split('T')[0]}</p>
                <p className="mt-4 text-2xl font-semibold text-slate-950">{currency}{booking.price}</p>
                {booking.paymentId && (
                  <p className="mt-2 break-all text-xs text-slate-500">Ref: {booking.paymentId}</p>
                )}
              </div>

              <div className="flex flex-col justify-between gap-4">
                {booking.status === 'pending' ? (
                  <select
                    onChange={(e) => openStatusConfirm(booking, e.target.value)}
                    value={booking.status}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  >
                    <option value="pending">Choose action</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="confirmed">Confirmed</option>
                  </select>
                ) : (
                  <span className={`inline-flex w-max rounded-full px-4 py-2 text-sm font-semibold capitalize ${booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {booking.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        variant={confirmState.variant}
        onClose={closeConfirm}
        onConfirm={handleConfirm}
        loading={isUpdating}
      />
    </div>
  );
};

export default ManageBookings;
