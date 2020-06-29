const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
var schema = new Schema({
  author:  { type: Schema.Types.ObjectId, ref: 'User' },
  title: {type: String, trim: true, required: true},
  noticeContent: {type: String, trim: true, required: true},
  numAnswers: {type: Number, default: 0},
  numReads: {type: Number, default: 0},
  createdAt: {type: Date, default: Date.now},
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var Notice = mongoose.model('Notice', schema);

module.exports = Notice;
