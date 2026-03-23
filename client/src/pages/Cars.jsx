import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import CarCard from '../components/CarCard';
import { useAppContext } from '../context/appContext';

const Cars = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const pickupLocation = searchParams.get('pickupLocation');
  const pickupDate = searchParams.get('pickupDate');
  const returnDate = searchParams.get('returnDate');

  const [input, setInput] = useState(query);
  const [filteredCars, setFilteredCars] = useState([]);
  const { cars, axios } = useAppContext();
  const isSearchData = pickupDate && returnDate && pickupLocation;

  useEffect(() => {
    setInput(query);
  }, [query]);

  const applyFilter = useCallback(() => {
    if (input === '') {
      setFilteredCars(cars);
      return;
    }

    const searchTerm = input.toLowerCase();
    const filtered = cars.filter((car) => (
      car.brand.toLowerCase().includes(searchTerm) ||
      car.model.toLowerCase().includes(searchTerm) ||
      car.category.toLowerCase().includes(searchTerm) ||
      car.transmission.toLowerCase().includes(searchTerm)
    ));

    setFilteredCars(filtered);
  }, [cars, input]);

  const searchCarAvailability = useCallback(async (silent = false) => {
    try {
      const { data } = await axios.post('/api/bookings/check-availability', {
        location: pickupLocation,
        pickupDate,
        returnDate,
      });

      if (data.success) {
        setFilteredCars(data.cars || []);

        if (!silent && (data.cars || []).length === 0) {
          toast.error('No cars available');
        }

        return;
      }

      if (!silent) {
        toast.error(data.message || 'Failed to search cars');
      }
    } catch (error) {
      if (!silent) {
        toast.error(error?.response?.data?.message || error.message || 'Network error');
      }
    }
  }, [axios, pickupDate, pickupLocation, returnDate]);

  useEffect(() => {
    if (!isSearchData) {
      return undefined;
    }

    searchCarAvailability();

    const intervalId = setInterval(() => {
      searchCarAvailability(true);
    }, 10000);

    return () => clearInterval(intervalId);
  }, [isSearchData, searchCarAvailability]);

  useEffect(() => {
    if (cars.length > 0 && !isSearchData) {
      applyFilter();
    }
  }, [applyFilter, cars.length, isSearchData]);

  return (
    <div className="bg-slate-50 pb-16">
      <div className="flex flex-col items-center bg-slate-100 px-4 py-16">
        <Title
          title="Available Cars"
          subTitle="Browse cars, compare price and details, and continue with the booking flow."
        />

        <div className="mt-6 flex h-12 w-full max-w-xl items-center rounded-full bg-white px-4 shadow-sm">
          <img src={assets.search_icon} alt="" className="mr-2 h-4 w-4" />
          <input
            onChange={(event) => setInput(event.target.value)}
            value={input}
            type="text"
            placeholder="Search by brand, model, category, or transmission"
            className="h-full w-full outline-none text-gray-500"
          />
          <img src={assets.filter_icon} alt="" className="ml-2 h-4 w-4" />
        </div>
      </div>

      <div className="px-6 md:px-16 lg:px-24 xl:px-32">
        <p className="mt-10 text-slate-700">Showing {filteredCars.length} cars</p>

        {filteredCars.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
            <p className="text-lg font-semibold text-slate-900">No cars found</p>
            <p className="mt-2">Try another search or change the city and dates.</p>
          </div>
        ) : (
          <div className="mx-auto mt-4 grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:px-20">
            {filteredCars.map((car) => (
              <CarCard key={car._id} car={car} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cars;
