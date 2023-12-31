const jwt = require("jsonwebtoken");
require("dotenv").config();

const Tutor_Secret_key = process.env.TUTOR_SECRET_KEY;
const Tutors = require("../models/tutorSchema");

const tutorVerification = async (req, res, next) => {
 
  try {
    
    const authorizationHeader = req.headers.authorization;

    const token = authorizationHeader.split(" ")[1];

      if (token === "undefined") {
      return res.status(401).json({ message: "Authentication failed shijith" });

    } else {
      
      const decodedToken =  jwt.verify(token, process.env.TUTOR_SECRET_KEY );

      req.tutorId = decodedToken._id;
    
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

module.exports = { tutorVerification,};
