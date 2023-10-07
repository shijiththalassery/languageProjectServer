const students = require("../models/studentShema");
const tutors = require("../models/tutorSchema")
const bcrypt = require("bcryptjs");

//hash password using bcrypt
const securedPassword = async (password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        return hashedPassword;
    } catch (error) {
        console.log(error.message)
    }
}


exports.studentRegister = async (req, res) => {

    console.log(req.body)
    const { username, mobileNumber, email, password } = req.body;
    if (!username || !email || !mobileNumber || !password) {
        res.status(400).json({ error: "please Enter All Input Data" })
    }

    try {
        const preStudent = await students.findOne({ email: email })
        if (preStudent) {
            res.status(400).json({ error: "Student is alredy exist" })
            CloseEvent.log('inside user is alredy exist')
        } else {
            const hPassword = await securedPassword(password)
            const studentRegister = new students({
                name: username,
                email: email,
                phone: mobileNumber,
                password: hPassword
            });
            const storedData = await studentRegister.save();
            res.status(200).json(storedData)
        }
    } catch (error) {
        res.status(400).json({ error: "Invalid Details", error })
    }
}

exports.tutorList = async (req, res) => {
    try {
        const tutorList = await tutors.find({ is_blocked: false });
        if (tutorList) {
            res.json(tutorList)
        } else {
            res.json({
                message: 'there is no tutor'
            })
        }
    } catch (error) {
        console.log(error);
        res.json({
            message: 'server error',
        })
    }
}

exports.tutorDetail = async (req, res) => {
    console.log("this is single tutor id ")
    const id = req.params.id;
    try {
        const tutorDetail = await tutors.findById(id)
        if (tutorDetail) {
            res.json({
                tutorDetail
            })
        } else {
            res.json({
                message: 'tutor is not found'
            })
        }
    } catch (error) {
        console.log(error);
        res.json({
            message: "server error"
        })
    }
}

exports.coursePurchase = async (req, res) => {
    const payment_capture = 1
    const amount = 990
    const currency = 'INR'

    const options = {
        amount: amount * 100,
        currency,
        receipt: shortid.generate(),
        payment_capture
    }

    try {
        const response = await razorpay.orders.create(options)
        console.log(response)
        res.json({
            id: response.id,
            currency: response.currency,
            amount: response.amount
        })
    } catch (error) {
        console.log(error)
    }
}