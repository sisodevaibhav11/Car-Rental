import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import CarCard from '../components/CarCard.jsx';
import { useAppContext } from '../context/appContext.jsx';

const Home = () => {
  const { cars } = useAppContext();

  const listedCars = cars.filter((car) => car.isListed !== false);
  const availableCars = listedCars.filter((car) => car.isAvailable);
  const featuredCars = availableCars.slice(0, 3);
  const uniqueLocations = new Set(listedCars.map((car) => car.location).filter(Boolean)).size;

  return (
    <div className="min-h-screen bg-slate-50">
      <Hero />

      <section className="px-4 py-10 md:px-8 lg:px-12 xl:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Cars available</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{availableCars.length}</p>
              <p className="mt-2 text-sm text-slate-600">Only listed and ready-to-book vehicles.</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Pickup locations</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{uniqueLocations}</p>
              <p className="mt-2 text-sm text-slate-600">Simple city-based search for the demo flow.</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Demo flow</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">Search, book, track</p>
              <p className="mt-2 text-sm text-slate-600">Show only the main features in a few clicks.</p>
            </div>
          </div>

          <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Main project flow</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-950">Keep the demo easy to explain</h2>
              </div>

              <Link
                to="/cars"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 md:w-auto"
              >
                Browse Cars
              </Link>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {[
                { step: '1', title: 'Select city and dates', text: 'Start from the home page and search available cars.' },
                { step: '2', title: 'Open car details', text: 'Check the main vehicle information and rental price.' },
                { step: '3', title: 'Submit booking', text: 'Fill the booking form and choose a payment method.' },
                { step: '4', title: 'Track in My Bookings', text: 'Show status, dates, price, and payment summary.' },
              ].map((item) => (
                <div key={item.step} className="rounded-3xl bg-slate-50 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                    {item.step}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Featured cars</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-950">Ready for booking</h2>
              </div>

              <Link to="/cars" className="text-sm font-semibold text-slate-700 hover:text-slate-950">
                View all cars
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featuredCars.map((car) => (
                <CarCard key={car._id} car={car} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
