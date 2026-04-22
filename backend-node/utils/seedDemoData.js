require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Booking = require('../models/Booking');

const SEED_PREFIX = 'seed2026';
const OUTPUT_PATH = path.resolve(__dirname, '../seed-demo-report.json');

const vendorCategoryPairs = [
  ['Wedding Hall', 'Luxury Ballroom'],
  ['Banquet Hall', 'Rooftop Venue'],
  ['Resort', 'Destination Venue'],
  ['Farmhouse', 'Garden Venue'],
  ['Conference Hall', 'Corporate Event Space'],
];

const venueTitlePools = {
  'Wedding Hall': [
    'Bhopal Wedding Courtyard',
    'Regal Wedding Hall Bhopal',
    'Celebration Wedding Palace',
    'Shubh Vivaah Hall Bhopal',
  ],
  'Luxury Ballroom': [
    'Bhopal Grand Ballroom',
    'Imperial Ballroom Bhopal',
    'Crystal Ballroom Bhopal',
    'Royal Orchid Ballroom',
  ],
  'Banquet Hall': [
    'Bhopal Banquet Square',
    'Arera Banquet Hall',
    'Lakeview Banquet Bhopal',
    'Grand Banquet Pavilion',
  ],
  'Rooftop Venue': [
    'Skyline Rooftop Bhopal',
    'Terrace 27 Bhopal',
    'Open Sky Rooftop Venue',
    'Sunset Deck Bhopal',
  ],
  Resort: [
    'Lake Breeze Resort Bhopal',
    'Palm Grove Resort Bhopal',
    'Celebration Resort Retreat',
    'Green Horizon Resort',
  ],
  'Destination Venue': [
    'Destination Bhopal Greens',
    'Grand Arrival Venue',
    'The Occasion Estate',
    'Milestone Destination Venue',
  ],
  Farmhouse: [
    'Bhopal Farmhouse Retreat',
    'Rustic Lawn Farmhouse',
    'Countryside Farmhouse Bhopal',
    'Olive Grove Farmhouse',
  ],
  'Garden Venue': [
    'Gauri Greens',
    'Utsav Garden',
    'Akanksha Garden',
    "Mayuri's Greenwood",
    'Royal Palace Marriage Garden',
  ],
  'Conference Hall': [
    'Bhopal Conference Center',
    'Summit Conference Hall',
    'Business Forum Bhopal',
    'Executive Meet Hall',
  ],
  'Corporate Event Space': [
    'Bhopal Corporate Arena',
    'LaunchPad Event Space',
    'Boardroom Events Bhopal',
    'Convention Hub Bhopal',
  ],
};

const venueImageSets = [
  {
    cover: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
    ],
    street: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    cover: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
    ],
    street: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1400&q=80',
  },
  {
    cover: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    ],
    street: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1400&q=80',
  },
  {
    cover: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
    ],
    street: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80',
  },
];

const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Krishna', 'Ishaan', 'Anaya', 'Diya', 'Meera', 'Saanvi', 'Aadhya'];
const lastNames = ['Sharma', 'Patel', 'Verma', 'Joshi', 'Kapoor', 'Mehta', 'Rao', 'Singh', 'Gupta', 'Nair'];
const bhopalLocations = [
  { city: 'Bhopal', zone: 'MP Nagar', landmark: 'DB Mall', area: 'Madhya Pradesh' },
  { city: 'Bhopal', zone: 'Arera Colony', landmark: '10 Number Market', area: 'Madhya Pradesh' },
  { city: 'Bhopal', zone: 'Kolar Road', landmark: 'DK Bridge', area: 'Madhya Pradesh' },
  { city: 'Bhopal', zone: 'Hoshangabad Road', landmark: 'Aashima Mall', area: 'Madhya Pradesh' },
  { city: 'Bhopal', zone: 'Lalghati', landmark: 'VIP Road', area: 'Madhya Pradesh' },
  { city: 'Bhopal', zone: 'Bawadiya Kalan', landmark: 'D Mart', area: 'Madhya Pradesh' },
  { city: 'Bhopal', zone: 'Kohefiza', landmark: 'Regional Science Centre', area: 'Madhya Pradesh' },
  { city: 'Bhopal', zone: 'Shahpura', landmark: 'Shahpura Lake', area: 'Madhya Pradesh' },
  { city: 'Bhopal', zone: 'Chuna Bhatti', landmark: 'Mata Mandir', area: 'Madhya Pradesh' },
  { city: 'Bhopal', zone: 'Ayodhya Bypass', landmark: 'People Mall', area: 'Madhya Pradesh' },
];

