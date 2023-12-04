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
router.get('/tutorList',studentAuth.studentVerification ,  studentController.tutorList); 
router.get('/tutorDetails/:id',studentAuth.studentVerification ,studentController.tutorDetail); 
router.post('/buyCourse', studentController.buyCourse);  //PROTECTION NEEDED  failed
router.get('/studentDetail/:email',studentAuth.studentVerification , studentController.studentDetail); 
router.post('/studentProfileEdit',studentAuth.studentVerification , studentController.studentProfileEdit); 
router.post('/reviewPost',studentAuth.studentVerification , studentController.reviewPost); 
router.get('/myTutorList/:email',studentAuth.studentVerification , studentController.myTutorList) 
router.post('/myAssignment',studentAuth.studentVerification , studentController.myAssignment)
router.post('/submitAssignemnt',studentAuth.studentVerification , studentController.submitAssignemnt);
router.get('/myCourseDetail/:id',studentAuth.studentVerification , studentController.myCourseDetail)
router.get('/cancelPurchase/:id',studentAuth.studentVerification , studentController.cancelPurchase);
router.get('/myDetail',studentAuth.studentVerification , studentController.myDetail);





router.post('/TutorRegistration', tutorController.TutorRegistration); 
router.post('/tutorLogin', tutorController.tutorLogin); 
router.post('/tutorOtpVerification', tutorController.tutorOtpVerification); 
router.post('/tutorVerification',auth.tutorVerification, tutorController.tutorVerification); 
router.get('/languageList', tutorController.languageList);
router.get('/tutorDetail/:email', auth.tutorVerification, tutorController.tutorDetail);
router.post('/tutorPremiumPurchase',auth.tutorVerification, tutorController.tutorPremuimSetUp); // PROTECTION NEEDED need to be change
router.post('/tutorProfileEdit',auth.tutorVerification, tutorController.tutorProfileEdit); 
router.post('/googleAuthCheckTutuor', tutorController.googleAuthCheckTutuor);
router.get('/studentList/:email',auth.tutorVerification, tutorController.studentList) 
router.post('/submitQuestion',auth.tutorVerification, tutorController.submitQuestion)
router.get('/tutorEarning',auth.tutorVerification,  tutorController.tutorEarning)
router.post('/assignmentDetail',auth.tutorVerification, tutorController.assignmentDetail)
router.get('/assignmentVerification/:id',auth.tutorVerification, tutorController.assignmentDetail)


router.post('/adminLogin', adminController.adminLogin)
router.get('/adminTutorList',adminAuth.adminVerfication, adminController.tutorList) 
router.put('/tutorBlock/:id',adminAuth.adminVerfication, adminController.tutorBlock) 
router.put('/tutorUnblock/:id',adminAuth.adminVerfication, adminController.tutorUnBlock) 
router.get('/adminStudentList',adminAuth.adminVerfication, adminController.studentList) 
router.put('/studentBlock/:id',adminAuth.adminVerfication, adminController.studentBlock)  
router.put('/studentUnblock/:id',adminAuth.adminVerfication, adminController.studentUnblock)   
router.post('/addLanguage',adminAuth.adminVerfication, adminController.addLanguage)  
router.get('/verificationList',adminAuth.adminVerfication, adminController.verificationList)  
router.put('/certificateApprove/:id',adminAuth.adminVerfication, adminController.certificateApprove)  
router.put('/certificateReject/:id',adminAuth.adminVerfication, adminController.certificateReject)   
router.get('/getChartData',adminAuth.adminVerfication, adminController.chartData);



router.post('/whatsApp',async(req, res)=>{

    const { name, place, email, phone, district, event } = req.body;

    // Set up your Twilio credentials and WhatsApp-enabled Twilio number
    const accountSid = process.env.VITE_API_ACCOUNT_SID;
    const authToken = process.env.VITE_API_AUTH_TOKEN;
    const fromNumber = phone; 
  
    const client = new twilio.Twilio(accountSid, authToken);
  
    try {

      const message = await client.messages.create({
        body: `Name: ${name}\nPlace: ${place}\nEmail: ${email}\nPhone: ${phone}\nDistrict: ${district}\nEvent: ${event}`,
        from: fromNumber,
        to: 'whatsapp:+919567260882', 
      });
  
      console.log('WhatsApp message sent SID:', message.sid);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  
})







const Tutor = require('../models/tutorSchema')
router.post('/checkmongo', async (req, res) => {
    const studentEmail = req.body.studentEmail;
    const tutorEmail = req.body.tutorEmail;

    const tutor = await Tutor.findOne({ email: tutorEmail });
    if (tutor) {
        const userEmailToCheck = req.body.studentEmail; // The email i want to check

        let isMatching = false;

        for (const student of tutor.students) {
            if (student.email === userEmailToCheck) {
                isMatching = true;
                break; // if the matching is fond then exiting the loop
            }
        }
        if(isMatching){
            res.json('true')
        }else{
            res.json('false')
        }
    }
})




// router.get('/coursePurchase/:id', studentController.coursePurchase); //PROTECTION NEEDED student
// router.get('/listOfTutor/:email', studentController.listOfTutor); //PROTECTION NEEDED

module.exports = router;
