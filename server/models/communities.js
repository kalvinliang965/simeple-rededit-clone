// Community Document Schema

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CommunitySchema = new Schema({
    name: {
        type: String,
        required: true,
        maxLength: 100
    },
    description: {
        type: String,
        required: true,
        maxLength: 500
    },
    postIDs: [{
        type: Schema.Types.ObjectId,
        ref: 'Post',
    }],
    startDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    members: [{
        type: String,
        required: true,
    }],

    owner: {
        type: String,
        required: true,
    },

    creator: {
        type: String,
        required: true,
    },
});

CommunitySchema.virtual('memberCount').get(function() {
    return this.members.length;
});

CommunitySchema.virtual('url').get(function(){
    return `communities/${this._id}`;
});


CommunitySchema.set('toJSON', { virtuals: true });

CommunitySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Community', CommunitySchema, `communities`);
