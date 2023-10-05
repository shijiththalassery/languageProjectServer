
const students = require("../models/studentShema");
const tutors = require("../models/tutorSchema")
const lang = require('../models/languageSchema')
const bcrypt = require("bcryptjs");
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const nodemailer = require('nodemailer');



const rejectionMail = async (username, email) => {
    try {
        const templatePath = path.join(__dirname, 'rejectionMail.html');
        const source = fs.readFileSync(templatePath, 'utf-8').toString();
        const template = handlebars.compile(source);
        const replacement = {
            email: email,
            username: username,
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
            subject: 'Rejection Mail from SpeakSphere',
            text: `Your OTP is . Please enter this code to verify your account.`,
            html: htmlToSend
        };

        const result = await transporter.sendMail(emailOptions);
        console.log(result);
    } catch (error) {
        console.log(error.message);
    }
};

const successMail = async (username, email) => {
    try {
        const templatePath = path.join(__dirname, 'success.html');
        const source = fs.readFileSync(templatePath, 'utf-8').toString();
        const template = handlebars.compile(source);
        const replacement = {
            email: email,
            username: username,
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
            subject: 'Success Mail from SpeakSphere',
            text: `Your OTP is . Please enter this code to verify your account.`,
            html: htmlToSend
        };

        const result = await transporter.sendMail(emailOptions);
        console.log(result);
    } catch (error) {
        console.log(error.message);
    }
};


const adminCredential = {
    userName: 'admin@gmail.com',
    password: 1234
}


exports.adminLogin = async (req, res) => {
    const { name, password } = req.body;
    console.log(password, adminCredential.password)
    if (adminCredential.userName == name && adminCredential.password == password) {
        console.log('inside successfull')
        res.status(200).json('success')
    }
    else {
        console.log('inside fail')
        res.status(400).json('email or password is incorrect')
    }
}


exports.tutorList = async (req, res) => {
    try {
        const tutor = await tutors.find();
        res.json(tutor)
    } catch (error) {

    }
}

exports.tutorBlock = async (req, res) => {
    const id = req.params.id;
    try {
        const tutorsData = await tutors.findByIdAndUpdate(req.params.id)
        const updateUser = await tutors.findByIdAndUpdate(
            id,
            {
                $set: {
                    is_blocked: true,
                },
            },
            { new: true }
        );
        if (updateUser) {
            console.log(tutorsData,'before update', updateUser,'after update')
            res.json({
                message: 'tutor blocked successfully'
            })
        } else {
            res.json({
                message: 'failed'
            })
        }
    } catch (error) {
        console.log(error)
    }
}

exports.tutorUnBlock = async (req, res) => {
    const id = req.params.id;
    try {
        try {
            const tutorsData = await tutors.findByIdAndUpdate(req.params.id)
            const updateUser = await tutors.findByIdAndUpdate(
                id,
                {
                    $set: {
                        is_blocked: false,
                    },
                },
                { new: true }
            );
            if (updateUser) {
                console.log(tutorsData,'before update', updateUser,'after update')
                res.json({
                    message: 'tutor unblocked successfully'
                })
            } else {
                res.json({
                    message: 'failed'
                })
            }
        } catch (error) {
            console.log(error)
        }
    } catch (error) {
        console.log(erro)
    }
}

exports.studentList = async (req, res) => {
    try {
        const studentList = await students.find();
        res.json(studentList)
    } catch (error) {
        console.log(error)
    }

}

exports.studentBlock = async (req, res) => {

    const id = req.params.id;
    try {
        const student = await students.findByIdAndUpdate(req.params.id)
        console.log(student, 'this is test usesr for entering detail')
        const updateUser = await students.findByIdAndUpdate(
            id,
            {
                $set: {
                    is_blocked: true,
                },
            },
            { new: true }
        );
        if (updateUser) {
            console.log(updateUser)
            res.json({
                message: 'student blocked successfully'
            })
        } else {
            res.json({
                message: 'failed'
            })
        }
    } catch (error) {
        console.log(error)
    }
}

exports.studentUnblock = async (req, res) => {

    const id = req.params.id;
    try {
        const updateUser = await students.findByIdAndUpdate(
            id,
            {
                $set: {
                    is_blocked: false,
                },
            },
            { new: true }
        );
        if (updateUser) {
            res.json({
                message: 'student unblocked successfully'
            })
        } else {
            res.json({
                message: 'failed'
            })
        }
    } catch (error) {
        console.log(error)
    }
}

exports.addLanguage = async (req, res) => {

    try {
        const { language } = req.body;
        const languages = language.trim().toLowerCase();
        const existLanguage = await lang.findOne({ language: languages });
        if (existLanguage) {
            res.json({ message: 'language is already exist' });
            return;
        } else {

            const languageRegister = new lang({
                language: languages,
            })
            const storedData = await languageRegister.save();
            res.json({
                message: 'language added successfully',
                soredData: storedData
            });
            return;
        }
    } catch (error) {
        console.log(error)
    }
}

exports.verificationList = async (req, res) => {

    try {
        const unverifiedTutors = await tutors.find({
            is_verified: false,
            file_submmitted: true,
        });
        res.json({
            data: unverifiedTutors
        })
    } catch (error) {
        console.log(error)
    }
}

exports.certificateApprove = async (req, res) => {
    const stringId = req.params.id;
    const tutorId = new mongoose.Types.ObjectId(stringId);
    let language
    try {
        const userData = await tutors.findById(tutorId)
        if (userData) {
            console.log(userData.language, 'this is user data')
            language = userData.language
        }

        const updatedLanguage = await lang.findOneAndUpdate(
            { language: language },
            { $push: { tutor: tutorId } },
            { new: true }
        );

        const verifiedCertificate = await tutors.findByIdAndUpdate(tutorId,
            { is_verified: true },
            { new: true }
        )
        const email = verifiedCertificate.email;
        const name = verifiedCertificate.name


        console.log(updatedLanguage, 'this is updated language model');


        if (verifiedCertificate && updatedLanguage) {
            successMail(name, email)
            res.json({
                message: 'success'
            })
        } else {
            res.json({
                message: 'error'
            })
        }
    } catch (error) {
        console.log(error)
    }

}
exports.certificateReject = async (req, res) => {
    const recievedId = req.params.id
    try {
        const tutorId = new mongoose.Types.ObjectId(recievedId);
        const tutor = await tutors.findById(tutorId)
        if (tutor) {
            const userName = tutor.name;
            const email = tutor.email;
            rejectionMail(userName, email);
            res.json({
                message: 'rejection mail send to user'
            })
        }
        else {
            res.json({
                message: 'no such tutor'
            })
        }

    } catch (error) {

    }
}