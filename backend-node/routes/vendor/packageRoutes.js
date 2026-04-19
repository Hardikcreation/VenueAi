const router2 = require('express').Router();
const pkgController = require('../../controllers/vendor/packageController');

router2.post('/add', pkgController.addPackage);

module.exports = router2;