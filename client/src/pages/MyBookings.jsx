import React, { useCallback, useEffect, useState } from 'react';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { motion } from "framer-motion";

const MyBookings = () => {

  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const { currency, axios, user } = useAppContext();

  const fetchMyBookings = useCallback(async (silent = false) => {
    try {
      const { data } = await axios.get('/api/bookings/user')

      if (data.success) {
        setBookings(data.bookings)
      } else {
        !silent && toast.error(data.message)
      }

    } catch (error) {
      !silent && toast.error(error.message)
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


  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const card = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  }

  const formatDate = (date) => date ? new Date(date).toISOString().split('T')[0] : '';
  const formatPaymentMethod = (method) => {
    if (method === 'upi') return 'UPI';
    if (method === 'card') return 'Card';
    return 'Cash';
  };

  return (

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className='px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-7xl mx-auto'
    >

      <Title
        title="My Bookings"
        subTitle="View and manage your bookings"
        align="left"
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className='flex flex-col gap-5 mt-12'
      >

        {bookings.map((booking, index) => (

          <motion.div
            key={booking._id}
            variants={card}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedBooking(booking)}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-borderColor rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
          >

            {/* Car Info */}
            <div className='md:col-span-1'>
              <div className='rounded-md overflow-hidden mb-3'>
                <motion.img
                  src={booking.car.image}
                  alt=""
                  className='w-full h-auto aspect-video object-cover'
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <p className='text-lg font-medium mt-2'>
                {booking.car.brand} {booking.car.model}
              </p>

              <p className='text-gray-500'>
                {booking.car.year} - {booking.car.category} - {booking.car.location}
              </p>
            </div>

            {/* Booking Details */}
            <div className='md:col-span-2 flex flex-col gap-4'>

              <div className='flex items-center gap-2'>
                <p className='px-3 py-1.5 bg-light rounded'>
                  Booking #{index + 1}
                </p>

                <p className={`px-3 py-1 text-xs rounded-full ${booking.status === 'confirmed'
                    ? 'bg-green-400/15 text-green-600'
                    : 'bg-red-400/15 text-red-600'
                  }`}>
                  {booking.status}
                </p>
              </div>

              <div className='flex items-start gap-2 mt-2'>
                <img src={assets.calendar_icon_colored} className='w-4 h-4 mt-1' />

                <div>
                  <p className='text-gray-500 leading-none'>Rental Period</p>
                  <p className='mt-1'>
                    {formatDate(booking.pickupDate)} To {formatDate(booking.returnDate)}
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-2'>
                <img src={assets.location_icon} className='w-4 h-4 mt-1' />

                <div>
                  <p className='text-gray-500 leading-none'>Pick-up Location</p>
                  <p className='mt-1'>{booking.car.location}</p>
                </div>
              </div>

            </div>

            {/* Payment Info */}
            <div className='md:col-span-1 flex flex-col justify-between items-end text-right'>

              <div className='text-sm text-gray-500'>
                <p>Total Price</p>

                <motion.h1
                  whileHover={{ scale: 1.1 }}
                  className='text-2xl font-semibold text-primary'
                >
                  {currency}{booking.price}
                </motion.h1>

                <p className='mt-2'>
                  Booked on {formatDate(booking.createdAt)}
                </p>
                <p className='mt-2 capitalize'>
                  {formatPaymentMethod(booking.paymentMethod)} - {booking.paymentStatus}
                </p>
              </div>

            </div>

          </motion.div>

        ))}

      </motion.div>

      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setSelectedBooking(null)}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedBooking.car?.brand} {selectedBooking.car?.model}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedBooking.car?.year} - {selectedBooking.car?.category} - {selectedBooking.car?.location}
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
                  <p className="mt-1 font-medium break-all">{selectedBooking.paymentId}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
};

export default MyBookings;
