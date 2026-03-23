import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/appContext';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const { currency, axios, user } = useAppContext();

  const fetchMyBookings = useCallback(async (silent = false) => {
    try {
      const { data } = await axios.get('/api/bookings/user');

      if (data.success) {
        setBookings(data.bookings);
      } else if (!silent) {
        toast.error(data.message);
      }
    } catch (error) {
      if (!silent) {
        toast.error(error.message);
      }
    }
  }, [axios]);

  useEffect(() => {
    if (!user) return undefined;

    fetchMyBookings();

    const intervalId = setInterval(() => {
      fetchMyBookings(true);
    }, 10000);

    return () => clearInterval(intervalId);
  }, [fetchMyBookings, user]);

  useEffect(() => {
    if (!selectedBooking) return;

    const updatedBooking = bookings.find((booking) => booking._id === selectedBooking._id);
    if (updatedBooking) {
      setSelectedBooking(updatedBooking);
    }
  }, [bookings, selectedBooking]);

  const formatDate = (date) => date ? new Date(date).toISOString().split('T')[0] : '';
  const formatPaymentMethod = (method) => {
    if (method === 'upi') return 'UPI';
    if (method === 'card') return 'Card';
    return 'Cash';
  };

  if (!user) {
    return (
      <div className="mx-auto mt-16 max-w-4xl px-6 md:px-10">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-950">My Bookings</h1>
          <p className="mt-3 text-slate-600">Login first to see your booking history and booking status.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-16 max-w-6xl px-6 text-sm md:px-10">
      <Title
        title="My Bookings"
        subTitle="View your booking status, trip dates, payment method, and total amount."
        align="left"
      />

      {bookings.length === 0 ? (
        <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-lg font-semibold text-slate-950">No bookings yet</p>
          <p className="mt-2 text-slate-600">Create one booking and it will appear here for your demo.</p>
        </div>
      ) : (
        <div className="mt-10 flex flex-col gap-5">
          {bookings.map((booking, index) => (
            <div
              key={booking._id}
              onClick={() => setSelectedBooking(booking)}
              className="grid cursor-pointer grid-cols-1 gap-6 rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md md:grid-cols-4"
            >
              <div className="md:col-span-1">
                <div className="mb-3 overflow-hidden rounded-xl">
                  <img
                    src={booking.car.image}
                    alt=""
                    className="aspect-video h-auto w-full object-cover"
                  />
                </div>

                <p className="mt-2 text-lg font-medium">
                  {booking.car.brand} {booking.car.model}
                </p>

                <p className="text-gray-500">
                  {booking.car.year} | {booking.car.category} | {booking.car.location}
                </p>
              </div>

              <div className="md:col-span-2 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <p className="rounded bg-light px-3 py-1.5">
                    Booking #{index + 1}
                  </p>

                  <p className={`rounded-full px-3 py-1 text-xs ${
                    booking.status === 'confirmed'
                      ? 'bg-green-400/15 text-green-600'
                      : booking.status === 'cancelled'
                        ? 'bg-red-400/15 text-red-600'
                        : 'bg-amber-400/15 text-amber-700'
                  }`}>
                    {booking.status}
                  </p>
                </div>

                <div className="mt-2 flex items-start gap-2">
                  <img src={assets.calendar_icon_colored} className="mt-1 h-4 w-4" alt="" />

                  <div>
                    <p className="leading-none text-gray-500">Rental Period</p>
                    <p className="mt-1">
                      {formatDate(booking.pickupDate)} to {formatDate(booking.returnDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <img src={assets.location_icon} className="mt-1 h-4 w-4" alt="" />

                  <div>
                    <p className="leading-none text-gray-500">Pick-up Location</p>
                    <p className="mt-1">{booking.car.location}</p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-1 flex flex-col justify-between items-end text-right">
                <div className="text-sm text-gray-500">
                  <p>Total Price</p>
                  <h1 className="text-2xl font-semibold text-primary">{currency}{booking.price}</h1>
                  <p className="mt-2">Booked on {formatDate(booking.createdAt)}</p>
                  <p className="mt-2 capitalize">{formatPaymentMethod(booking.paymentMethod)} - {booking.paymentStatus}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedBooking.car?.brand} {selectedBooking.car?.model}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedBooking.car?.year} | {selectedBooking.car?.category} | {selectedBooking.car?.location}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="text-2xl leading-none text-gray-400 transition hover:text-gray-700"
              >
                x
              </button>
            </div>

            <img
              src={selectedBooking.car?.image}
              alt={`${selectedBooking.car?.brand || 'Car'} ${selectedBooking.car?.model || ''}`.trim()}
              className="mt-5 h-56 w-full rounded-xl object-cover"
            />

            <div className="mt-6 grid grid-cols-1 gap-4 text-sm text-gray-700 sm:grid-cols-2">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-gray-500">Status</p>
                <p className="mt-1 font-medium capitalize">{selectedBooking.status}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-gray-500">Total Price</p>
                <p className="mt-1 font-medium">{currency}{selectedBooking.price}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-gray-500">Payment Method</p>
                <p className="mt-1 font-medium">{formatPaymentMethod(selectedBooking.paymentMethod)}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-gray-500">Payment Status</p>
                <p className="mt-1 font-medium capitalize">{selectedBooking.paymentStatus || 'pending'}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-gray-500">Pickup Date</p>
                <p className="mt-1 font-medium">{formatDate(selectedBooking.pickupDate)}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-gray-500">Return Date</p>
                <p className="mt-1 font-medium">{formatDate(selectedBooking.returnDate)}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 sm:col-span-2">
                <p className="text-gray-500">Pickup Location</p>
                <p className="mt-1 font-medium">{selectedBooking.car?.location}</p>
              </div>
              {selectedBooking.contactNumber && (
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-gray-500">Contact Number</p>
                  <p className="mt-1 font-medium">{selectedBooking.contactNumber}</p>
                </div>
              )}
              {selectedBooking.pickupTime && (
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-gray-500">Pickup Time</p>
                  <p className="mt-1 font-medium">{selectedBooking.pickupTime}</p>
                </div>
              )}
              {typeof selectedBooking.needDriver === 'boolean' && (
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-gray-500">Driver Needed</p>
                  <p className="mt-1 font-medium">{selectedBooking.needDriver ? 'Yes' : 'No'}</p>
                </div>
              )}
              {selectedBooking.passengerCount && (
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-gray-500">Passengers</p>
                  <p className="mt-1 font-medium">{selectedBooking.passengerCount}</p>
                </div>
              )}
              {selectedBooking.specialRequests && (
                <div className="rounded-xl bg-gray-50 p-4 sm:col-span-2">
                  <p className="text-gray-500">Special Requests</p>
                  <p className="mt-1 font-medium">{selectedBooking.specialRequests}</p>
                </div>
              )}
              {selectedBooking.paymentId && (
                <div className="rounded-xl bg-gray-50 p-4 sm:col-span-2">
                  <p className="text-gray-500">Payment Reference</p>
                  <p className="mt-1 break-all font-medium">{selectedBooking.paymentId}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
