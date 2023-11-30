const express = require('express');
const { check, body, param, query, cookie, header } = require("express-validator")
const router = express.Router();
const { getlogin, postlogin, postlogout, getSignup, postSignup, getReset, postReset, getNewPassword, postNewPassword } = require('../controllers/auth');

router.get("/login", getlogin)
router.post("/login",
    [body("email", "Please Enter Valid Email").isEmail().normalizeEmail(),
    body("password", "Password length min 5 Char").isLength({ min: 5 }).trim()]
    , postlogin)


router.post("/logout", postlogout)

router.get("/signup", getSignup)
router.post("/signup",
    [check("email").isEmail().withMessage("Enter a Valid mail")
        .custom((value, { req }) => {
            if (value === "admin@mail.com") {
                throw new Error("This email address is forbidden");
            }
            return true;
        }).normalizeEmail(),
    body("password", "Only allow Number and Character , Password  Length  above 5 Char ").isLength({ min: 5 }).isAlphanumeric().trim(),
    body("confirmPassword").trim().custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Password and ConfirmPassword mismatch");
        }
        return true;
    })]
    , postSignup)




router.get("/reset", getReset)
router.post("/reset", postReset)


router.get("/reset/:token", getNewPassword)
router.post("/new-password", postNewPassword)


module.exports = router;
