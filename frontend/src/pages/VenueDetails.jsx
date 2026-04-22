import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, CheckCircle2, ImageIcon, IndianRupee, MapPin, Users } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { bookingAPI, productAPI } from '../services/api';
import { getErrorMessage } from '../utils/errors';
import { getVenueImage, getVenueLocationLabel, toVenueImageUrl } from '../utils/venues';

const OCCASIONS = ['Wedding', 'Reception', 'Birthday', 'Corporate Event', 'Engagement', 'Other'];

const toCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const today = new Date().toISOString().split('T')[0];

const formatDate = (value) => {
  if (!value) return 'Not selected';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const VenueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const bookingSectionRef = useRef(null);

  const [venue, setVenue] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [bookingForm, setBookingForm] = useState({
    booking_name: user?.name || '',
    booking_email: user?.email || '',
    booking_phone: '',
    event_date: '',
    guest_count: '',
    occasion_type: 'Wedding',
    payment_method: 'on_visit',
    message: '',
  });

  useEffect(() => {
    setBookingForm((current) => ({
      ...current,
      booking_name: user?.name || current.booking_name,
      booking_email: user?.email || current.booking_email,
    }));
  }, [user]);

  useEffect(() => {
    const fetchVenueDetails = async () => {
      try {
        setLoading(true);
        const [venueData, availabilityData] = await Promise.all([
          productAPI.getById(id),
          bookingAPI.getAvailability(id),
        ]);

        setVenue(venueData);
        setAvailability(Array.isArray(availabilityData?.blockedSlots) ? availabilityData.blockedSlots : []);
      } catch (err) {
        console.error(err);
        const message = getErrorMessage(err, 'Failed to load venue');
        setError(message);
        showToast(message, 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchVenueDetails();
  }, [id]);

  useEffect(() => {
    if (location.state?.startBooking && bookingSectionRef.current) {
      bookingSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.state]);

  const galleryImages = useMemo(() => {
    if (!venue) return [];
    const images = [venue.thumbnail, venue.image, ...(venue.gallery_images || [])]
      .filter(Boolean)
      .map((path) => toVenueImageUrl(path));

    return [...new Set(images)];
  }, [venue]);

  const isDateBooked = useMemo(() => {
    if (!bookingForm.event_date) return false;

    return availability
      .filter((slot) => slot.event_date?.slice(0, 10) === bookingForm.event_date)
      .length > 0;
  }, [availability, bookingForm.event_date]);

  const bookingHighlights = useMemo(() => {
    if (!venue) return [];

    return [
      `${toCurrency(venue.price)} starting price`,
      `Up to ${venue.capacity || 0} guests`,
      venue.category || 'Venue booking',
      getVenueLocationLabel(venue) || 'Bhopal',
    ];
  }, [venue]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((current) => ({
      ...current,
      [name]: value,
    }));
    setSuccessMessage('');
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');

    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      showToast('Please log in as a user to send a booking request.', 'info');
      return;
    }

    if (user.role !== 'user') {
      const message = 'Only users can place booking requests.';
      setError(message);
      showToast(message, 'error');
      return;
    }

    if (!bookingForm.event_date) {
      setError('Please choose an event date.');
      return;
    }

    if (isDateBooked) {
      setError('This date is already booked. Please choose another date.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await bookingAPI.create({
        product_id: id,
        ...bookingForm,
        guest_count: Number(bookingForm.guest_count || 0),
      });

      const success = response?.message || 'Booking request sent successfully.';
      setSuccessMessage(success);
      showToast(success, 'success');
      const updatedAvailability = await bookingAPI.getAvailability(id);
      setAvailability(Array.isArray(updatedAvailability?.blockedSlots) ? updatedAvailability.blockedSlots : []);
      setBookingForm((current) => ({
        ...current,
        event_date: '',
        message: '',
      }));
    } catch (err) {
      console.error(err);
      const message = getErrorMessage(err, 'Failed to create booking');
      setError(message);
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading venue details...</div>;
  }

  if (error && !venue) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-red-300">{error}</div>;
  }

  if (!venue) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">Venue not found</div>;
  }

  const heroImage = getVenueImage(venue);
  const locationLabel = getVenueLocationLabel(venue);

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-8">
          <div>
            <div className="rounded-3xl overflow-hidden border border-white/10 bg-[#111]">
              {heroImage ? (
                <img src={heroImage} alt={venue.name} className="w-full h-[420px] object-cover" />
              ) : (
                <div className="h-[420px] flex items-center justify-center text-gray-500">
                  <ImageIcon className="w-12 h-12" />
                </div>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {galleryImages.slice(0, 4).map((image, index) => (
                  <div key={`${image}-${index}`} className="rounded-2xl overflow-hidden border border-white/10 bg-[#111]">
                    <img src={image} alt={`${venue.name} ${index + 1}`} className="w-full h-28 object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#101014] rounded-3xl border border-white/10 p-6 h-fit">
            <div className="inline-flex px-3 py-1 rounded-full bg-white/10 text-sm text-purple-200 mb-4">
              {venue.category || 'Venue'}
            </div>
            <h1 className="text-3xl font-bold mb-3">{venue.title || venue.name || 'Venue'}</h1>
            <p className="text-gray-400 leading-relaxed mb-5">{venue.description || 'Venue details will be updated soon.'}</p>

            <div className="space-y-3 text-sm text-gray-300 mb-6">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-purple-300" />
                <span>{locationLabel || 'Bhopal'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-purple-300" />
                <span>Up to {venue.capacity || 0} guests</span>
              </div>
              <div className="flex items-center gap-3">
                <IndianRupee className="w-4 h-4 text-purple-300" />
                <span>{toCurrency(venue.price)} per event</span>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              {bookingHighlights.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => bookingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="w-full bg-white text-black py-3 rounded-2xl font-semibold hover:bg-gray-100 transition-all"
            >
              Check Availability & Book
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-14">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8">
          <div className="bg-[#101014] rounded-3xl border border-white/10 p-6">
            <h2 className="text-2xl font-bold mb-5">Venue Information</h2>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-gray-500 mb-1">Business</p>
                <p>{venue.business_name || venue.vendor_name || 'Verified venue partner'}</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-gray-500 mb-1">Occasions</p>
                <p>{Array.isArray(venue.occasion_types) && venue.occasion_types.length > 0 ? venue.occasion_types.join(', ') : 'Wedding, parties, private events'}</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-gray-500 mb-1">Features</p>
                <p>{Array.isArray(venue.features) && venue.features.length > 0 ? venue.features.join(', ') : 'Venue amenities coming soon'}</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-gray-500 mb-1">Packages</p>
                <p>{Array.isArray(venue.packages) && venue.packages.length > 0 ? `${venue.packages.length} package options available` : 'Custom pricing available on request'}</p>
              </div>
            </div>

            <div className="mt-6 bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="font-semibold mb-3">Booked Dates</h3>
              {availability.length === 0 ? (
                <p className="text-sm text-gray-400">No blocked dates yet. This venue is currently open for fresh booking requests.</p>
              ) : (
                <div className="space-y-2">
                  {availability.slice(0, 8).map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between text-sm bg-black/30 rounded-xl px-3 py-2 border border-white/5">
                      <span>{formatDate(slot.event_date)}</span>
                      <span className="text-gray-400">{slot.event_time ? slot.event_time.slice(0, 5) : 'Whole day blocked'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div ref={bookingSectionRef} className="bg-[#101014] rounded-3xl border border-white/10 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold">Check Availability & Book</h2>
                <p className="text-gray-400 mt-2">Choose your date and send a booking request to the venue owner.</p>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-sm text-gray-300">
                {availability.length} blocked date{availability.length === 1 ? '' : 's'}
              </div>
            </div>

            <form onSubmit={handleBooking} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm text-gray-400 mb-2 block">Your Name</span>
                  <input
                    type="text"
                    name="booking_name"
                    value={bookingForm.booking_name}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-gray-400 mb-2 block">Email</span>
                  <input
                    type="email"
                    name="booking_email"
                    value={bookingForm.booking_email}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
                    required
                  />
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm text-gray-400 mb-2 block">Phone Number</span>
                  <input
                    type="tel"
                    name="booking_phone"
                    value={bookingForm.booking_phone}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
                    placeholder="Enter contact number"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-gray-400 mb-2 block">Guests</span>
                  <input
                    type="number"
                    name="guest_count"
                    min="1"
                    max={venue.capacity || 5000}
                    value={bookingForm.guest_count}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
                    placeholder={`Up to ${venue.capacity || 0}`}
                    required
                  />
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm text-gray-400 mb-2 block">Event Date</span>
                  <div className="relative">
                    <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="date"
                      name="event_date"
                      min={today}
                      value={bookingForm.event_date}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl bg-white/5 border border-white/10 pl-11 pr-4 py-3 outline-none focus:border-white/30"
                      required
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm text-gray-400 mb-2 block">Occasion</span>
                  <select
                    name="occasion_type"
                    value={bookingForm.occasion_type}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
                  >
                    {OCCASIONS.map((occasion) => (
                      <option key={occasion} value={occasion} className="bg-[#101014]">
                        {occasion}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {bookingForm.event_date && isDateBooked && (
                <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  This date is already booked. Please pick another date.
                </div>
              )}

              <label className="block">
                <span className="text-sm text-gray-400 mb-2 block">Payment Method</span>
                <select
                  name="payment_method"
                  value={bookingForm.payment_method}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
                >
                  <option value="on_visit" className="bg-[#101014]">Pay on visit</option>
                  <option value="upi" className="bg-[#101014]">UPI</option>
                  <option value="card" className="bg-[#101014]">Card</option>
                  <option value="cash" className="bg-[#101014]">Cash</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm text-gray-400 mb-2 block">Message to Venue</span>
                <textarea
                  name="message"
                  value={bookingForm.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-white/30 resize-none"
                  placeholder="Share your event details, decoration needs, or any questions."
                />
              </label>

              {error && (
                <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {successMessage}
                </div>
              )}

              {!user && (
                <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  Log in as a user to send a booking request for this venue.
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || isDateBooked}
                className="w-full bg-white text-black py-3 rounded-2xl font-semibold hover:bg-gray-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Sending Booking Request...' : 'Book This Venue'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VenueDetails;
