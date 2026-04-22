import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, CheckCircle2, ImageIcon, IndianRupee, MapPin, Users, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { bookingAPI, productAPI } from '../services/api';
import { getErrorMessage } from '../utils/errors';
import { getVenueImage, getVenueLocationLabel, toVenueImageUrl } from '../utils/venues';
import MarketplaceBottomNav from '../components/MarketplaceBottomNav';

const OCCASIONS = ['Wedding', 'Reception', 'Birthday', 'Corporate Event', 'Engagement', 'Other'];
const RECENTLY_VIEWED_KEY = 'venue-ai-recently-viewed';

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

// Lazy Image Component
const LazyImage = ({ src, alt, className, onClick }) => {
  const imgRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' }
    );

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={`relative overflow-hidden bg-gradient-to-r from-[#7C3AED]/20 to-[#23113F]/20 ${className}`} onClick={onClick}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`h-full w-full object-cover transition-all duration-500 cursor-pointer ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
      )}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 animate-pulse">
          <div className="h-full w-full bg-gradient-to-r from-[#7C3AED]/10 via-[#23113F]/10 to-[#7C3AED]/10" />
        </div>
      )}
    </div>
  );
};

// Lightbox Component for Image Gallery
const Lightbox = ({ images, currentIndex, onClose, onNext, onPrev }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      <div className="w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[currentIndex]}
          alt={`Gallery ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center text-white/70 text-sm">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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

  useEffect(() => {
    if (!venue) return;

    const viewedItem = {
      id: venue.id || venue._id,
      title: venue.title || venue.name,
      image: venue.image,
      category: venue.category,
      price: venue.price,
      location: venue.location,
    };

    try {
      const current = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]');
      const next = [viewedItem, ...(Array.isArray(current) ? current.filter((item) => item.id !== viewedItem.id) : [])].slice(0, 8);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
    } catch {
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify([viewedItem]));
    }
  }, [venue]);

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

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5FF] text-[#23113F]">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="animate-pulse">
            <div className="h-96 bg-[#FBFAFF] rounded-3xl mb-4 border border-[#7C3AED]/10" />
            <div className="h-8 bg-[#FBFAFF] rounded w-3/4 mb-4 border border-[#7C3AED]/10" />
            <div className="h-4 bg-[#FBFAFF] rounded w-full mb-2 border border-[#7C3AED]/10" />
            <div className="h-4 bg-[#FBFAFF] rounded w-2/3 border border-[#7C3AED]/10" />
          </div>
        </div>
        <MarketplaceBottomNav />
      </div>
    );
  }

  if (error && !venue) {
    return (
      <div className="min-h-screen bg-[#F8F5FF] text-[#23113F] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-[#7C3AED] text-white rounded-full hover:bg-[#6D28D9] transition-colors">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-[#F8F5FF] text-[#23113F] flex items-center justify-center">
        <p>Venue not found</p>
      </div>
    );
  }

  const heroImage = getVenueImage(venue);
  const locationLabel = getVenueLocationLabel(venue);

  return (
    <div className="min-h-screen bg-[#F8F5FF] text-[#23113F] pb-24">
      {/* Hero Section */}
      <div className="relative">
        <div className="h-48 sm:h-64 md:h-80 w-full overflow-hidden">
          <LazyImage
            src={heroImage}
            alt={venue.name}
            className="w-full h-full"
            onClick={() => galleryImages.length > 0 && openLightbox(0)}
          />
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 p-2 rounded-full bg-[#23113F]/50 backdrop-blur-sm hover:bg-[#23113F]/70 transition border border-[#7C3AED]/20"
        >
          <ChevronLeft className="w-5 h-5 text-[#F8F5FF]" />
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-6">
          {/* Left Column - Details */}
          <div>
            <div className="mb-6">
              <div className="inline-flex px-3 py-1 rounded-full bg-[#7C3AED]/10 text-xs sm:text-sm text-[#7C3AED] mb-3 border border-[#7C3AED]/20">
                {venue.category || 'Venue'}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-[#23113F]">{venue.title || venue.name || 'Venue'}</h1>
              <p className="text-[#23113F]/70 text-sm sm:text-base leading-relaxed">
                {venue.description || 'Venue details will be updated soon.'}
              </p>
            </div>

            {/* Gallery Grid */}
            {galleryImages.length > 1 && (
              <div className="mb-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 text-[#23113F]">Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                  {galleryImages.slice(1, 5).map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="rounded-xl overflow-hidden border border-[#7C3AED]/10 bg-[#FBFAFF] cursor-pointer hover:opacity-90 transition"
                      onClick={() => openLightbox(index + 1)}
                    >
                      <LazyImage src={image} alt={`${venue.name} ${index + 2}`} className="w-full h-24 sm:h-28 md:h-32 object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Venue Information */}
            <div className="bg-[#FBFAFF] rounded-2xl border border-[#7C3AED]/10 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-[#23113F]">Venue Information</h2>

              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-[#7C3AED]/5 rounded-xl p-3 sm:p-4 border border-[#7C3AED]/10">
                  <p className="text-[#23113F]/60 text-xs sm:text-sm mb-1">Business</p>
                  <p className="text-sm sm:text-base text-[#23113F]">{venue.business_name || venue.vendor_name || 'Verified venue partner'}</p>
                </div>
                <div className="bg-[#7C3AED]/5 rounded-xl p-3 sm:p-4 border border-[#7C3AED]/10">
                  <p className="text-[#23113F]/60 text-xs sm:text-sm mb-1">Occasions</p>
                  <p className="text-sm sm:text-base">
                    {Array.isArray(venue.occasion_types) && venue.occasion_types.length > 0
                      ? venue.occasion_types.slice(0, 3).join(', ')
                      : 'Wedding, parties, private events'}
                    {Array.isArray(venue.occasion_types) && venue.occasion_types.length > 3 && ' + more'}
                  </p>
                </div>
                <div className="bg-[#7C3AED]/5 rounded-xl p-3 sm:p-4 border border-[#7C3AED]/10">
                  <p className="text-[#23113F]/60 text-xs sm:text-sm mb-1">Features</p>
                  <p className="text-sm sm:text-base text-[#23113F]">
                    {Array.isArray(venue.features) && venue.features.length > 0
                      ? venue.features.slice(0, 3).join(', ')
                      : 'Venue amenities coming soon'}
                    {Array.isArray(venue.features) && venue.features.length > 3 && ' + more'}
                  </p>
                </div>
                <div className="bg-[#7C3AED]/5 rounded-xl p-3 sm:p-4 border border-[#7C3AED]/10">
                  <p className="text-[#23113F]/60 text-xs sm:text-sm mb-1">Packages</p>
                  <p className="text-sm sm:text-base text-[#23113F]">
                    {Array.isArray(venue.packages) && venue.packages.length > 0
                      ? `${venue.packages.length} package options available`
                      : 'Custom pricing available on request'}
                  </p>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 bg-[#7C3AED]/5 rounded-xl p-3 sm:p-4 border border-[#7C3AED]/10">
                <h3 className="font-semibold text-sm sm:text-base mb-3 text-[#23113F]">Booked Dates</h3>
                {availability.length === 0 ? (
                  <p className="text-xs sm:text-sm text-[#23113F]/60">No blocked dates yet. This venue is currently open for fresh booking requests.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availability.slice(0, 8).map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between text-xs sm:text-sm bg-[#7C3AED]/10 rounded-xl px-3 py-2 border border-[#7C3AED]/20">
                        <span>{formatDate(slot.event_date)}</span>
                        <span className="text-[#23113F]/60 text-xs">{slot.event_time ? slot.event_time.slice(0, 5) : 'Whole day blocked'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div ref={bookingSectionRef}>
            <div className="bg-[#FBFAFF] rounded-2xl border border-[#7C3AED]/10 p-4 sm:p-6 sticky top-4">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-[#23113F]">Check Availability</h2>
                <p className="text-[#23113F]/70 text-xs sm:text-sm mt-1">Choose your date and send a booking request</p>
              </div>

              <div className="space-y-3 mb-4 sm:mb-6">
                {bookingHighlights.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs sm:text-sm text-[#23113F]/70">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0" />
                    <span className="line-clamp-1">{item}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid gap-4">
                  <input
                    type="text"
                    name="booking_name"
                    value={bookingForm.booking_name}
                    onChange={handleInputChange}
                    placeholder="Your Name"
                    className="w-full rounded-xl bg-[#7C3AED]/5 border border-[#7C3AED]/10 px-4 py-3 text-sm outline-none focus:border-[#7C3AED]/30 text-[#23113F] placeholder-[#23113F]/50"
                    required
                  />
                  <input
                    type="email"
                    name="booking_email"
                    value={bookingForm.booking_email}
                    onChange={handleInputChange}
                    placeholder="Email"
                    className="w-full rounded-xl bg-[#7C3AED]/5 border border-[#7C3AED]/10 px-4 py-3 text-sm outline-none focus:border-[#7C3AED]/30 text-[#23113F] placeholder-[#23113F]/50"
                    required
                  />
                  <input
                    type="tel"
                    name="booking_phone"
                    value={bookingForm.booking_phone}
                    onChange={handleInputChange}
                    placeholder="Phone Number"
                    className="w-full rounded-xl bg-[#7C3AED]/5 border border-[#7C3AED]/10 px-4 py-3 text-sm outline-none focus:border-[#7C3AED]/30 text-[#23113F] placeholder-[#23113F]/50"
                  />
                  <input
                    type="number"
                    name="guest_count"
                    min="1"
                    max={venue.capacity || 5000}
                    value={bookingForm.guest_count}
                    onChange={handleInputChange}
                    placeholder={`Guests (Up to ${venue.capacity || 0})`}
                    className="w-full rounded-xl bg-[#7C3AED]/5 border border-[#7C3AED]/10 px-4 py-3 text-sm outline-none focus:border-[#7C3AED]/30 text-[#23113F] placeholder-[#23113F]/50"
                    required
                  />

                  <div className="relative">
                    <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7C3AED]" />
                    <input
                      type="date"
                      name="event_date"
                      min={today}
                      value={bookingForm.event_date}
                      onChange={handleInputChange}
                      className="w-full rounded-xl bg-[#7C3AED]/5 border border-[#7C3AED]/10 pl-11 pr-4 py-3 text-sm outline-none focus:border-[#7C3AED]/30 text-[#23113F] placeholder-[#23113F]/50"
                      required
                    />
                  </div>

                  <select
                    name="occasion_type"
                    value={bookingForm.occasion_type}
                    onChange={handleInputChange}
                    className="w-full rounded-xl bg-[#7C3AED]/5 border border-[#7C3AED]/10 px-4 py-3 text-sm outline-none focus:border-[#7C3AED]/30 text-[#23113F] placeholder-[#23113F]/50"
                  >
                    {OCCASIONS.map((occasion) => (
                      <option key={occasion} value={occasion} className="bg-[#101014]">
                        {occasion}
                      </option>
                    ))}
                  </select>

                  <select
                    name="payment_method"
                    value={bookingForm.payment_method}
                    onChange={handleInputChange}
                    className="w-full rounded-xl bg-[#7C3AED]/5 border border-[#7C3AED]/10 px-4 py-3 text-sm outline-none focus:border-[#7C3AED]/30 text-[#23113F] placeholder-[#23113F]/50"
                  >
                    <option value="on_visit" className="bg-[#101014]">Pay on visit</option>
                    <option value="upi" className="bg-[#101014]">UPI</option>
                    <option value="card" className="bg-[#101014]">Card</option>
                    <option value="cash" className="bg-[#101014]">Cash</option>
                  </select>

                  <textarea
                    name="message"
                    value={bookingForm.message}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full rounded-xl bg-[#7C3AED]/5 border border-[#7C3AED]/10 px-4 py-3 text-sm outline-none focus:border-[#7C3AED]/30 resize-none text-[#23113F] placeholder-[#23113F]/50"
                    placeholder="Message to Venue (optional)"
                  />
                </div>

                {bookingForm.event_date && isDateBooked && (
                  <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs sm:text-sm text-red-200">
                    This date is already booked. Please pick another date.
                  </div>
                )}

                {error && (
                  <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs sm:text-sm text-red-200">
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-50 px-4 py-3 text-xs sm:text-sm text-emerald-600">
                    {successMessage}
                  </div>
                )}

                {!user && (
                  <div className="rounded-xl border border-amber-400/20 bg-amber-50 px-4 py-3 text-xs sm:text-sm text-amber-600">
                    Log in as a user to send a booking request for this venue.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || isDateBooked}
                  className="w-full bg-[#7C3AED] text-white py-3 rounded-xl font-semibold hover:bg-[#6D28D9] transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {submitting ? 'Sending Request...' : 'Book This Venue'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <Lightbox
          images={galleryImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => setLightboxIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))}
          onNext={() => setLightboxIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0))}
        />
      )}

      <MarketplaceBottomNav />
    </div>
  );
};

export default VenueDetails; 