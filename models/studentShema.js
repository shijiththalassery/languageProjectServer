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
    profilePhoto: {
        type: String,
        default:"https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-538.jpg"
    },
    backgroundPhoto: {
        type: String,
        default:"https://wallpaper.dog/large/5492398.jpg"
    },
    role: {
        type: String,
        default:'student'
    },
    course: [
        {
            tutorId:{
                type:mongoose.Schema.Types.ObjectId
            },
            selectedTime:{
                type:Number
            },
            origianlTime: {
                type: String
            },
            language:{
                type:String
            },
            isActive:{
                type:Boolean,
                default:true
            },
            purchaseDate:{
                type:String
            },
            endDate:{
                type:String
            },
            roomNo:{
                type:String
            }
        }
  ],

})

const students = new mongoose.model('students', studentSchema)

module.exports = students;

