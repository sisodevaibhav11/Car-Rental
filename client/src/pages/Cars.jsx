import React, { useCallback, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import Title from '../components/Title'
import CarCard from '../components/CarCard'
import { useSearchParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const Cars = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const [input, setInput] = useState(query);
  const pickupLocation = searchParams.get('pickupLocation');
  const pickupDate = searchParams.get('pickupDate');
  const returnDate = searchParams.get('returnDate');

  const { cars, axios } = useAppContext();

  const isSearchData = pickupDate && returnDate && pickupLocation;
  const [filteredCars, setFilteredCars] = useState([]);

  useEffect(() => {
    setInput(query);
  }, [query]);

  const applyFilter = useCallback(() => {
    if (input === '') {
      setFilteredCars(cars);
      return;
    }

    const filtered = cars.slice().filter((car) => {
      const searchTerm = input.toLowerCase();
      return (
        car.brand.toLowerCase().includes(searchTerm) ||
        car.model.toLowerCase().includes(searchTerm) ||
        car.category.toLowerCase().includes(searchTerm) ||
        car.transmission.toLowerCase().includes(searchTerm)
      );
    });
    setFilteredCars(filtered);
  }, [cars, input])

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

      !silent && toast.error(data.message || 'Failed to search cars');
    } catch (error) {
      !silent && toast.error(error?.response?.data?.message || error.message || 'Network error');
    }
  }, [axios, pickupDate, pickupLocation, returnDate])
  useEffect(() => {
    if (!isSearchData) return undefined;

    searchCarAvailability();

    const intervalId = setInterval(() => {
      searchCarAvailability(true);
    }, 10000);

    return () => clearInterval(intervalId);
  }, [isSearchData, searchCarAvailability])

  useEffect(() => {
    cars.length > 0 && !isSearchData && applyFilter();
  }, [applyFilter, cars.length, isSearchData])

  return (
    <div>
      <div className='flex flex-col items-center py-20 bg-gray-100 max-md:px-4'>
        <Title title='Available Cars' subTitle='Browse our selection of premium 
            vehicles available for your next adventure'/>

        <div className='flex items-center bg-white px-4 mt-6 max-w-140 w-full h-12 
        rounded-full shadow'>
          <img src={assets.search_icon} alt="" className='w-4.5 h-4.5 mr-2' />
          
          <input onChange={(e) => setInput(e.target.value)} value={input} type="text"
            placeholder='Search by make, model, or features' className='w-full h-full
            outline-none text-gray-500'/>

          <img src={assets.filter_icon} alt="" className='w-4.5 h-4.5 ml-2' />
        </div>
      </div>

      <div>
        <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-10'>
          <p>Showing {filteredCars.length} Cars</p>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4
                              xl:px-20 max-w-7xl mx-auto'>
            {filteredCars.map((car, index) => (
              <div key={index}>
                <CarCard car={car} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cars
