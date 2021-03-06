const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Schema = mongoose.Schema;

var schema = new Schema({
  name: {type: String, required: true, trim: true},
  userid: {type: String, required: true, index: true, unique: true, trim: true},
  company: {type: String},
  password: {type: String},
  createdAt: {type: Date, default: Date.now},
  minorname: {type: String, trim: true},
  adminflag:{type:Number, default: 0},
  email:{type: String},
  csrflag:{type: Number, default: 0}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

schema.methods.generateHash = function(password) {
  return bcrypt.hash(password, 10); // return Promise
};

schema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password); // return Promise
};

var User = mongoose.model('User', schema);

module.exports = User;
