const { getPool } = require('../config/db');
const { formatProduct, parseList, serializeList } = require('../utils/productFormatter');
const { uploadImage, uploadImages } = require('../utils/uploadImage');

const getVendorByUserId = async (userId) => {
  const [vendors] = await getPool().query('SELECT * FROM vendors WHERE user_id = ?', [userId]);
  return vendors[0] || null;
};

const getVenueByVendorId = async (vendorId) => {
  const [venues] = await getPool().query(
    `SELECT p.*,
      (
        SELECT COUNT(*)
        FROM bookings b
        WHERE b.product_id = p.id AND b.status = 'pending'
      ) AS pending_bookings,
      (
        SELECT COUNT(*)
        FROM bookings b
        WHERE b.product_id = p.id
      ) AS total_bookings
     FROM products p
     WHERE p.vendor_id = ?
     ORDER BY p.created_at ASC
     LIMIT 1`,
    [vendorId]
  );

  return venues[0] ? formatProduct(venues[0]) : null;
};

const getProfile = async (req, res) => {
  try {
    const vendor = await getVendorByUserId(req.user.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    return res.json(vendor);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const vendor = await getVendorByUserId(req.user.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    const businessName = req.body.businessName?.trim() || vendor.business_name;
    const phone = req.body.phone?.trim() || null;
    const address = req.body.address?.trim() || null;

    await getPool().query(
      'UPDATE vendors SET business_name = ?, phone = ?, address = ? WHERE id = ?',
      [businessName, phone, address, vendor.id]
    );

    return res.json({
      message: 'Vendor profile updated successfully',
      vendor: {
        ...vendor,
        business_name: businessName,
        phone,
        address
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const addProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      capacity,
      price,
      category,
      location,
      zone,
      landmark,
      latitude,
      longitude,
      streetViewImage,
      videoUrl,
      occasionTypes,
      features
    } = req.body;
    const coverImage = await uploadImage(req.files?.image?.[0], 'venue-ai/cover-images');
    const galleryImages = await uploadImages(req.files?.gallery || [], 'venue-ai/gallery');

    const vendor = await getVendorByUserId(req.user.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    const existingVenue = await getVenueByVendorId(vendor.id);
    if (existingVenue) {
      return res.status(400).json({ message: 'Each vendor can manage only one venue. Please edit your existing venue instead.' });
    }

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    await getPool().query(
      `INSERT INTO products (
        vendor_id, title, image, gallery_images, video_url, description, location, category,
        zone, landmark, latitude, longitude, street_view_image, occasion_types, features, capacity, price, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vendor.id,
        title,
        coverImage,
        serializeList(galleryImages),
        videoUrl || null,
        description,
        location || null,
        category || null,
        zone || null,
        landmark || null,
        latitude || null,
        longitude || null,
        streetViewImage || null,
        serializeList(parseList(occasionTypes)),
        serializeList(parseList(features)),
        capacity || null,
        price || null,
        'pending'
      ]
    );

    return res.status(201).json({ message: 'Product added successfully, pending approval' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getMyVenue = async (req, res) => {
  try {
    const vendor = await getVendorByUserId(req.user.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    const venue = await getVenueByVendorId(vendor.id);
    return res.json(venue);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const updateMyVenue = async (req, res) => {
  try {
    const vendor = await getVendorByUserId(req.user.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    const existingVenue = await getVenueByVendorId(vendor.id);
    if (!existingVenue) {
      return res.status(404).json({ message: 'No venue found for this vendor' });
    }

    const {
      title,
      description,
      capacity,
      price,
      category,
      location,
      zone,
      landmark,
      latitude,
      longitude,
      streetViewImage,
      videoUrl,
      occasionTypes,
      features
    } = req.body;

    const coverImage = req.files?.image?.[0]
      ? await uploadImage(req.files.image[0], 'venue-ai/cover-images')
      : existingVenue.image;

    const uploadedGalleryImages = await uploadImages(req.files?.gallery || [], 'venue-ai/gallery');
    const galleryImages = uploadedGalleryImages.length > 0
      ? uploadedGalleryImages
      : existingVenue.gallery_images;

    await getPool().query(
      `UPDATE products
       SET title = ?, image = ?, gallery_images = ?, video_url = ?, description = ?,
           location = ?, category = ?, zone = ?, landmark = ?, latitude = ?, longitude = ?,
           street_view_image = ?, occasion_types = ?, features = ?, capacity = ?, price = ?, status = 'pending'
       WHERE id = ? AND vendor_id = ?`,
      [
        title?.trim() || existingVenue.title,
        coverImage,
        serializeList(galleryImages),
        videoUrl?.trim() || existingVenue.video_url || null,
        description?.trim() || existingVenue.description,
        location?.trim() || existingVenue.location || null,
        category?.trim() || existingVenue.category || null,
        zone?.trim() || existingVenue.zone || null,
        landmark?.trim() || existingVenue.landmark || null,
        latitude || existingVenue.latitude || null,
        longitude || existingVenue.longitude || null,
        streetViewImage?.trim() || existingVenue.street_view_image || null,
        serializeList(parseList(occasionTypes ?? existingVenue.occasion_types)),
        serializeList(parseList(features ?? existingVenue.features)),
        capacity || existingVenue.capacity || null,
        price || existingVenue.price || null,
        existingVenue.id,
        vendor.id
      ]
    );

    const updatedVenue = await getVenueByVendorId(vendor.id);

    return res.json({
      message: 'Venue updated successfully. It is pending admin approval after the changes.',
      venue: updatedVenue
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { addProduct, getMyVenue, updateMyVenue, getProfile, updateProfile };
