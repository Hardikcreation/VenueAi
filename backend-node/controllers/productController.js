const Product = require('../models/Product');
const Feature = require('../models/Feature');
const Service = require('../models/Service');
const Package = require('../models/Package');

const formatProductPayload = (product, extras = {}) => {
  if (!product) return null;

  const vendor = product.vendor_id || null;
  const owner = vendor?.user_id || null;
  const rawPrice = product.price ?? product.base_price ?? 0;

  return {
    ...product.toObject(),
    ...extras,
    id: String(product._id),
    name: product.title,
    title: product.title,
    price: rawPrice,
    base_price: rawPrice,
    thumbnail: product.image || null,
    image: product.image || null,
    gallery_images: product.gallery_images || [],
    business_name: vendor?.business_name || '',
    vendor_name: owner?.name || '',
    area: [product.zone, product.landmark].filter(Boolean).join(', '),
  };
};

// ✅ Get All Products (with search + filter + pagination)
const getAllProducts = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    let filter = {};

    // 🔹 Only approved for public
    if (status && status !== 'all') filter.status = status;
    else filter.status = 'approved';

    // 🔍 Search
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .populate({
        path: 'vendor_id',
        select: 'business_name',
        populate: {
          path: 'user_id',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // 🔥 Enrich data
    const enriched = await Promise.all(
      products.map(async (product) => {
        const [features, services, packages] = await Promise.all([
          Feature.findOne({ product_id: product._id }),
          Service.find({ product_id: product._id }),
          Package.find({ product_id: product._id })
        ]);

        return formatProductPayload(product, {
          features,
          services,
          packages
        });
      })
    );

    const total = await Product.countDocuments(filter);

    res.json({
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: enriched
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// ✅ Get Single Product (Full Details)
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({
        path: 'vendor_id',
        select: 'business_name',
        populate: {
          path: 'user_id',
          select: 'name'
        }
      });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const [features, services, packages] = await Promise.all([
      Feature.findOne({ product_id: product._id }),
      Service.find({ product_id: product._id }),
      Package.find({ product_id: product._id })
    ]);

    res.json(formatProductPayload(product, {
      features,
      services,
      packages
    }));

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  getAllProducts,
  getProductById,
  formatProductPayload
};
