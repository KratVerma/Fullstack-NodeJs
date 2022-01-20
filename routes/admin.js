const path = require('path');
const { check, body } = require('express-validator/check');


const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/add-product', isAuth, adminController.getAddProduct);

router.get('/admin-product-list', isAuth, adminController.getProductList);

router.post('/add-product',
    [
        body('title').isString().isLength({ min: 5 }).trim(),
        body('price').isFloat(),
        body('description').isLength({ min: 5, max: 100 }).trim(),
    ],
    isAuth, adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product',
    [
        body('title').isString().isLength({ min: 5 }).trim(),
        body('price').isFloat(),
        body('description').isLength({ min: 5, max: 100 }).trim(),
    ],
    isAuth, adminController.postEditProduct);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;