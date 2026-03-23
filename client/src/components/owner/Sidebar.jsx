import React, { useEffect, useMemo, useState } from 'react';
import { assets, ownerMenuLinks } from '../../assets/assets';
import { useLocation, NavLink } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const { user, axios, fetchUser } = useAppContext();
  const location = useLocation();
  const [image, setImage] = useState('');
  const previewImage = useMemo(() => {
    if (image) {
      return URL.createObjectURL(image);
    }

    return user?.image || 'https://images.unsplash.com/photo-163332755192-727a05c4013d?q=80&w=300';
  }, [image, user?.image]);

  useEffect(() => {
    if (!image) return undefined;

    return () => URL.revokeObjectURL(previewImage);
  }, [image, previewImage]);

  const updateImage = async () => {
    try {
      const formData = new FormData();
      formData.append('image', image);

      const { data } = await axios.post('/api/owner/update-image', formData);

      if (data.success) {
        fetchUser();
        setImage('');
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <aside className="w-full md:max-w-[310px] md:min-w-[310px]">
      <div className="sticky top-[88px] m-4 overflow-hidden rounded-[2rem] border border-white/40 bg-slate-950 px-5 py-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(245,158,11,0.22),_transparent_26%)]" />

        <div className="relative">
          <div className="rounded-[1.6rem] border border-white/10 bg-white/6 p-5">
            <div className="flex items-center gap-4">
              <div className="group relative">
                <label htmlFor="image">
                  <img
                    src={previewImage}
                    alt=""
                    className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white/15"
                  />

                  <input type="file" id="image" accept="image/*" hidden onChange={(e) => setImage(e.target.files[0])} />

                  <div className="absolute inset-0 hidden rounded-2xl bg-slate-900/55 group-hover:flex items-center justify-center cursor-pointer">
                    <img src={assets.edit_icon} alt="" />
                  </div>
                </label>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">VIP Garage</p>
                <p className="mt-1 text-lg font-semibold">{user?.name}</p>
                <p className="text-sm text-white/60">Curating premium experiences</p>
              </div>
            </div>

            {image && (
              <button
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
                onClick={updateImage}
              >
                Save Profile Image <img src={assets.check_icon} width={13} alt="" />
              </button>
            )}
          </div>

          <div className="mt-5 space-y-2">
            {ownerMenuLinks.map((link, index) => {
              const active = link.path === location.pathname;

              return (
                <div key={index} className="transition-transform duration-150 hover:translate-x-1">
                  <NavLink
                    to={link.path}
                    className={`relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3.5 transition ${
                      active
                        ? 'bg-white text-slate-950 shadow-[0_14px_35px_rgba(255,255,255,0.16)]'
                        : 'bg-white/6 text-white/75 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <img src={active ? link.coloredIcon : link.icon} alt="" className="h-5 w-5" />
                    <span className="text-sm font-medium">{link.name}</span>
                    {active && <div className="ml-auto h-2.5 w-2.5 rounded-full bg-amber-400" />}
                  </NavLink>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
