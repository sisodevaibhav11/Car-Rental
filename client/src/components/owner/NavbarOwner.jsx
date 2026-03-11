import React from 'react';
import { assets } from '../../assets/assets';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { motion } from 'framer-motion';

const NavbarOwner = () => {
  const { user } = useAppContext();

  return (
    <div className="sticky top-0 z-40 border-b border-white/40 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 text-white md:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img src={assets.logo} alt="" className="h-8 rounded-full bg-white/95 p-1.5" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.34em] text-white/60">Luxury Fleet</p>
            <p className="text-sm font-medium text-white">Owner Command</p>
          </div>
        </Link>

        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden items-center gap-3 rounded-full border border-white/15 bg-white/8 px-4 py-2 md:flex"
        >
          <div className="h-10 w-10 overflow-hidden rounded-full border border-white/20">
            <img
              src={user?.image || 'https://images.unsplash.com/photo-163332755192-727a05c4013d?q=80&w=300'}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/50">Operator</p>
            <p className="text-sm font-medium text-white">{user?.name || 'Owner'}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NavbarOwner;
