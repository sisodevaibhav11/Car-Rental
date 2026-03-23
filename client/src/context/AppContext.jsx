import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from 'react-hot-toast';
import { useLocation, useNavigate } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currency = import.meta.env.VITE_CURRENCY || "$";

  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [pickupDate, setPickupDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [cars, setCars] = useState([]);
  const [locations, setLocations] = useState([]);

  const logout = useCallback((showToast = true) => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsOwner(false);
    delete axios.defaults.headers.common.Authorization;

    if (showToast) {
      toast.success('Logged out successfully');
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/user/data');
      if (data.success) {
        setUser(data.user);
        setIsOwner(data.user.role === 'owner');
      } else {
        logout(false);
        navigate('/');
      }
    } catch (error) {
      logout(false);
      toast.error(error?.response?.data?.message || error.message);
    }
  }, [logout, navigate]);

  const fetchCars = useCallback(async (silent = false) => {
    try {
      const { data } = await axios.get('/api/user/cars');
      if (data.success) {
        setCars(data.cars);
      } else if (!silent) {
        toast.error(data.message);
      }
    } catch (error) {
      if (!silent) {
        toast.error(error?.response?.data?.message || error.message);
      }
    }
  }, []);

  const fetchLocations = useCallback(async (silent = false) => {
    try {
      const { data } = await axios.get('/api/user/locations');
      if (data.success) {
        setLocations(data.locations || []);
      } else if (!silent) {
        toast.error(data.message || 'Failed to load locations');
      }
    } catch (error) {
      if (!silent) {
        toast.error(error?.response?.data?.message || error.message);
      }
    }
  }, []);

  useEffect(() => {
    fetchCars();
    fetchLocations(true);

    const intervalId = setInterval(() => {
      if (document.hidden) {
        return;
      }

      fetchCars(true);
      fetchLocations(true);
    }, location.pathname.startsWith('/owner') ? 30000 : 20000);

    return () => clearInterval(intervalId);
  }, [fetchCars, fetchLocations, location.pathname]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common.Authorization = token;
      fetchUser();
    } else {
      delete axios.defaults.headers.common.Authorization;
    }

    fetchCars(true);
    fetchLocations(true);
  }, [fetchCars, fetchLocations, fetchUser, token]);

  const value = useMemo(() => ({
    navigate,
    currency,
    axios,
    user,
    setUser,
    token,
    setToken,
    isOwner,
    setIsOwner,
    fetchUser,
    showLogin,
    setShowLogin,
    pickupDate,
    setPickupDate,
    returnDate,
    setReturnDate,
    cars,
    fetchCars,
    logout,
    setCars,
    locations,
    fetchLocations,
  }), [
    navigate,
    currency,
    user,
    token,
    isOwner,
    fetchUser,
    showLogin,
    pickupDate,
    returnDate,
    cars,
    fetchCars,
    logout,
    locations,
    fetchLocations,
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
