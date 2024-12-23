// users.js

// This module contain the schemas for user document
// user can be either admin or normal user
// There is only one admin

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    displayName: {
        type: String,
        required: true,
        maxLength: 15,
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: function (text) {
                const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return regex.test(text);
              },
              message: "Must be a valid email",   
        },
    },

    // password after hash
    password: {
        type: String,
        required: true,
    },

    createdDate: {
        type: Date,
        default: Date.now,
    },

    reputation: {
        type: Number,
        default: function() {
            return this.admin? 1000: 100; // Regular users should start with a reputation of 100.  Admin users should start with a reputation of 1000.  
        }
    },

    admin: {
        type: Boolean,
        default: false,
    },
    // User's community
    communities: [{
        type: Schema.Types.ObjectId,
        ref: "Community",
    }],

    // User's comment
    comments: [{
        type: Schema.Types.ObjectId,
        ref: "Comment",
    }],

    // User's post
    posts: [{
        type: Schema.Types.ObjectId,
        ref: "Post",
    }],

    ownedCommunities: [{
        type: Schema.Types.ObjectId,
        ref: 'Community',
    }],
});

UserSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
})

UserSchema.virtual("url").get(function() {
    return `user/${this._id}`;  
});

module.exports = mongoose.model("User", UserSchema, "users");
