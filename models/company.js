const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
  name:  { type: String, trim: true, unique: true, required:true },
  number: { type: Number, default: 0, unique: true, trim: true, required:true },
}, {
  collection:'companys',
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
var Company = mongoose.model('Company', schema);

module.exports = Company;
