const students = require("../models/studentShema");
const tutors = require("../models/tutorSchema")
const bcrypt = require("bcryptjs");
const cloudinary = require('../config/cloudinary');
const app = require('../app')
const lang = require('../models/languageSchema')
const mongoose = require('mongoose');
const NodeCache = require('node-cache');
const myCache = new NodeCache();
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const nodemailer = require('nodemailer');
const Razorpay = require('razorpay');
const shortid = require('shortid');
const generateToken = require('../util/generateToken')
const jwt = require('jsonwebtoken');
require("dotenv").config();



var razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
});



const sendOtpMail = async (username, email, otp) => {
    try {
        const templatePath = path.join(__dirname, 'otp.html');
        const source = fs.readFileSync(templatePath, 'utf-8').toString();
        const template = handlebars.compile(source);
        const replacement = {
            email: email,
            username: username,
            otp: otp,
        };
        const htmlToSend = template(replacement);
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.NODE_MAILER_ID,
                pass: process.env.NODE_MAILER_KEY
            }
        });

        const emailOptions = {
            from: process.env.MY_EMAIL,
            to: email,
            subject: 'Your OTP for user verification',
            text: `Your OTP is ${otp}. Please enter this code to verify your account.`,
            html: htmlToSend
        };

        const result = await transporter.sendMail(emailOptions);
        console.log(result);
    } catch (error) {
        console.log(error.message);
    }
};

const securedPassword = async (password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        return hashedPassword;
    } catch (error) {
        console.log(error.message)
    }
}

const createTimeSlote = (startTime, endTime) => {
    const timeSlote = []
    if (startTime.includes('am') && endTime.includes('pm')) {
        if (parseInt(endTime) !== 12) {

            end = 12 + parseInt(endTime)
            start = parseInt(startTime)
            for (let i = start; i < end; i++) {
                timeSlote.push(i)
            }
            return timeSlote;

        } else {
            //end time is 12 pm
            end = 12;
            start = parseInt(startTime)
            for (let i = start; i < end; i++) {
                timeSlote.push(i)
            }
            return timeSlote;
        }
    }
    else if (startTime.includes('am') && endTime.includes('am')) {

        if (parseInt(endTime) !== 12) {
            end = parseInt(endTime)
            start = parseInt(startTime)
            for (let i = start; i < end; i++) {
                timeSlote.push(i)
            }
            return timeSlote;
        } else {
            end = 24
            start = parseInt(startTime)
            for (let i = start; i < end; i++) {
                timeSlote.push(i)
            }
            return timeSlote;
        }

    }
    else if (startTime.includes('pm') && endTime.includes('pm')) {

        if (parseInt(startTime) !== 12) {

            start = 12 + parseInt(startTime)
            end = 12 + parseInt(endTime)
            for (let i = start; i < end; i++) {
                timeSlote.push(i)
            }
            return timeSlote;

        } else {
            start = 12;
            end = 12 + parseInt(endTime)
            for (let i = start; i < end; i++) {
                timeSlote.push(i)
            }
            return timeSlote;
        }
    }

}

exports.tutorLogin = async (req, res) => {
    console.log('inside tutor login')
    const { email, password } = req.body;
    console.log(email)
    try {
        const tutorData = await tutors.findOne({ email: email });
        if (tutorData) {
            if (tutorData.is_blocked == true) {
                res.json({ error: 'error' });
                return;
            } else {
                const passwordMatch = await bcrypt.compare(password, tutorData.password);
                if (passwordMatch) {
                    const token = jwt.sign(
                        {
                            _id: tutorData._id, // Include the MongoDB document ID
                        },
                        process.env.JWT_SECRET,
                        {
                            expiresIn: "12h", // Set an expiration time for the token
                        }
                    );
                    res.json({
                        success: true,
                        tutorDetail: tutorData,
                        token: token
                    });
                    return;
                } else {
                    res.json({
                        message: 'email or password is not matching'
                    })
                }
            }
        } else {
            res.json({
                message: 'there no such data'
            })
        }

    } catch (error) {
        console.log(error);
        res.json({
            message: 'serverError'
        })
    }
}

exports.TutorRegistration = async (req, res) => {
    const minutes = 5;
    const millisecondsInOneMinute = 60 * 1000;
    const cacheDuration = minutes * millisecondsInOneMinute;
    const { name, email } = req.body
    const tutorData = req.body;
    const key = "data";
    const value = tutorData;
    const tutorDetails = myCache.set(key, value, cacheDuration);



    const tOtpNumber = Math.floor(100000 + Math.random() * 900000).toString();
    const otp = "tmyOtp";
    const number = tOtpNumber;
    const otpDetail = myCache.set(otp, number, 90000);


    try {
        const tutorData = await tutors.findOne({ email: req.body.email })
        if (tutorData) {
            res.json({
                message: 'user is alredy exist'
            })
            return;
        } else {
            sendOtpMail(name, email, tOtpNumber);
            res.json({ message: "success" });
            return;
        }
        console.log("haiiii")
    }
    catch (error) {
        console.log(error)
    }
}

