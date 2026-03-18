import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from 'react-hot-toast'
import { useNavigate } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"

export const AppContext = createContext();

export const AppProvider = ({ children }) => {

    const navigate = useNavigate();
    const currency = import.meta.env.VITE_CURRENCY || "$"

    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [isOwner, setIsOwner] = useState(null);
    const [showLogin, setShowLogin] = useState(false);
    const [pickupDate, setPickupDate] = useState(null);
    const [returnDate, setReturnDate] = useState(null);

    const [cars, setCars] = useState([]);
    const [locations, setLocations] = useState([]);

    //function to check if user is logged in 
    const logout = useCallback((showToast = true) => {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
        setIsOwner(false)
        delete axios.defaults.headers.common.Authorization
        if (showToast) {
            toast.success('Logged out successfully')
        }
    }, [])

    const fetchUser = useCallback(async () => {
        try {
            const { data } = await axios.get('/api/user/data')
            if (data.success) {
                setUser(data.user)
                setIsOwner(data.user.role === 'owner')
            } else {
                logout(false)
                navigate('/')
            }
        } catch (error) {
            logout(false)
            toast.error(error?.response?.data?.message || error.message);
        }
    }, [logout, navigate])
    //function to fetch all cars from server
    const fetchCars = useCallback(async (silent = false) => {
        try {
            const { data } = await axios.get('/api/user/cars')
            data.success ? setCars(data.cars) : !silent && toast.error(data.message)
        } catch (error) {
            !silent && toast.error(error?.response?.data?.message || error.message)
        }
    }, [])

    const fetchLocations = useCallback(async (silent = false) => {
        try {
            const { data } = await axios.get('/api/user/locations')
            if (data.success) {
                setLocations(data.locations || [])
            } else if (!silent) {
                toast.error(data.message || 'Failed to load locations')
            }
        } catch (error) {
            !silent && toast.error(error?.response?.data?.message || error.message)
        }
    }, [])

    //useEffect to fetch cars on first load
    useEffect(() => {
        fetchCars()
        fetchLocations(true)

        const intervalId = setInterval(() => {
            fetchCars(true)
            fetchLocations(true)
        }, 10000)

        return () => clearInterval(intervalId)
    }, [fetchCars, fetchLocations])

    //useEffect to fetch user data when token is available
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common.Authorization = token
            fetchUser()
        } else {
            delete axios.defaults.headers.common.Authorization
        }
    }, [fetchUser, token])

    const value = useMemo(() => ({
        navigate, currency, axios, user, setUser,
        token, setToken, isOwner, setIsOwner, fetchUser, showLogin,
        setShowLogin, pickupDate, setPickupDate, returnDate, setReturnDate, cars, fetchCars, logout, setCars, locations, fetchLocations
    }), [navigate, currency, user, token, isOwner, fetchUser, showLogin, pickupDate, returnDate, cars, fetchCars, logout, locations, fetchLocations])

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );

}

export const useAppContext = () => {
    return useContext(AppContext)
}

