import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/appContext';
import Loader from '../components/Loder';
import ConfirmModal from '../components/ConfirmModal.jsx';

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
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingStatus, setBookingStatus] = useState({ loading: true, isBookable: false, message: '' });
  const [paymentDialog, setPaymentDialog] = useState({
    open: false,
    orderId: '',
    paymentToken: '',
    amount: 0,
  });

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
      const bookingPayload = {
        car: id,
        pickupDate,
        returnDate,
        pickupTime,
        contactNumber: contactNumber.trim(),
        passengerCount: passengerCount ? Number(passengerCount) : undefined,
        needDriver: needDriver === 'yes',
        specialRequests: specialRequests.trim(),
        paymentMethod,
      };

      if (paymentMethod === 'cash') {
        const { data } = await axios.post('/api/bookings/create', bookingPayload);

        if (data.success) {
          toast.success(data.message);
          navigate('/my-bookings');
        } else {
          toast.error(data.message);
        }

        return;
      }

      const { data } = await axios.post('/api/payment/create-intent', bookingPayload);

      if (data.success) {
        setPaymentDialog({
          open: true,
          orderId: data.payment.orderId,
          paymentToken: data.payment.paymentToken,
          amount: data.payment.amount,
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmOnlinePayment = async () => {
    try {
      setIsSubmitting(true);
      const { data } = await axios.post('/api/payment/confirm', {
        car: id,
        pickupDate,
        returnDate,
        pickupTime,
        contactNumber: contactNumber.trim(),
        passengerCount: passengerCount ? Number(passengerCount) : undefined,
        needDriver: needDriver === 'yes',
        specialRequests: specialRequests.trim(),
        paymentMethod,
        orderId: paymentDialog.orderId,
        paymentToken: paymentDialog.paymentToken,
      });

      if (data.success) {
        toast.success(data.message);
        setPaymentDialog({ open: false, orderId: '', paymentToken: '', amount: 0 });
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
    <div className="bg-slate-50 px-4 pb-20 pt-10 md:px-8 lg:px-12 xl:px-20">
      <div className="mx-auto max-w-6xl">
        <button onClick={() => navigate(`/car/${id}`)} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900">
          <img src={assets.arrow_icon} alt="" className="h-4 w-4 rotate-180 opacity-60" />
          Back to vehicle details
        </button>

        <div className="grid gap-8 xl:grid-cols-[1fr_0.95fr]">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <img src={car.image} alt={`${car.brand} ${car.model}`} className="h-[280px] w-full object-cover md:h-[420px]" />

            <div className="grid gap-8 p-6 md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Booking summary</p>
                  <h1 className="mt-3 text-4xl font-semibold text-slate-950 md:text-5xl">{car.brand} {car.model}</h1>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{car.description}</p>
                </div>

                <div className="rounded-[1.5rem] bg-slate-950 px-5 py-4 text-white">
                  <p className="text-sm text-white/70">Rate</p>
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

              <div className="rounded-[1.5rem] bg-slate-50 p-6">
                <p className="text-sm font-medium text-slate-900">Booking flow</p>
                <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                  <div className="rounded-[1rem] bg-white px-4 py-3">Choose your dates</div>
                  <div className="rounded-[1rem] bg-white px-4 py-3">Fill contact details</div>
                  <div className="rounded-[1rem] bg-white px-4 py-3">Confirm payment method</div>
                </div>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="h-max rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Booking form</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-950">Complete your booking</h2>
                <p className={`mt-3 text-sm ${bookingStatus.isBookable ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {bookingStatus.loading
                    ? 'Checking current booking availability...'
                    : bookingStatus.message || (bookingStatus.isBookable ? 'Car is available for your selected dates' : 'Car is currently unavailable')}
                </p>
                {!bookingStatus.isBookable && unavailableUntil ? (
                  <p className="mt-1 text-xs text-slate-500">Current block ends on {unavailableUntil}</p>
                ) : null}
              </div>

              <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700">Main flow</div>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Pickup date</span>
                <input
                  type="date"
                  value={pickupDate || ''}
                  onChange={(event) => setPickupDate(event.target.value)}
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
                  onChange={(event) => setReturnDate(event.target.value)}
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
                  onChange={(event) => setPickupTime(event.target.value)}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Contact number</span>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(event) => setContactNumber(event.target.value)}
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
                  onChange={(event) => setPassengerCount(event.target.value)}
                  placeholder={`Up to ${car.seating_capacity}`}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Driver needed</span>
                <select
                  value={needDriver}
                  onChange={(event) => setNeedDriver(event.target.value)}
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
                  onChange={(event) => setSpecialRequests(event.target.value)}
                  placeholder="Airport transfer, event timing, preferred contact instructions..."
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Payment method</span>
                <select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                >
                  <option value="cash">Cash at pickup</option>
                  <option value="card">Online card payment</option>
                  <option value="upi">UPI payment</option>
                </select>
                <p className="mt-2 text-xs text-slate-500">
                  {paymentMethod === 'cash'
                    ? 'Your booking will be created now and payment will be collected at pickup.'
                    : 'You will complete a secure mock payment confirmation before the booking is created.'}
                </p>
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
                  <p className="mt-2 text-sm text-white/60">
                    Payment: {paymentMethod === 'cash' ? 'Cash at pickup' : paymentMethod === 'card' ? 'Online card' : 'UPI'}
                  </p>
                </div>

                <p className="max-w-[180px] text-right text-sm text-white/60">Final confirmation depends on availability and reservation review.</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || bookingStatus.loading || (!bookingStatus.isBookable && Boolean(user))}
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting
                ? 'Processing...'
                : !user
                  ? 'Login Or Sign Up To Book'
                  : bookingStatus.loading
                    ? 'Checking Availability...'
                    : bookingStatus.isBookable
                      ? paymentMethod === 'cash' ? 'Confirm Booking Request' : 'Proceed To Payment'
                      : 'Booking Blocked'}
            </button>
          </form>
        </div>
      </div>

      <ConfirmModal
        open={paymentDialog.open}
        title="Confirm online payment?"
        message={`This simulated payment will charge ${currency}${paymentDialog.amount} via ${paymentMethod === 'card' ? 'card' : 'UPI'} and then create the booking.`}
        confirmText={isSubmitting ? 'Processing...' : 'Pay Now'}
        variant="primary"
        onClose={() => !isSubmitting && setPaymentDialog({ open: false, orderId: '', paymentToken: '', amount: 0 })}
        onConfirm={confirmOnlinePayment}
        loading={isSubmitting}
      />
    </div>
  );
};

export default BookingPage;