exports.tutorOtpVerification = async (req, res) => {
    console.log('entering tutor registration')
    const generateOtp = myCache.data.tmyOtp.v;
    console.log(generateOtp, 'this is otp of the tutor')
    console.log(req.body)

    const {
        name,
        email,
        mobile,
        language,
        profilePhoto,
        password,
        confirmPassword,
        price,
        startingTime,
        endingTime,
        otp
    } = req.body
    const timeSlot = createTimeSlote(startingTime, endingTime)
    if (generateOtp === otp) {
        try {
            const result = await cloudinary.uploader.upload(profilePhoto, {
                folder: 'tutors',
            });
            const imageUrl = result.secure_url;
            const hPassword = await securedPassword(confirmPassword);
            const tutorRegister = new tutors({
                name: name,
                email: email,
                phone: mobile,
                password: hPassword,
                language: language,
                timeSlot: timeSlot,
                price: price,
                profilePhoto: imageUrl,
            });
            const storedData = await tutorRegister.save();
            res.status(200).json({
                message: 'ok',
                data: storedData
            });
        } catch (error) {
            console.log(error)
            res.json({
                message: 'failed'
            })
        }
    } else {
        res.json({
            message: 'wrong otp'
        })
    }
}

exports.tutorVerification = async (req, res,) => {
    const { email } = req.body;
    const availableTime = []
    const stringWithQuotes = email;
    const emailId = stringWithQuotes.replace(/"/g, '');
    try {
        const updatedData = await tutors.findOneAndUpdate(
            { email: emailId },
            {
                $set: {
                    file_submmitted: true,
                },
            },
            {
                new: true,
            }
        );
        if (updatedData) {
            console.log('Updated document:', updatedData);
        } else {
            console.error('Document not found');
        }
        let message = 'user send a certificate'
        req.app.io.emit('profile:verificatioin', message);
    } catch (error) {
        console.log(error)
    }

}

exports.languageList = async (req, res) => {
    console.log('langugae list is working')
    try {
        const languageList = await lang.find().select('language');
        res.json({
            language: languageList
        })
        return;
    } catch (error) {
        console.log(error)
        res.json({
            message: 'unknown error'
        })
        return;
    }
}
exports.tutorDetail = async (req, res) => {

    const email = req.params.email;
    const stringWithQuotes = email;
    const emailId = stringWithQuotes.replace(/"/g, '');
    console.log(email, 'thsi is the email of the tutor')
    try {
        const tutorDetail = await tutors.findOne({ email: email })
        if (tutorDetail) {

            res.json({
                message: 'success',
                detail: tutorDetail
            })
        } else {
            res.json({
                message: 'no such tutor'
            })
        }

    } catch (error) {
        console.log(error)
    }
}



exports.tutorPremiumPurchase = async (req, res) => {

    console.log('inside premium purchase')
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
        return;
    } catch (error) {
        console.log(error)
    }
}


exports.tutorProfileEdit = async (req, res) => {
    console.log('tutor edit ')
    const {
        name,
        email,
        phone,
        password,
        confPassword,
        profilePhoto,
        backgroundPhoto } = req.body;
    console.log(req.body, 'this is the body of the ')
    console.log(profilePhoto, backgroundPhoto, 'these are the user edit data from edit profile')
    const hPassword = await securedPassword(password);
    try {
        const profile = await cloudinary.uploader.upload(profilePhoto, {
            folder: 'tutorProfilePhoto',
        });
        const profileUrl = profile.secure_url;

        const background = await cloudinary.uploader.upload(backgroundPhoto, {
            folder: 'tutorProfilePhoto',
        });
        const backgroundUrl = background.secure_url;

        const updateUser = await tutors.findOneAndUpdate(
            { email: email }, // The query to find the document
            {
                $set: {
                    name: name, // Replace newName with the new name value
                    email: email, // Replace newEmail with the new email value
                    phone: phone,
                    password: hPassword,
                    profilePhoto: profileUrl,// Replace newPhone with the new phone value
                    backgroundPhoto: backgroundUrl
                },
            },
            { new: true } // To return the updated document (optional)
        );
        if (updateUser) {
            res.json({
                message: 'ok'
            })
        } else {
            res.json({
                message: 'failed'
            })
        }
    } catch (error) {
        console.log(error);
        res.json({
            message: 'server error'
        })
    }
}

exports.tutorPremuimSetUp = async (req, res) => {
    console.log('entering tutorPremuimSetUp')
    const { email } = req.body;
    console.log(email)
    try {
        const data = await tutors.findOne({ email: email });
        console.log(data.name, data.email, 'these are the data from api')
        const updateUser = await tutors.findOneAndUpdate(
            { email: email },
            {
                $set: {
                    is_premium: true,
                },
            },
            { new: true }
        );
        if (updateUser) {
            console.log(updateUser.is_premium, 'this is the updated user')
            res.json({
                message: 'ok',
            })
        } else {
            res.json({
                message: 'fail'
            })
        }
    } catch (error) {
        console.log(error)
    }

}


exports.googleAuthCheckTutuor = async (req, res) => {
    console.log('inside google auth tutor entry')
    console.log(req.body)
    const { email } = req.body;
    try {
        const tutorData = await tutors.findOne({ email: email });
        if (tutorData) {
            console.log(tutorData, 'this is tutor data')
            if (tutorData.is_blocked == true) {
                res.json({ message: 'error' });
                return;
            } else {
                res.json({
                    message: "success"
                })
                return;
            }
        } else {
            res.json({
                message: 'notFound'
            })
        }
    } catch (error) {
        console.log(error);
        req.json({
            message: 'serverError'
        })
    }
}

exports.studentList = async (req, res) => {

    const email = req.params.email;
    try {
        const tutorDetail = await tutors.findOne({ email: email })
        if (tutorDetail) {
            res.json(tutorDetail)
        }
        else {
            res.json("mongoError")
        }
    } catch (error) {
        console.log(error);
        res.json('serverError');
        return
    }

}

exports.submitQuestion = async (req, res) => {
    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleString('default', { month: 'long' });
    const year = today.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    const { question } = req.body;
    const tutorId = req.tutorId;
    console.log(tutorId, question, formattedDate)

    res.json('okey')
}