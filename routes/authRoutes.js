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
      cb(null, './public/Profile')
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
router.get('/profile/:id',requireAuth, authController.profile_get);
router.post('/profile_pic', requireAuth, upload.single('uploaded_file'), authController.profile_post);
router.get('/dashboard/:id',requireAuth, authController.dashboard_get);
router.get('/admin', authController.admin_get);
router.get('/login', authController.login_get);
router.get('/logout', authController.logout_get);
router.post('/login', authController.login_post);
router.get('/register', authController.register_get);
router.post('/register', authController.register_post);

// updating bus
module.exports = router;

