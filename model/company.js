const mongoose = require('mongoose');

let CompanyModel = new mongoose.Schema({
    company: String,
    likes: Number,
    likedIPs:[]
});

module.exports = mongoose.model('Company', CompanyModel);