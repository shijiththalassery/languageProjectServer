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

    bookeyTime: [Number],

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
            }
        }
    ],
    student: [
        {
            email: {
                type: String
            },
            time: {
                type: Number
            },
            isActive: {
                type: Boolean
            },
            Price: {
                type: Number
            },
        }
    ],

})


const tutors = new mongoose.model("tutors", tutorSchema);


module.exports = tutors;


await User.findByIdAndUpdate(
    userId,
    {
        $push: {
            cart: {
                product: product._id,
                quantity: 1
            }
        }
    },
    { new: true }
)