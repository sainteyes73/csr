const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
  number:{type: Number, default : 0},
  name: {type: String, trim: true}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
var Item = mongoose.model('Item', schema);

module.exports = Item;
