import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assets } from '../assets/assets';
import Loader from '../components/Loder';
import { useAppContext } from '../context/AppContext';

const CarDetails = () => {
  const { id } = useParams();
  const { cars, currency } = useAppContext();
  const navigate = useNavigate();
  const car = cars.find((item) => item._id === id);

  return car ? (
    <div className="px-4 pb-20 pt-10 md:px-8 lg:px-12 xl:px-20">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900">
        <img src={assets.arrow_icon} alt="" className="h-4 w-4 rotate-180 opacity-65" />
        Back to all cars
      </button>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_0.9fr]">
        <div className="overflow-hidden rounded-[2.4rem] border border-white/60 bg-white/82 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-8">
          <img src={car.image} alt="" className="mb-8 h-auto w-full rounded-[2rem] object-cover shadow-md md:max-h-[480px]" />
          <div className="space-y-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">Vehicle Overview</p>
              <h1 className="mt-3 font-serif text-4xl text-slate-950 md:text-5xl">{car.brand} {car.model}</h1>
              <p className="mt-2 text-lg text-slate-600">{car.category} • {car.year}</p>
            </div>
            <hr className="border-borderColor" />

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { icon: assets.users_icon, text: `${car.seating_capacity} Seats` },
                { icon: assets.fuel_icon, text: car.fuel_type },
                { icon: assets.car_icon, text: car.transmission },
                { icon: assets.location_icon, text: car.location },
              ].map(({ icon, text }) => (
                <div key={text} className="flex flex-col items-center rounded-[1.4rem] bg-slate-50 p-4 text-center">
                  <img src={icon} alt="" className="mb-2 h-5" />
                  <span className="text-sm text-slate-700">{text}</span>
                </div>
              ))}
            </div>

            <div>
              <h2 className="mb-3 text-xl font-medium text-slate-950">Description</h2>
              <p className="max-w-3xl text-slate-600">{car.description}</p>
            </div>

            <div>
              <h1 className="mb-3 text-xl font-medium text-slate-950">Features</h1>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  '360 Camera',
                  'Bluetooth',
                  'GPS',
                  'Heated Seats',
                  'Rear View Mirror',
                ].map((item) => (
                  <li key={item} className="flex items-center text-slate-600">
                    <img src={assets.check_icon} className="mr-2 h-4" alt="" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="h-max rounded-[2.4rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.96))] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">Reservation</p>
          <p className="mt-4 flex items-center justify-between text-4xl font-semibold text-slate-950">
            {currency}{car.pricePerDay}
            <span className="text-base font-normal text-slate-400">per day</span>
          </p>

          <div className="mt-8 rounded-[1.8rem] bg-slate-950 p-5 text-white">
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">Booking includes</p>
            <div className="mt-4 space-y-3 text-sm text-white/75">
              <p>Flexible pickup and return dates</p>
              <p>Driver option and contact details on booking form</p>
              <p>Special request notes for events or airport transfer</p>
            </div>
          </div>

          <div className="mt-8 space-y-4 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-[1.4rem] border border-slate-200 bg-white px-4 py-3">
              <span>Location</span>
              <span className="font-medium text-slate-950">{car.location}</span>
            </div>
            <div className="flex items-center justify-between rounded-[1.4rem] border border-slate-200 bg-white px-4 py-3">
              <span>Vehicle type</span>
              <span className="font-medium text-slate-950">{car.category}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              navigate(`/book/${car._id}`);
              window.scrollTo(0, 0);
            }}
            className="mt-8 w-full rounded-2xl bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:brightness-105"
          >
            Continue To Booking
          </button>
        </div>
      </div>
    </div>
  ) : <Loader />;
};

export default CarDetails;
