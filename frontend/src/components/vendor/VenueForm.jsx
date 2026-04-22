import React, { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { vendorAPI } from '../../services/api';
import { getErrorMessage } from '../../utils/errors';

const CATEGORY_OPTIONS = [
  'Wedding Hall',
  'Luxury Ballroom',
  'Banquet Hall',
  'Rooftop Venue',
  'Resort',
  'Destination Venue',
  'Farmhouse',
  'Garden Venue',
  'Conference Hall',
  'Corporate Event Space',
];

const BUDGET_OPTIONS = ['budget', 'mid', 'premium'];

const createInitialForm = () => ({
  title: '',
  description: '',
  price: '',
  location: '',
  city: 'Bhopal',
  capacity: '',
  category: '',
  zone: '',
  landmark: '',
  priceUnit: 'Starting Price',
  tagLabel: '',
  budgetTier: 'mid',
  pureVeg: false,
  premiumPick: false,
  availableToday: true,
  serviceArea: '',
  occasionFocus: '',
});

const VenueForm = ({ venue, refresh }) => {
  const [form, setForm] = useState(createInitialForm());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (venue) {
      setForm({
        ...createInitialForm(),
        ...venue,
        occasionFocus: Array.isArray(venue.occasion_focus)
          ? venue.occasion_focus.join(', ')
          : Array.isArray(venue.occasion_types)
            ? venue.occasion_types.join(', ')
            : '',
        pureVeg: Boolean(venue.pure_veg),
        premiumPick: Boolean(venue.premium_pick),
        availableToday: Boolean(venue.available_today),
        priceUnit: venue.price_unit || 'Starting Price',
        tagLabel: venue.tag_label || '',
        budgetTier: venue.budget_tier || 'mid',
        serviceArea: venue.service_area || '',
      });
    }
  }, [venue]);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        ...form,
        occasionFocus: form.occasionFocus,
        occasionTypes: form.occasionFocus,
      };

      if (venue) {
        await vendorAPI.updateVenue(payload);
        showToast('Listing updated successfully.', 'success');
      } else {
        await vendorAPI.addVenue(payload);
        showToast('Listing created successfully.', 'success');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      refresh();
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to save listing. Please try again.');
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5 rounded-[28px] bg-white p-6 shadow-[0_22px_55px_rgba(109,40,217,0.08)]">
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Listing saved successfully.</div>}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#3D2A60]">Title</span>
          <input
            type="text"
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder="Ex: Gauri Greens"
            className="w-full rounded-2xl border border-[#E9DDFE] px-4 py-3 outline-none focus:border-[#7C3AED]"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#3D2A60]">Category</span>
          <select
            value={form.category}
            onChange={(event) => updateField('category', event.target.value)}
            className="w-full rounded-2xl border border-[#E9DDFE] px-4 py-3 outline-none focus:border-[#7C3AED]"
            required
          >
            <option value="">Select category</option>
            {CATEGORY_OPTIONS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-[#3D2A60]">Description</span>
        <textarea
          value={form.description}
          onChange={(event) => updateField('description', event.target.value)}
          rows={4}
          placeholder="Describe your venue, ambience, packages and why customers love it."
          className="w-full rounded-2xl border border-[#E9DDFE] px-4 py-3 outline-none focus:border-[#7C3AED]"
          required
        />
      </label>

      <div className="grid gap-5 md:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#3D2A60]">Price</span>
          <input
            type="number"
            value={form.price}
            onChange={(event) => updateField('price', event.target.value)}
            className="w-full rounded-2xl border border-[#E9DDFE] px-4 py-3 outline-none focus:border-[#7C3AED]"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#3D2A60]">Price Unit</span>
          <input
            type="text"
            value={form.priceUnit}
            onChange={(event) => updateField('priceUnit', event.target.value)}
            placeholder="Starting Price / Per Event"
            className="w-full rounded-2xl border border-[#E9DDFE] px-4 py-3 outline-none focus:border-[#7C3AED]"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#3D2A60]">Capacity</span>
          <input
            type="number"
            value={form.capacity}
            onChange={(event) => updateField('capacity', event.target.value)}
            className="w-full rounded-2xl border border-[#E9DDFE] px-4 py-3 outline-none focus:border-[#7C3AED]"
          />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#3D2A60]">Location</span>
          <input
            type="text"
            value={form.location}
            onChange={(event) => updateField('location', event.target.value)}
            placeholder="Arera Colony, Bhopal"
            className="w-full rounded-2xl border border-[#E9DDFE] px-4 py-3 outline-none focus:border-[#7C3AED]"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#3D2A60]">Service Area</span>
          <input
            type="text"
            value={form.serviceArea}
            onChange={(event) => updateField('serviceArea', event.target.value)}
            placeholder="MP Nagar, Arera Colony, Shahpura"
            className="w-full rounded-2xl border border-[#E9DDFE] px-4 py-3 outline-none focus:border-[#7C3AED]"
          />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#3D2A60]">Zone</span>
          <input
            type="text"
            value={form.zone}
            onChange={(event) => updateField('zone', event.target.value)}
            className="w-full rounded-2xl border border-[#E9DDFE] px-4 py-3 outline-none focus:border-[#7C3AED]"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#3D2A60]">Landmark</span>
          <input
            type="text"
            value={form.landmark}
            onChange={(event) => updateField('landmark', event.target.value)}
            className="w-full rounded-2xl border border-[#E9DDFE] px-4 py-3 outline-none focus:border-[#7C3AED]"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#3D2A60]">Budget Tier</span>
          <select
            value={form.budgetTier}
            onChange={(event) => updateField('budgetTier', event.target.value)}
            className="w-full rounded-2xl border border-[#E9DDFE] px-4 py-3 outline-none focus:border-[#7C3AED]"
          >
            {BUDGET_OPTIONS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#3D2A60]">Tag Label</span>
          <input
            type="text"
            value={form.tagLabel}
            onChange={(event) => updateField('tagLabel', event.target.value)}
            placeholder="Pure Veg / Most Loved / Premium"
            className="w-full rounded-2xl border border-[#E9DDFE] px-4 py-3 outline-none focus:border-[#7C3AED]"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#3D2A60]">Occasion Focus</span>
          <input
            type="text"
            value={form.occasionFocus}
            onChange={(event) => updateField('occasionFocus', event.target.value)}
            placeholder="Wedding, Anniversary, Corporate Event"
            className="w-full rounded-2xl border border-[#E9DDFE] px-4 py-3 outline-none focus:border-[#7C3AED]"
          />
        </label>
      </div>

      <div className="grid gap-4 rounded-[24px] bg-[#F8F5FF] p-4 md:grid-cols-3">
        {[
          ['Pure Veg', 'pureVeg'],
          ['Premium Pick', 'premiumPick'],
          ['Available Today', 'availableToday'],
        ].map(([label, key]) => (
          <label key={key} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#3D2A60]">
            <input
              type="checkbox"
              checked={Boolean(form[key])}
              onChange={(event) => updateField(key, event.target.checked)}
              className="h-4 w-4 rounded border-[#D8B4FE] text-[#7C3AED]"
            />
            <span>{label}</span>
          </label>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-r from-[#6D28D9] to-[#9333EA] px-4 py-3 font-semibold text-white shadow-[0_18px_45px_rgba(109,40,217,0.24)] disabled:opacity-60"
      >
        {loading ? 'Saving listing...' : venue ? 'Update Listing' : 'Create Listing'}
      </button>
    </form>
  );
};

export default VenueForm;
