const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
  name:  { type: String, trim: true },
  number: { type: Number, default: 0 },
}, {
  collection : 'items',
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
var Item = mongoose.model('Item', schema);

module.exports = Item;
