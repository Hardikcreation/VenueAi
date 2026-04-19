const router3 = require('express').Router();
const featureController = require('../../controllers/vendor/featureController');

router3.post('/update', featureController.addOrUpdateFeatures);

module.exports = router3;
