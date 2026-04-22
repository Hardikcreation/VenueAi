import React, { useContext } from 'react';
import { CalendarDays, Heart, Home, Search, UserCircle2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const MarketplaceBottomNav = () => {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const profilePath = user?.role === 'vendor' ? '/vendor' : user?.role === 'admin' ? '/admin' : '/profile';

  const items = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/services', label: 'Search', icon: Search },
    { to: '/my-bookings', label: 'Bookings', icon: CalendarDays },
    { to: '/wishlist', label: 'Wishlist', icon: Heart },
    { to: profilePath, label: 'Profile', icon: UserCircle2 },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#EDE6FF] bg-white/95 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-xl items-center justify-between px-3 py-2">
        {items.map((item) => {
          const active = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex min-w-[64px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-semibold transition ${
                active ? 'bg-[#6D28D9]/10 text-[#6D28D9]' : 'text-[#8A7AAE]'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MarketplaceBottomNav;