const occasionOptions = [
  ['Wedding', 'Reception', 'Engagement'],
  ['Birthday', 'Anniversary', 'Family Gathering'],
  ['Corporate Event', 'Conference', 'Product Launch'],
  ['Haldi', 'Mehendi', 'Sangeet'],
  ['Baby Shower', 'Private Party', 'Festive Celebration'],
];

const featureOptions = [
  ['Valet Parking', 'Bridal Suite', 'Catering Support', 'DJ Booth'],
  ['Poolside Deck', 'Power Backup', 'Outdoor Seating', 'Live Counter Space'],
  ['Air Conditioning', 'Stage Setup', 'LED Wall', 'Projector'],
  ['Garden Lawn', 'Kids Zone', 'Decor Partner Support', 'Photography Spots'],
  ['Luxury Rooms', 'In-house Decor', 'Sound System', 'Security Staff'],
];

const loremBits = [
  'crafted for elegant celebrations',
  'popular for premium family events',
  'known for smooth vendor coordination',
  'designed for memorable guest experiences',
  'well suited for intimate and grand occasions',
];

const paymentMethods = ['on_visit', 'upi', 'card', 'cash'];
const bookingStatuses = ['pending', 'accepted', 'completed', 'rejected'];
const paymentStatuses = {
  pending: 'pending',
  accepted: 'pending',
  completed: 'paid',
  rejected: 'failed',
};

const createSlug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const getVenueTitle = (category, index) => {
  const pool = venueTitlePools[category] || [`${category} Venue Bhopal`];
  const baseTitle = pool[index % pool.length];
  const repeats = Math.floor(index / pool.length);
  return repeats > 0 ? `${baseTitle} ${repeats + 1}` : baseTitle;
};

const getVenueImageSet = (index) => venueImageSets[index % venueImageSets.length];

const buildVenueDescription = (title, city, category, index) =>
  `${title} is a ${category.toLowerCase()} in ${city} ${loremBits[index % loremBits.length]}. It offers flexible event layouts, strong service access, and polished ambience for modern celebrations.`;

const buildUserSeed = (index) => {
  const firstName = firstNames[index % firstNames.length];
  const lastName = lastNames[(index + 2) % lastNames.length];
  const name = `${firstName} ${lastName}`;
  const email = `${SEED_PREFIX}.user${String(index + 1).padStart(2, '0')}@venueai.demo`;
  const password = `User@${2026 + index}`;

  return { name, email, password };
};

const buildVendorSeed = (index) => {
  const primaryCategory = vendorCategoryPairs[Math.floor(index / 2)][index % 2];
  const location = bhopalLocations[index % bhopalLocations.length];
  const proprietorFirst = firstNames[(index + 3) % firstNames.length];
  const proprietorLast = lastNames[(index + 4) % lastNames.length];
  const ownerName = `${proprietorFirst} ${proprietorLast}`;
  const businessCore = `${location.city} ${primaryCategory}`;
  const businessName = `${businessCore} Collective`;
  const email = `${SEED_PREFIX}.vendor${String(index + 1).padStart(2, '0')}@venueai.demo`;
  const password = `Vendor@${3030 + index}`;
  const phone = `98${String(10000000 + index * 137).slice(0, 8)}`;
  const address = `${location.zone}, near ${location.landmark}, ${location.city}, ${location.area}`;

  return {
    ownerName,
    businessName,
    email,
    password,
    phone,
    address,
    primaryCategory,
    location,
  };
};

