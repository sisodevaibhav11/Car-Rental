import React from 'react'
import NavBar from './components/Navbar.jsx'
import { useLocation, Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Cars from './pages/Cars.jsx'
import CarDetails from './pages/CarDetails.jsx'
import BookingPage from './pages/BookingPage.jsx'
import MyBookings from './pages/MyBookings.jsx'
import Footer from './components/Footer.jsx'
import Layout from './pages/owner/Layout.jsx'
import Dashboard from './pages/owner/Dashboard.jsx'
import AddCar from './pages/owner/AddCar.jsx'
import ManageCars from './pages/owner/ManageCars.jsx'
import ManageBookings from './pages/owner/ManageBookings.jsx'
import Login from './components/Login.jsx'
import {Toaster} from 'react-hot-toast'
import { useAppContext } from './context/appContext.jsx'
    
const App = () => {
  const {showLogin}=useAppContext();
  const isOwnerPath = useLocation().pathname.startsWith('/owner');
  return (
    <>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: '12px',
          padding: '14px 16px',
          color: '#0f172a',
          fontWeight: 500,
        },
        success: {
          style: {
            background: '#dcfce7',
            border: '1px solid #86efac',
            color: '#166534',
          },
          iconTheme: {
            primary: '#16a34a',
            secondary: '#dcfce7',
          },
        },
        error: {
          style: {
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
          },
          iconTheme: {
            primary: '#dc2626',
            secondary: '#fee2e2',
          },
        },
      }}
    />
      {showLogin && <Login />}
      
      {!isOwnerPath && <NavBar/>}

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/car/:id' element={<CarDetails />} />
        <Route path='/book/:id' element={<BookingPage />} />
        <Route path='/cars' element={<Cars />} />
        <Route path='/my-bookings' element={<MyBookings />} />
        <Route path='/owner' element={<Layout />} >
          <Route index element={<Dashboard />} />
          <Route path='add-car' element={<AddCar />} />
          <Route path='manage-cars' element={<ManageCars />} />
          <Route path='manage-bookings' element={<ManageBookings />} />
        </Route>
      </Routes>

      {!isOwnerPath && <Footer />}
    </>
  )
}

export default App
