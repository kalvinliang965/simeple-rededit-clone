// Post Document Schema

let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let PostsSchema = new Schema({
    title: {
        type:String, 
        required: true, 
        maxLength: 100
    },
    content: {
        type:String, 
        required: true
    },
    linkFlairID: {
        type:Schema.Types.ObjectId,
        ref: 'Linkflair',
    },
    postedBy: {
        type:String, 
        required: true
    },
    postedDate: {
        type:Date, 
        default: Date.now, 
    },
    commentIDs: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment',
    }],
    views: {
        type:Number, 
        default: 0,
    },
    upvote: {
        type:Number,
        default: 0,
    }
});

PostsSchema
.virtual('url')
.get(function(){
    const url = "posts/"+this._id;
    return url;
});

module.exports = mongoose.model("Post", PostsSchema, `posts`);

