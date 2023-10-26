const jwt = require("jsonwebtoken");

const ADMIN_TOKEN_SECRETKEY = process.env.admintoken_secretKey;

const verifyAdminToken = (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization; 

    const adminToken = authorizationHeader.split(" ")[1];

    if (adminToken === "undefined") {

      return res.status(401).json({ message: "Authentication failed" });
    } else {

      const decodedAdminToken = jwt.verify(adminToken, ADMIN_TOKEN_SECRETKEY);
 
      req.adminId = decodedAdminToken._id;

      next();
    }
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};

module.exports = {verifyAdminToken};
