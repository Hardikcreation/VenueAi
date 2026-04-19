// controllers/searchController.js

const Product = require('../models/Product');
const { formatProductPayload } = require('./productController');

exports.searchVenues = async (req, res) => {
    try {
        const { q, category, minPrice, maxPrice, capacity } = req.query;

        let query = { status: 'approved' };

        if (q) {
            query.$or = [
                { title: { $regex: q, $options: 'i' } },
                { category: { $regex: q, $options: 'i' } },
                { location: { $regex: q, $options: 'i' } },
                { zone: { $regex: q, $options: 'i' } },
                { landmark: { $regex: q, $options: 'i' } }
            ];
        }

        if (category) query.category = category;

        if (capacity) query.capacity = { $gte: Number(capacity) };

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const venues = await Product.find(query)
            .populate({
                path: 'vendor_id',
                select: 'business_name',
                populate: {
                    path: 'user_id',
                    select: 'name'
                }
            })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            success: true,
            count: venues.length,
            data: venues.map((venue) => formatProductPayload(venue))
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Search failed' });
    }
};
