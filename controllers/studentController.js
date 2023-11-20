const students = require("../models/studentShema");
const tutors = require("../models/tutorSchema")
const bcrypt = require("bcryptjs");
const Razorpay = require('razorpay');
const shortid = require('shortid');
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require("dotenv").config();



//hash password using bcrypt
const securedPassword = async (password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        return hashedPassword;
    } catch (error) {
        console.log(error.message)
    }
}

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}


var razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
});

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

    let tutorList = {}

    console.log(req.query, 'thsi is the quwery from front end');

    const { langTypes, sortTypes, search } = req.query;

    let query = {
        is_verified: true,
        is_blocked: false
    }

    if (search) {
        // query.name = search;
        //    query.name = search;
        //   query.name = { $regex: new RegExp(search, "i") };
        query.name = { $regex: new RegExp(`.*${search}.*`, "i") };
    }

    if (langTypes) {
        console.log(langTypes,'this is language type')
        query.language = langTypes;
        
    }

    if (sortTypes) {
        console.log(sortTypes,'this is sort tyep')
        let sortDirection = 1; // Default to ascending

        if (sortTypes === "Descending") {
          sortDirection = -1;
        }
  
        tutorList = await tutors.find(query).sort({ price: sortDirection })
        res.json(tutorList)
    } else {
        tutorList = await tutors.find(query)
        res.json(tutorList)
    }


}


