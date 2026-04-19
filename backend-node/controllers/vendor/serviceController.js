const Service = require('../../models/Service');

exports.addService = async (req, res) => {
    const { productId, name, price } = req.body;
    const service = await Service.create({ product_id: productId, name, price });
    res.json(service);
};

exports.getServices = async (req, res) => {
    const services = await Service.find({ product_id: req.params.productId });
    res.json(services);
};