const {Router} = require('express');
const authController = require('../controllers/authController');
const router = Router();
const {requireAuth} = require('../middleware/authMiddleware');
const multer  = require('multer')
const path = require('path');


// const {authUser} = require('../controllers/authController')


// SET STORAGE
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './public/Images')
    },
    filename: (req, file, cb) => {
        console.log(file)
      cb(null,Date.now() + path.extname(file.originalname))
    }
  })
  
  const upload = multer({ storage: storage })

  
router.get('', authController.homepage);
router.get('/home', authController.homepage_get);
router.get('/booked', authController.booked_get);
router.post('/profile', upload.single('uploaded_file'), authController.profile_post);
router.get('/dashboard',requireAuth, authController.dashboard_get);
router.post('/addBus', authController.addBus_post);
router.get('/login', authController.login_get);
router.get('/logout', authController.logout_get);
router.post('/login', authController.login_post);
router.get('/register', authController.register_get);
router.post('/register', authController.register_post);
router.get('/result', authController.result_get);
router.get('/add', authController.addBus_get);
// router.get('/test', authController.test_get);
// router.post('/test', authController.test_post);
router.post('/add', authController.addBus_post);
router.get('/search', authController.search_post);
router.get('/customer/:id', authController.selected_get);
router.get('/customer/:id/proceed', authController.proceed_get);
router.post('/customer/submit/:id', authController.submit_post);
router.post('/customer/paying/:id', authController.paying_post);
router.get('/customer/submit/seats/:id', authController.seat_get);
router.get('/customer/submit/seats/:id/proceed/done', authController.done_get);
router.post('/customer/submit/seats/:id/proceed/done', authController.done_post);
router.post('/customer/submit/seats/:id', authController.seat_post);
// updating bus
router.post('/updatebus', authController.updateBus_post);
module.exports = router;

