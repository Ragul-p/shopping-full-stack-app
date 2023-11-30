const path = require('path');
const fs = require('fs');


const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const User = require('./models/user');
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer")
const app = express();
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");


const mongoUri="mongodb+srv://ragul:IZi2D2IPxTlrardy@cluster0.wabeliy.mongodb.net/shopping?retryWrites=true&w=majority";

const store = new MongoDBStore({
  uri: mongoUri,
  collection: "sessions"
});

const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images")
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single("image"))
app.use(express.static(path.join(__dirname, 'public')));
app.use("/images", express.static(path.join(__dirname, "images")));


app.use(session({ secret: "secret", resave: false, saveUninitialized: false, store: store }));

app.use(csrfProtection);
app.use(flash());
app.use(helmet());
app.use(compression())

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: "a" });
app.use(morgan("combined", { stream: accessLogStream }));

app.use(async (req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  const user = await User.findById(req.session.user._id);
  req.user = user;
  next();
});

app.use(async (req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn,
    res.locals.csrfToken = req.csrfToken()
  next();
});


app.use("/admin", require("./routes/admin"));
app.use("/", require('./routes/shop'));
app.use("/", require("./routes/auth"));
app.use(require('./controllers/error').get404);

mongoose.connect(mongoUri)
  .then(async (result) => {
  })
  .catch(err => {
    console.log(err);
  });

app.listen(process.env.PORT || 3000, () => {
  console.log("server is listening on port 3000");
}); 
