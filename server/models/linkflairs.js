// LinkFlair Document Schema

let mongoose = require("mongoose");

let Schema = mongoose.Schema;

let LinkFlair_Schema = new Schema({
    content: {
        type: String, 
        maxLength: 30,
        required:true, 
    }
});

LinkFlair_Schema.virtual('url').get(function(){
    const url = `linkFlairs/${this._id}`;
    return url;
});

module.exports = mongoose.model('Linkflair', LinkFlair_Schema, `linkflairs`);