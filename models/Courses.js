var mongoose = require('mongoose');

var CourseSchema = new mongoose.Schema({
  title: String,
  link: String,
  author: String,
  major: String,
  upvotes: {type: Number, default: 0},
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});
CourseSchema.methods.upvote = function(cb) {
  this.upvotes += 1;
  this.save(cb);
};
CourseSchema.methods.downvote = function(cb) {
  this.upvotes -= 1;
  this.save(cb);
};

mongoose.model('Course', CourseSchema);