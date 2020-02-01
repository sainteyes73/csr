const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
  name:  { type: String, trim: true },
  number: { type: Number, default: 0 },
}, {
  collection:'companys',
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
var Company = mongoose.model('Company', schema);

module.exports = Company;
