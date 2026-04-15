const app = require('./app');
const { getPool } = require('./config/db');
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const ensureColumnExists = async (db, tableName, columnName, columnDefinition) => {
  const [columns] = await db.query(
    `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
    `,
    [process.env.DB_NAME, tableName, columnName]
  );

  if (columns.length === 0) {
    await db.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
    console.log(`Added ${tableName}.${columnName}`);
  }
};

const createUserIfMissing = async (db, { name, email, password, role }) => {
  const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    return existing[0].id;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await db.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hashedPassword, role]
  );
  return result.insertId;
};

const createVendorIfMissing = async (db, userId, { businessName, phone, address }) => {
  const [existing] = await db.query('SELECT id FROM vendors WHERE user_id = ?', [userId]);
  if (existing.length > 0) {
    return existing[0].id;
  }

  const [result] = await db.query(
    'INSERT INTO vendors (user_id, business_name, phone, address) VALUES (?, ?, ?, ?)',
    [userId, businessName, phone || null, address || null]
  );
  return result.insertId;
};

const createVenueIfMissing = async (db, vendorId, venue) => {
  const [existing] = await db.query(
    'SELECT id FROM products WHERE vendor_id = ? AND title = ?',
    [vendorId, venue.title]
  );
  if (existing.length > 0) {
    return existing[0].id;
  }

  const [result] = await db.query(
    `INSERT INTO products (
      vendor_id, title, image, gallery_images, video_url, description, location, category,
      zone, landmark, latitude, longitude, street_view_image, occasion_types, features,
      capacity, price, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      vendorId,
      venue.title,
      venue.image,
      JSON.stringify(venue.galleryImages || []),
      venue.videoUrl || null,
      venue.description,
      venue.location,
      venue.category,
      venue.zone,
      venue.landmark,
      venue.latitude,
      venue.longitude,
      venue.streetViewImage || null,
      JSON.stringify(venue.occasionTypes || []),
      JSON.stringify(venue.features || []),
      venue.capacity,
      venue.price,
      venue.status || 'approved'
    ]
  );
  return result.insertId;
};

const createBookingIfMissing = async (db, booking) => {
  const [existing] = await db.query(
    'SELECT id FROM bookings WHERE product_id = ? AND user_id = ? AND event_date = ? AND event_time = ?',
    [booking.productId, booking.userId, booking.eventDate, booking.eventTime]
  );
  if (existing.length > 0) {
    return;
  }

  await db.query(
    `INSERT INTO bookings (
      product_id, user_id, booking_name, booking_email, booking_phone, event_date, event_time,
      guest_count, occasion_type, selected_services, payment_method, payment_status, message, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      booking.productId,
      booking.userId,
      booking.bookingName,
      booking.bookingEmail,
      booking.bookingPhone || null,
      booking.eventDate,
      booking.eventTime,
      booking.guestCount || null,
      booking.occasionType || null,
      JSON.stringify(booking.selectedServices || []),
      booking.paymentMethod || 'on_visit',
      booking.paymentStatus || 'pending',
      booking.message || null,
      booking.status || 'pending'
    ]
  );
};

