const Product = require('../models/product');
const { validationResult } = require("express-validator");



const getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product', path: '/admin/add-product', hasError: false, editing: false,
    errrorMessage: null, validationErrors: []
  });
};



const postAddProduct = (req, res, next) => {
  const { title, price, description } = req.body;
  const image = req.file;

  const error = validationResult(req);
  if (!error.isEmpty()) { return res.render('admin/edit-product', { pageTitle: 'Add Product', path: '/admin/edit-product', hasError: true, editing: false, product: { title, imageUrl: "", price, description }, errrorMessage: error.array()[0].msg, validationErrors: error.array() }); }
  if (!image) { return res.render('admin/edit-product', { pageTitle: 'Add Product', path: '/admin/edit-product', hasError: true, editing: false, product: { title, imageUrl: "", price, description }, errrorMessage: "Image Not Uploader or Upload file is Not Image", validationErrors: [] }); }

  const imageUrl = image?.path;
  const product = new Product({
    title: title,

    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  }).save();

  res.redirect('/admin/products');
};



const getEditProduct = async (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) { return res.redirect('/'); }

  const prodId = req.params.productId;
  const product = await Product.findById(prodId);

  if (!product) { return res.redirect('/'); }
  res.render('admin/edit-product', {
    pageTitle: 'Edit Product', path: '/admin/edit-product',
    hasError: false, editing: editMode, product: product,
    errrorMessage: null,
    validationErrors: []
  });
};



const postEditProduct = async (req, res, next) => {
  const { productId, title, price, description } = req.body;
  const image = req.file;
  const error = validationResult(req);
  if (!error.isEmpty()) { return res.render('admin/edit-product', { pageTitle: 'Add Product', path: '/admin/edit-product', hasError: true, editing: true, product: { title, imageUrl: "", price, description, description, _id: productId }, errrorMessage: error.array()[0].msg, validationErrors: error.array() }); }
  if (!image) { return res.render('admin/edit-product', { pageTitle: 'Add Product', path: '/admin/edit-product', hasError: true, editing: false, product: { title, imageUrl: "", price, description, description, _id: productId }, errrorMessage: "Image Not Uploader or Upload file is Not Image", validationErrors: [] }); }

  const imageUrl = image.path;

  const update = await Product.updateOne({ _id: productId }, { title, price, description, imageUrl });
  res.redirect('/admin/products');
};



const getProducts = async (req, res, next) => {
  const products = await Product.find({ userId: req.user._id });
  res.render('admin/products', { prods: products, pageTitle: 'Admin Products', path: '/admin/products' });
};



const deleteProduct = async (req, res, next) => {
  const { productId } = req.params;
  await Product.deleteOne({ _id: productId })
  // res.redirect('/admin/products');
  res.status(200).json({ message: "success!" });

};




module.exports = { getAddProduct, postAddProduct, getEditProduct, postEditProduct, getProducts, deleteProduct }