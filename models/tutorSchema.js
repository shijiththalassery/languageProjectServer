const mongoose = require('mongoose')

const tutorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
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
    totalTime: {
        type: Number,
        required: true,
    },
    timeSlot: {
        type: Object,
        required: true,
    },
    price: {
        type: Number,
        required: true
    },
    is_verified: {
        type: Boolean,
        default: false,
    },
    file_submmitted: {
        type: Boolean,
        default: false,
    },
    profilePhoto: {
        type: String
    },
    backgroundPhoto: {
        type: String
    },
    language: {
        type: String
    },
    certificate: {
        type: String
    },
    role: {
        type: String
    },
    availableTime: [{
        type: Number,
    }],
    bookedTime: [{
        type: Number,
    }],
    is_premium:{
        type:Boolean,
        default : false,
    },
})


const tutors = new mongoose.model("tutors", tutorSchema);


module.exports = tutors;