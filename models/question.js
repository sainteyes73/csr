const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
var schema = new Schema({
  author:  { type: Schema.Types.ObjectId, ref: 'User' },
  title: {type: String, trim: true, required: true},
  manager: {type: String, trim: true, required: true},
  noticeContent: {type: String, trim: true, required: true},
  phonenum:{type: String, trim:true},
  extension: {type:Number, default:0},
  numLikes: {type: Number, default: 0},
  numAnswers: {type: Number, default: 0},
  numReads: {type: Number, default: 0},
  createdAt: {type: Date, default: Date.now},
  selectoption: {type: Number, trim:true, required: true}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var Question = mongoose.model('Question', schema);

module.exports = Question;
