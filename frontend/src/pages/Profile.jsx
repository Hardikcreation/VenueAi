import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, LogIn, UserRound } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import MarketplaceBottomNav from '../components/MarketplaceBottomNav';

const Profile = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-[#F8F5FF] px-4 py-8 pb-28">
      <div className="mx-auto max-w-xl space-y-4">
        <div className="rounded-[28px] bg-gradient-to-br from-[#6D28D9] to-[#9333EA] p-6 text-white shadow-[0_24px_70px_rgba(109,40,217,0.28)]">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15">
            <UserRound className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">{user?.name || 'Guest Profile'}</h1>
          <p className="mt-2 text-sm text-white/80">{user?.email || 'Login to manage bookings, wishlist, and account settings.'}</p>
        </div>

        {!user ? (
          <Link
            to="/login"
            className="flex items-center justify-between rounded-[24px] bg-white px-5 py-4 text-[#22103D] shadow-[0_18px_45px_rgba(109,40,217,0.08)]"
          >
            <span className="flex items-center gap-3 font-semibold">
              <LogIn className="h-5 w-5 text-[#7C3AED]" />
              Login to continue
            </span>
            <ChevronRight className="h-5 w-5 text-[#8A7AAE]" />
          </Link>
        ) : (
          <div className="rounded-[24px] bg-white p-5 shadow-[0_18px_45px_rgba(109,40,217,0.08)]">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#7D6F95]">Role</span>
              <span className="font-semibold capitalize text-[#22103D]">{user.role}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#7D6F95]">Bookings</span>
              <Link to="/my-bookings" className="font-semibold text-[#7C3AED]">View</Link>
            </div>
          </div>
        )}
      </div>
      <MarketplaceBottomNav />
    </div>
  );
};

export default Profile;
