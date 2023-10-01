const express = require("express");
const store = require('../middleware/multer')
const router = express.Router(); // Initialize the router

const studentController = require("../controllers/studentController");
const userController = require("../controllers/userController");
const tutorController = require('../controllers/tutorController')
const adminController = require('../controllers/adminController')

router.post('/student/register', studentController.studentRegister);
router.post('/checkUser', userController.checkUser); 
router.post('/userRegistration', userController.userRegistration); 
router.post('/userLogin',userController.userLogin) 

router.post('/TutorRegistration', tutorController.TutorRegistration)
router.post('/tutorOtpVerification', tutorController.tutorOtpVerification)
router.post('/tutorVerification', tutorController.tutorVerification)
router.get('/languageList',tutorController.languageList)
router.get('/tutorDetail/:email',tutorController.tutorDetail)
router.post('/tutorPremiumPurchase',tutorController.tutorPremiumPurchase)


router.post('/adminLogin',adminController.adminLogin)
router.get('/adminTutorList',adminController.tutorList)
router.put('/tutorBlock/:id',adminController.tutorBlock)
router.put('/tutorUnblock/:id',adminController.tutorUnBlock)
router.get('/adminStudentList',adminController.studentList)
router.put('/studentBlock/:id',adminController.studentBlock)
router.put('/studentUnblock/:id',adminController.studentUnblock)
router.post('/addLanguage',adminController.addLanguage)
router.get('/verificationList',adminController.verificationList)
router.put('/certificateApprove/:id',adminController.certificateApprove)
router.put('/certificateReject/:id',adminController.certificateReject)






module.exports = router;
