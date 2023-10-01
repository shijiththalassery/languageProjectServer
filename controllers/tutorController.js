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
const shortid = require('shortid')


var razorpay  = new Razorpay({
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


exports.TutorRegistration = async (req, res) => {
    const minutes = 5;
    const millisecondsInOneMinute = 60 * 1000;
    const cacheDuration = minutes * millisecondsInOneMinute;
    const {name,email} = req.body
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
                message:'user is alredy exist'
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

exports.tutorOtpVerification = async (req, res) =>{
    const generateOtp = myCache.data.tmyOtp.v;
    const{name, email, mobile, language, photo, confirmPassword, otp} = req.body;
    if(generateOtp === otp){
        try {
            const result = await cloudinary.uploader.upload(photo, {
                folder: 'tutors', 
              });
            const imageUrl = result.secure_url;
            const hPassword = await securedPassword(confirmPassword);
            const tutorRegister = new tutors({
                name: name,
                email: email,
                phone: mobile,
                password: hPassword,
                photo: imageUrl,
                language:language,
                role:"tutor",
              });
              const storedData = await tutorRegister.save();
              res.status(200).json({
                message: 'ok',
                data: storedData
              });
        } catch (error) {
            console.log(error)
        }
    }else{
        res.json({
            message:'wrong otp'
        })
    }
}

exports.tutorVerification = async (req, res,) => {
    const { startTime, endTime, language, certificate, email } = req.body;
    const availableTime = []
    const stringWithQuotes = email;
    const emailId = stringWithQuotes.replace(/"/g, '');
    try {
        const result = await cloudinary.uploader.upload(certificate);
        const imageUrl = result.secure_url;
        for (let i = startTime; i < endTime; i++) {
            availableTime.push(parseInt(i))
        }
        const updatedData = await tutors.findOneAndUpdate(
            { email: emailId },
            {
                $set: {
                    language: language,
                    certificate: imageUrl,
                    availableTime: availableTime,
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
        req.app.io.emit('connection', message);
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
    console.log(req.params.email)
    const email = req.params.email
    const stringWithQuotes = email;
    const emailId = stringWithQuotes.replace(/"/g, '');
    try {
        const tutorDetail = await tutors.findOne({ email: emailId })
        if (tutorDetail) {
            res.json({
                message: 'success',
                detail: tutorDetail
            })
        }

    } catch (error) {
        console.log(error)
    }
}

exports.tutorPremiumPurchase = async(req, res) =>{
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

