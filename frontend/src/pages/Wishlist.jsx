import React from 'react';
import { Heart } from 'lucide-react';
import MarketplaceBottomNav from '../components/MarketplaceBottomNav';

const Wishlist = () => {
  return (
    <div className="min-h-screen bg-[#F8F5FF] px-4 py-8 pb-28">
      <div className="mx-auto max-w-xl">
        <div className="rounded-[28px] bg-white p-6 shadow-[0_24px_60px_rgba(109,40,217,0.08)]">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3E8FF] text-[#7C3AED]">
            <Heart className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-[#22103D]">Wishlist</h1>
          <p className="mt-2 text-sm text-[#7D6F95]">
            Favorite venues and service combos can live here. The shell is ready, and we can connect persistent wishlist storage next.
          </p>
        </div>
      </div>
      <MarketplaceBottomNav />
    </div>
  );
};

export default Wishlist;
