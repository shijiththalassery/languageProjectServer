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

    timeSlot: [Number],

    bookedTime: [Number],

    availableTime: [Number],

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
        type: String,
        default: 'https://cdn.wallpapersafari.com/62/90/owk8QH.jpg'
    },
    language: {
        type: String
    },
    certificate: {
        type: String
    },
    is_premium: {
        type: Boolean,
        default: false,
    },
    students: [
        {
            email: {
                type: String
            },
            time: {
                type: Number
            },
            origianlTime: {
                type: String
            },
            isActive: {
                type: Boolean,
                default:true,
            },
            Price: {
                type: Number
            },
            purchaseDate:{
                type:String
            },
            endDate:{
                type:String
            },
            Name:{
                type:String
            },
            roomNo:{
                type:String
            }
        }
    ],
    reviews: [
        {
            email: {
                type: String
            },
            name: {
                type: String
            },
            review: {
                type: String
            },
            stars:{
                type:Number
            }
        }
    ],



})


const tutors = new mongoose.model("tutors", tutorSchema);


module.exports = tutors;


