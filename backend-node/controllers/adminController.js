// controllers/adminController.js

const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const { formatProductPayload } = require('./productController');

const buildVendorSummary = (vendor, venue) => ({
  id: String(vendor._id),
  _id: vendor._id,
  business_name: vendor.business_name,
  phone: vendor.phone || '',
  address: vendor.address || '',
  approved: Boolean(vendor.approved),
  createdAt: vendor.createdAt,
  user: vendor.user_id ? {
    id: String(vendor.user_id._id),
    name: vendor.user_id.name,
    email: vendor.user_id.email
  } : null,
  venue: venue ? {
    id: String(venue._id),
    title: venue.title,
    status: venue.status,
    category: venue.category,
    location: venue.location,
    image: venue.image || null,
    gallery_images: venue.gallery_images || []
  } : null,
  verification_documents: vendor.verification_documents || []
});

const getStats = async (req, res) => {
  try {
    const users = await User.countDocuments({ role: 'user' });
    const vendors = await Vendor.countDocuments();
    const products = await Product.countDocuments();
    const pending = await Product.countDocuments({ status: 'pending' });

    res.json({ users, vendors, products, pending });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find()
      .populate('user_id', 'name email') // JOIN replacement
      .sort({ createdAt: -1 });

    const venueIds = vendors.map((vendor) => vendor._id);
    const venues = await Product.find({ vendor_id: { $in: venueIds } });
    const venueMap = new Map(venues.map((venue) => [String(venue.vendor_id), venue]));

    res.json(vendors.map((vendor) => buildVendorSummary(vendor, venueMap.get(String(vendor._id)))));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getVendorDetails = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findById(vendorId).populate('user_id', 'name email role createdAt');
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const venue = await Product.findOne({ vendor_id: vendor._id })
      .populate({
        path: 'vendor_id',
        select: 'business_name user_id',
        populate: {
          path: 'user_id',
          select: 'name email'
        }
      });

    res.json({
      vendor: buildVendorSummary(vendor, venue),
      venue: venue ? formatProductPayload(venue) : null,
      documents: vendor.verification_documents || [],
      images: [
        ...(venue?.image ? [venue.image] : []),
        ...(venue?.gallery_images || [])
      ]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const product = await Product.findByIdAndUpdate(id, { status }, { new: true });

    if (product?.vendor_id) {
      await Vendor.findByIdAndUpdate(product.vendor_id, {
        approved: status === 'approved'
      });
    }

    res.json({ message: 'Product status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // delete related vendor + products (manual cascade)
    const vendor = await Vendor.findOne({ user_id: userId });
    if (vendor) {
      await Product.deleteMany({ vendor_id: vendor._id });
      await Vendor.deleteOne({ _id: vendor._id });
    }

    await User.findByIdAndDelete(userId);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const approveVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const vendor = await Vendor.findByIdAndUpdate(vendorId, { approved: true }, { new: true });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    await Product.updateMany({ vendor_id: vendor._id }, { status: 'approved' });

    res.json({ message: 'Vendor approved successfully', vendor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const rejectVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const vendor = await Vendor.findByIdAndUpdate(vendorId, { approved: false }, { new: true });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    await Product.updateMany({ vendor_id: vendor._id }, { status: 'rejected' });

    res.json({ message: 'Vendor rejected successfully', vendor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getStats,
  getAllUsers,
  getAllVendors,
  getVendorDetails,
  updateProductStatus,
  deleteUser,
  approveVendor,
  rejectVendor,
};
