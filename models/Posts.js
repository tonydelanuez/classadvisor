var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
  title: String,
  link: String,
  author: String,
  major: String,
  description: String,
  upvotes: {type: Number, default: 0},
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  courses: [String]
});
PostSchema.methods.upvote = function(cb) {
  this.upvotes += 1;
  this.save(cb);
};
PostSchema.methods.downvote = function(cb) {
  this.upvotes -= 1;
  this.save(cb);
};

mongoose.model('Post', PostSchema);