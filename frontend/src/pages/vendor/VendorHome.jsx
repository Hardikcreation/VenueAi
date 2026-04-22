import React, { useEffect, useState } from 'react';
import { ArrowRight, Building2, Calendar, Image, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { vendorAPI } from '../../services/api';
import { getErrorMessage } from '../../utils/errors';

const actions = [
  { title: 'Update Listing', desc: 'Keep pricing, tags and occasion focus fresh.', path: 'venue', icon: Building2 },
  { title: 'Manage Bookings', desc: 'Approve, reject and track incoming requests.', path: 'bookings', icon: Calendar },
  { title: 'Refresh Gallery', desc: 'Upload premium photos for better conversion.', path: 'images', icon: Image },
  { title: 'Verification', desc: 'Complete trust documents and improve approval.', path: 'verification', icon: ShieldCheck },
];

const VendorHome = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await vendorAPI.getProfile();
        setProfile(response);
      } catch (err) {
        const message = getErrorMessage(err, 'Failed to fetch vendor profile');
        setError(message);
        showToast(message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const approvalState = profile?.approved && profile?.venue_status === 'approved'
    ? 'Live'
    : profile?.venue_status === 'rejected'
      ? 'Needs changes'
      : 'Pending review';

  return (
    <div className="space-y-5">
      <section className="rounded-[32px] bg-gradient-to-br from-[#6D28D9] via-[#7C3AED] to-[#C026D3] p-6 text-white shadow-[0_30px_70px_rgba(109,40,217,0.28)]">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/75">Vendor HQ</p>
        <h2 className="mt-2 text-3xl font-extrabold">{profile?.business_name || 'Your Event Business'}</h2>
        <p className="mt-3 max-w-2xl text-sm text-white/82">
          Run your storefront like a marketplace brand: keep your listing polished, stay responsive to leads, and use images plus premium metadata to lift discovery.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-[24px] bg-white/14 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/70">Status</p>
            <p className="mt-2 text-xl font-bold">{approvalState}</p>
          </div>
          <div className="rounded-[24px] bg-white/14 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/70">Venue Review</p>
            <p className="mt-2 text-xl font-bold capitalize">{profile?.venue_status || 'Not submitted'}</p>
          </div>
          <div className="rounded-[24px] bg-white/14 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/70">Profile</p>
            <p className="mt-2 text-xl font-bold">{loading ? 'Loading...' : 'Ready'}</p>
          </div>
        </div>
      </section>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.title}
              type="button"
              onClick={() => navigate(action.path)}
              className="rounded-[28px] bg-white p-5 text-left shadow-[0_18px_45px_rgba(109,40,217,0.08)] transition hover:-translate-y-1"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3E8FF] text-[#7C3AED]">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#22103D]">{action.title}</h3>
              <p className="mt-2 text-sm text-[#7D6F95]">{action.desc}</p>
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#7C3AED]">
                Open <ArrowRight className="h-4 w-4" />
              </div>
            </button>
          );
        })}
      </section>

      <section className="rounded-[28px] bg-white p-6 shadow-[0_18px_45px_rgba(109,40,217,0.08)]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3E8FF] text-[#7C3AED]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#22103D]">Marketplace checklist</h3>
            <p className="text-sm text-[#7D6F95]">A clean listing converts better than a crowded one.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {[
            'Write a strong title and description matched to your actual category.',
            'Use tag labels like Pure Veg, Premium, or Family Favorite thoughtfully.',
            'Keep pricing and availability current so users trust your card.',
            'Upload multiple quality images that match the listing promise.',
          ].map((tip) => (
            <div key={tip} className="rounded-2xl bg-[#F8F5FF] px-4 py-3 text-sm font-medium text-[#3D2A60]">
              {tip}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default VendorHome;
