const express = require('express');
const { getProducts, getProduct, getIndex, getCart, postCart, postCartDeleteProduct, postOrder, getOrders, getInvoice } = require('../controllers/shop');
const router = express.Router();
const { isAuth } = require('../middleware/Is-auth.js');

router.get('/', getIndex);
router.get('/products', getProducts);
router.get('/products/:productId', getProduct);

router.get('/cart', isAuth, getCart);
router.post('/cart', isAuth, postCart);
router.post('/cart-delete-item', isAuth, postCartDeleteProduct);

router.post('/create-order', isAuth, postOrder);
router.get('/orders', isAuth, getOrders);

router.get('/orders/:orderId', isAuth, getInvoice);


module.exports = router;
