const crypto = require("crypto");
const User = require('../models/user');
const bcryptjs = require("bcryptjs")
const { validationResult } = require("express-validator");


// login 
const getlogin = (req, res, next) => {
    let message = req.flash("error")
    if (message.length > 0) { message = message[0] } else { message = null }
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login', errrorMessage: message,
        oldInput: { email: "", password: "" },
        validationErrors: []
    });
};

const postlogin = async (req, res, next) => {
    const { email, password } = req.body;

    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.render('auth/login', {
            pageTitle: 'Login',
            path: '/login',
            errrorMessage: error.array()[0].msg,
            oldInput: { email: email, password: password },
            validationErrors: error.array()
        });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.render('auth/login', {
            pageTitle: 'Login', path: '/login', errrorMessage: "Invalid Email or Password",
            oldInput: { email: email, password: password },
            validationErrors: []
        });
    }

    const comparePassword = await bcryptjs.compare(password, user.password);
    if (!comparePassword) {
        return res.render('auth/login', {
            pageTitle: 'Login', path: '/login', errrorMessage: "Invalid Email or Password",
            oldInput: { email: email, password: password },
            validationErrors: []
        });
    }

    if (comparePassword) {
        req.session.user = user;
        req.session.isLoggedIn = true
        return req.session.save((err) => {
            res.redirect('/');
        });
    }


};


// logout
const postlogout = async (req, res, next) => {
    req.session.destroy(() => {
        res.redirect("/");
    });

};


// signup
const getSignup = (req, res, next) => {
    let message = req.flash("error")
    if (message.length > 0) { message = message[0] } else { message = null }
    res.render('auth/signup', {
        pageTitle: 'Signup',
        path: '/signup',
        errrorMessage: message,
        oldInput: { email: "", password: "", confirmPassword: "" },
        validationErrors: []
    });
};


const postSignup = async (req, res, next) => {
    const { email, password, confirmPassword } = req.body;
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(422).render('auth/signup', {
            pageTitle: 'Signup',
            path: '/signup',
            errrorMessage: error.array()[0].msg,
            oldInput: { email: email, password: password, confirmPassword: confirmPassword },
            validationErrors: error.array()
        });
    }

    const alreadyUser = await User.findOne({ email: email });
    if (alreadyUser) {
        req.flash("error", "Email Already Exist Please Use Different Email");
        return res.redirect("/signup")
    }


    const hashpassword = await bcryptjs.hash(password, 5);
    const newUser = await new User({
        email: email,
        password: hashpassword,
        confirmPassword: confirmPassword,
        cart: { items: [] }
    }).save();
    return res.redirect("/login")
};


// reset token

const getReset = (req, res, next) => {
    let message = req.flash("error")
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null
    }
    res.render('auth/reset', { pageTitle: 'Reset Password', path: '/reset', errrorMessage: message });
};

const postReset = async (req, res, next) => {
    crypto.randomBytes(32, async (err, buffer) => {
        if (err) {
            return res.redirect("/reset");
        }
        const token = buffer.toString("hex");
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            req.flash("error", "No Account found With That Email ")
            return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        await user.save();
        console.log(`reset link  http://localhost:3000/reset/${token}`);
        return res.redirect("/");
    });

};

// reset new password
const getNewPassword = async (req, res, next) => {
    let message = req.flash("error")
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null
    }
    const token = req.params.token;
    const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });

    res.render('auth/new-password', { pageTitle: 'New Password', path: '/new-password', errrorMessage: message, userId: user._id.toString(), passwordToken: token });
};

const postNewPassword = async (req, res, next) => {
    const { passwordToken, password, userId } = req.body;
    const user = await User.findOne({ resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() }, _id: userId });

    const hashpassword = await bcryptjs.hash(password, 5);

    user.password = hashpassword;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();

    return res.redirect("/login");

};


module.exports = { getlogin, postlogin, postlogout, getSignup, postSignup, getReset, postReset, getNewPassword, postNewPassword }