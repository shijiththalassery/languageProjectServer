const jwt = require("jsonwebtoken");
require("dotenv").config();

const Tutor_Secret_key = process.env.tutor_secretKey;
const Vendor = require("../models/vendorModel");

const verifyVendorToken = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    
    const token = authorizationHeader.split(" ")[1];
   
      if (token === "undefined") {
  
      return res.status(401).json({ message: "Authentication failed" });
    } else {
   
      const decodedToken = jwt.verify(token, "jesvinjose49");
     
      req.vendorId = decodedToken._id;
    
      next();
    }
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};

const vendorBlock = async (req, res, next) => {
  let vendorId = localStorage.getItem("vendorId");
  const vendor = await Vendor.findById(vendorId);
  if (vendor.blockStatus === true) {
    return res.json({ message: "User is Blocked" });
  } else {
    console.log("Hi unblocked user");
    next();
  }
};

module.exports = { verifyVendorToken, vendorBlock };
