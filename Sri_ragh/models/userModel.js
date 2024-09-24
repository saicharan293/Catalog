const mongoose = require('mongoose');
require('dotenv').config()
mongoose.connect(process.env.MONGO_URL);

const userSchema=mongoose.Schema({
    fullName:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    }
})

module.exports = mongoose.model('user',userSchema);