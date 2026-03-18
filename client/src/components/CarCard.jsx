import React from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CarCard = ({ car }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();
  const isRentableNow = car.isListed !== false && car.isAvailable;

  const formatDate = (date) => (date ? new Date(date).toISOString().split('T')[0] : '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      viewport={{ once: true }}
      onClick={() => {
        navigate(`/car/${car._id}`);
        window.scrollTo(0, 0);
      }}
      className="group cursor-pointer overflow-hidden rounded-xl shadow-lg transition-all duration-500 hover:shadow-2xl"
    >
      <div className="relative h-48 overflow-hidden">
        <motion.img
          src={car.image}
          alt="car"
          className="h-full w-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.5 }}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${
            isRentableNow
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {isRentableNow ? 'Available Now' : 'Unavailable'}
        </motion.div>

        {!isRentableNow && car.unavailableUntil && (
          <div className="absolute left-4 top-14 rounded-full bg-black/75 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            Until {formatDate(car.unavailableUntil)}
          </div>
        )}

        <div className="absolute bottom-4 right-4 rounded-lg bg-black/80 px-3 py-2 text-white backdrop-blur-sm">
          <span className="font-semibold">{currency}{car.pricePerDay}</span>
          <span className="text-sm text-white/80"> / day</span>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="mb-2 flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium">
              {car.brand} {car.model}
            </h3>

            <p className="text-sm text-gray-500">
              {car.category} - {car.year}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-y-3 text-sm text-gray-600">
          <div className="flex items-center">
            <img src={assets.users_icon} className="mr-2 h-4" />
            <span>{car.seating_capacity} Seats</span>
          </div>

          <div className="flex items-center">
            <img src={assets.fuel_icon} className="mr-2 h-4" />
            <span>{car.fuel_type}</span>
          </div>

          <div className="flex items-center">
            <img src={assets.car_icon} className="mr-2 h-4" />
            <span>{car.transmission}</span>
          </div>

          <div className="flex items-center">
            <img src={assets.location_icon} className="mr-2 h-4" />
            <span>{car.location}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CarCard;