const buildVenueSeed = (vendorDoc, vendorSeed, venueIndex) => {
  const location = bhopalLocations[(venueIndex + 1) % bhopalLocations.length];
  const category = venueIndex % 2 === 0 ? vendorSeed.primaryCategory : vendorCategoryPairs[Math.floor((venueIndex + 1) / 2) % vendorCategoryPairs.length][venueIndex % 2];
  const title = getVenueTitle(category, venueIndex);
  const price = 65000 + venueIndex * 8500;
  const capacity = 120 + (venueIndex % 5) * 80 + Math.floor(venueIndex / 2) * 10;
  const occasionTypes = occasionOptions[venueIndex % occasionOptions.length];
  const features = featureOptions[venueIndex % featureOptions.length];
  const slug = createSlug(`${vendorSeed.businessName}-${title}-${venueIndex + 1}`);
  const imageSet = getVenueImageSet(venueIndex);

  return {
    vendor_id: vendorDoc._id,
    title,
    description: buildVenueDescription(title, location.city, category, venueIndex),
    image: imageSet.cover,
    gallery_images: imageSet.gallery,
    video_url: `https://example.com/showcase/${slug}`,
    location: `${location.zone}, ${location.city}`,
    category,
    zone: location.zone,
    landmark: location.landmark,
    latitude: 22.5 + venueIndex * 0.07,
    longitude: 75.8 + venueIndex * 0.05,
    street_view_image: imageSet.street,
    occasion_types: occasionTypes,
    features,
    capacity,
    price,
    base_price: price,
    status: 'approved',
  };
};

const buildBookingSeed = (bookingIndex, users, venues) => {
  const user = users[bookingIndex % users.length];
  const venue = venues[bookingIndex % venues.length];
  const monthsAhead = 1 + Math.floor(bookingIndex / 5);
  const eventDate = new Date(Date.UTC(2026, monthsAhead, 5 + (bookingIndex % 20)));
  const status = bookingStatuses[bookingIndex % bookingStatuses.length];
  const guestCount = Math.min(venue.capacity - 5, 80 + (bookingIndex % 7) * 35);
  const paymentMethod = paymentMethods[bookingIndex % paymentMethods.length];

  return {
    product_id: venue._id,
    user_id: user._id,
    date: eventDate,
    booking_name: user.name,
    booking_email: user.email,
    booking_phone: `97${String(20000000 + bookingIndex * 271).slice(0, 8)}`,
    event_date: eventDate,
    event_time: null,
    guest_count: guestCount,
    occasion_type: venue.occasion_types?.[bookingIndex % venue.occasion_types.length] || 'Wedding',
    payment_method: paymentMethod,
    payment_status: paymentStatuses[status],
    message: `Interested in booking ${venue.title} for ${guestCount} guests. Please share package details and decoration options.`,
    status,
    rejection_reason: status === 'rejected' ? 'Date no longer available due to a private block.' : '',
    selected_services: [],
    selected_package: null,
  };
};

async function connectDb() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing in backend-node/.env');
  }

  await mongoose.connect(process.env.MONGO_URI);
}

async function clearExistingSeedData() {
  const seededUsers = await User.find({
    email: { $regex: `^${SEED_PREFIX}\\.(user|vendor)`, $options: 'i' },
  }).select('_id role');

  const userIds = seededUsers.map((user) => user._id);
  const vendorDocs = await Vendor.find({ user_id: { $in: userIds } }).select('_id');
  const vendorIds = vendorDocs.map((vendor) => vendor._id);
  const productDocs = await Product.find({ vendor_id: { $in: vendorIds } }).select('_id');
  const productIds = productDocs.map((product) => product._id);

  if (productIds.length) {
    await Booking.deleteMany({ product_id: { $in: productIds } });
    await Product.deleteMany({ _id: { $in: productIds } });
  }

  if (vendorIds.length) {
    await Vendor.deleteMany({ _id: { $in: vendorIds } });
  }

  if (userIds.length) {
    await User.deleteMany({ _id: { $in: userIds } });
  }
}

