const mongoose = require('mongoose')

const languageSchema = new mongoose.Schema({
    language: {
        type: String,
        required: true
    },
    tutor: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'tutor'
        },
    ],
    students: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'students'
        },
    ],

})

const languages = new mongoose.model('languages', languageSchema)

module.exports = languages;

