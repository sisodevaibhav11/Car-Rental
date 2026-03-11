import React, { useState } from 'react';
import { useAppContext } from '../context/appContext.jsx';
import toast from 'react-hot-toast';
import { assets, menuLinks } from '../assets/assets';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ConfirmModal from './ConfirmModal.jsx';

const Navbar = () => {
  const [searchInput, setSearchInput] = useState('');
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    variant: 'primary',
    onConfirm: null,
  });

  const { setShowLogin, user, logout, isOwner, axios, setIsOwner } = useAppContext();

  const location = useLocation();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const isHomePage = location.pathname === '/';

  const changeRole = async () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    try {
      const { data } = await axios.post('/api/owner/change-role');
      if (data.success) {
        setIsOwner(true);
        toast.success(data.message);
        navigate('/owner/add-car');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleNavbarSearch = (event) => {
    event.preventDefault();
    const trimmedSearch = searchInput.trim();

    navigate(trimmedSearch ? `/cars?query=${encodeURIComponent(trimmedSearch)}` : '/cars');
    setOpen(false);
  };

  const openConfirm = ({ title, message, confirmText, variant, onConfirm }) => {
    setConfirmState({
      open: true,
      title,
      message,
      confirmText,
      variant,
      onConfirm,
    });
  };

  const closeConfirm = () => {
    setConfirmState((prev) => ({ ...prev, open: false, onConfirm: null }));
  };

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45 }}
        className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-all ${
          isHomePage
            ? 'border-white/40 bg-white/55 shadow-[0_16px_40px_rgba(15,23,42,0.06)]'
            : 'border-slate-200/80 bg-white/88 shadow-[0_10px_30px_rgba(15,23,42,0.05)]'
        }`}
      >
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-6 py-4 md:px-10 lg:px-16 xl:px-24">
          <Link to="/" className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.03 }} className="rounded-full bg-slate-950 p-2 shadow-[0_10px_28px_rgba(15,23,42,0.16)]">
              <img src={assets.logo} alt="logo" className="h-7 w-7 rounded-full bg-white p-1" />
            </motion.div>
            <div className="hidden sm:block">
              <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-slate-500">Prestige Rentals</p>
              <p className="text-sm font-semibold tracking-[0.08em] text-slate-900">Luxury Car Collection</p>
            </div>
          </Link>

          <div
            className={`fixed right-0 top-[73px] z-50 flex h-[calc(100vh-73px)] w-full flex-col gap-6 border-l border-slate-200/80 px-6 py-6 transition-transform duration-300 sm:static sm:h-auto sm:w-auto sm:flex-row sm:items-center sm:border-l-0 sm:bg-transparent sm:px-0 sm:py-0 ${
              open
                ? 'translate-x-0 bg-white/96 backdrop-blur-xl'
                : 'translate-x-full bg-white/96 backdrop-blur-xl sm:translate-x-0'
            }`}
          >
            <nav className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
              {menuLinks.map((link, index) => (
                <NavLink
                  key={index}
                  to={link.path}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2.5 text-sm font-semibold tracking-[0.08em] transition ${
                      isActive
                        ? 'bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)]'
                        : 'text-slate-600 hover:bg-white/80 hover:text-slate-950'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>

            <form
              onSubmit={handleNavbarSearch}
              className="flex w-full items-center gap-2 rounded-full border border-slate-200 bg-white/88 px-4 py-2 shadow-[0_8px_22px_rgba(15,23,42,0.05)] sm:w-[280px]"
            >
              <img src={assets.search_icon} alt="search icon" className="h-4 w-4 opacity-60" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Search luxury cars"
              />
              <button
                type="submit"
                className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-slate-800"
              >
                Go
              </button>
            </form>

            <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
              <button
                onClick={() =>
                  isOwner
                    ? navigate('/owner')
                    : openConfirm({
                        title: 'Become an Owner?',
                        message: 'This will switch your account to owner mode so you can list and manage cars.',
                        confirmText: 'Continue',
                        variant: 'primary',
                        onConfirm: async () => {
                          closeConfirm();
                          await changeRole();
                        },
                      })
                }
                className="text-sm font-semibold tracking-[0.08em] text-slate-600 transition hover:text-slate-950"
              >
                {isOwner ? 'Dashboard' : 'List cars'}
              </button>

              <button
                onClick={() => {
                  if (!user) {
                    setShowLogin(true);
                    return;
                  }

                  openConfirm({
                    title: 'Logout from this account?',
                    message: 'You will need to login again to manage bookings, cars, and account actions.',
                    confirmText: 'Logout',
                    variant: 'danger',
                    onConfirm: () => {
                      closeConfirm();
                      logout();
                    },
                  });
                }}
                className="rounded-full bg-slate-950 px-6 py-2.5 text-sm font-bold tracking-[0.12em] text-white shadow-[0_12px_30px_rgba(15,23,42,0.14)] transition hover:bg-slate-800"
              >
                {user ? 'Logout' : 'Login'}
              </button>
            </div>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="rounded-full border border-slate-200 bg-white/80 p-2.5 text-slate-700 shadow-sm transition hover:bg-white sm:hidden"
          >
            <img
              src={open ? assets.close_icon : assets.menu_icon}
              alt="menu"
              className="h-4 w-4"
            />
          </button>
        </div>
      </motion.header>

      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        variant={confirmState.variant}
        onClose={closeConfirm}
        onConfirm={confirmState.onConfirm}
      />
    </>
  );
};

export default Navbar;
