import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import Loader from '../components/Loder';

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { axios, cars, user, setShowLogin, pickupDate, setPickupDate, returnDate, setReturnDate, currency } = useAppContext();
  const car = cars.find((item) => item._id === id);
  const [pickupTime, setPickupTime] = useState('10:00');
  const [contactNumber, setContactNumber] = useState('');
  const [passengerCount, setPassengerCount] = useState('');
  const [needDriver, setNeedDriver] = useState('yes');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingStatus, setBookingStatus] = useState({ loading: true, isBookable: false, message: '' });

  const rentalDays = useMemo(() => {
    if (!pickupDate || !returnDate) return 0;
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [pickupDate, returnDate]);

  const estimatedTotal = rentalDays ? rentalDays * car?.pricePerDay : car?.pricePerDay || 0;
  const unavailableUntil = car?.unavailableUntil ? new Date(car.unavailableUntil).toISOString().split('T')[0] : '';

  useEffect(() => {
    let isMounted = true;

    const fetchBookingStatus = async () => {
      if (!car) return;

      try {
        setBookingStatus((prev) => ({ ...prev, loading: true }));
        const params = new URLSearchParams();

        if (pickupDate) params.set('pickupDate', pickupDate);
        if (returnDate) params.set('returnDate', returnDate);

        const queryString = params.toString();
        const { data } = await axios.get(`/api/bookings/car-status/${id}${queryString ? `?${queryString}` : ''}`);
        if (!isMounted) return;

        setBookingStatus({
          loading: false,
          isBookable: Boolean(data.success && data.isBookable),
          message: data.message || '',
        });
      } catch (error) {
        if (!isMounted) return;
        setBookingStatus({
          loading: false,
          isBookable: false,
          message: error?.response?.data?.message || error.message || 'Unable to verify booking availability',
        });
      }
    };

    fetchBookingStatus();
    return () => {
      isMounted = false;
    };
  }, [axios, car, id, pickupDate, returnDate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      toast('Login or sign up to continue with this booking');
      setShowLogin(true);
      return;
    }

    if (!pickupDate || !returnDate) {
      toast.error('Pickup and return dates are required');
      return;
    }

    if (!contactNumber.trim()) {
      toast.error('Contact number is required');
      return;
    }

    if (!bookingStatus.isBookable) {
      toast.error(bookingStatus.message || 'This car is unavailable for the selected dates');
      return;
    }

    try {
      setIsSubmitting(true);
      const { data } = await axios.post('/api/bookings/create', {
        car: id,
        pickupDate,
        returnDate,
        pickupTime,
        contactNumber: contactNumber.trim(),
        passengerCount: passengerCount ? Number(passengerCount) : undefined,
        needDriver: needDriver === 'yes',
        specialRequests: specialRequests.trim(),
      });

      if (data.success) {
        toast.success(data.message);
        navigate('/my-bookings');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!car) return <Loader />;

  return (
    <div className="px-4 pb-20 pt-10 md:px-8 lg:px-12 xl:px-20">
      <div className="mx-auto max-w-[1480px]">
        <button onClick={() => navigate(`/car/${id}`)} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900">
          <img src={assets.arrow_icon} alt="" className="h-4 w-4 rotate-180 opacity-60" />
          Back to vehicle details
        </button>

        <div className="grid gap-8 xl:grid-cols-[1fr_0.95fr]">
          <div className="overflow-hidden rounded-[2.4rem] border border-white/60 bg-white/80 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <img src={car.image} alt={`${car.brand} ${car.model}`} className="h-[280px] w-full object-cover md:h-[420px]" />
            <div className="grid gap-8 p-6 md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">VIP Reservation</p>
                  <h1 className="mt-3 font-serif text-4xl text-slate-950 md:text-5xl">{car.brand} {car.model}</h1>
                  <p className="mt-3 max-w-2xl text-base leading-8 text-slate-600">{car.description}</p>
                </div>
                <div className="rounded-[1.6rem] bg-slate-950 px-5 py-4 text-white">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/50">Rate</p>
                  <p className="mt-2 text-3xl font-semibold">{currency}{car.pricePerDay}</p>
                  <p className="text-sm text-white/65">per day</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { icon: assets.users_icon, label: `${car.seating_capacity} seats` },
                  { icon: assets.fuel_icon, label: car.fuel_type },
                  { icon: assets.car_icon, label: car.transmission },
                  { icon: assets.location_icon, label: car.location },
                ].map((item) => (
                  <div key={item.label} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                    <img src={item.icon} alt="" className="h-5" />
                    <p className="mt-4 text-sm font-medium text-slate-700">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.8rem] bg-[linear-gradient(135deg,#0f172a_0%,#111827_100%)] p-6 text-white">
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">Reservation Notes</p>
                <div className="mt-4 grid gap-3 text-sm text-white/78 md:grid-cols-3">
                  <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3">Professional handover at pickup</div>
                  <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3">Optional chauffeur request</div>
                  <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3">Priority support during booking window</div>
                </div>
              </div>
            </div>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="h-max rounded-[2.4rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.96))] p-6 shadow-[0_24px_90px_rgba(15,23,42,0.08)] md:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Booking Form</p>
                <h2 className="mt-3 font-serif text-3xl text-slate-950">Secure this vehicle</h2>
                <p className={`mt-3 text-sm ${bookingStatus.isBookable ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {bookingStatus.loading
                    ? 'Checking current booking availability...'
                    : bookingStatus.message || (bookingStatus.isBookable ? 'Car is available for your selected dates' : 'Car is currently unavailable')}
                </p>
                {!bookingStatus.isBookable && unavailableUntil ? (
                  <p className="mt-1 text-xs text-slate-500">Current block ends on {unavailableUntil}</p>
                ) : null}
              </div>
              <div className="rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-800">
                VIP
              </div>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Pickup date</span>
                <input
                  type="date"
                  value={pickupDate || ''}
                  onChange={(e) => setPickupDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Return date</span>
                <input
                  type="date"
                  value={returnDate || ''}
                  onChange={(e) => setReturnDate(e.target.value)}
                  min={pickupDate || new Date().toISOString().split('T')[0]}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Pickup time</span>
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Contact number</span>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="Enter phone number"
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Passengers</span>
                <input
                  type="number"
                  min="1"
                  max={car.seating_capacity}
                  value={passengerCount}
                  onChange={(e) => setPassengerCount(e.target.value)}
                  placeholder={`Up to ${car.seating_capacity}`}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Driver needed</span>
                <select
                  value={needDriver}
                  onChange={(e) => setNeedDriver(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                >
                  <option value="yes">Yes, include driver</option>
                  <option value="no">No, self drive</option>
                </select>
              </label>

              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Special requests</span>
                <textarea
                  rows="4"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Airport transfer, event timing, preferred contact instructions..."
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
            </div>

            <div className="mt-8 rounded-[1.8rem] bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between text-sm text-white/65">
                <span>Estimated duration</span>
                <span>{rentalDays || 0} day{rentalDays === 1 ? '' : 's'}</span>
              </div>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/45">Estimated total</p>
                  <p className="mt-2 text-4xl font-semibold">{currency}{estimatedTotal}</p>
                </div>
                <p className="max-w-[180px] text-right text-sm text-white/60">Final confirmation depends on availability and reservation review.</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || bookingStatus.loading || (!bookingStatus.isBookable && Boolean(user))}
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting
                ? 'Processing...'
                : !user
                  ? 'Login Or Sign Up To Book'
                  : bookingStatus.loading
                    ? 'Checking Availability...'
                    : bookingStatus.isBookable
                      ? 'Confirm Booking Request'
                      : 'Booking Blocked'}
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
