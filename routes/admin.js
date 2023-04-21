var express = require('express');
// const { addProducts } = require('../controller/adminController');
var router = express.Router();
const adminController = require('../controller/adminController')

const multer=require('multer');
const categoryHelpers = require('../helpers/categoryHelpers');
const couponHelpers = require('../helpers/couponHelpers')
// const File=require('../model/connection')
const auth=require('../controller/auth');
const { getcouponMgt } = require('../controller/adminController');
const chartHelpers = require('../helpers/chartHelpers');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/productImages');
  },
  filename: (req, file, cb) => {
 
    cb(null, Date.now()+'-'+file.originalname);
  },
});

const upload = multer({
  storage: multerStorage,
});

const multerStorage2 =multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,"public/bannerImages");
  },
  filename:(req,file,cb)=>{
    cb(null,Date.now()+'-'+file.originalname);
  },
})
const upload2 = multer({
  storage:multerStorage2,
});

/* GET home page. */
router.get('/login',adminController.adminLogin)

router.post('/login',adminController.postLogin)

router.get('/chartGraph', adminController.revenueGraphMonth)

router.get('/adminLogout',adminController.adminDoLogout)

router.get('/dashboard',auth.verifyAdmin,adminController.adminDashboard)

router.get('/addproduct',auth.verifyAdmin,adminController.adminAddProduct)

router.get('/addCategory',auth.verifyAdmin,adminController.adminAddCategory)

router.get('/productMgt',auth.verifyAdmin,adminController.adminProductMgt)

router.get('/categoryMgt',auth.verifyAdmin,adminController.adminCategoryMgt)

router.get('/userMgt',auth.verifyAdmin,adminController.douser)

router.get('/orderMgt',auth.verifyAdmin,adminController.AdminorderMgt)

router.get('/orderDetails/:id',auth.verifyAdmin,adminController.adminOrderDetails)

router.post("/updateOrderStatus",auth.verifyAdmin,adminController.updateOrderStatus)


router.post("/addproduct", upload.array("Image"),adminController.addProducts);

router.post('/addCategory',adminController.postAddCategory)

router.get('/editbanner/:id',auth.verifyAdmin,adminController.editBannerPage)

// router.post('/editbanner/:id',auth.verifyAdmin,upload2.array('Image'),adminController.editBannerPost)

router.delete('/deletebanner/:id',auth.verifyAdmin,adminController.deleteBanner)


// router.route('/editProduct/:id').get(adminController.doEditProduct).post(adminController.adminEditProducts)
router.get('/editProduct/:id',adminController.doEditProduct)

router.post('/editProduct/:id', upload.array("Image"),adminController.adminEditProducts)

router.get('/editCategory/:id',adminController.doEditCategory)

router.post('/editCategory/:id',adminController.adminEditCategory)

router.post('/deleteProduct/:id',adminController.adminDeleteProduct)

router.get('/deleteCategory/:id',adminController.adminDeleteCategory)

router.get('/userMgt/blocked/:id',adminController.getBlockUser)

router.get('/userMgt/unblocked/:id',adminController.getUnBlockUser)

router.get('/couponMgt',auth.verifyAdmin,adminController.getcouponMgt)

router.get('/couponMgt/addCoupon',auth.verifyAdmin,adminController.getaddCoupon)

router.get('/couponMgt/generateCoupon',adminController.getCoupenCode)

router.post('/couponMgt/addCoupon',adminController.postaddCoupon)

router.get('/categoryBanner',auth.verifyAdmin,adminController.getCatagoryBanner)

router.get('/addCategoryBanner',auth.verifyAdmin,adminController.addCategoryBanner)

router.post('/add-CategoryBanner',upload2.array('Image'),adminController.addCategoryBannerPost)

router.get('/deleteCategoryBanner/:id',auth.verifyAdmin,adminController.deleteCategoryBanner)

router.get('/banner',auth.verifyAdmin,adminController.banner)

router.get('/add-banner',auth.verifyAdmin,adminController.addBanner)

router.post('/add-banner',upload2.array('Image'),adminController.addBannerPost)

router.get('/bannerMgt',auth.verifyAdmin,adminController.bannerMgt)

router.get("/bannerList",auth.verifyAdmin,adminController.bannerList)

router.get('/salesReport',auth.verifyAdmin,adminController.generateSalesReport)

router.get('/generate-PDF-monthly',auth.verifyAdmin,adminController.generateReportPDF)

module.exports = router;
