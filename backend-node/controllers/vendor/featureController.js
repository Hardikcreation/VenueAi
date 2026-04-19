const Feature = require('../../models/Feature');

exports.addOrUpdateFeatures = async (req, res) => {
    const { productId, ...features } = req.body;

    let feature = await Feature.findOne({ product_id: productId });

    if (feature) {
        Object.assign(feature, features);
        await feature.save();
    } else {
        feature = await Feature.create({ product_id: productId, ...features });
    }

    res.json(feature);
};
