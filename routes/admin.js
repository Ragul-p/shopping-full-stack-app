const express = require('express');
const { getAddProduct, getProducts, postAddProduct, getEditProduct, postEditProduct, deleteProduct } = require('../controllers/admin');
const { isAuth } = require('../middleware/Is-auth.js');
const router = express.Router();
const { body } = require("express-validator");

router.get('/add-product', isAuth, getAddProduct);

router.get('/products', isAuth, getProducts);

router.post('/add-product', [
    body("title", "Title Length min 3").isString().isLength({ min: 3 }).trim(),
    body("price", "Floting No Only").isFloat(),
    body("description", "Description Min 5 To Max 400").isString().isLength({ min: 5, max: 400 }).trim(),
], isAuth, postAddProduct);

router.get('/edit-product/:productId', isAuth, getEditProduct);

router.post('/edit-product', [
    body("title", "Title Length min 3").isString().isLength({ min: 3 }).trim(),
    body("price", "Floting No Only").isFloat(),
    body("description", "Description Min 5 To Max 400").isString().isLength({ min: 5, max: 400 }).trim(),
], isAuth, postEditProduct);

router.delete('/product/:productId', isAuth, deleteProduct);

module.exports = router;
