const students = require("../models/studentShema");
const tutors = require("../models/tutorSchema");
const languages = require('../models/languageSchema')
const nodemailer = require('nodemailer');
const NodeCache = require("node-cache");
const bcrypt = require("bcryptjs");
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const myCache = new NodeCache();
const cloudinary = require('../config/cloudinary');


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

exports.checkUser = async (req, res) => {
  console.log('inside check user')
  const otpNumber = Math.floor(100000 + Math.random() * 900000).toString();
  const key = "myOtp";
  const value = otpNumber;
  const otpDetail = myCache.set(key, value, 90000);
  const { email, username } = req.body;
  try {
    const preStudent = await students.findOne({ email: email });
    if (preStudent) {
      console.log('inside student is alredy exist block')
      res.json({ message: "error" });
    } else {
      sendOtpMail(username, email, otpNumber);
      res.json({ message: "success" });
      console.log('email is send to the currespond email address')
    }
    setTimeout(() => {
      console.log(myCache.data.myOtp.v)
      myCache.data.myOtp.v = null
    }, 100000);
  }
  catch (error) {
    console.log(error)
  }
}

exports.userRegistration = async (req, res) => {
  
  const generateOtp = myCache.data.myOtp.v;
  
  const { username, mobileNumber, email, confrimPassword, photo, otp } = req.body;  
  const str = mobileNumber;
  const number = parseInt(str, 10);
  console.log(generateOtp,'is generated otp ',otp,'is user typed otp')
  try {
    const result = await cloudinary.uploader.upload(photo, {
      folder: 'students', 
    });
    const imageUrl = result.secure_url;
    if (generateOtp == otp) {
      const hPassword = await securedPassword(confrimPassword);
      const studentRegister = new students({
        name: username,
        email: email,
        phone: number,
        password: hPassword,
        photo: imageUrl,
        role:"student",
      });
      const storedData = await studentRegister.save();
      res.status(200).json({
        message: 'ok',
        data: storedData
      });
    }
    else {
      console.log('data not saved')
      res.json({ message: 'error' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


exports.userLogin = async (req, res) => {
  try {
    const { userMail, userPassword, role } = req.body;
    console.log(req.body, 'this is req.body');

    if (role == 'student') {
      console.log('entering student if block');
      const studentData = await students.findOne({ email: userMail });
      if (studentData.is_blocked == true) {
        res.json({ error: 'You are blocked. Please contact admin' });
      }
      const passwordMatch = await bcrypt.compare(userPassword, studentData.password);
      if (passwordMatch) {
        console.log('student password matching');
        res.json({
          success: true,
          tutorDetail: studentData,
          role: 'student'
        });
      } else {
        res.json({ error: 'Incorrect email ID or password for student' });
      }
    } else {
      console.log('entering tutor if block');
      const tutorData = await tutors.findOne({ email: userMail });
      if (tutorData.is_blocked == true) {
        res.json({ error: 'You are blocked. Please contact admin' });
      }
      const passwordMatch = await bcrypt.compare(userPassword, tutorData.password);
      if (passwordMatch) {
        console.log('student password matching');
        res.json({
          success: true,
          tutorDetail: tutorData,
          role: 'tutor'
        });
        return;
      } else {
        console.log('inside tutor wrond password')
        res.json({ error: 'Incorrect email ID or password for tutor' });
        return;
      }
    }
  } catch (error) {
    console.log(error);
  }
};




