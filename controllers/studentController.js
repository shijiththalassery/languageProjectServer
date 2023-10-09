const students = require("../models/studentShema");
const tutors = require("../models/tutorSchema")
const bcrypt = require("bcryptjs");
const Razorpay = require('razorpay');
const shortid = require('shortid');
const mongoose = require('mongoose');

//hash password using bcrypt
const securedPassword = async (password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        return hashedPassword;
    } catch (error) {
        console.log(error.message)
    }
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
    const id = req.params.id;
    let amount;
    try {
        const tutorDetail = await tutors.findById(id);
        if (tutorDetail) {
            amount = tutorDetail.price;
        }
    } catch (error) {
        console.log(error)
    }
    const payment_capture = 1

    const currency = 'INR'

    const options = {
        amount: amount * 100,
        currency,
        receipt: shortid.generate(),
        payment_capture
    }

    try {
        const response = await razorpay.orders.create(options);
        console.log('this is the line')
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


exports.buyCourse = async (req, res) => {

    const { userSelectedTime, tutorId, userId } = req.body;
    console.log(userSelectedTime, tutorId, userId,'this is back end data')
    const objectId = new mongoose.Types.ObjectId(tutorId);
    console.log(objectId)
    try {
        const studentData = await students.findOne({email:userId})
        studentData.tutor = objectId;
        studentData.selectedTime = userSelectedTime ;
        await studentData.save();
            if (studentData.isModified()) {
                res.json({
                    message: 'ok data saved timeslot',
                    studentData
                });
                return;
            } else {
                res.json({
                    message: 'No changes were made to timeslot',
                    studentData
                });
                return;
            }

        console.log(studentData)
        const tutor = await tutors.findById(objectId);
        console.log(tutor)
        // if (tutor) {
        //     for (const day in userSelectedTime) {
        //         const time = userSelectedTime[day];
        //         if (tutor.timeSlot[day]) {
        //             tutor.timeSlot[day] = tutor.timeSlot[day].filter((t) => t !== time);
        //         }
        //         if (tutor.bookedTime[day]) {
        //             // Day exists in bookedTime, push the time to the array
        //             tutor.bookedTime[day].push(time);
        //           } else {
        //             // Day doesn't exist in bookedTime, create a new array with the time
        //             tutor.bookedTime[day] = [time];
        //           }
        //     }
    
        //     await tutor.save();
            
        //     if (tutor.isModified()) {
        //         res.json({
        //             message: 'ok data saved timeslot',
        //             tutor
        //         });
        //     } else {
        //         res.json({
        //             message: 'No changes were made to timeslot',
        //             tutor
        //         });
        //     }
        // }else{
        //     res.json({
        //         message:'error in mongoDb'
        //     })
        //     return;
        // }
    } catch (error) {
        console.log(error)
        res.json({
            message:'server error'
        })
        return;
    }
}

exports.googleAuthCheckStudent = async (req, res) => {
    console.log('inside google auth tutor entry')
    console.log(req.body)
    const {email } = req.body;
    try {
        const tutorData = await students.findOne({ email: email });
        if(tutorData){
            console.log(tutorData,'this is tutor data')
            if (tutorData.is_blocked == true) {
                res.json({ message: 'error' });
                return;
              }else{
                  res.json({
                      message:"success"
                  })
                  return;
              }
        }else{
            res.json({
                message:'notFound'
            })
        }
    } catch (error) {
        console.log(error);
        req.json({
            message:'serverError'
        })
    }
}

exports.studentLogin = async (req, res) => {
    const {email, password} = req.body;
    try {
        const studentData = await students.findOne({ email: email });
        if (studentData.is_blocked == true) {
          res.json({ error: 'error' });
          return;
        }
        const passwordMatch = await bcrypt.compare(password, studentData.password);
        if (passwordMatch) {
          console.log('student password matching');
          res.json({
            success: true,
            tutorDetail: studentData,
            role: 'tutor'
          });
          return;
        }else{
            res.json({
                message:false
            })
            return;
        }
    } catch (error) {
        console.log(error);
        res.json({
            message:'server error'
        })
    }
}

exports.studentDetail = async(req, res) => {
    console.log(req.params.email,'this api is from student detail   ');
    const email = req.params.email
    const emails = JSON.parse(email)
    try {
        const studentDetail = await students.findOne({email:emails});
        if(studentDetail){
            const tutorEmail = await tutors.findById(studentDetail.tutor)
            if(tutorEmail){
                res.json({
                    message:studentDetail,
                    education:tutorEmail
                })
                return;
            }
            res.json({
                message:studentDetail
            })
            return;
        }else{
            res.json({
                message:'no such student'
            })
        }
    } catch (error) {
        console.log(error);
        res.json({
            message:'servererror'
        })
    }
}


exports.studentProfileEdit = async(req, res) => {

    console.log(req.body)
    res.json({
        message:'ok'
    })
}