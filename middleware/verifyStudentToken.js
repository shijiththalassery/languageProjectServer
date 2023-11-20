const jwt = require("jsonwebtoken");
require("dotenv").config();

const Student_Secret_key = process.env.STUDENT_SECRET_KEY;
const Student = require('../models/studentShema')

const studentVerification = async (req, res, next) => {
  console.log('inside middle ware student verification')
  try {
    
    const authorizationHeader = req.headers.authorization;

    const token = authorizationHeader.split(" ")[1];

      if (token === "undefined") {
      return res.status(401).json({ message: "Authentication failed shijith" });

    } else {
      console.log('token decode in lese')
      const decodedToken =  jwt.verify(token, process.env.Student_Secret_key );

      req.studentId = decodedToken._id;
      next();
    }
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};

// const tutorBlock = async (req, res, next) => {
//   let tutorId = localStorage.getItem("vendorId");
//   const tutorData = await Tutors.findById(vendorId);
//   if (tutorData.is_blocked === true) {
//     return res.json({ message: "User is Blocked" });
//   } else {
//     console.log("Hi unblocked user");
//     next();
//   }
// };

module.exports = { studentVerification,};
