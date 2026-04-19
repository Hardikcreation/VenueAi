const router = require('express').Router();
const controller = require('../../controllers/vendor/serviceController');

router.post('/add', controller.addService);
router.get('/:productId', controller.getServices);

module.exports = router;
