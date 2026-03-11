import React, { useEffect } from 'react';
import NavbarOwner from '../../components/owner/NavbarOwner';
import Sidebar from '../../components/owner/Sidebar';
import { Outlet } from 'react-router-dom';
import { useAppContext } from '../../context/appContext';

const Layout = () => {
  const { isOwner, navigate } = useAppContext();

  useEffect(() => {
    if (isOwner === false) {
      navigate('/');
    }
  }, [isOwner, navigate]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#edf4ff_30%,#fdf7ef_100%)]">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-12%] top-[-8%] h-[420px] w-[420px] rounded-full bg-sky-300/20 blur-3xl" />
        <div className="absolute right-[-10%] top-[18%] h-[360px] w-[360px] rounded-full bg-amber-300/25 blur-3xl" />
        <div className="absolute bottom-[-12%] left-[26%] h-[340px] w-[340px] rounded-full bg-rose-300/18 blur-3xl" />
      </div>

      <NavbarOwner />

      <div className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-[1600px] flex-col gap-4 px-3 py-4 md:flex-row md:px-4">
        <Sidebar />
        <main className="min-h-full flex-1">
          <div className="min-h-[calc(100vh-105px)] rounded-[2rem] border border-white/45 bg-white/35 p-4 backdrop-blur-xl md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
