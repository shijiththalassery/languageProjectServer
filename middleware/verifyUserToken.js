const jwt = require("jsonwebtoken");
require("dotenv").config();
const USER_TOKEN_SECRETKEY = process.env.usertoken_secretKey;
const User = require("../models/userModel");

const verifyUserToken = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization; 

    const token = authorizationHeader.split(" ")[1];

      if (token === "undefined") {
      console.log(token,"inside undefined token");
      return res.status(401).json({ message: "Authentication failed" });
    } else {
      console.log(process.env.usertoken_secretKey, "usertoken secret key");

      const decodedToken = jwt.verify(token, USER_TOKEN_SECRETKEY);

      req.userId = decodedToken._id;

      next();
      
    }
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};

const userBlock = async (req, res, next) => {
  let userId = localStorage.getItem("userId");
  const user = await User.findById(userId);
  if (user.blockStatus === true) {
    return res.json({ message: "User is Blocked" });
  } else {
    console.log("Hi unblocked user");
    next();
  }
};

module.exports = { verifyUserToken, userBlock };
