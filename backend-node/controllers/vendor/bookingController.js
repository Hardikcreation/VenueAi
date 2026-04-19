const Booking = require('../../models/Booking');
const Product = require('../../models/Product');
const Vendor = require('../../models/Vendor');

const BLOCKING_STATUSES = ['pending', 'accepted', 'completed'];

const formatBookingPayload = (booking) => {
  if (!booking) return null;

  const venue = booking.product_id || null;
  const vendor = venue?.vendor_id || null;
  const owner = vendor?.user_id || null;

  return {
    ...booking.toObject(),
    id: String(booking._id),
    title: venue?.title || 'Venue',
    business_name: vendor?.business_name || '',
    vendor_name: owner?.name || '',
    venue: venue
      ? {
          id: String(venue._id),
          title: venue.title,
          location: venue.location,
          category: venue.category,
          image: venue.image,
          gallery_images: venue.gallery_images || [],
        }
      : null,
    user: booking.user_id
      ? {
          id: String(booking.user_id._id),
          name: booking.user_id.name,
          email: booking.user_id.email,
        }
      : null,
    event_date: booking.event_date || booking.date || null,
  };
};

const getVendorProduct = async (userId) => {
  const vendor = await Vendor.findOne({ user_id: userId });
  if (!vendor) return { vendor: null, product: null };

  const product = await Product.findOne({ vendor_id: vendor._id });
  return { vendor, product };
};

exports.getAvailability = async (req, res) => {
  try {
    const { productId } = req.params;

    const bookings = await Booking.find({
      product_id: productId,
      status: { $in: BLOCKING_STATUSES },
    })
      .select('event_date event_time date status')
      .sort({ event_date: 1, createdAt: -1 });

    const blockedSlots = bookings.map((booking) => ({
      id: String(booking._id),
      event_date: booking.event_date || booking.date || null,
      event_time: booking.event_time || null,
      status: booking.status,
    }));

    res.json({
      success: true,
      blockedSlots,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const {
      product_id,
      event_date,
      event_time,
      guest_count,
      occasion_type,
      payment_method,
      message,
      booking_name,
      booking_email,
      booking_phone,
      selected_services,
      selected_package,
    } = req.body;

    if (!product_id || !event_date) {
      return res.status(400).json({ message: 'Venue and event date are required' });
    }

    const product = await Product.findById(product_id);
    if (!product || product.status !== 'approved') {
      return res.status(404).json({ message: 'Venue not found' });
    }

    const normalizedDate = new Date(event_date);
    if (Number.isNaN(normalizedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid event date' });
    }

    const conflictingBooking = await Booking.findOne({
      product_id,
      event_date: normalizedDate,
      event_time: event_time || null,
      status: { $in: BLOCKING_STATUSES },
    });

    if (conflictingBooking) {
      return res.status(409).json({ message: 'This date and time is already booked' });
    }

    const booking = await Booking.create({
      product_id,
      user_id: req.user.id,
      date: normalizedDate,
      event_date: normalizedDate,
      event_time: event_time || null,
      guest_count: guest_count ? Number(guest_count) : undefined,
      occasion_type: occasion_type || '',
      payment_method: payment_method || 'on_visit',
      payment_status: 'pending',
      message: message || '',
      booking_name: booking_name || '',
      booking_email: booking_email || '',
      booking_phone: booking_phone || '',
      selected_services: Array.isArray(selected_services) ? selected_services : [],
      selected_package: selected_package || null,
      status: 'pending',
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate({
        path: 'product_id',
        populate: {
          path: 'vendor_id',
          select: 'business_name',
          populate: {
            path: 'user_id',
            select: 'name',
          },
        },
      })
      .populate('user_id', 'name email');

    res.status(201).json({
      success: true,
      message: 'Booking request sent successfully',
      booking: formatBookingPayload(populatedBooking),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user_id: req.user.id })
      .populate({
        path: 'product_id',
        populate: {
          path: 'vendor_id',
          select: 'business_name',
          populate: {
            path: 'user_id',
            select: 'name',
          },
        },
      })
      .sort({ createdAt: -1 });

    res.json(bookings.map((booking) => formatBookingPayload(booking)));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getVendorBookings = async (req, res) => {
  try {
    const { vendor, product } = await getVendorProduct(req.user.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    if (!product) return res.status(404).json({ message: 'Venue not found' });

    const bookings = await Booking.find({ product_id: product._id })
      .populate('user_id', 'name email')
      .populate({
        path: 'product_id',
        populate: {
          path: 'vendor_id',
          select: 'business_name',
          populate: {
            path: 'user_id',
            select: 'name',
          },
        },
      })
      .sort({ createdAt: -1 });

    res.json(bookings.map((booking) => formatBookingPayload(booking)));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.id || req.body.bookingId;
    const { status, reason } = req.body;

    if (!bookingId || !status) {
      return res.status(400).json({ message: 'Booking id and status are required' });
    }

    const { vendor, product } = await getVendorProduct(req.user.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    if (!product) return res.status(404).json({ message: 'Venue not found' });

    const booking = await Booking.findOne({ _id: bookingId, product_id: product._id });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    booking.rejection_reason = status === 'rejected' ? reason || '' : '';
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('user_id', 'name email')
      .populate({
        path: 'product_id',
        populate: {
          path: 'vendor_id',
          select: 'business_name',
          populate: {
            path: 'user_id',
            select: 'name',
          },
        },
      });

    res.json(formatBookingPayload(populatedBooking));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports.formatBookingPayload = formatBookingPayload;
