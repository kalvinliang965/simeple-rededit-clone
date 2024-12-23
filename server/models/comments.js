// comments.js

let mongoose = require('mongoose')
let Schema = mongoose.Schema;

let CommentsSchema = new Schema({
    content: {
        type: String, 
        maxLength: 500,
        required: true, 
    },
    commentIDs: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment',
    }],
    commentedBy: {
        type: String, 
        required: true
    },
    commentedDate: { 
        type: Date, 
        default: Date.now, 
        required: true
    },
    upvote: {
        type: Number,
        default: 0,
    }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

CommentsSchema.virtual('url').get(function() {
    const url = `comments/${this._id}`;
    return url;
});

module.exports = mongoose.model('Comment', CommentsSchema, 'comments');