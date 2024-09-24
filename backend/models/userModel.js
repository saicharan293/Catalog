const mongoose = require('mongoose');
require('dotenv').config()
mongoose.connect(process.env.MONGO_URL);

const userSchema=mongoose.Schema({
    googleId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    photo: { type: String },
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('user',userSchema);