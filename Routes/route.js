const express = require("express");
const store = require('../middleware/multer')
const router = express.Router(); // Initialize the router
const protect = require('../middleware/authMiddleware')
const auth = require('../middleware/verifyTutorToken')
const studentAuth = require('../middleware/verifyStudentToken')
const adminAuth = require('../middleware/verifyAdminToken')



const studentController = require("../controllers/studentController");
const userController = require("../controllers/userController");
const tutorController = require('../controllers/tutorController');
const adminController = require('../controllers/adminController');

router.post('/student/register', studentController.studentRegister);
router.post('/studentLogin', studentController.studentLogin);
router.post('/googleAuthCheckStudent', studentController.googleAuthCheckStudent);
router.post('/checkUser', userController.checkUser);
router.post('/userRegistration', userController.userRegistration);
router.post('/userLogin', userController.userLogin);
router.get('/tutorList', studentController.tutorList); // PROTECTION NEEDED
router.get('/tutorDetails/:id', studentController.tutorDetail); //PROTECTION NEEDED
router.get('/coursePurchase/:id', studentController.coursePurchase); //PROTECTION NEEDED
router.post('/buyCourse', studentController.buyCourse);  //PROTECTION NEEDED
router.get('/studentDetail/:email', studentController.studentDetail); //PROTECTION NEEDED
router.post('/studentProfileEdit', studentController.studentProfileEdit); //PROTECTION NEEDED
router.get('/listOfTutor/:email', studentController.listOfTutor); //PROTECTION NEEDED
router.post('/reviewPost',studentAuth.studentVerification , studentController.reviewPost); 
router.get('/myTutorList/:email', studentController.myTutorList) //PROTECTION NEEDED




router.post('/TutorRegistration', tutorController.TutorRegistration); 
router.post('/tutorLogin', tutorController.tutorLogin); 
router.post('/tutorOtpVerification', tutorController.tutorOtpVerification); 
router.post('/tutorVerification', tutorController.tutorVerification); // PROTECTION NEEDED
router.get('/languageList', tutorController.languageList); 
router.get('/tutorDetail/:email', auth.tutorVerification, tutorController.tutorDetail);
router.post('/tutorPremiumPurchase', tutorController.tutorPremiumPurchase); // PROTECTION NEEDED
router.post('/tutorProfileEdit', tutorController.tutorProfileEdit); // PROTECTION NEEDED
router.post('/tutorPremuimSetUp', tutorController.tutorPremuimSetUp); // PROTECTION NEEDED
router.post('/googleAuthCheckTutuor', tutorController.googleAuthCheckTutuor);
router.get('/studentList/:email', tutorController.studentList) // PROTECTION NEEDED
router.post('/submitQuestion',auth.tutorVerification, tutorController.submitQuestion)
router.get('/tutorEarning',auth.tutorVerification,  tutorController.tutorEarning)
router.post('/assignmentDetail',auth.tutorVerification, tutorController.assignmentDetail)


router.post('/adminLogin', adminController.adminLogin)
router.get('/adminTutorList', adminController.tutorList) // PROTECTION NEEDED
router.put('/tutorBlock/:id', adminController.tutorBlock)  // PROTECTION NEEDED
router.put('/tutorUnblock/:id', adminController.tutorUnBlock)  // PROTECTION NEEDED
router.get('/adminStudentList', adminController.studentList)  // PROTECTION NEEDED
router.put('/studentBlock/:id', adminController.studentBlock)  // PROTECTION NEEDED
router.put('/studentUnblock/:id', adminController.studentUnblock)   // PROTECTION NEEDED
router.post('/addLanguage', adminController.addLanguage)  // PROTECTION NEEDED
router.get('/verificationList', adminController.verificationList)  // PROTECTION NEEDED
router.put('/certificateApprove/:id', adminController.certificateApprove)   // PROTECTION NEEDED
router.put('/certificateReject/:id', adminController.certificateReject)   // PROTECTION NEEDED
router.get('/getChartData', adminController.chartData);

// adminAuth.adminVerfication,










const Tutor = require('../models/tutorSchema')
router.post('/checkmongo', async (req, res) => {
    const studentEmail = req.body.studentEmail;
    const tutorEmail = req.body.tutorEmail;

    const tutor = await Tutor.findOne({ email: tutorEmail });
    if (tutor) {
        const userEmailToCheck = req.body.studentEmail; // The email you want to check

        let isMatching = false;

        for (const student of tutor.students) {
            if (student.email === userEmailToCheck) {
                isMatching = true;
                break; // Exit the loop when a match is found
            }
        }
        if(isMatching){
            res.json('true')
        }else{
            res.json('false')
        }
    }
})






module.exports = router;