async function seedDemoData() {
  await connectDb();
  await clearExistingSeedData();

  const passwordHashes = new Map();
  const getPasswordHash = async (plainText) => {
    if (!passwordHashes.has(plainText)) {
      passwordHashes.set(plainText, await bcrypt.hash(plainText, 10));
    }
    return passwordHashes.get(plainText);
  };

  const createdUsers = [];
  const createdVendors = [];
  const createdVenues = [];
  const createdBookings = [];

  for (let index = 0; index < 10; index += 1) {
    const seed = buildUserSeed(index);
    const user = await User.create({
      name: seed.name,
      email: seed.email,
      password: await getPasswordHash(seed.password),
      role: 'user',
    });

    createdUsers.push({ ...seed, _id: user._id });
  }

  for (let index = 0; index < 10; index += 1) {
    const seed = buildVendorSeed(index);
    const user = await User.create({
      name: seed.ownerName,
      email: seed.email,
      password: await getPasswordHash(seed.password),
      role: 'vendor',
    });

    const vendor = await Vendor.create({
      user_id: user._id,
      business_name: seed.businessName,
      phone: seed.phone,
      address: seed.address,
      approved: true,
      verification_documents: [
        {
          url: `https://example.com/verification/${createSlug(seed.businessName)}.pdf`,
          uploadedAt: new Date(),
        },
      ],
    });

    createdVendors.push({
      ...seed,
      userId: user._id,
      vendorId: vendor._id,
    });

    for (let venueOffset = 0; venueOffset < 2; venueOffset += 1) {
      const venue = await Product.create(
        buildVenueSeed(vendor, seed, index * 2 + venueOffset)
      );

      createdVenues.push(venue);
    }
  }

  for (let index = 0; index < 20; index += 1) {
    const booking = await Booking.create(
      buildBookingSeed(index, createdUsers, createdVenues)
    );
    createdBookings.push(booking);
  }

  const venueReport = createdVenues.map((venue) => {
    const vendor = createdVendors.find((item) => String(item.vendorId) === String(venue.vendor_id));
    return {
      venueId: String(venue._id),
      vendorId: String(venue.vendor_id),
      vendorEmail: vendor?.email || '',
      title: venue.title,
      category: venue.category,
      location: venue.location,
      price: venue.price,
      capacity: venue.capacity,
      status: venue.status,
    };
  });

  const bookingReport = createdBookings.map((booking) => ({
    bookingId: String(booking._id),
    userId: String(booking.user_id),
    venueId: String(booking.product_id),
    eventDate: booking.event_date,
    status: booking.status,
    paymentMethod: booking.payment_method,
    paymentStatus: booking.payment_status,
  }));

  const report = {
    seededAt: new Date().toISOString(),
    counts: {
      users: createdUsers.length,
      vendors: createdVendors.length,
      venues: createdVenues.length,
      bookings: createdBookings.length,
    },
    users: createdUsers.map((user) => ({
      userId: String(user._id),
      name: user.name,
      email: user.email,
      password: user.password,
      role: 'user',
    })),
    vendors: createdVendors.map((vendor) => ({
      userId: String(vendor.userId),
      vendorId: String(vendor.vendorId),
      ownerName: vendor.ownerName,
      businessName: vendor.businessName,
      email: vendor.email,
      password: vendor.password,
      phone: vendor.phone,
      address: vendor.address,
      category: vendor.primaryCategory,
      role: 'vendor',
    })),
    venues: venueReport,
    bookings: bookingReport,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(report, null, 2));

  console.log(`Seed complete. Report written to ${OUTPUT_PATH}`);
  console.log(JSON.stringify(report.counts, null, 2));
}

seedDemoData()
  .catch((error) => {
    console.error('Seed demo data failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
