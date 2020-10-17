const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types
const userSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true
    },
    email: {
        type: String, 
        required: true
    },
    password: {
        type: String, 
        required: true
    },
    resetToken: String,
    expire: Date,
    pic: {
        type: String,
        default: "https://res.cloudinary.com/pradthecoder/image/upload/v1602641314/no-image-icon-23505_q9svsu.png"
    },
    followers: [{type: ObjectId, ref: "User"}],
    following: [{type: ObjectId, ref: "User"}]

});





mongoose.model("User", userSchema);
