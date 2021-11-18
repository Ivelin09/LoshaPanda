const mongoose  = require("mongoose");

let notify = new mongoose.Schema({
    _id: String,
    time: String,
});

let studyStatus = new mongoose.Schema({
    mark: Number,
    desc: String,
    author: String,
    date: String
}, {_id: false});

let schema = new mongoose.Schema({
    _id: String,
    status: [studyStatus],
    totalGrade: Number,
    username: String
});


module.exports.studentModel = mongoose.model('Class', schema);
module.exports.notify = mongoose.model('notify', notify);