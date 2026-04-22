import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Building2, Calendar, Home, Image, LayoutDashboard, ShieldCheck, Sparkles } from 'lucide-react';

const menu = [
  { name: 'Overview', path: '.', icon: Home },
  { name: 'Performance', path: 'dashboard', icon: LayoutDashboard },
  { name: 'Listing', path: 'venue', icon: Building2 },
  { name: 'Bookings', path: 'bookings', icon: Calendar },
  { name: 'Gallery', path: 'images', icon: Image },
  { name: 'Verification', path: 'verification', icon: ShieldCheck },
];

const VendorLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F8F5FF]">
      <div className="mx-auto grid min-h-screen max-w-[1440px] gap-6 px-4 py-5 md:grid-cols-[280px_1fr] md:px-6">
        <aside className="hidden rounded-[34px] bg-gradient-to-b from-[#2A104F] to-[#4C1D95] p-6 text-white shadow-[0_28px_70px_rgba(76,29,149,0.35)] md:flex md:flex-col">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/70">Vendor Studio</p>
              <h2 className="text-xl font-extrabold">Event Marketplace</h2>
            </div>
          </div>

          <nav className="space-y-2">
            {menu.map((item) => {
              const Icon = item.icon;
              const isHome = item.path === '.';
              const active = isHome ? location.pathname === '/vendor' : location.pathname.includes(`/vendor/${item.path}`);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    active ? 'bg-white text-[#2A104F]' : 'text-white/82 hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-[26px] bg-white/10 p-4 text-sm text-white/80">
            Keep your listing updated with price, tag labels, availability, and high-quality images for better discovery.
          </div>
        </aside>

        <main className="space-y-5">
          <div className="rounded-[28px] bg-white px-5 py-4 shadow-[0_20px_55px_rgba(109,40,217,0.08)] md:px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#A293BB]">Vendor Workspace</p>
                <h1 className="mt-1 text-2xl font-extrabold text-[#22103D]">Manage your storefront</h1>
              </div>
              <Link to="/" className="rounded-full bg-[#F3E8FF] px-4 py-2 text-sm font-semibold text-[#6D28D9]">
                View Marketplace
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-[24px] bg-white p-2 shadow-[0_20px_55px_rgba(109,40,217,0.08)] md:hidden">
            {menu.slice(0, 3).map((item) => {
              const Icon = item.icon;
              const isHome = item.path === '.';
              const active = isHome ? location.pathname === '/vendor' : location.pathname.includes(`/vendor/${item.path}`);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex flex-col items-center gap-2 rounded-2xl px-2 py-3 text-[11px] font-semibold ${
                    active ? 'bg-[#6D28D9]/10 text-[#6D28D9]' : 'text-[#8A7AAE]'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
