const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const shopRouter = express.Router();

shopRouter.get('/', shopController.getIndex);

shopRouter.get('/products', shopController.getProducts);

shopRouter.get('/products/:productId', shopController.getProductById);

shopRouter.get('/cart', isAuth, shopController.getCart);

shopRouter.post('/cart', isAuth, shopController.postCart);

shopRouter.post('/cart-delete-item', isAuth, shopController.postCartDeleteProd);

shopRouter.get('/orders', isAuth, shopController.getOrders);

shopRouter.get('/checkout', isAuth, shopController.getCheckout);

shopRouter.get('/checkout/success', shopController.getCheckoutSuccess);

shopRouter.get('/checkout/cancel', shopController.getCheckout);

shopRouter.get('/orders/:orderId', isAuth, shopController.getInvoice);

module.exports = shopRouter;