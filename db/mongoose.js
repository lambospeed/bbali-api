/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var mongoose = require('mongoose');
var db = mongoose.connect("mongodb://haidu:!kcm19940903@ds155299.mlab.com:55299/bbali");

mongoose.Promise = global.Promise;
module.exports = mongoose;