const seedDatabase = async (db) => {
  const vendorSeed = [
    {
      user: { name: 'Arera Greens', email: 'vendor1@venue.ai', password: 'vendor@123', role: 'vendor' },
      vendor: { businessName: 'Arera Greens Events', phone: '9893000001', address: 'Arera Colony, Bhopal' },
      venues: [
        {
          title: 'Arera Greens Garden Lawn',
          image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
          galleryImages: [
            'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=900&q=80'
          ],
          videoUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
          description: 'Open-air premium lawn for weddings, receptions, and grand family celebrations.',
          location: 'Arera Colony, Bhopal',
          category: 'Gardens',
          zone: 'Arera Colony',
          landmark: 'Near E-7 Market',
          latitude: 23.2199,
          longitude: 77.4323,
          streetViewImage: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1000&q=80',
          occasionTypes: ['Wedding', 'Reception', 'Shadi Party'],
          features: ['Valet Parking', 'Catering', 'Stage Decor', 'DJ Booth'],
          capacity: 650,
          price: 185000,
          status: 'approved'
        }
      ]
    },
    {
      user: { name: 'Lakeview Resorts', email: 'vendor2@venue.ai', password: 'vendor@123', role: 'vendor' },
      vendor: { businessName: 'Lakeview Resorts', phone: '9893000002', address: 'Shyamla Hills, Bhopal' },
      venues: [
        {
          title: 'Shyamla Hills Lakeview Resort',
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
          galleryImages: [
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80'
          ],
          videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
          description: 'Lakeside resort venue perfect for destination-style ceremonies and corporate retreats.',
          location: 'Shyamla Hills, Bhopal',
          category: 'Resorts',
          zone: 'Shyamla Hills',
          landmark: 'Near Van Vihar Gate',
          latitude: 23.2339,
          longitude: 77.3764,
          streetViewImage: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1000&q=80',
          occasionTypes: ['Wedding', 'Corporate Retreat', 'Engagement'],
          features: ['Lake View', 'Guest Rooms', 'Catering', 'Parking'],
          capacity: 420,
          price: 240000,
          status: 'approved'
        },
        {
          title: 'Van Vihar Sunset Lawn',
          image: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?auto=format&fit=crop&w=1200&q=80',
          galleryImages: [
            'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=80'
          ],
          description: 'Scenic lawn with sunset-facing setup for intimate celebrations and mehendi nights.',
          location: 'Shyamla Hills, Bhopal',
          category: 'Lawns',
          zone: 'Shyamla Hills',
          landmark: 'Upper Lake Promenade',
          latitude: 23.2351,
          longitude: 77.3805,
          streetViewImage: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45?auto=format&fit=crop&w=1000&q=80',
          occasionTypes: ['Mehendi', 'Cocktail', 'Birthday'],
          features: ['Sunset Deck', 'Live Counters', 'Floral Decor'],
          capacity: 220,
          price: 98000,
          status: 'approved'
        }
      ]
    },
    {
      user: { name: 'MP Nagar Banquets', email: 'vendor3@venue.ai', password: 'vendor@123', role: 'vendor' },
      vendor: { businessName: 'MP Nagar Banquets', phone: '9893000003', address: 'MP Nagar Zone 2, Bhopal' },
      venues: [
        {
          title: 'MP Nagar Grand Banquet',
          image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
          galleryImages: [
            'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&w=900&q=80'
          ],
          description: 'Central banquet hall with flexible seating for weddings, sangeet, and conferences.',
          location: 'MP Nagar, Bhopal',
          category: 'Banquet Halls',
          zone: 'MP Nagar',
          landmark: 'Near DB Mall',
          latitude: 23.2332,
          longitude: 77.4348,
          streetViewImage: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80',
          occasionTypes: ['Conference', 'Sangeet', 'Wedding'],
          features: ['AC Hall', 'Projector', 'Sound System', 'Parking'],
          capacity: 500,
          price: 155000,
          status: 'approved'
        },
        {
          title: 'DB City Celebration Hall',
          image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
          galleryImages: [],
          description: 'Urban event hall for birthdays, pre-wedding functions, and launches.',
          location: 'MP Nagar, Bhopal',
          category: 'Banquet Halls',
          zone: 'MP Nagar',
          landmark: 'DB City Mall',
          latitude: 23.2338,
          longitude: 77.4341,
          streetViewImage: 'https://images.unsplash.com/photo-1519167758481-83f29e1a8f70?auto=format&fit=crop&w=1000&q=80',
          occasionTypes: ['Birthday', 'Launch Event', 'Anniversary'],
          features: ['Decor', 'Photography', 'In-house Catering'],
          capacity: 180,
          price: 72000,
          status: 'approved'
        }
      ]
    },
    {
      user: { name: 'Farmhouse Circle', email: 'vendor4@venue.ai', password: 'vendor@123', role: 'vendor' },
      vendor: { businessName: 'Farmhouse Circle', phone: '9893000004', address: 'Kolar Road, Bhopal' },
      venues: [
        {
          title: 'Kolar Farmhouse Retreat',
          image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
          galleryImages: [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80'
          ],
          description: 'Private farmhouse venue for birthdays, haldi, poolside brunches, and weekend events.',
          location: 'Kolar Road, Bhopal',
          category: 'Farmhouses',
          zone: 'Kolar Road',
          landmark: 'Near Aura Mall',
          latitude: 23.1816,
          longitude: 77.4633,
          streetViewImage: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1000&q=80',
          occasionTypes: ['Birthday', 'Haldi', 'Private Party'],
          features: ['Poolside Setup', 'Night Stay', 'BBQ Counter'],
          capacity: 160,
          price: 65000,
          status: 'approved'
        }
      ]
    },
    {
      user: { name: 'Bawadiya Lawns', email: 'vendor5@venue.ai', password: 'vendor@123', role: 'vendor' },
      vendor: { businessName: 'Bawadiya Lawns', phone: '9893000005', address: 'Bawadiya Kalan, Bhopal' },
      venues: [
        {
          title: 'Bawadiya Royal Lawn',
          image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
          galleryImages: [
            'https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=900&q=80'
          ],
          description: 'Expansive lawn for baraat entries, receptions, and community celebrations.',
          location: 'Bawadiya Kalan, Bhopal',
          category: 'Lawns',
          zone: 'Bawadiya Kalan',
          landmark: 'Near Danish Kunj Square',
          latitude: 23.1947,
          longitude: 77.4668,
          streetViewImage: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?auto=format&fit=crop&w=1000&q=80',
          occasionTypes: ['Reception', 'Shadi Party', 'Community Event'],
          features: ['Large Parking', 'Mandap Setup', 'Lighting Truss'],
          capacity: 900,
          price: 210000,
          status: 'approved'
        },
        {
          title: 'Danish Garden Pavilion',
          image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
          galleryImages: [],
          description: 'Garden pavilion venue for elegant birthdays and engagement dinners.',
          location: 'Bawadiya Kalan, Bhopal',
          category: 'Gardens',
          zone: 'Bawadiya Kalan',
          landmark: 'Danish Hills Viewpoint',
          latitude: 23.1989,
          longitude: 77.4712,
          streetViewImage: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1000&q=80',
          occasionTypes: ['Engagement', 'Birthday', 'Cocktail'],
          features: ['Designer Lighting', 'Live Music Deck', 'Photo Booth'],
          capacity: 240,
          price: 88000,
          status: 'approved'
        }
      ]
    }
  ];

  const userSeed = [
    { name: 'Aarav Mehta', email: 'user1@venue.ai', password: 'user@123' },
    { name: 'Siya Verma', email: 'user2@venue.ai', password: 'user@123' },
    { name: 'Rudra Jain', email: 'user3@venue.ai', password: 'user@123' },
    { name: 'Anaya Sharma', email: 'user4@venue.ai', password: 'user@123' },
    { name: 'Kabir Khan', email: 'user5@venue.ai', password: 'user@123' },
    { name: 'Ishita Rao', email: 'user6@venue.ai', password: 'user@123' },
    { name: 'Dhruv Patel', email: 'user7@venue.ai', password: 'user@123' },
    { name: 'Myra Soni', email: 'user8@venue.ai', password: 'user@123' },
    { name: 'Arjun Tiwari', email: 'user9@venue.ai', password: 'user@123' },
    { name: 'Kiara Dubey', email: 'user10@venue.ai', password: 'user@123' }
  ];

  const userIds = {};
  for (const user of userSeed) {
    userIds[user.email] = await createUserIfMissing(db, { ...user, role: 'user' });
  }

  const venueIds = {};
  for (const vendorSeedItem of vendorSeed) {
    const vendorUserId = await createUserIfMissing(db, vendorSeedItem.user);
    const vendorId = await createVendorIfMissing(db, vendorUserId, vendorSeedItem.vendor);

    for (const venue of vendorSeedItem.venues) {
      const venueId = await createVenueIfMissing(db, vendorId, venue);
      venueIds[venue.title] = venueId;
    }
  }

  await createBookingIfMissing(db, {
    productId: venueIds['Arera Greens Garden Lawn'],
    userId: userIds['user1@venue.ai'],
    bookingName: 'Aarav Mehta',
    bookingEmail: 'user1@venue.ai',
    bookingPhone: '9826000001',
    eventDate: '2026-05-20',
    eventTime: '19:00:00',
    guestCount: 450,
    occasionType: 'Wedding',
    selectedServices: ['Valet Parking', 'Catering', 'Stage Decor'],
    paymentMethod: 'on_visit',
    paymentStatus: 'pending',
    message: 'Need grand entrance setup and varmala stage lighting.',
    status: 'pending'
  });

  await createBookingIfMissing(db, {
    productId: venueIds['MP Nagar Grand Banquet'],
    userId: userIds['user2@venue.ai'],
    bookingName: 'Siya Verma',
    bookingEmail: 'user2@venue.ai',
    bookingPhone: '9826000002',
    eventDate: '2026-05-18',
    eventTime: '16:00:00',
    guestCount: 220,
    occasionType: 'Sangeet',
    selectedServices: ['Sound System', 'Projector'],
    paymentMethod: 'on_visit',
    paymentStatus: 'pending',
    message: 'Looking for LED wall and dance floor layout.',
    status: 'accepted'
  });
};

