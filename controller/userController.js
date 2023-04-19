const e = require("express");
require("dotenv").config();
const { response } = require("../app");
const userHelpers = require("../helpers/userHelpers");
const cartHelpers = require("../helpers/cartHelpers");
const categoryHelpers = require("../helpers/categoryHelpers");
const productHelpers = require("../helpers/productHelpers");
const couponHelpers = require("../helpers/couponHelpers")
let couponPrice=0
const db = require("../model/connection");
const orderHelpers = require("../helpers/orderHelpers");
const wishlistHelpers = require("../helpers/wishlistHelpers");
const client1 = require("twilio")(
  process.env.ACCOUNT_SDI,
  process.env.ATH_TOKEN
);

// Initialize with separate variables.

// const {Client, Env, Currency, Models, Tokens} = require('bitpay-sdk');

// let tokens = Tokens;
// tokens.merchant = 'J2aV5QLLazq9D2Gg4RmeKzpYQgS7MtZrryotAUV7hMLP';
// let keyFilePath = __dirname+'/../secure/private_key_test.key';
// let keyPlainText = '206bbfbb81f95d281a366896e609756efe3f22996656894e72544df65c023c76';
// let configFilePath = __dirname+'/../secure/BitPay.config.json';

// let client = new Client(
//     null,
//     Env.Test,
//     ['206bbfbb81f95d281a366896e609756efe3f22996656894e72544df65c023c76'],
//     tokens
// );
        

const paypal = require("@paypal/checkout-server-sdk");
const bannerHelpers = require("../helpers/bannerHelpers");
const Environment =
  process.env.NODE_ENV === "production"
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment;
const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
);
 


