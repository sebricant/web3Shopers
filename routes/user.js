var express = require('express');
var router = express.Router();
const userController= require('../controller/userController')
const auth = require('../controller/auth');
const wishlistHelpers = require('../helpers/wishlistHelpers');

router.get('/',userController.landingPage);

router.get('/signup',userController.signupPage)

router.post('/user-registration',userController.signupPost)

router.get('/login',userController.loginPage)

router.post('/login',userController.loginPost)

router.get("/logout",userController.dologout)

router.get('/loginWithOTP',userController.loginOTPPage)

router.get('/loginOTP',userController.doGetOTPLogin)

router.get('/getOTP',userController.getOTPLogin)

router.get('/otpLogin:id',userController.doGetVerifyOTP)

router.get('/OTPLogin',userController.getotpsVerify)

router.get('/productview/:id',userController.productPage)

router.get("/shop",userController.shopPage)

router.get('/shopWishlist',auth.verifyUser,userController.wishListPage)

router.post('/addToWishlist/:id',auth.verifyUser,wishlistHelpers.addtoWishList)

router.post('/deleteProductFromWishlist/:id',auth.verifyUser,userController.deleteproductFromWishlist)

router.get('/cart',auth.verifyUser,userController.cartPage)

router.post('/addToCart/:id',auth.verifyUser,userController.addtoCart)

router.put('/changeProductQty',auth.verifyUser,userController.changeProductQuantity)

router.post('/deleteProductFromCart/:id',auth.verifyUser,userController.deleteproductFromCart)

router.get('/checkouts',auth.verifyUser,userController. checkoutPage)

router.post('/placeOrder',auth.verifyUser,userController.placeOrder)

router.post('/create-order',auth.verifyUser,userController.paypalOrder)

router.get('/paypal-success',auth.verifyUser,userController.paypalSuccess)

router.get('/account',auth.verifyUser,userController.accountPage)

router.get('/orders',auth.verifyUser,userController.ordersPage)

router.post('/returnOrder',auth.verifyUser,userController.returnOrder)

router.get('/userOrderDetails/:id',auth.verifyUser,userController.userOrderDetails)

router.put('/cancelOrder',auth.verifyUser,userController.cancelOrder)

router.post('/verifyPayment',auth.verifyUser,userController.verifyPayment)

router.get('/autoFill/:id',auth.verifyUser,userController.autofill)

router.get('/success',auth.verifyUser,userController.successPage)

router.post("/checkout/couponVerify",auth.verifyUser,userController.verifyCoupon)

router.post('/checkout/verifyCouponChecked',auth.verifyUser,userController.checkCoupon)

router.post("/checkout/applyCoupon",auth.verifyUser,userController.applyCoupon)



// router.post('/order/returnProduct',auth.verifyUser,userController.returnProduct)

module.exports = router;