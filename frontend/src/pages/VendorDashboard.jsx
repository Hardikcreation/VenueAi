import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarCheck2, Film, ImagePlus, Plus, Upload } from 'lucide-react';
import VenueCard from './VenueCard';
import { vendorAPI } from '../services/api';

const initialFormData = {
  title: '',
  description: '',
  category: '',
  location: '',
  zone: '',
  landmark: '',
  latitude: '',
  longitude: '',
  streetViewImage: '',
  occasionTypes: '',
  features: '',
  capacity: '',
  price: '',
  videoUrl: ''
};

const bookingStatusStyles = {
  pending: 'bg-[#FEF9C3] text-[#854D0E]',
  accepted: 'bg-[#DCFCE7] text-[#166534]',
  rejected: 'bg-[#FEE2E2] text-[#991B1B]',
  completed: 'bg-[#DBEAFE] text-[#1D4ED8]'
};

const VendorDashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [venue, setVenue] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [coverImage, setCoverImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState('');

  const populateForm = (currentVenue) => {
    if (!currentVenue) {
      setFormData(initialFormData);
      return;
    }

    setFormData({
      title: currentVenue.title || '',
      description: currentVenue.description || '',
      category: currentVenue.category || '',
      location: currentVenue.location || '',
      zone: currentVenue.zone || '',
      landmark: currentVenue.landmark || '',
      latitude: currentVenue.latitude || '',
      longitude: currentVenue.longitude || '',
      streetViewImage: currentVenue.street_view_image || '',
      occasionTypes: Array.isArray(currentVenue.occasion_types) ? currentVenue.occasion_types.join(', ') : '',
      features: Array.isArray(currentVenue.features) ? currentVenue.features.join(', ') : '',
      capacity: currentVenue.capacity || '',
      price: currentVenue.price || '',
      videoUrl: currentVenue.video_url || ''
    });
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      const [venueResponse, bookingResponse] = await Promise.all([
        vendorAPI.getMyVenue(),
        vendorAPI.getBookingRequests()
      ]);

      setVenue(venueResponse || null);
      populateForm(venueResponse || null);
      setBookings(Array.isArray(bookingResponse) ? bookingResponse : []);
    } catch (error) {
      console.error('Error fetching vendor dashboard:', error);
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const stats = useMemo(() => ({
    venues: venue ? 1 : 0,
    pendingVenues: venue?.status === 'pending' ? 1 : 0,
    pendingBookings: bookings.filter((booking) => booking.status === 'pending').length,
    acceptedBookings: bookings.filter((booking) => booking.status === 'accepted').length
  }), [venue, bookings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      if (coverImage) {
        data.append('image', coverImage);
      }
      Array.from(galleryImages).forEach((file) => data.append('gallery', file));

      if (venue) {
        const response = await vendorAPI.updateVenue(data);
        setMessage(response.message || 'Venue updated successfully.');
      } else {
        await vendorAPI.addProduct(data);
        setMessage('Venue submitted successfully. Admin approval is still required before users can book it.');
      }

      setCoverImage(null);
      setGalleryImages([]);
      setShowForm(false);
      setActiveTab('venue');
      await fetchDashboardData();
    } catch (error) {
      setMessage(error.data?.message || error.message || 'Failed to save venue');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId, status) => {
    try {
      await vendorAPI.updateBookingStatus(bookingId, status);
      setMessage(`Booking ${status} successfully.`);
      await fetchDashboardData();
    } catch (error) {
      setMessage(error.data?.message || error.message || 'Failed to update booking');
    }
  };

  if (pageLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading vendor dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F6F3EE]" data-testid="vendor-dashboard">
      <div className="bg-[linear-gradient(135deg,#1C1917,#44403C)] text-white py-12">
        <div className="px-6 md:px-8">
          <h1 className="font-heading text-4xl tracking-tight mb-2" data-testid="dashboard-heading">Vendor Command Center</h1>
          <p className="text-stone-300">Upload venues, highlight what each space is perfect for, and manage booking requests in one place.</p>
        </div>
      </div>

      <div className="px-6 md:px-8 py-8">
        {message && (
          <div className="bg-white text-[#44403C] p-4 rounded-2xl border border-stone-200 mb-6" data-testid="success-message">
            {message}
          </div>
        )}

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Venues', value: stats.venues, icon: Plus },
            { label: 'Pending Venue Approval', value: stats.pendingVenues, icon: Upload },
            { label: 'Pending Requests', value: stats.pendingBookings, icon: CalendarCheck2 },
            { label: 'Accepted Bookings', value: stats.acceptedBookings, icon: Film }
          ].map((card) => (
            <div key={card.label} className="bg-white border border-stone-200 rounded-[1.5rem] p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center justify-center rounded-2xl bg-[#FFF7ED] text-[#9A3412] w-12 h-12">
                  <card.icon size={20} />
                </span>
                <span className="font-heading text-4xl">{card.value}</span>
              </div>
              <p className="text-xs tracking-[0.2em] uppercase font-bold text-[#57534E]">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'venue', label: 'My Venue' },
            { id: 'requests', label: 'Booking Requests' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-[#1C1917] text-white' : 'bg-white border border-stone-200 text-[#44403C]'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <button
            onClick={() => setShowForm((current) => !current)}
            className="ml-auto bg-[#9A3412] text-white px-6 py-3 rounded-full flex items-center gap-2"
            data-testid="add-listing-btn"
          >
            <Plus size={18} />
            {showForm ? 'Close Form' : venue ? 'Edit Venue' : 'Create Venue'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-8 rounded-[2rem] border border-stone-200 mb-8" data-testid="add-listing-form">
            <h2 className="font-heading text-3xl mb-2">{venue ? 'Customize Your Venue' : 'Create Your Venue'}</h2>
            <p className="text-[#57534E] mb-8">This vendor account can manage one venue only. Update its details, capacity, features, photos, and media from here.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs tracking-[0.2em] uppercase font-bold block mb-2">Venue Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A3412]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs tracking-[0.2em] uppercase font-bold block mb-2">Venue Category</label>
                  <input
                    type="text"
                    placeholder="Banquet, farmhouse, rooftop..."
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A3412]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs tracking-[0.2em] uppercase font-bold block mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#9A3412] min-h-32"
                  required
                />
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs tracking-[0.2em] uppercase font-bold block mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A3412]"
                  />
                </div>
                <div>
                  <label className="text-xs tracking-[0.2em] uppercase font-bold block mb-2">Bhopal Zone</label>
                  <input
                    type="text"
                    placeholder="Arera Colony, MP Nagar..."
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A3412]"
                  />
                </div>
                <div>
                  <label className="text-xs tracking-[0.2em] uppercase font-bold block mb-2">Nearby Landmark</label>
                  <input
                    type="text"
                    placeholder="DB Mall, Upper Lake..."
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A3412]"
                  />
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs tracking-[0.2em] uppercase font-bold block mb-2">Latitude</label>
                  <input
                    type="number"
                    step="0.0000001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A3412]"
                  />
                </div>
                <div>
                  <label className="text-xs tracking-[0.2em] uppercase font-bold block mb-2">Longitude</label>
                  <input
                    type="number"
                    step="0.0000001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A3412]"
                  />
                </div>
                <div>
                  <label className="text-xs tracking-[0.2em] uppercase font-bold block mb-2">Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A3412]"
                  />
                </div>
                <div>
                  <label className="text-xs tracking-[0.2em] uppercase font-bold block mb-2">Starting Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A3412]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs tracking-[0.2em] uppercase font-bold block mb-2">Street View Preview Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.streetViewImage}
                  onChange={(e) => setFormData({ ...formData, streetViewImage: e.target.value })}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A3412]"
                />
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs tracking-[0.2em] uppercase font-bold block mb-2">Best For</label>
                  <input
                    type="text"
                    placeholder="Birthday, wedding, cocktail, engagement"
                    value={formData.occasionTypes}
                    onChange={(e) => setFormData({ ...formData, occasionTypes: e.target.value })}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A3412]"
                  />
                </div>
                <div>
                  <label className="text-xs tracking-[0.2em] uppercase font-bold block mb-2">Features</label>
                  <input
                    type="text"
                    placeholder="Parking, DJ stage, bridal room, catering"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A3412]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs tracking-[0.2em] uppercase font-bold block mb-2">Venue Video URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A3412]"
                />
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="border-2 border-dashed border-stone-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center justify-center rounded-2xl bg-[#FFF7ED] text-[#9A3412] w-10 h-10"><ImagePlus size={18} /></span>
                    <div>
                      <p className="font-medium">Cover Image</p>
                      <p className="text-sm text-[#57534E]">The main image users see first.</p>
                    </div>
                  </div>
                  <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files[0] || null)} className="w-full" />
                  {coverImage && <p className="mt-3 text-sm text-[#57534E]">{coverImage.name}</p>}
                </div>

                <div className="border-2 border-dashed border-stone-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#1D4ED8] w-10 h-10"><Upload size={18} /></span>
                    <div>
                      <p className="font-medium">Gallery Images</p>
                      <p className="text-sm text-[#57534E]">Add up to 6 extra photos.</p>
                    </div>
                  </div>
                  <input type="file" accept="image/*" multiple onChange={(e) => setGalleryImages(Array.from(e.target.files || []))} className="w-full" />
                  {galleryImages.length > 0 && (
                    <p className="mt-3 text-sm text-[#57534E]">{galleryImages.length} gallery images selected</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1C1917] text-white py-3 rounded-full font-medium hover:bg-[#9A3412] transition-all disabled:opacity-50"
              >
                {loading ? 'Saving venue...' : 'Save Venue'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
            <div className="bg-white border border-stone-200 rounded-[2rem] p-8">
              <h2 className="font-heading text-3xl mb-4">What vendors can do now</h2>
              <div className="grid gap-4 text-[#57534E]">
                <div>Each vendor profile now manages one venue only.</div>
                <div>Update capacity, features, photos, gallery, video, and venue details any time.</div>
                <div>Every venue update goes back to pending so admin can re-approve the latest details.</div>
                <div>Review booking requests and accept, reject, or complete them directly from this dashboard.</div>
              </div>
            </div>
            <div className="bg-white border border-stone-200 rounded-[2rem] p-8">
              <h2 className="font-heading text-3xl mb-4">Latest Requests</h2>
              <div className="space-y-4">
                {bookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="border border-stone-200 rounded-2xl p-4">
                    <p className="font-medium">{booking.title}</p>
                    <p className="text-sm text-[#57534E] mt-1">{booking.booking_name} | {booking.event_date?.slice(0, 10)}</p>
                    <span className={`inline-block mt-3 text-xs px-3 py-1 rounded-full ${bookingStatusStyles[booking.status]}`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
                {bookings.length === 0 && <p className="text-sm text-[#57534E]">No booking requests yet.</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'venue' && (
          <>
            <h2 className="font-heading text-2xl mb-6" data-testid="my-listings-heading">My Venue</h2>
            {!venue ? (
              <div className="text-center py-12 text-[#57534E]" data-testid="no-listings">No venue created yet</div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6" data-testid="listings-grid">
                <VenueCard
                  venue={venue}
                  action={
                    <div className="flex items-center justify-between text-sm text-[#57534E]">
                      <span>{venue.pending_bookings || 0} pending requests</span>
                      <span>{venue.total_bookings || 0} total bookings</span>
                    </div>
                  }
                />
                <div className="bg-white border border-stone-200 rounded-[2rem] p-6 self-start">
                  <h3 className="font-heading text-2xl mb-3">Manage Venue</h3>
                  <p className="text-sm text-[#57534E] mb-4">
                    Status: <span className="font-medium text-[#1C1917]">{venue.status}</span>
                  </p>
                  <p className="text-sm text-[#57534E] mb-6">
                    Use one venue profile and keep it updated with the latest images, features, capacity, and details.
                  </p>
                  <button
                    onClick={() => {
                      populateForm(venue);
                      setShowForm(true);
                    }}
                    className="w-full bg-[#1C1917] text-white py-3 rounded-full font-medium"
                  >
                    Update Venue
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'requests' && (
          <div className="bg-white border border-stone-200 rounded-[2rem] overflow-hidden">
            <div className="p-6 border-b border-stone-200">
              <h2 className="font-heading text-3xl">Booking Requests</h2>
              <p className="text-[#57534E] mt-2">Accept serious leads, reject unavailable dates, and mark completed events once done.</p>
            </div>
            <div className="divide-y divide-stone-200">
              {bookings.length === 0 ? (
                <div className="p-8 text-[#57534E]">No booking requests yet.</div>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="font-heading text-2xl">{booking.title}</h3>
                          <span className={`text-xs px-3 py-1 rounded-full ${bookingStatusStyles[booking.status]}`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-sm text-[#57534E]">{booking.booking_name} | {booking.booking_email} | {booking.booking_phone || 'No phone shared'}</p>
                        <div className="grid sm:grid-cols-3 gap-3 mt-4 text-sm text-[#57534E]">
                          <div>Event date: <span className="font-medium text-[#1C1917]">{booking.event_date?.slice(0, 10)}</span></div>
                          <div>Time: <span className="font-medium text-[#1C1917]">{booking.event_time?.slice(0, 5) || 'Not set'}</span></div>
                          <div>Guests: <span className="font-medium text-[#1C1917]">{booking.guest_count || 'Flexible'}</span></div>
                          <div>Occasion: <span className="font-medium text-[#1C1917]">{booking.occasion_type || 'Custom event'}</span></div>
                          <div>Payment: <span className="font-medium text-[#1C1917]">{booking.payment_method === 'on_visit' ? 'Pay on visit' : booking.payment_method || 'Not shared'}</span></div>
                          <div>Payment status: <span className="font-medium text-[#1C1917]">{booking.payment_status || 'pending'}</span></div>
                        </div>
                        {Array.isArray(booking.selected_services) && booking.selected_services.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {booking.selected_services.map((service) => (
                              <span key={service} className="text-xs px-3 py-1 rounded-full bg-[#EFF6FF] text-[#1D4ED8]">
                                {service}
                              </span>
                            ))}
                          </div>
                        )}
                        {booking.message && <p className="mt-4 text-sm leading-relaxed text-[#57534E]">{booking.message}</p>}
                      </div>

                      <div className="flex flex-wrap gap-3 lg:justify-end">
                        <button
                          onClick={() => handleBookingAction(booking.id, 'accepted')}
                          className="px-4 py-2 rounded-full bg-[#166534] text-white text-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleBookingAction(booking.id, 'rejected')}
                          className="px-4 py-2 rounded-full bg-[#991B1B] text-white text-sm"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleBookingAction(booking.id, 'completed')}
                          className="px-4 py-2 rounded-full bg-[#1D4ED8] text-white text-sm"
                        >
                          Mark Completed
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;

