import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { assets } from '../assets/assets';
import Loader from '../components/Loder';
import { useAppContext } from '../context/AppContext';

const CarDetails = () => {
  const { id } = useParams();
  const { cars, currency, user, setShowLogin } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const car = cars.find((item) => item._id === id);
  const isBookableNow = car && car.isListed !== false && car.isAvailable;
  const unavailableUntil = car?.unavailableUntil ? new Date(car.unavailableUntil).toISOString().split('T')[0] : '';
  const backToCarsPath = location.state?.fromCarsPath || '/cars';

  const handleReservationClick = () => {
    if (!car) return;

    if (!user) {
      toast('Login or sign up to continue with this booking');
      setShowLogin(true);
      return;
    }

    if (!isBookableNow) {
      toast.error(unavailableUntil ? `This car is blocked until ${unavailableUntil}` : 'This car is currently unavailable');
      return;
    }

    navigate(`/book/${car._id}`);
    window.scrollTo(0, 0);
  };

  return car ? (
    <div className="bg-slate-50 px-4 pb-20 pt-10 md:px-8 lg:px-12 xl:px-20">
      <button onClick={() => navigate(backToCarsPath)} className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900">
        <img src={assets.arrow_icon} alt="" className="h-4 w-4 rotate-180 opacity-65" />
        Back to all cars
      </button>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_0.9fr]">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <img src={car.image} alt="" className="mb-8 h-auto w-full rounded-[1.5rem] object-cover shadow-sm md:max-h-[480px]" />

          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-slate-500">Vehicle overview</p>
              <h1 className="mt-3 text-4xl font-semibold text-slate-950 md:text-5xl">{car.brand} {car.model}</h1>
              <p className="mt-2 text-lg text-slate-600">{car.category} | {car.year}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { icon: assets.users_icon, text: `${car.seating_capacity} Seats` },
                { icon: assets.fuel_icon, text: car.fuel_type },
                { icon: assets.car_icon, text: car.transmission },
                { icon: assets.location_icon, text: car.location },
              ].map(({ icon, text }) => (
                <div key={text} className="flex flex-col items-center rounded-[1.2rem] bg-slate-50 p-4 text-center">
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
              <h2 className="mb-3 text-xl font-medium text-slate-950">Included highlights</h2>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {['Bluetooth', 'GPS', 'Air Conditioning', 'Comfortable Seating'].map((item) => (
                  <li key={item} className="flex items-center text-slate-600">
                    <img src={assets.check_icon} className="mr-2 h-4" alt="" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="h-max rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-sm font-medium text-slate-500">Reservation</p>
          <p className="mt-4 flex items-center justify-between text-4xl font-semibold text-slate-950">
            {currency}{car.pricePerDay}
            <span className="text-base font-normal text-slate-400">per day</span>
          </p>

          <div className="mt-8 rounded-[1.5rem] bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-900">What the user can do</p>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>Select pickup and return dates</p>
              <p>Add contact details and driver preference</p>
              <p>Choose cash, card, or UPI payment</p>
            </div>
          </div>

          <div className="mt-8 space-y-4 text-sm text-slate-600">
            <div className={`rounded-[1.4rem] border px-4 py-3 ${
              isBookableNow ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}>
              <span className="font-semibold">{isBookableNow ? 'Available for booking now' : 'Booking temporarily blocked'}</span>
              {!isBookableNow && unavailableUntil ? <p className="mt-1 text-xs">Unavailable until {unavailableUntil}</p> : null}
            </div>

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
            onClick={handleReservationClick}
            disabled={!user ? false : !isBookableNow}
            className="mt-8 w-full rounded-2xl bg-slate-950 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {!user ? 'Login Or Sign Up To Rent' : isBookableNow ? 'Continue To Booking' : 'Booking Unavailable'}
          </button>
        </div>
      </div>
    </div>
  ) : <Loader />;
};

export default CarDetails;