module.exports = {
  
  landingPage: async(req, res) => {
    let userId = req.session.user._id;
    let category = await categoryHelpers.allCategory();
    let cartCount = await userHelpers.getCartCount(userId);
    let cartProduct = await cartHelpers.getCartProducts(userId);
    let wishlistCount = await wishlistHelpers.wishlistCount(userId);
    let bannerdata = await bannerHelpers.getAllBanners();
    let user = req.session.user;
    let categoryBanner = await productHelpers.getCatagoryBanner()
    res.render("index", { user: user ,category,
      cartCount,
      wishlistCount,
      bannerdata,
      categoryBanner,
      cartProduct });
  },
  signupPage: (req, res) => {
    res.render("users/signup", { layout: "layout" });
  },
  loginPage: (req, res) => {
    res.render("users/login", { layout: "layout" });
  },
  
  shopPage: async (req, res) => {
    let user = req.session.user;
    let userId = req.session.user._id;
    let data = req.query
    let category = await categoryHelpers.allCategory();
    let cartCount = await userHelpers.getCartCount(userId);
    let cartProduct = await cartHelpers.getCartProducts(userId);
    let wishlistCount = await wishlistHelpers.wishlistCount(userId);
    let products = await productHelpers.allProducts(data);
    res.render("users/shop", {
      layout: "layout",
      products,
      cartCount,
      cartProduct,
      data,
      wishlistCount,
      category,
      user: user,
      header: true,
    });
  },
  loginOTPPage: (req, res) => {
    res.render("users/loginWithOTP", { layout: "layout" });
  },
  signupPost: (req, res) => {
    // console.log(req.body);
    userHelpers.doSignup(req.body).then((response) => {
      if (!response.status) {
        console.log("fail");
        res.send({ value: "failed" });
      } else {
        console.log("success");
        req.session.loggedIn = true;
        res.json({ value: "success" });
      }
    });
  },
  loginPost: (req, res) => {
    // console.log("asdfd", req.body);
    userHelpers.loginPost(req.body).then((response) => {
      if (response.status) {
        req.session.loggedIn = true;
        req.session.user = response.user;
        res.send(response);
      } else {
        res.send(response);
      }
    });
  },
  dologout: (req, res) => {
    req.session.loggedIn = false;
    req.session.user = "";
    res.redirect("/login");
  },
  doGetOTPLogin: function (req, res) {
    res.render("users/loginWithOTP", { user: false });
  },
  getOTPLogin: async (req, res) => {
    try {
      const mobileNumber = req.query.phoneNumber.slice(2);
      const existingData = await db.users.findOne({ mobile: mobileNumber });

      console.log("data phone => ", existingData, "req.query.phoneNumber");

      if (!existingData) throw "User not exist";

      otpNumber = req.query.phoneNumber;
      console.log(otpNumber);
      console.log(req.query.channel);
      client1.verify
        .services(process.env.SERVICE_ID)
        .verifications.create({
          to: `+${otpNumber}`,
          channel: `${req.query.channel}`,
        })
        .then((data) => {
          console.log(data);
          res.send({ status: true });
          // res.status(200).send(data)
        });
    } catch (error) {
      console.log(error,"error");
      res.send({ status: false });
    }
  },
  doGetVerifyOTP: (req, res) => {
    guestuser = req.session.userData;
    let otpNumber = req.params.id;
    res.render("users/otpLogin", { otpNumber, guestuser, user: false });
  },
  getotpsVerify: (req, res) => {
    console.log(req.query.phoneNumber);
    client1.verify
      .services(process.env.SERVICE_ID)
      .verificationChecks.create({
        to: `+91${req.query.phoneNumber}`,
        code: req.query.code,
      })
      .then(async (data) => {
        console.log(data);
        if (data.valid) {
          // req.session.user = ;
          req.session.loggedIn = true;
          res.send({ value: "success" });
        } else {
          res.send({ value: "failed" });
        }
      });
  },
  productPage: async (req, res) => {
    console.log(req.params.id, "jhg");
    let user = req.session.user;
    let userId = req.session.user._id;
    let cartCount = await userHelpers.getCartCount(req.session.user);
    let cartProduct = await cartHelpers.getCartProducts(userId);
    let product = await productHelpers.productview(req.params.id);
    let wishlistCount = await wishlistHelpers.wishlistCount(userId);

    res.render("users/productview", { user: user, product,cartProduct,cartCount,wishlistCount});
  },
  wishListPage: async (req, res) => {
    let userId = req.session.user._id;
    let products = await userHelpers.getWishlistProducts(userId);
    let cartCount = await userHelpers.getCartCount(userId);
    let cartProduct = await cartHelpers.getCartProducts(userId);
    let wishlistCount = await wishlistHelpers.wishlistCount(userId);

    res.render("users/shopWishlist", {
      products,
      layout: "layout",
      cartCount,
      wishlistCount,
      cartProduct,
      wishlist: true,
      user: userId,
    });
  },
  successPage:async(req, res) => {
    let user = req.session.user;
    let userId = req.session.user._id;
    let category = await categoryHelpers.allCategory();
    let cartCount = await userHelpers.getCartCount(userId);
    let cartProduct = await cartHelpers.getCartProducts(userId);
    let wishlistCount = await wishlistHelpers.wishlistCount(userId);
    let product = await productHelpers.productview(req.params.id);
    res.render("users/success", { user: user,product ,category,
      wishlistCount,
      cartCount,
      cartProduct,});
  },

  cartPage: async (req, res) => {
    let userId = req.session.user._id;
    let category = await categoryHelpers.allCategory();
    let products = await cartHelpers.getCartProducts(userId);
    let cartCount = await userHelpers.getCartCount(req.session.user);
    let total = await orderHelpers.getTotalAmount(req.session.user._id);
    let wishlistCount = await wishlistHelpers.wishlistCount(userId);
    total=total?.total;
    console.log(total, "carttotal1");
    res.render("users/cart", {
      layout: "layout",
      products,
      total,
      category,
      cartCount,
      wishlistCount,
      user: true,
      header: true,
    });
  },

  checkoutPage: async (req, res) => {
    console.log("kjhgfd");
    // let category= await categoryHelpers.allCategory()
    // let products = await productHelpers.allProducts()
    // console.log(req.session.user._id, "efdvb");
    let userId = req.session.user._id;
    let category = await categoryHelpers.allCategory();
    let cartCount = await userHelpers.getCartCount(req.session.user);
    let cartProduct = await cartHelpers.getCartProducts(userId);
    let cartTotal = await orderHelpers.getCheckOutData(req.session.user._id);
  console.log(cartTotal,"yyy");
    let products = await cartHelpers.getCartProducts(req.session.user._id);
    let wishlistCount = await wishlistHelpers.wishlistCount(userId);
    let address = await db.address.find({ userId: req.session.user._id });
    let coupondata = await couponHelpers.getallcoupon();
    // console.log(cartTotal,"usercontrollers total");
    res.render("users/checkouts", {
      layout: "layout",
      products,
      cartTotal,
      wishlistCount,
      address,
      category,
cartCount,
cartProduct,
coupondata,
      user: true,
      header: true,
    });
  },

  addNewaddres: (req, res) => {
    let userId = req.session.user._id;
    userHelpers.addNewAddress(req.body,userId).then(() => {
      res.send("address added");
    });
  },

  accountPage: async (req, res) => {
    let userId = req.session.user._id;
    let cartProduct = await cartHelpers.getCartProducts(userId);
    let category = await categoryHelpers.allCategory();
    let products = await productHelpers.allProducts();
    let userName = req.session.user.fName;
    let wishlistCount = await wishlistHelpers.wishlistCount(userId);
    let cartCount = await userHelpers.getCartCount(req.session.user);
    let address = await userHelpers.addressDetails(req.session.user._id);

    // console.log(cartCount, "frgn");
    userHelpers.orderdetails(req.session.user._id).then((orders) => {
      // console.log(address, "hihi");
      res.render("users/account", {
        address,
        cartProduct,
        cartCount,
        userName,
        wishlistCount,
        orders,
        layout: "layout",
        products,
        category,
        user: true,
        header: true,
      });
    });
  },
  ordersPage:async (req, res) => {
    let userId = req.session.user._id;
    let category = await categoryHelpers.allCategory();
    let products = await productHelpers.allProducts();
    let userName = req.session.user.fName;
    let cartCount = await userHelpers.getCartCount(req.session.user);
    let address = await userHelpers.addressDetails(req.session.user._id);
    let wishlistCount = await wishlistHelpers.wishlistCount(userId);
    let total = await orderHelpers.getTotalAmount(req.session.user._id);
    let cartProduct = await cartHelpers.getCartProducts(userId);
    // console.log(cartCount, "cart count");
    userHelpers.orderdetails(req.session.user._id).then((orders) => {
      // console.log(address, "hoho ordersPage");
      res.render("users/orders", {
        address,
        cartCount,
        wishlistCount,
        cartProduct,
        userName,
        orders,
        total,
        layout: "layout",
        products,
        category,
        user: true,
        header: true,
      });
    });
  },
  userOrderDetails:async(req,res)=>{
    let userId = req.session.user._id;
    let category = await categoryHelpers.allCategory();
    let products = await productHelpers.allProducts();
    let userName = req.session.user.fName;
    let cartCount = await userHelpers.getCartCount(req.session.user);
    let address = await userHelpers.addressDetails(req.session.user._id);
    let wishlistCount = await wishlistHelpers.wishlistCount(userId);
    let total = await orderHelpers.getTotalAmount(req.session.user._id);
    let cartProduct = await cartHelpers.getCartProducts(userId);
    try {
      orderHelpers
        .userOrderDetails(req.session.user._id, req.params.id)
        .then((orders) => {
          console.log(orders,"order");
          res.render("user/userOrderDetails", {
            layout: "layout",
            orders,
            address,
            cartCount,
            wishlistCount,
            cartProduct,
            userName,
            total,
            products,
            category,
          });
        });
    } catch (error){}
  },
  addToWishlist: (req, res) => {
    // console.log(req.session.user._id, "test2");
    wishlistHelpers
      .addtoWishList(req.params._id, res.session.user._id)
      .then(() => {
        res.json({ status: true });
      });
  },
  deleteproductFromWishlist: async (req, res) => {
    const proId = req.params.id;
    const userId = req.session._id;
    const response = await wishlistHelpers.doDeleteproductFromWishlist(
      req.body,
      proId,
      userId
    );
    const wishListItems = await wishlistHelpers.getWishlistProducts(userId);
    response.wishListItems = wishListItems.length;
    res.json({ status: true });
  },

  addtoCart: (req, res) => {
    // console.log(req.session.user._id, "hgj");
    cartHelpers.addtoCart(req.params.id, req.session.user._id).then(() => {
      res.json({ status: true });
    });
  },

  changeProductQuantity: (req, res) => { 
    console.log(req.body,"kkkkkkkkkkkkkkkkkkkkk");
    cartHelpers.doChangeProductQuantity(req.body).then(async(response) => {
     response.total= await orderHelpers.getTotalAmount(req.session.user._id)
      console.log(response.total);
      res.json(response);
    });
  },
  getcart: async (req, res) => {
    let products = await cartHelpers.getCartProducts(req.session._id);
    res.render("user/cart", { products });
  },
  deleteproductFromCart: async (req, res) => {
    const proId = req.params.id;
    const userId = req.session._id;
    const response = await cartHelpers.doDeleteproductFromCart(
      req.body,
      proId,
      userId
    );
    const cartItems = await cartHelpers.getCartProducts(userId);
    response.cartItems = cartItems.length;
    res.json({ status: true });
  },
  placeOrder: async (req, res) => {
    // console.log(req.body, "vf");
    let total = await orderHelpers.getTotalAmount(req.session.user._id);
    console.log(couponPrice,"log couponPrice in placeorder");
    total = total - couponPrice
    console.log(total, "total");
    userHelpers
      .placeOrder(req.body, total, req.session.user._id,couponPrice)
      .then(async (response) => {
        couponPrice=0
        if (req.body.paymentMethod == "COD") {
          res.send({ value: "success" });
        } else if (req.body.paymentMethod == "razorpay") {
          userHelpers
            .generateRazorpay(total, req.session.user._id)
            .then((response) => {
              res.json({ razorpay: true, response: response });
            });
        } else {
          res.json({ paypal: true, total: total });
        }
      });
  },
  cancelOrder: (req, res) => {
    console.log(req.body, "body");
    userHelpers.cancelOrder(req.body, req.session.user).then(() => {
      res.json({ status: true });
    });
  },
  returnOrder:(req,res)=>{
    userHelpers.returnProduct(req.body,req.session.user._id).then((response)=>{
      console.log('return order',response);
      res.send(response)
    })
  },
  getAddress: (req, res) => {
    let addrId = req.params.id;
    userHelpers.getSingleAddress(addrId, req.session.user).then((data) => {
      res.json(data);
    });
  },
  checkoutPost: async (req, res) => {
    let total = await userHelpers.getTotalAmount(req.session.user._id);
    console.log(total,'users-controllers');
    
    userHelpers.placeOrder(req.body, total).then((response) => {
      if (req.body.payment == "COD") {
        res.send({ success: true });
      } else if (req.body.payment == "razorpay") {
        userHelpers
          .generateRazorpay(req.body, total, req.session.user._id)
          .then((response) => {
            res.json(response);
          });
      }
    });
  },
  verifyPayment: (req, res) => {
    userHelpers
      .verifyPayment(req.body)
      .then(() => {
        userHelpers
          .changePaymentStatus(req.session.user, req.body["order[reciept]"])
          .then(() => {
            res.json({ status: true });
          });
      })
      .catch((err) => {
        res.json({ status: false });
      });
  },
  autofill: (req, res) => {
    console.log("hello");
    userId = req.session.user._id;
    addrsId = req.params.id;
    cartHelpers.autofill(userId, addrsId).then((data) => {
      console.log(data, "ppppppppppp");
      console.log(data[0], "my address");
      res.send(data[0].address);
    });
  },

  paypalOrder: async (req, res) => {
    let total = req.body.total;
    total = parseInt(total);
    const request = new paypal.orders.OrdersCreateRequest();
    // const value = await Convert(total).from("INR").to("USD");
    const value = total;
    let price = Math.round(value);

    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: price,
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: price,
              },
            },
          },
        },
      ],
    });

    try {
      const order = await paypalClient.execute(request)
      res.json({ id: order.result.id });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
  paypalSuccess: async (req, res) => {
    const ordersDetails = await db.orders.find({ userId: req.session.user });
    let orders = ordersDetails[0].orders.slice().reverse();
    let orderId1 = orders[0]._id;
    let orderId = "" + orderId1;

    userHelpers.changePaymentStatus(req.session.user, orderId).then(() => {
      res.json({ status: true });
    });
  },
  verifyCoupon:(req,res)=>{
    try{
      let couponName=req.body.coupon
      couponHelpers.verifyCoupon(couponName,req.session.user).then((response)=>{
        res.json(response)
      })
    }catch(error){

    }
  },
  checkCoupon:(req,res)=>{
    try{
      let couponCheck = req.body.couponCheck
      couponHelpers.checkCoupon(couponCheck,req.session.user).then((response)=>{
        res.json(response)
      })
    }catch(error){

    }
  },
  applyCoupon:async(req,res)=>{
    try{
   
      let couponName= req.body.couponName
      let total = await userHelpers.getTotalCount(req.session.user._id)
      console.log(total,"kk");
      couponHelpers.applyCoupon(couponName,req.session.user,total).then((response)=>{
        couponPrice = response.discountAmount
        res.json(response)
      })
    }catch(error){

    }
  },
  returnProduct:(req,res)=>{
    try{
      let obj={
        proid:req.body.proId,
        orderId:req.body.orderId
      }
      userHelpers.returnProduct(obj,req.session.user).then((response)=>{
        res.json(response)
      })
    }catch(error){

    }
  }
};