const initDatabase = async () => {
  try {
    // First, ensure the database exists
    const initialPool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const initialConn = initialPool.promise();
    await initialConn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    await initialPool.end();

    // Now get the main pool and run the schema
    const db = getPool();
    const schema = fs.readFileSync(path.join(__dirname, 'config', 'schema.sql'), 'utf8');
    
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    console.log(`Running ${statements.length} schema statements...`);
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          await db.query(statement);
        } catch (error) {
          console.error(`Error in statement ${i + 1}:`, error.message);
          throw error;
        }
      }
    }

    await ensureColumnExists(db, 'vendors', 'phone', 'VARCHAR(20) NULL');
    await ensureColumnExists(db, 'vendors', 'address', 'TEXT NULL');
    await ensureColumnExists(db, 'products', 'gallery_images', 'TEXT NULL');
    await ensureColumnExists(db, 'products', 'video_url', 'VARCHAR(500) NULL');
    await ensureColumnExists(db, 'products', 'location', 'VARCHAR(255) NULL');
    await ensureColumnExists(db, 'products', 'category', 'VARCHAR(100) NULL');
    await ensureColumnExists(db, 'products', 'zone', 'VARCHAR(100) NULL');
    await ensureColumnExists(db, 'products', 'landmark', 'VARCHAR(255) NULL');
    await ensureColumnExists(db, 'products', 'latitude', 'DECIMAL(10, 7) NULL');
    await ensureColumnExists(db, 'products', 'longitude', 'DECIMAL(10, 7) NULL');
    await ensureColumnExists(db, 'products', 'street_view_image', 'VARCHAR(500) NULL');
    await ensureColumnExists(db, 'products', 'occasion_types', 'VARCHAR(255) NULL');
    await ensureColumnExists(db, 'products', 'features', 'TEXT NULL');
    await ensureColumnExists(db, 'bookings', 'event_time', 'TIME NULL');
    await ensureColumnExists(db, 'bookings', 'selected_services', 'TEXT NULL');
    await ensureColumnExists(db, 'bookings', 'payment_method', `ENUM('on_visit', 'upi', 'card', 'net_banking') DEFAULT 'on_visit'`);
    await ensureColumnExists(db, 'bookings', 'payment_status', `ENUM('pending', 'not_available', 'paid') DEFAULT 'pending'`);
    await db.query(`
      UPDATE bookings
      SET event_time = COALESCE(event_time, '18:00:00')
      WHERE event_time IS NULL
    `);

    const [adminExists] = await db.query('SELECT * FROM users WHERE email = ?', ['admin@venue.ai']);
    
    if (adminExists.length === 0) {
      const hashedPassword = await bcrypt.hash('admin@123', 10);
      await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin', 'admin@venue.ai', hashedPassword, 'admin']
      );
      console.log('Admin user created: admin@venue.ai / admin@123');
    }

    await seedDatabase(db);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
