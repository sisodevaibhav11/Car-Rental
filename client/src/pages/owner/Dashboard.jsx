import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { assets } from '../../assets/assets';
import Title from '../../components/owner/Title';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { currency, axios, isOwner } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    totalCars: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    recentBookings: [],
    monthlyRevenue: 0,
  });
  const completionRate = useMemo(() => (
    data.totalBookings ? Math.round((data.completedBookings / data.totalBookings) * 100) : 0
  ), [data.completedBookings, data.totalBookings]);

  const dashboardCards = [
    { title: 'Cars', value: data.totalCars, suffix: 'total', accent: 'from-sky-500/20 to-blue-600/10', icon: assets.carIconColored },
    { title: 'Bookings', value: data.totalBookings, suffix: 'total', accent: 'from-violet-500/20 to-fuchsia-500/10', icon: assets.listIconColored },
    { title: 'Pending', value: data.pendingBookings, suffix: 'requests', accent: 'from-amber-400/25 to-orange-500/10', icon: assets.cautionIconColored },
    { title: 'Confirmed', value: data.completedBookings, suffix: 'bookings', accent: 'from-emerald-400/25 to-teal-500/10', icon: assets.listIconColored },
  ];

  const fetchDashboardData = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      }

      const { data } = await axios.get('/api/owner/dashboard');
      if (data.success) {
        setData(data.dashboardData);
      } else {
        !silent && toast.error(data.message);
      }
    } catch (error) {
      !silent && toast.error(error.message);
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
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
        subTitle="See the main details of your cars and bookings in one place."
        eyebrow="Overview"
      />

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.25),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(251,191,36,0.22),_transparent_24%)]" />
          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/55">Total Revenue</p>
                <p className="mt-2 text-sm text-white/65">Money earned from confirmed bookings</p>
              </div>
              <button
                type="button"
                onClick={() => fetchDashboardData()}
                disabled={isLoading}
                className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Refreshing' : 'Refresh'}
              </button>
            </div>
            <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">{isLoading ? '...' : `${currency}${data.monthlyRevenue}`}</h2>
                <p className="mt-2 max-w-xl text-sm leading-7 text-white/70">
                  This number updates when bookings are confirmed.
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-white/15 bg-white/10 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Main Focus</p>
                <p className="mt-2 text-lg font-medium">{data.pendingBookings} bookings need review</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/50 bg-white/75 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">What To Do</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900">Simple next steps</h3>
          <div className="mt-5 space-y-4">
            <div className="rounded-[1.4rem] bg-slate-950 px-5 py-4 text-white">
              <p className="text-sm text-white/60">Check booking requests</p>
              <p className="mt-1 text-lg font-semibold">{data.pendingBookings} pending bookings</p>
            </div>
            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-sm text-slate-500">Check car visibility</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{data.totalCars} cars in your list</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
        {dashboardCards.map((card, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-[1.8rem] border border-white/55 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.accent}`} />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{card.title}</p>
                <p className="mt-4 text-4xl font-semibold text-slate-950">{isLoading ? '...' : card.value}</p>
                <p className="mt-1 text-sm text-slate-600">{card.suffix}</p>
              </div>
              <div className="rounded-2xl bg-white/85 p-3 shadow-sm">
                <img src={card.icon} alt="" className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[2rem] border border-white/55 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
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
            {!isLoading && data.recentBookings.length === 0 && (
              <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-slate-50/70 p-6 text-sm text-slate-500">
                No recent bookings yet. New reservations will appear here.
              </div>
            )}
            {data.recentBookings.map((booking, index) => (
              <div
                key={index}
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
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/55 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#172554] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Quick Guide</p>
          <h3 className="mt-2 text-2xl font-semibold">Main features only</h3>
          <div className="mt-6 space-y-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4">
              <p className="text-sm text-white/60">Add Car</p>
              <p className="mt-1 text-lg font-medium">Create a new car listing with image, price, and location.</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4">
              <p className="text-sm text-white/60">Manage</p>
              <p className="mt-1 text-lg font-medium">Show or hide cars and confirm or cancel bookings.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
