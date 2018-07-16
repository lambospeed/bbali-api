/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var crypto = require('crypto');
var mongoose = require('../mongoose');

var UserSchema = new mongoose.Schema({
    Email: {
        type: String,
        required: false,
        trim: true,
        unique: true,
        sparse: true
    },
    Phone: {
        type: String,
        required: false,
        trim: true,
        unique: true,
        sparse: true
    },
    FullName: {
        type: String,
        required: true,
        trim: true
    },
    Password: {
        type: String,
        required: true
    },
    salt: {
        type: String
    },
    UserLat: {
        type: String,
        required: false
    },
    UserLon: {
        type: String,
        required: false
    },
    SelectedLanguage: {
        type: String,
        required: false,
        default: 'English'
    },
    BitcoinAddress: {
        type: String
    },
    EtherAddress: {
        type: String
    },
    UserAuth: {
        type: String
    },
    RestoreLink: {
        type: String
    }
});

UserSchema.pre('save', function (next) {
    if ( this.Email !== undefined || this.Phone !== undefined ) {
        next();
    }
});

UserSchema.methods.encryptPassword = function (password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
}

UserSchema.methods.checkPass = function (pass) {
    return this.encryptPassword(pass) === this.Password;
}


var UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;