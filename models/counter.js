var mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
  name: {type:String, required:true},
  totalCount: {type:Number, required:true},
  todayCount: {type:Number},
  date: {type:String}
},
{
  collection : 'counters',
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

var Counter = mongoose.model('Counter',schema);
module.exports = Counter;
