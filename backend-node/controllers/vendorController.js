// controllers/vendorController.js

const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Booking = require('../models/Booking');

const { uploadImage, uploadImages } = require('../utils/uploadImage');

const normalizeArrayField = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};


// ✅ Get Vendor by User
const getVendorByUserId = async (userId) => {
  return await Vendor.findOne({ user_id: userId });
};

// ✅ Get Venue by Vendor
const getVenueByVendorId = async (vendorId) => {
  const product = await Product.findOne({ vendor_id: vendorId });

  if (!product) return null;

  const pendingBookings = await Booking.countDocuments({
    product_id: product._id,
    status: 'pending'
  });

  const totalBookings = await Booking.countDocuments({
    product_id: product._id
  });

  return {
    ...product.toObject(),
    pending_bookings: pendingBookings,
    total_bookings: totalBookings
  };
};


// ✅ Get Profile
const getProfile = async (req, res) => {
  try {
    const vendor = await getVendorByUserId(req.user.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const venue = await Product.findOne({ vendor_id: vendor._id }).select('status title');

    res.json({
      ...vendor.toObject(),
      venue_status: venue?.status || null,
      venue_title: venue?.title || null
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// ✅ Update Profile
const updateProfile = async (req, res) => {
  try {
    const vendor = await getVendorByUserId(req.user.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    vendor.business_name = req.body.businessName?.trim() || vendor.business_name;
    vendor.phone = req.body.phone?.trim() || null;
    vendor.address = req.body.address?.trim() || null;

    await vendor.save();

    res.json({
      message: 'Profile updated',
      vendor
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// ✅ Add Product (Venue)
const addProduct = async (req, res) => {
  try {
    const vendor = await getVendorByUserId(req.user.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    const existing = await Product.findOne({ vendor_id: vendor._id });
    if (existing) {
      return res.status(400).json({ message: 'Only one venue allowed per vendor' });
    }

    const coverImage = await uploadImage(req.files?.image?.[0], 'venue-ai/cover');
    const galleryImages = await uploadImages(req.files?.gallery || [], 'venue-ai/gallery');

    const product = await Product.create({
      vendor_id: vendor._id,
      title: req.body.title,
      description: req.body.description,
      image: coverImage,
      gallery_images: galleryImages,
      video_url: req.body.videoUrl || null,
      location: req.body.location,
      city: req.body.city || 'Bhopal',
      category: req.body.category,
      listing_type: req.body.listingType || 'venue',
      zone: req.body.zone,
      landmark: req.body.landmark,
      service_area: req.body.serviceArea || req.body.location || '',
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      street_view_image: req.body.streetViewImage,
      occasion_types: normalizeArrayField(req.body.occasionTypes),
      occasion_focus: normalizeArrayField(req.body.occasionFocus || req.body.occasionTypes),
      features: normalizeArrayField(req.body.features),
      combo_items: normalizeArrayField(req.body.comboItems),
      capacity: req.body.capacity,
      price: req.body.price,
      base_price: req.body.price,
      price_unit: req.body.priceUnit || 'Starting Price',
      tag_label: req.body.tagLabel || '',
      pure_veg: req.body.pureVeg === true || req.body.pureVeg === 'true',
      rating: Number(req.body.rating || 0),
      review_count: Number(req.body.reviewCount || 0),
      budget_tier: req.body.budgetTier || 'mid',
      premium_pick: req.body.premiumPick === true || req.body.premiumPick === 'true',
      available_today: req.body.availableToday === true || req.body.availableToday === 'true',
      combo_package: req.body.comboPackage === true || req.body.comboPackage === 'true',
      combo_name: req.body.comboName || '',
      combo_discount_price: Number(req.body.comboDiscountPrice || 0),
      combo_original_price: Number(req.body.comboOriginalPrice || 0),
      trending_score: Number(req.body.trendingScore || 0),
      recommended_score: Number(req.body.recommendedScore || 0),
      status: 'pending'
    });

    res.status(201).json({
      message: 'Venue added (pending approval)',
      product
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// ✅ Get My Venue
const getMyVenue = async (req, res) => {
  try {
    const vendor = await getVendorByUserId(req.user.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    const venue = await getVenueByVendorId(vendor._id);

    res.json(venue);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// ✅ Update Venue
const updateMyVenue = async (req, res) => {
  try {
    const vendor = await getVendorByUserId(req.user.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    const product = await Product.findOne({ vendor_id: vendor._id });
    if (!product) return res.status(404).json({ message: 'Venue not found' });

    if (req.files?.image?.[0]) {
      product.image = await uploadImage(req.files.image[0], 'venue-ai/cover');
    }

    const galleryImages = await uploadImages(req.files?.gallery || [], 'venue-ai/gallery');
    if (galleryImages.length > 0) {
      product.gallery_images = galleryImages;
    }

    product.title = req.body.title || product.title;
    product.description = req.body.description || product.description;
    product.location = req.body.location || product.location;
    product.city = req.body.city || product.city;
    product.category = req.body.category || product.category;
    product.listing_type = req.body.listingType || product.listing_type;
    product.zone = req.body.zone || product.zone;
    product.landmark = req.body.landmark || product.landmark;
    product.service_area = req.body.serviceArea || product.service_area;
    product.capacity = req.body.capacity || product.capacity;
    product.price = req.body.price || product.price;
    product.base_price = req.body.price || product.base_price;
    product.occasion_types = normalizeArrayField(req.body.occasionTypes).length ? normalizeArrayField(req.body.occasionTypes) : product.occasion_types;
    product.occasion_focus = normalizeArrayField(req.body.occasionFocus).length ? normalizeArrayField(req.body.occasionFocus) : product.occasion_focus;
    product.features = normalizeArrayField(req.body.features).length ? normalizeArrayField(req.body.features) : product.features;
    product.combo_items = normalizeArrayField(req.body.comboItems).length ? normalizeArrayField(req.body.comboItems) : product.combo_items;
    product.price_unit = req.body.priceUnit || product.price_unit;
    product.tag_label = req.body.tagLabel || product.tag_label;
    if (typeof req.body.pureVeg !== 'undefined') product.pure_veg = req.body.pureVeg === true || req.body.pureVeg === 'true';
    if (req.body.rating) product.rating = Number(req.body.rating || product.rating);
    if (req.body.reviewCount) product.review_count = Number(req.body.reviewCount || product.review_count);
    product.budget_tier = req.body.budgetTier || product.budget_tier;
    if (typeof req.body.premiumPick !== 'undefined') product.premium_pick = req.body.premiumPick === true || req.body.premiumPick === 'true';
    if (typeof req.body.availableToday !== 'undefined') product.available_today = req.body.availableToday === true || req.body.availableToday === 'true';
    if (typeof req.body.comboPackage !== 'undefined') product.combo_package = req.body.comboPackage === true || req.body.comboPackage === 'true';
    product.combo_name = req.body.comboName || product.combo_name;
    if (req.body.comboDiscountPrice) product.combo_discount_price = Number(req.body.comboDiscountPrice || product.combo_discount_price);
    if (req.body.comboOriginalPrice) product.combo_original_price = Number(req.body.comboOriginalPrice || product.combo_original_price);
    if (req.body.trendingScore) product.trending_score = Number(req.body.trendingScore || product.trending_score);
    if (req.body.recommendedScore) product.recommended_score = Number(req.body.recommendedScore || product.recommended_score);

    product.status = 'pending'; // re-approval

    await product.save();

    res.json({
      message: 'Updated (pending approval)',
      product
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// ✅ Upload Images
const uploadVenueImages = async (req, res) => {
  try {
    const vendor = await getVendorByUserId(req.user.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    const product = await Product.findOne({ vendor_id: vendor._id });
    if (!product) return res.status(404).json({ message: 'Venue not found' });

    const uploadedImages = await uploadImages(req.files || [], 'venue-ai/gallery');
    
    // Add to existing gallery images
    product.gallery_images = [...(product.gallery_images || []), ...uploadedImages];
    await product.save();

    res.json({
      message: 'Images uploaded successfully',
      images: uploadedImages,
      gallery: product.gallery_images
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Get Venue Images
const getVenueImages = async (req, res) => {
  try {
    const vendor = await getVendorByUserId(req.user.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    const product = await Product.findOne({ vendor_id: vendor._id });
    if (!product) return res.status(404).json({ message: 'Venue not found' });

    res.json(product.gallery_images || []);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Upload Verification Document
const uploadVerificationDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const vendor = await getVendorByUserId(req.user.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    // Upload document to Cloudinary
    const documentUrl = await uploadImage(req.file, 'venue-ai/verification');

    // Store verification document URL in vendor record
    vendor.verification_documents = vendor.verification_documents || [];
    vendor.verification_documents.push({
      url: documentUrl,
      uploadedAt: new Date()
    });

    await vendor.save();

    res.json({
      message: 'Document uploaded successfully',
      documentUrl
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  addProduct,
  getMyVenue,
  updateMyVenue,
  getProfile,
  updateProfile,
  uploadVenueImages,
  getVenueImages,
  uploadVerificationDocument
};
