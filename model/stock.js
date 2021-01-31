const mongoose = require('mongoose');

let StockModel = new mongoose.Schema({
    stock: String,
    likes: Number,
    likeIPs:[]
});

module.exports = mongoose.model('Stock', StockModel);