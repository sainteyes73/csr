const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
  number:{type: Number, default:0},
  name:{type: String, trim:true}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
var Company = mongoose.model('Company', schema);

module.exports = Company;
