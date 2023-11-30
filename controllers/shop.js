const Product = require('../models/product');
const Order = require('../models/order');
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");


const getIndex = async (req, res, next) => {
  const page = +req.query.page || 1;
  const perpage = 3;
  const totalItems = await Product.find().countDocuments();
  const products = await Product.find()
    .skip((page - 1) * perpage)
    .limit(perpage);
  res.render('shop/index', {
    prods: products,
    pageTitle: 'Shop',
    path: '/',
    currentPage: page,
    hasNextPage: perpage * page < totalItems,
    hasPreviousPage: page > 1,
    nextPage: page + 1,
    previousPage: page - 1,
    lastPage: Math.ceil(totalItems / perpage)
  });
};

const getProducts = async (req, res, next) => {
  const page = +req.query.page || 1;
  const perpage = 3;
  const totalItems = await Product.find().countDocuments();
  const products = await Product.find()
    .skip((page - 1) * perpage)
    .limit(perpage);
  res.render('shop/product-list', {
    prods: products,
    pageTitle: 'All Products',
    path: '/products',
    currentPage: page,
    hasNextPage: perpage * page < totalItems,
    hasPreviousPage: page > 1,
    nextPage: page + 1,
    previousPage: page - 1,
    lastPage: Math.ceil(totalItems / perpage)
  });
};

const getProduct = async (req, res, next) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);
  res.render('shop/product-detail', { product: product, pageTitle: product.title, path: '/products' });
};



const getCart = async (req, res, next) => {
  const user = await req.user.populate("cart.items.productId");
  console.log(user);
  const userCart = user.cart.items;
  console.log(userCart);

  console.log(userCart);
  res.render('shop/cart', { path: '/cart', pageTitle: 'Your Cart', products: userCart });
};

const postCart = async (req, res, next) => {
  const { productId } = req.body;
  const product = await Product.findById(productId);
  req.user.addToCart(product);
  res.redirect('/cart');
};

const postCartDeleteProduct = async (req, res, next) => {
  const { productId } = req.body;
  await req.user.removeFromCart(productId);
  res.redirect('/cart');
};

const postOrder = async (req, res, next) => {
  const user = await req.user.populate("cart.items.productId");

  const products = await user.cart.items.map(data => {
    return {
      quantity: data.quantity,
      product: { ...data.productId._doc }
    };
  });
  const order = await new Order({
    user: {
      email: req.user.email,
      userId: req.user
    },
    products: products
  }).save();

  await req.user.clearCart();
  res.redirect('/orders');
};



const getOrders = async (req, res, next) => {
  const orders = await Order.find({ 'user.userId': req.user._id });
  res.render('shop/orders', { path: '/orders', pageTitle: 'Your Orders', orders: orders });
};



const getInvoice = async (req, res, next) => {
  const orderId = req.params.orderId;

  const findOrder = await Order.findById(orderId);
  const invoiceName = "invoice-" + orderId + '.pdf';
  const invoicePath = path.join("data", "invoices", invoiceName);

  // 1.
  // fs.readFile(invoicePath, (err, data) => {
  //   res.setHeader("Content-Type", "application/pdf");
  //   res.setHeader("Content-Disposition", "inline;filename='" + invoiceName + "'");
  //   res.send(data);
  // })

  // 2.
  // const file = fs.createReadStream(invoicePath);
  // res.setHeader("Content-Type", "application/pdf");
  // res.setHeader("Content-Disposition", "inline;filename='" + invoiceName + "'");
  // file.pipe(res);


  // 3.
  const pdfDoc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline;filename='" + invoiceName + "'");
  pdfDoc.pipe(fs.createWriteStream(invoicePath));
  pdfDoc.pipe(res);


  pdfDoc.fontSize(26).text("Invoice", { underline: true });
  pdfDoc.text("--------------------------------------------");
  let totalPrice = 0;
  findOrder.products.forEach(prod => {
    totalPrice = totalPrice + prod.quantity * prod.product.price;
    pdfDoc.fontSize(16).text(prod.product.title + "   -   " + prod.quantity + ' x ' + ' $ ' + prod.product.price);
  })
  pdfDoc.text("-------");
  pdfDoc.fontSize(20).text("Total Price :              $ " + totalPrice);


  pdfDoc.end();

};



module.exports = { getProducts, getProduct, getIndex, getCart, postCart, postCartDeleteProduct, postOrder, getOrders, getInvoice }