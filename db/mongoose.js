/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var mongoose = require('mongoose');
var db = mongoose.connect("mongodb://localhost:27017/bbail2", {
    useMongoClient: true
});

mongoose.Promise = global.Promise;
module.exports = mongoose;
