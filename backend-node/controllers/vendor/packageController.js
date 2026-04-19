const Package = require('../../models/Package');

exports.addPackage = async (req, res) => {
    const { productId, name, services, price } = req.body;
    const pkg = await Package.create({ product_id: productId, name, services, price });
    res.json(pkg);
};