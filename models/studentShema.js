const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    is_blocked: {
        type: Boolean,
        default: false
    },
    photo: {
        type: String,
    },
    backgroundPhoto: {
        type: String,
    },
    role: {
        type: String,
    },
})

const students = new mongoose.model('students', studentSchema)

module.exports = students;

