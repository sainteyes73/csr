const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
  name:  { type: String, trim: true, unique: true },
  number: { type: Number, unique: true, trim: true },
}, {
  collection : 'items',
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
var Item = mongoose.model('Item', schema);

module.exports = Item;
