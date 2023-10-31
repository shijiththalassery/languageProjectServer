const jwt = require('jsonwebtoken');

const asyncHandler = require('express-async-handler');
const Students = require('../models/studentShema');
const Tutor = require('../models/tutorSchema');


const protect = asyncHandler(async (req, res, next) => {
    let token;

    token = req.cookie.jwt;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await Tutor.findById(decoded.userId).select(-password)
            next();
        } catch (error) {
            res.status(401);
            throw new Error('not authorized , invalid token')
        }
    } else {
        res.status(401);
        throw new Error('not authorized , no token')
    }
})

module.exports = protect ; 