import React, { useContext, useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, CreditCard, IndianRupee, MapPin, Sparkles, Video } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BACKEND_BASE_URL } from '../config/env';
import { bookingAPI, productAPI } from '../services/api';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1761085590866-e94c99818636?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBldmVudCUyMHZlbnVlJTIwaW50ZXJpb3J8ZW58MHx8fHwxNzc1Nzk5ODQ3fDA&ixlib=rb-4.1.0&q=85';
const TIME_SLOTS = ['10:00:00', '13:00:00', '16:00:00', '19:00:00'];

const normalizeImage = (image) => {
  if (!image) {
    return FALLBACK_IMAGE;
  }

  return image.startsWith('http') ? image : `${BACKEND_BASE_URL}${image}`;
};

const formatSlotLabel = (slot) => {
  const [hours, minutes] = slot.split(':');
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const VenueDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [venue, setVenue] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [step, setStep] = useState('details');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [bookingForm, setBookingForm] = useState({
    bookingName: user?.name || '',
    bookingEmail: user?.email || '',
    bookingPhone: '',
    eventDate: '',
    eventTime: '',
    guestCount: '',
    occasionType: '',
    selectedServices: [],
    paymentMethod: 'on_visit',
    message: ''
  });

  useEffect(() => {
    if (user?.role === 'user') {
      setBookingForm((current) => ({
        ...current,
        bookingName: current.bookingName || user.name || '',
        bookingEmail: current.bookingEmail || user.email || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    const loadVenue = async () => {
      try {
        const [venueResponse, availabilityResponse] = await Promise.all([
          productAPI.getById(id),
          bookingAPI.getAvailability(id)
        ]);

        setVenue(venueResponse);
        setAvailability(Array.isArray(availabilityResponse.blockedSlots) ? availabilityResponse.blockedSlots : []);
      } catch (error) {
        console.error('Error loading venue details:', error);
        setMessage(error.data?.message || error.message || 'Could not load venue details');
      } finally {
        setLoading(false);
      }
    };

    loadVenue();
  }, [id]);

  useEffect(() => {
    if (location.state?.startBooking) {
      if (!user) {
        navigate('/login');
        return;
      }

      if (user.role !== 'user') {
        setMessage('Only user accounts can place booking requests.');
        return;
      }

      setStep('availability');
    }
  }, [location.state, navigate, user]);

  useEffect(() => {
    if (location.state?.prefillBooking) {
      setBookingForm((current) => ({
        ...current,
        eventDate: location.state.prefillBooking.eventDate || current.eventDate,
        guestCount: location.state.prefillBooking.guestCount || current.guestCount
      }));
    }
  }, [location.state]);

  const blockedForSelectedDate = useMemo(
    () => availability.filter((slot) => slot.event_date?.slice(0, 10) === bookingForm.eventDate),
    [availability, bookingForm.eventDate]
  );

  const unavailableTimes = new Set(blockedForSelectedDate.map((slot) => slot.event_time));
  const galleryImages = useMemo(() => {
    if (!venue) {
      return [];
    }

    const gallery = Array.isArray(venue.gallery_images) ? venue.gallery_images.map(normalizeImage) : [];
    const cover = normalizeImage(venue.image);
    return [cover, ...gallery.filter((image) => image !== cover)];
  }, [venue]);

  const serviceOptions = Array.isArray(venue?.features) ? venue.features : [];

  const toggleService = (service) => {
    setBookingForm((current) => ({
      ...current,
      selectedServices: current.selectedServices.includes(service)
        ? current.selectedServices.filter((item) => item !== service)
        : [...current.selectedServices, service]
    }));
  };

  const moveToBooking = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'user') {
      setMessage('Only user accounts can send booking requests.');
      return;
    }

    setMessage('');
    setStep('availability');
  };

  const continueToPayment = () => {
    if (!bookingForm.eventDate || !bookingForm.eventTime) {
      setMessage('Please select an available date and time first.');
      return;
    }

    setMessage('');
    setStep('payment');
  };

  const submitBooking = async () => {
    if (!venue) {
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const response = await bookingAPI.create({
        productId: venue.id,
        ...bookingForm
      });

      setMessage(response.message || 'After the vendor accepts your request within 24 hours, your booking will be confirmed.');
      setStep('success');
    } catch (error) {
      setMessage(error.data?.message || error.message || 'Could not complete booking request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading venue details...</div>;
  }

  if (!venue) {
    return <div className="min-h-screen flex items-center justify-center">Venue not found.</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <div className="px-6 md:px-12 lg:px-24 py-10">
        {message && (
          <div className="mb-6 rounded-2xl border border-stone-200 bg-white px-5 py-4 text-sm text-[#57534E]">
            {message}
          </div>
        )}

        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
          <div>
            <div className="grid md:grid-cols-[1.25fr_0.75fr] gap-4 mb-6">
              <img
                src={galleryImages[0] || FALLBACK_IMAGE}
                alt={venue.title}
                className="w-full h-[26rem] object-cover rounded-[2rem]"
              />
              <div className="grid gap-4">
                {galleryImages.slice(1, 4).map((image, index) => (
                  <img key={`${image}-${index}`} src={image} alt={`${venue.title} ${index + 2}`} className="w-full h-[8rem] object-cover rounded-[1.5rem]" />
                ))}
              </div>
            </div>

          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] border border-stone-200 p-6">
              <div className="flex items-center justify-between mb-6">
                {[
                  { id: 'details', label: 'Details' },
                  { id: 'availability', label: 'Availability' },
                  { id: 'payment', label: 'Payment' }
                ].map((item, index) => (
                  <React.Fragment key={item.id}>
                    <button
                      onClick={() => {
                        if (item.id === 'details') setStep('details');
                        if (item.id === 'availability' && (step === 'availability' || step === 'payment' || step === 'success')) setStep('availability');
                        if (item.id === 'payment' && (step === 'payment' || step === 'success')) setStep('payment');
                      }}
                      className={`text-sm font-medium ${step === item.id ? 'text-[#9A3412]' : 'text-[#A8A29E]'}`}
                    >
                      {item.label}
                    </button>
                    {index < 2 && <div className="h-px flex-1 mx-3 bg-stone-200" />}
                  </React.Fragment>
                ))}
              </div>

              {step === 'details' && (
                <div>
                  <h2 className="font-heading text-3xl mb-3">Start Booking</h2>
                  <p className="text-[#57534E] leading-relaxed mb-6">
                    Review this venue, then continue to choose your date, time slot, and the services you want with your booking request.
                  </p>
                  <button onClick={moveToBooking} className="w-full bg-[#1C1917] text-white py-3 rounded-full font-medium hover:bg-[#9A3412] transition-all">
                    Book This Venue
                  </button>
                </div>
              )}

              {step === 'availability' && (
                <div className="space-y-5">
                  <h2 className="font-heading text-3xl">Choose Date And Services</h2>
                  <div className="grid gap-4">
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingForm.eventDate}
                      onChange={(event) => setBookingForm({ ...bookingForm, eventDate: event.target.value, eventTime: '' })}
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A3412]"
                    />

                    {bookingForm.eventDate && (
                      <div>
                        <p className="text-xs tracking-[0.2em] uppercase font-bold text-[#78716C] mb-3">Available Time Slots</p>
                        <div className="grid grid-cols-2 gap-3">
                          {TIME_SLOTS.map((slot) => {
                            const blocked = unavailableTimes.has(slot);
                            return (
                              <button
                                key={slot}
                                type="button"
                                disabled={blocked}
                                onClick={() => setBookingForm({ ...bookingForm, eventTime: slot })}
                                className={`px-4 py-3 rounded-xl border text-sm ${
                                  blocked
                                    ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                                    : bookingForm.eventTime === slot
                                      ? 'bg-[#1C1917] text-white border-[#1C1917]'
                                      : 'bg-white text-[#44403C] border-stone-200'
                                }`}
                              >
                                {formatSlotLabel(slot)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Your name"
                        value={bookingForm.bookingName}
                        onChange={(event) => setBookingForm({ ...bookingForm, bookingName: event.target.value })}
                        className="w-full px-4 py-3 border border-stone-200 rounded-xl"
                      />
                      <input
                        type="email"
                        placeholder="Your email"
                        value={bookingForm.bookingEmail}
                        onChange={(event) => setBookingForm({ ...bookingForm, bookingEmail: event.target.value })}
                        className="w-full px-4 py-3 border border-stone-200 rounded-xl"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Phone number"
                        value={bookingForm.bookingPhone}
                        onChange={(event) => setBookingForm({ ...bookingForm, bookingPhone: event.target.value })}
                        className="w-full px-4 py-3 border border-stone-200 rounded-xl"
                      />
                      <input
                        type="number"
                        placeholder="Guest count"
                        value={bookingForm.guestCount}
                        onChange={(event) => setBookingForm({ ...bookingForm, guestCount: event.target.value })}
                        className="w-full px-4 py-3 border border-stone-200 rounded-xl"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Occasion type"
                      value={bookingForm.occasionType}
                      onChange={(event) => setBookingForm({ ...bookingForm, occasionType: event.target.value })}
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl"
                    />

                    {serviceOptions.length > 0 && (
                      <div>
                        <p className="text-xs tracking-[0.2em] uppercase font-bold text-[#78716C] mb-3">Select Services</p>
                        <div className="flex flex-wrap gap-3">
                          {serviceOptions.map((service) => {
                            const selected = bookingForm.selectedServices.includes(service);
                            return (
                              <button
                                key={service}
                                type="button"
                                onClick={() => toggleService(service)}
                                className={`px-4 py-2 rounded-full text-sm border ${
                                  selected
                                    ? 'bg-[#9A3412] text-white border-[#9A3412]'
                                    : 'bg-white text-[#44403C] border-stone-200'
                                }`}
                              >
                                {service}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <textarea
                      placeholder="Extra notes for the vendor"
                      value={bookingForm.message}
                      onChange={(event) => setBookingForm({ ...bookingForm, message: event.target.value })}
                      className="w-full min-h-28 px-4 py-3 border border-stone-200 rounded-2xl"
                    />
                  </div>

                  <button onClick={continueToPayment} className="w-full bg-[#1C1917] text-white py-3 rounded-full font-medium">
                    Continue To Payment
                  </button>
                </div>
              )}

              {step === 'payment' && (
                <div className="space-y-5">
                  <h2 className="font-heading text-3xl">Payment Preference</h2>
                  <p className="text-[#57534E] leading-relaxed">
                    Online payments will be added later. Right now only pay on visit can complete the booking request.
                  </p>

                  <div className="grid gap-3">
                    {[
                      { id: 'on_visit', label: 'Pay On Visit', enabled: true, note: 'Available now' },
                      { id: 'upi', label: 'UPI', enabled: false, note: 'Coming soon' },
                      { id: 'card', label: 'Card', enabled: false, note: 'Coming soon' },
                      { id: 'net_banking', label: 'Net Banking', enabled: false, note: 'Coming soon' }
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        disabled={!option.enabled}
                        onClick={() => option.enabled && setBookingForm({ ...bookingForm, paymentMethod: option.id })}
                        className={`w-full text-left px-4 py-4 rounded-2xl border ${
                          bookingForm.paymentMethod === option.id
                            ? 'border-[#1C1917] bg-[#F5F5F4]'
                            : 'border-stone-200 bg-white'
                        } ${!option.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium flex items-center gap-2"><CreditCard size={16} /> {option.label}</span>
                          <span className="text-xs text-[#57534E]">{option.note}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="rounded-2xl bg-[#FFF7ED] px-4 py-4 text-sm text-[#9A3412]">
                    Booking note: after the vendor accepts your request, your booking will be successfully done within 24 hours.
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep('availability')} className="px-5 py-3 rounded-full border border-stone-200 text-[#44403C]">
                      Back
                    </button>
                    <button
                      onClick={submitBooking}
                      disabled={submitting}
                      className="flex-1 bg-[#1C1917] text-white py-3 rounded-full font-medium disabled:opacity-50"
                    >
                      {submitting ? 'Sending Request...' : 'Confirm Booking Request'}
                    </button>
                  </div>
                </div>
              )}

              {step === 'success' && (
                <div className="text-center py-8">
                  <CheckCircle2 className="mx-auto text-[#166534] mb-4" size={44} />
                  <h2 className="font-heading text-3xl mb-3">Request Sent To Vendor</h2>
                  <p className="text-[#57534E] leading-relaxed mb-6">
                    Your request is now with this venue vendor. Once they accept it, your booking will be confirmed. Please expect an update within 24 hours.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button onClick={() => navigate('/my-bookings')} className="px-5 py-3 rounded-full bg-[#1C1917] text-white">
                      View My Bookings
                    </button>
                    <button onClick={() => navigate('/services')} className="px-5 py-3 rounded-full border border-stone-200 text-[#44403C]">
                      Browse More Venues
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
         
        </div>
        <div className="w-full px-4 md:px-10 lg:px-20 py-8 bg-gradient-to-b from-white to-stone-50">

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {venue.category && (
              <span className="text-xs px-4 py-1.5 rounded-full bg-orange-100 text-orange-800 font-medium shadow-sm">
                {venue.category}
              </span>
            )}
            {venue.status && (
              <span className="text-xs px-4 py-1.5 rounded-full bg-green-100 text-green-700 font-medium shadow-sm">
                {venue.status}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4 text-stone-900">
            {venue.title}
          </h1>

          {/* Description */}
          <p className="text-stone-600 text-base md:text-lg leading-relaxed mb-8 max-w-4xl">
            {venue.description}
          </p>

          {/* Info Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">

            <div className="flex items-center gap-3 p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition">
              <MapPin size={18} className="text-orange-500" />
              <span>{venue.location || 'Location shared later'}</span>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition">
              <CalendarDays size={18} className="text-blue-500" />
              <span>Capacity {venue.capacity || 'Flexible'}</span>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition">
              <IndianRupee size={18} className="text-green-600" />
              <span>Starting from {venue.price || 'On request'}</span>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition">
              <Sparkles size={18} className="text-purple-500" />
              <span>Managed by {venue.business_name}</span>
            </div>

          </div>

          {/* Occasion Types */}
          {Array.isArray(venue.occasion_types) && venue.occasion_types.length > 0 && (
            <div className="mb-10">
              <h2 className="font-heading text-2xl font-semibold mb-4 text-stone-900">
                Perfect For
              </h2>
              <div className="flex flex-wrap gap-3">
                {venue.occasion_types.map((item) => (
                  <span
                    key={item}
                    className="text-sm px-4 py-2 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200 transition"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          {serviceOptions.length > 0 && (
            <div className="mb-10">
              <h2 className="font-heading text-2xl font-semibold mb-4 text-stone-900">
                Available Services
              </h2>
              <div className="flex flex-wrap gap-3">
                {serviceOptions.map((item) => (
                  <span
                    key={item}
                    className="text-sm px-4 py-2 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Video Button */}
          {venue.video_url && (
            <a
              href={venue.video_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white hover:bg-stone-800 transition shadow-md"
            >
              <Video size={18} />
              Watch Venue Video
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default VenueDetails;