exports.tutorDetail = async (req, res) => {
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

// exports.coursePurchase = async (req, res) => {
//     const id = req.params.id;
//     let amount;
//     try {
//         const tutorDetail = await tutors.findById(id);
//         if (tutorDetail) {
//             amount = tutorDetail.price;
//         }
//     } catch (error) {
//         console.log(error)
//     }
//     const payment_capture = 1

//     const currency = 'INR'

//     const options = {
//         amount: amount * 100,
//         currency,
//         receipt: shortid.generate(),
//         payment_capture
//     }

//     try {
//         const response = await razorpay.orders.create(options);
//         console.log('this is the line')
//         console.log(response)
//         res.json({
//             id: response.id,
//             currency: response.currency,
//             amount: response.amount
//         })
//     } catch (error) {
//         console.log(error)
//     }
// }


exports.buyCourse = async (req, res) => {
    const {
        studentSelectedTime,
        tutorId,
        language,
        studentEmail,
        price,
        stringTime
    } = req.body;

    const roomNo = generateRandomString(10);
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().slice(0, 10);
    const originalDate = new Date(formattedDate);
    const newDate = new Date(originalDate);
    newDate.setDate(originalDate.getDate() + 30);
    const formattedNewDate = newDate.toISOString().slice(0, 10);

    try {

        const updatedStudent = await students.findOneAndUpdate(
            { email: studentEmail },
            {
                $push: {
                    course: {
                        tutorId: tutorId,
                        selectedTime: studentSelectedTime,
                        language: language,
                        purchaseDate: formattedDate,
                        endDate: formattedNewDate,
                        origianlTime: stringTime,
                        roomNo: roomNo
                    }
                }
            },
            { new: true }
        );

        let updatedTutor = await tutors.findByIdAndUpdate(
            tutorId,
            {
                $push: {
                    students: {
                        email: studentEmail,
                        time: parseInt(studentSelectedTime),
                        Price: price,
                        purchaseDate: formattedDate,
                        endDate: formattedNewDate,
                        Name: updatedStudent.name,
                        origianlTime: stringTime,
                        roomNo: roomNo
                    },
                },
                $pull: {
                    availableTime: studentSelectedTime
                },
            },

        );

        updatedTutor = await tutors.findByIdAndUpdate(
            tutorId, {
            $push: {
                bookedTime: studentSelectedTime
            }
        },
            { new: true }
        );

        if (updatedStudent && updatedTutor) {
            res.json({
                message: 'success',
            })
        } else {
            res.json({
                message: 'mongoError'
            })
        }

    } catch (error) {
        console.log(error)
        res.json({
            message: 'serverError'
        })
        return;
    }
}

exports.googleAuthCheckStudent = async (req, res) => {
    console.log('inside google auth tutor entry')
    console.log(req.body)
    const { email } = req.body;
    try {
        const tutorData = await students.findOne({ email: email });
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

exports.studentLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const studentData = await students.findOne({ email: email });
        console.log(studentData, 'this is the student dadta')
        if (studentData.is_blocked == true) {
            res.json({ error: 'error' });
            return;
        }
        const passwordMatch = await bcrypt.compare(password, studentData.password);
        if (passwordMatch) {
            console.log('student password matching');
            const token = jwt.sign(
                {
                    _id: studentData._id, // Include the MongoDB document ID
                },
                process.env.STUDENT_SECRET_KEY,
                {
                    expiresIn: "12h", // Set an expiration time for the token
                }
            );
            res.json({
                success: true,
                tutorDetail: studentData,
                role: 'tutor',
                studentToken: token
            });
            return;
        } else {
            res.json({
                message: false
            })
            return;
        }
    } catch (error) {
        console.log(error);
        res.json({
            message: 'server error'
        })
    }
}

exports.studentDetail = async (req, res) => {

    console.log('inside for navbar');
    console.log(req.params.email, 'this is student my email')
    const email = req.params.email
    const emails = JSON.parse(email)
    try {
        const studentDetail = await students.findOne({ email: emails });
        if (studentDetail) {
            const tutorEmail = await tutors.findById(studentDetail.tutor)
            if (tutorEmail) {
                res.json({
                    message: studentDetail,
                    education: tutorEmail
                })
                return;
            }
            res.json({
                message: studentDetail
            })
            return;
        } else {
            res.json({
                message: 'no such student'
            })
        }
    } catch (error) {
        console.log(error);
        res.json({
            message: 'servererror'
        })
    }
}


exports.studentProfileEdit = async (req, res) => {
    const {
        existEmail,
        name,
        email,
        number,
        profilePhoto,
        backgroundPhoto } = req.body;
    console.log(existEmail, 'this is the email of the student')
    const emailId = existEmail.replace(/"/g, '');

    try {
        const profile = await cloudinary.uploader.upload(profilePhoto, {
            folder: 'studentProfilePhoto',
        });
        const profileUrl = profile.secure_url;

        const background = await cloudinary.uploader.upload(backgroundPhoto, {
            folder: 'studentBgPhoto',
        });
        const backgroundUrl = background.secure_url;

        const updateUser = await students.findOneAndUpdate(
            { email: emailId }, // The query to find the document
            {
                $set: {
                    name: name, // Replace newName with the new name value
                    email: email, // Replace newEmail with the new email value
                    phone: number,
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
            return;
        } else {
            res.json({
                message: 'failed'
            })
            return;
        }
    } catch (error) {
        console.log(error);
        res.json({
            message: 'server error'
        })
        return;
    }
}

exports.listOfTutor = async (req, res) => {
    const email = req.params.email;
    try {
        const user = await students.find({ email: email })
        if (user) {
            const tutorId = user[0].tutor;
            const tutorList = await tutors.findById(tutorId)
            console.log(tutorList, 'this is tutor list form sreya shijith')
            if (tutorList) {
                res.json({
                    message: tutorList
                })
                return;
            } else {
                res.json({
                    message: 'no tutor for this student'
                })
                return
            }
        } else {
            res.json({
                message: 'no such user'
            })
            return;
        }
    } catch (error) {
        console.log(error);
        res.json({
            message: 'serverError',
            error: error
        })
        return;
    }
}

exports.reviewPost = async (req, res) => {


    console.log(req.body, 'this body')
    const {
        email,
        tutorId,
        review,
        star
    } = req.body
    const objectId = new ObjectId(tutorId);
    // console.log(objectId,'thsi is converted object id');
    // console.log(tutorId,'thsi is id from bodoy')

    try {
        const reviwer = await students.findOne({ email: email })
        console.log(reviwer, 'this is reviewr')
        const user = await tutors.findOne({ 'reviews.email': email }).exec();
        console.log(user, 'this is user')
        if (user) {
            res.json({
                message: 'done it'
            })
        } else {
            const review = {
                email: req.body.email,
                name: reviwer.name,
                review: req.body.review,
                stars: req.body.star
            }
            console.log(review, 'this is review object');
            const tutorShijth = await tutors.findById(tutorId)
            console.log(tutorShijth, 'this is tutor')
            const tutorReviewUpdate = await tutors.findOneAndUpdate(
                { _id: objectId },
                {
                    $push: { reviews: review },
                },
                { new: true },
            );
            console.log(tutorReviewUpdate, 'this is updated user')
            res.json({
                message: 'success'
            })
        }
    } catch (error) {
        console.log(error)
        res.json({
            message: 'serverError'
        })
    }
}

exports.myTutorList = async (req, res) => {

    const email = req.params.email;
    try {
        const studentData = await students.findOne({ email: email })
        if (studentData) {
            res.json(studentData);
            return
        } else {
            res.json('mongoError')
        }
    } catch (error) {
        console.log(error);
        res.json(serverError);
        return;
    }
}

exports.myAssignment = async (req, res) => {

    const { room, email } = req.body;

    try {
        const student = await students.findOne(
            {
                _id: req.studentId,
                'course.roomNo': room,
            },
            {
                'course.$': 1,
            }
        );

        if (student) {

            const tutorId = student.course[0].tutorId;

            const assignments = await students.find(
                {
                    _id: req.studentId,
                    'assignment.tutorId': tutorId,
                }
            );

            if (assignments && assignments.length > 0) {
                console.log(558,assignments)
                const assignment = assignments[0].assignment;
                console.log(560,assignment)
                res.json(assignment)
                return;

            } else {

                console.log('No assignment found.');
                res.json("No assignment found.")
                return;
            }

        } else {

            res.json('there is no tutor id or assignment');
            return;
        }
    } catch (error) {
        console.log(error);
        res.json("serverError")
        return;
    }

}

exports.submitAssignemnt = async( req, res) => {

    console.log('inside submit')
    console.log(req.body)

  const {data, room,  assignmentId} = req.body;
  try {
    const student = await students.findOne(
        {
            _id: req.studentId,
            'course.roomNo': room,
        },
        {
            'course.$': 1,
        }
    );
    if (student) {
        const tutorId = student.course[0].tutorId;
        const updatedStudent = await students.findOneAndUpdate(
            {
              _id: req.studentId,
              'assignment._id': assignmentId,
            },
            {
              $set: {
                'assignment.$.answer': data,
                'assignment.$.submit': true, 
              },
            },
            { new: true }
          );
          if (!updatedStudent) {
            console.log("Student or assignment not found");
            res.json('Student or assignment not found')
            return
          }else{
            res.json('assignment successfully updated')
          }

    }else{
        res.json('there is no tutor for you')
        return;
    }
    
  } catch (error) {
    console.log(error);
    res.json('serverError')
  }
    // res.json('okey shijit')
}