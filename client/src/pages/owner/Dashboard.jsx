import React, { useCallback, useEffect, useState } from 'react';
import { assets } from '../../assets/assets';
import Title from '../../components/owner/Title';
import { useAppContext } from '../../context/appContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { currency, axios, isOwner } = useAppContext();
  const [data, setData] = useState({
    totalCars: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    recentBookings: [],
    monthlyRevenue: 0,
  });

  const dashboardCards = [
    { title: 'Cars', value: data.totalCars, suffix: 'total', accent: 'from-sky-500/20 to-blue-600/10', icon: assets.carIconColored },
    { title: 'Bookings', value: data.totalBookings, suffix: 'total', accent: 'from-violet-500/20 to-fuchsia-500/10', icon: assets.listIconColored },
    { title: 'Pending', value: data.pendingBookings, suffix: 'requests', accent: 'from-amber-400/25 to-orange-500/10', icon: assets.cautionIconColored },
    { title: 'Confirmed', value: data.completedBookings, suffix: 'bookings', accent: 'from-emerald-400/25 to-teal-500/10', icon: assets.listIconColored },
  ];

  const fetchDashboardData = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/owner/dashboard');
      if (data.success) {
        setData(data.dashboardData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, [axios]);

  useEffect(() => {
    if (isOwner) {
      fetchDashboardData();
    }
  }, [fetchDashboardData, isOwner]);

  return (
    <div className="min-h-full px-2 py-2 md:px-4">
      <Title
        title="Dashboard"
        subTitle="View cars, bookings, and revenue."
        eyebrow="Overview"
      />

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.25),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(251,191,36,0.22),_transparent_24%)]" />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.3em] text-white/55">Revenue</p>
            <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">{currency}{data.monthlyRevenue}</h2>
                <p className="mt-2 max-w-xl text-sm leading-7 text-white/70">
                  Revenue from confirmed bookings.
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-white/15 bg-white/10 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Summary</p>
                <p className="mt-2 text-lg font-medium">{data.completedBookings} confirmed bookings</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-[2rem] border border-white/50 bg-white/75 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Status</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900">Booking overview</h3>
          <div className="mt-5 space-y-4">
            <div className="rounded-[1.4rem] bg-slate-950 px-5 py-4 text-white">
              <p className="text-sm text-white/60">Completion rate</p>
              <p className="mt-1 text-3xl font-semibold">
                {data.totalBookings ? Math.round((data.completedBookings / data.totalBookings) * 100) : 0}%
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-sm text-slate-500">Pending bookings</p>
              <p className="mt-1 text-3xl font-semibold text-slate-900">{data.pendingBookings}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
        {dashboardCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="relative overflow-hidden rounded-[1.8rem] border border-white/55 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.accent}`} />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{card.title}</p>
                <p className="mt-4 text-4xl font-semibold text-slate-950">{card.value}</p>
                <p className="mt-1 text-sm text-slate-600">{card.suffix}</p>
              </div>
              <div className="rounded-2xl bg-white/85 p-3 shadow-sm">
                <img src={card.icon} alt="" className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-white/55 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Recent Activity</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">Recent bookings</h3>
            </div>
            <div className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white">
              Latest
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {data.recentBookings.map((booking, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
                className="flex flex-col gap-4 rounded-[1.6rem] border border-slate-200 bg-slate-50/90 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 md:flex">
                    <img src={assets.listIconColored} alt="" className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-900">{booking.car?.brand} {booking.car?.model}</p>
                    <p className="text-sm text-slate-500">Booked on {booking.createdAt.split('T')[0]}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium text-slate-700">{currency}{booking.price}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {booking.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-[2rem] border border-white/55 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#172554] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Notes</p>
          <h3 className="mt-2 text-2xl font-semibold">Quick summary</h3>
          <div className="mt-6 space-y-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4">
              <p className="text-sm text-white/60">Pending</p>
              <p className="mt-1 text-lg font-medium">Review pending bookings regularly.</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4">
              <p className="text-sm text-white/60">Confirmed</p>
              <p className="mt-1 text-lg font-medium">Confirmed bookings increase revenue.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
