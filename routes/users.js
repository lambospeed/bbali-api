/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var express = require('express');
var router = express.Router();
var User = require('../db/models/User');

var multer = require('multer');
var upload = multer();

var randomstring = require('randomstring');

function isEmailOrPhone(req, res, next) {
    var email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var phone = /^\+[0-9]+\s[0-9]+$/;
    if ( ( req.body.email !== undefined && email.test(req.body.email)) 
            || ( req.body.phone !== undefined && phone.test(req.body.phone) )) {
        next();
    } else {
        res.send({
            error: 'Email or Phone should be exist and correct'
        });
    }
}

function isEmail(req, res, next) {
    var email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if ( req.body.email !== undefined && email.test(req.body.email) ) {
        next();
    } else {
        res.send({
            error: 'Email should be exist and correct'
        });
    }
}

function isFullName(req, res, next) {
    var fullName = /[0-9a-zA-Z]+\s+[0-9a-zA-Z]+/;
    if ( req.body.fullName !== undefined && fullName.test(req.body.fullName) ) {
        next();
    } else {
        res.send({
            error: 'Full name should be exist and correct'
        });
    }
}

function isPassword(req, res, next) {
    if ( req.body.password !== undefined && req.body.password.length > 5 ) {
        next();
    } else {
        res.send({
            error: 'Password should be exist and have more then 5 characters'
        });
    }
}

function xor(ai) {
    var f = "";
    for (var c = 0; c < ai.length; c++) {
        f += String.fromCharCode(ai.charCodeAt(c) ^ (1 + (ai.length - c) % 32));
    }
    return f;
}

router.post('/create', 
    upload.array(), 
    isEmailOrPhone, 
    isFullName,
    isPassword,
    function (req, res) {
        var salt = Math.random() + '';
        var user = new User({
            FullName: req.body.fullName,
            Email: req.body.email,
            Phone: req.body.phone,
            salt: salt,
            UserLat: req.body.userLat,
            UserLon: req.body.userLon,
            SelectedLanguage: req.body.selectedLanguage,
            EtherAddress: randomstring.generate({
                charset: 'hex',
                length: 42
            }),
            BitcoinAddress: randomstring.generate({
                charset: 'alphanumeric',
                length: 33
            })
        });
        user.Password = user.encryptPassword( xor(req.body.password) );
        var auth = '';
        do {
            auth = randomstring.generate({
                charset: 'alphanumeric',
                length: 12
            });
        } while ( User.find({UserAuth: auth}).count() > 0 );
        user.UserAuth = auth;
        
        user.save().then(function (registerUser) {
            if (registerUser) {
                res.send({
                    error: false,
                    msg: 'user account succefully created',
                    data: {
                        userEmail: registerUser.Email,
                        userPhone: registerUser.Phone,
                        userAuth: registerUser.UserAuth,
                        bitcoinAddress: registerUser.BitcoinAddress,
                        etherAddress: registerUser.EtherAddress
                    }
                });
            } else {
                res.send({
                    error: "Please try again later"
                });
            }
        })
});

router.post('/session', 
    upload.array(), 
    isEmailOrPhone, 
    isPassword, 
    function (req, res) {
        User.findOne({
            $or: [
                {Email: req.body.email},
                {Phone: req.body.phone}
            ]
        }).then( function (findedUser) {
            if ( findedUser && findedUser.checkPass( xor( req.body.password ) ) ) {
                res.send({
                    error: false,
                    msg: 'user account succefully created',
                    data: {
                        currentStatus: 'riding',
                        status: 'notsuspend',
                        userAuth: findedUser.UserAuth,
                        language: findedUser.SelectedLanguage
                    }
                });
            } else {
                res.send({
                    error: 'User not found'
                });
            }
        });
});

router.post('/forgotPassword',
    upload.array(), 
    isEmail,
    function (req, res) {
        var restoreLink = '';
        do {
            restoreLink = randomstring.generate({
                charset: 'alphanumeric',
                length: 12
            });
        } while ( User.find({
            RestoreLink: restoreLink
        }).count() > 0 );
        
        User.find({
            Email: req.body.email
        }).then( function (findedUser) {
            if ( findedUser ) {
                findedUser.RestoreLink = restoreLink;
                findedUser.save();
                res.send({
                    error: false,
                    msg: 'E-mail sent with reset instructions',
                    data: {
                        email: req.body.email
                    }
                });
            } else {
                res.send({
                    error: 'User not found'
                });
            }
        });
});

module.exports = router;