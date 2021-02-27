const User = require("../models/user.js")
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { render } = require('ejs');
const passport = require('passport');
require("../config/passport")(passport)

//login handle
router.get('/login', (req, res) => {
    res.render('login');
})
router.get('/register', (req, res) => {
    res.render('register')
})

//Register handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true,
    })(req, res, next);
})

router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];
    console.log(' Name : ' + name + '/ email : ' + email + '/ password : ' + password);
    if (!name || !email || !password || !password2) {
        errors.push({ msg: "모든 값을 입력해주세요." })
    }
    //check if match
    if (password !== password2) {
        errors.push({ msg: "비밀번호가 일치하지 않습니다." });
    }

    //check if password is more than 6 characters
    if (password.length < 6) {
        errors.push({ msg: '비밀번호는 6글자 이상이어야 합니다.' })
    }
    if (errors.length > 0) {
        res.render('register', {
            errors: errors,
            name: name,
            email: email,
            password: password,
            password2: password2
        })
    } else {
        //validation passed
        User.findOne({ email: email }).exec((err, user) => {
            console.log(user);
            if (user) {
                errors.push({ msg: '이미 등록된 이메일입니다.' });
                res.render('register', { errors, name, email, password, password2 })
            } else {
                const newUser = new User({
                    name: name,
                    email: email,
                    password: password
                });
                //hash password
                bcrypt.genSalt(10, (err, salt) =>
                    bcrypt.hash(newUser.password, salt,
                        (err, hash) => {
                            if (err) throw err;
                            //save pass to hash
                            newUser.password = hash;
                            //save user
                            newUser.save()
                                .then((value) => {
                                    console.log(value);
                                    req.flash('success_msg', '회원가입이 완료되었습니다!');
                                    res.redirect('/users/login');
                                })
                                .catch(value => console.log(value));
                        }));
            } //ELSE statement ends here
        })
    }
})

//logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', '로그아웃 되었습니다.');
    res.redirect('/users/login');
})

module.exports = router;