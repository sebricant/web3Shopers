
// required all the neccessary helpers and declared admin login and password.

const userHelpers = require("../helpers/userHelpers");
const sales = require('../helpers/salesHelpers')
var adminEmail = "admin@gmail.com";
var adminPassword = "123";
const chartHelpers=require("../helpers/chartHelpers");
const productHelpers = require("../helpers/productHelpers");
const db = require("../model/connection");
const categoryHelpers = require("../helpers/categoryHelpers"); 
const couponHelpers = require('../helpers/couponHelpers');
const bannerHelpers = require("../helpers/bannerHelpers");
const orderHelpers = require("../helpers/orderHelpers");
const voucherCodes = require('voucher-code-generator');

module.exports = {

  // rendering admin login page.

  adminLogin: (req, res) => {
    res.render("admin/login", { layout: "adminLayout" });
  },
  // checking login and password.

  postLogin: (req, res) => {
    const { email, password } = req.body;
    if (email == adminEmail && password == adminPassword) {
      req.session.adminLogin = true;
      res.send({ value: "success" });
    } else {
      res.send({ value: "failed" });
    }
  },
  // rendering admin Dashboard and passing required data's to frontend.

  adminDashboard: async (req, res) => {
    let category = await categoryHelpers.allCategory();
    let products = await productHelpers.allProducts();
    let orders = await orderHelpers.allOrders();
    let monthly = await sales.monthlySales()
    res.render("admin/dashboard", {
      layout: "adminLayout",
      sidebar: true,
      header: false,
      category,
      products,
      orders,
      monthly,
    });
  },

  // rendering admin Addproduct page.

  adminAddProduct: async (req, res) => {
    let category = await categoryHelpers.allCategory();
    res.render("admin/addProduct", {
      layout: "adminLayout",
      sidebar: true,
      header: true,
      category,
    });
  },

  // rendering admin add Category page.

  adminAddCategory: (req, res) => {
    res.render("admin/addCategory", {
      layout: "adminLayout",
      sidebar: true,
      header: true,
    });
  },
 
  // rendering admin product management page and passing required data's.

  adminProductMgt: async (req, res) => {
    let data = req.query;
    let products = await productHelpers.allProducts(data);
    res.render("admin/productMgt", {
      layout: "adminLayout",
      sidebar: true,
      header: true,
      products,
    });
  },

  //rending admin order Management page and passing order details. 

  AdminorderMgt: async (req, res) => {
    userHelpers.adminorderdetails().then((orders) => {
      res.render("admin/orderMgt", {
        layout: "adminLayout",
        sidebar: true,
        header: true,
        orders,
      });
    });
  },

  // renderin order Details page and passing individual order details data.

  adminOrderDetails: (req, res) => {
    try {
      orderHelpers
        .adminOrderDetails(req.session.user._id, req.params.id)
        .then((orders) => {
          res.render("admin/orderDetails", {
            layout: "adminLayout",
            orders,
            sidebar: true,
            header: true,
          });
        });
    } catch (error){}
  },

  // updating order status.

  updateOrderStatus: (req, res) => {
   
    userHelpers.updateOrderStatus(req.body, req.session.user).then(() => {
      res.json({ status: true });
    });
  },
   
  // rendering admin category Management page and passing category data's.

  adminCategoryMgt: async (req, res) => {
    let category = await categoryHelpers.allCategory();
    res.render("admin/categoryMgt", {
      layout: "adminLayout",
      sidebar: true,
      header: true,
      category,
    });
  },

  // delete admin category.

  adminDeleteCategory: (req, res) => {
    let catId = req.params.id;
    // console.log(catId);
    categoryHelpers.DeleteCategory(catId).then((response) => {
      if (response) {
        res.send({ value: "success" });
      } else {
        res.send({ value: "failed" });
      }
    });
  },

  // sending add product data's.

  PostadminAddProduct: async (req, res) => {
    // console.log(req);
    // let data=await db.product(req.body)
    // data.save()
    res.send({ staus: true });
  },

  // admin logout .

  adminDoLogout: (req, res) => {
    // console.log("lkjfklasdjfklasdjfalksj");
    req.session.adminLogin = false;
    res.redirect("/admin/login");
  },

  // admin add product and redirecting to product mgt page.

  addProducts: (req, res) => {
    // console.log(req.body);
    const files = req.files;
    const fileName = files.map((file) => {
      return file.filename;
    });

    const product = req.body;
    product.Image = fileName;

    productHelpers.addProducts(product).then((reponse) => {
      res.redirect("/admin/productMgt");
    });
  },

  // sending add category data.

  postAddCategory: (req, res) => {
    const name = req.body.name;
    const category = {
      name: name,
    };

    categoryHelpers.addcategory(category).then((response) => {
      res.redirect("/admin/categoryMgt");
    });
  },

  // rendering edit product page and passing data.

  doEditProduct: async (req, res) => {
    let newProduct = await productHelpers.getProduct(req.params.id);
    let category = await categoryHelpers.allCategory();
    res.render("admin/editProduct", {
      layout: "adminLayout",
      sidebar: true,
      newProduct,
      category,
    });
  },

  // editing product details 

  adminEditProducts: async (req, res) => {
    // console.log(req.body, "edit product");
    try {
      //converts string to array
      let index = req.body.IndexOfImage.srsit(",").map(function (item) {
        return parseInt(item, 10);
      });
      //remove duplicate values in array
      index = index.filter((item, i) => index.indexOf(item) == i);

      const files = req.files
      const fileName = files?.map((file) => {
        return file.filename
      });
      // console.log(index, "this is my index array");
      // console.log(fileName, "this is my new files name");

      let prodata = await productHelpers.getProduct(req.params.id);
      var Image = prodata.Image
      for (i = 0; i < index.length; i++) {
        Image[index[i]] = fileName[i];
      }

      console.log(Image, "this is my image data of array");
      const product = req.body
      product.Image = Image
      // console.log(product, prodata, "product before and agter");

      productHelpers
        .adminEditProducts(req.params.id, product)
        .then(() => {
          res.redirect("/admin/productMgt");
        })
        .catch((error) => {
          res.render("error", { errmessage: error.message });
        });
    } catch (error) {
      res.render("error", { errmessage: error.message });
    }
  },

  // rendering edit category page.

  doEditCategory: async (req, res) => {
    let newcategory = await categoryHelpers.getCategory(req.params.id);
    res.render("admin/editCategory", {
      layout: "adminLayout",
      sidebar: true,
      newcategory,
    });
  },

  // edit category data passing.

  adminEditCategory: async (req, res) => {
    categoryHelpers.admineditCategory(req.params.id, req.body).then(() => {
      res.redirect("/admin/categoryMgt");
    });
  },

  // deleting product.

  adminDeleteProduct: (req, res) => {
    let proId = req.params.id;
    // console.log(proId);
    productHelpers.DeleteProduct(proId).then((response) => {
      if (response) {
        res.send({ value: "success" });
      } else {
        res.send({ value: "failed" });
      }
    });
  },

  // rendering user Management page and checking session.

  douser: (req, res) => {
    if (req.session.adminLogin) {
      userHelpers.getuser().then((users) => {
        res.render("admin/userMgt", {
          layout: "adminLayout",
          sidebar: true,
          users: users,
          header: true,
        });
      });
    }
  },

  // blocking user.

  getBlockUser: function (req, res) {
    let userId = req.params.id;
    userHelpers.doBlockUser(userId).then(() => {
      res.redirect("/admin/userMgt");
    });
  },

  //unblocking user. 

  getUnBlockUser: function (req, res) {
    let userId = req.params.id;
    userHelpers.doUnblockUser(userId).then(() => {
      res.redirect("/admin/userMgt");
    });
  },

  // generating coupon code.

  getCoupenCode:async(req,res)=>{
    try{
      let couponCode= await voucherCodes.generate({
        prefix:'web3Shop-',
        length:5,
        count:1
      })
      res.send({couponCode})
    }catch(error){
      console.log(error)
    }
  },

  // rendering coupon Mgt page.

  getcouponMgt: async(req,res)=>{
    try{
      let admin = req.admin
      let couponData = await db.coupon.find({})
      res.render('admin/couponMgt',{layout:"adminLayout",  
      admin,
      couponData,
      sidebar: true,})
    }catch(error){
      console.log(error);
    }
  },

  // rendering add coupon page.

  getaddCoupon:(req,res)=>{
    try{
      let admin= req.admin;
      res.render("admin/addCoupon",{admin,layout:"adminLayout", sidebar: true, })
    }catch(error){
      console.log(error);
    }
  },

  // sending add coupon data.

  postaddCoupon:(req,res)=>{
    // console.log("khgfghj");
    try{
      let obj={
        coupon:req.body.coupon,
        discountType:req.body.discountType,
        cappedAmount:req.body.cappedAmount,
        amount:req.body.discountAmount,
        amountValidity:req.body.amountValidity,
        percentage:req.body.discountPercentage,
        validity:req.body.validity,
        description:req.body.description,
        redeemTime:req.body.redeemTime
      }
      // console.log("obj",obj);
      couponHelpers.addCoupon(obj).then((response)=>{
        res.json(response)
      }).catch(error=>console.log(error))
    }catch(error){
      console.log(error);
    }
  },

  // rendering banner Management page.

  banner:(req,res)=>{
    res.render("admin/bannerMgt",{
      layout:'adminLayout',
      sidebar:true,
    })
  },

  // rendering banner Management page.

  bannerMgt:(req,res)=>{
    bannerHelpers.banner().then((banner)=>{
      res.render('admin/bannerMgt',{
        layout:"adminLayout",
        sidebar:true,
        banner})
    })
  },
  
  // renderring add banner page.

  addBanner:(req,res)=>{
    categoryHelpers.getcategory().then((categories) => {
    res.render('admin/addBanner',{  layout:"adminLayout",categories,
    sidebar:true,})
  })
  },

  // rendering add banner data.

  addBannerPost:(req,res)=>{

    const files = req.files;
    const fileName = files.map((file) => {
      return file.filename;
    })
    const banner = req.body
    banner.Image = fileName
    
    bannerHelpers.addBanner(banner).then((insertedId)=>{
      res.redirect("/admin/banner")
    })
    },

    // rendering all banner list and details.

    bannerList:async(req,res)=>{
      let banner = await bannerHelpers.getAllBanners()
      res.render("admin/bannerList",{
        layout:"adminLayout",
        sidebar:true,
        banner
      })
    },

    // deleting banner.

    deleteBanner:(req,res)=>{
    let bannerId = req.params.id
    console.log(bannerId,'bannerId');
    bannerHelpers.deleteBanner(bannerId).then((response)=>{
      res.redirect('/admin/bannerList')
    })
    },

    // editing banner page.

    editBannerPage:(req,res)=>{
      bannerHelpers.editBanner(req.params.id).then((data)=>{
        res.render('admin/editBanner',{
          layout:'adminLayout',
          sidebar:true,
          data,
        })
      })
    },

    // rendering category banner page.

    getCatagoryBanner:async(req,res)=>{
      let catagoryBanner = await productHelpers.getCatagoryBanner()
      // console.log(catagoryBanner,'categoryBanner');
      res.render('admin/categoryBanner',{
        layout:'adminLayout',
        sidebar:true,
        catagoryBanner
      })
    },

    //rendering add category banner page. 

    addCategoryBanner:async(req,res)=>{
      let category = await categoryHelpers.allCategory();
      res.render('admin/addCategoryBanner',{
        layout:'adminLayout',
        sidebar:true,
        category
      })
    },

    // sending add category banner data.

    addCategoryBannerPost:(req,res)=>{
      const files = req.files;
      const fileName = files.map((file) => {
        return file.filename;
      })
      const Catbanner = req.body
      // console.log(Catbanner,"data")
      Catbanner.Image = fileName
      productHelpers.addCategoryBanner(Catbanner).then((category)=>{
        res.redirect('/admin/categoryBanner')
      })
    },

    // deleting category banner.

    deleteCategoryBanner:(req,res)=>{
      // console.log("idhihi",req.params.id);
      try {
        productHelpers.deleteCategoryBanner(req.params.id).then((response)=>{
          res.redirect('/admin/categoryBanner')
        }) 
      } catch (error) {
        console.log(error);
      }
  },

  // revenue GraphMonthly data.

  revenueGraphMonth: async (req, res) => {
   
    try {
        
        let ReturnGraphMonth = await chartHelpers.ReturnGraphMonth()
        let RevenueByDay = await sales.getRevenueByDay()
        let monthlyDelivery = await chartHelpers.deliveryGraphMonth()
        chartHelpers.revenueGraphMonthnew().then((priceStat) => {
            res.send({
              monthlyDelivery,ReturnGraphMonth, priceStat, RevenueByDay

            })
        })
    } catch (err) {
        console.log(err)
    }
},


  // generateSalesReport

generateSalesReport: async (req, res) => {
    let yearly = await sales.yearlySales()
    let monthly = await sales.monthlySales()
    let daily = await sales.dailySales()
    let monthWise = await sales.monthWiseSales()
    console.log(monthly,"monthly data")
    console.log(yearly,"yearly data")
    res.render('admin/salesReport', {layout:"adminLayout", sidebar: true, monthly, yearly, daily, monthWise })
}
,
    //generateReportPDF

generateReportPDF: (req, res) => {
    sales.monthlySales().then((response) => {
        res.send(response)
    })
},

};
