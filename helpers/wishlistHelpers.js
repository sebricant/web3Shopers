const { response } = require("../app");
const db = require("../model/connection");
const userHelpers = require("./userHelpers");
const cartHelpers = require("./cartHelpers")
var objectId = require("mongodb").ObjectId;

module.exports = {
  addtoWishList: (req, res) => {
    let proid = req.params.id;
    let userId = req.session.user._id;
    prodobj = {
      item: proid,
    };
    return new Promise(async (resolve, reject) => {
      let userWishlist = await db.wishList.findOne({ user: userId });
      if (userWishlist) {
        db.wishList
          .updateOne(
            { user: userId },
            {
              $push: {
                wishListProducts: { item: proid },
              },
            }
          )
          .then(() => {
            resolve();
            res.send({ status: true });
          });
      } else {
        wishobj = {
          user: userId,
          wishListProducts: [prodobj],
        };
        console.log(wishobj);
        let data = await db.wishList(wishobj);
        data.save((err, data) => {
          if (err) {
            console.log(err);
          } else {
            resolve(data);
            res.send({ status: true });
          }
        });
        console.log(data);
      }
    });
  },
  wishListPage: async (req, res) => {
    let userId = req.session.user._id;
    let products = await userHelpers.getWishlistProducts(userId);
    let cartCount = await userHelpers.getCartCount(userId);
    let cartProduct = await cartHelpers.getCartProducts(userId);
    res.render("users/shopWishlist", {
      products,
      layout: "layout",
      cartCount,
      cartProduct,
      wishlist: true,
      user: userId,
    });
  },
  doDeleteproductFromWishlist: async (data, proId, userId) => {
    return new Promise(async (resolve, reject) => {
      console.log(data, "dodeleteproductwishlist in wishlistHelpers");
      db.wishList
        .updateOne(
          { _id: data.wishlistId },
          {
            $pull: {
              wishListProducts: { item: objectId(proId) },
            },
          }
        )
        .then((result) => {
          console.log(result, "wish");
          resolve(result);
        });
    });
  },
  getWishlistProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let WishListItems = await db.wishList.aggregate([
        {
          $match: { user: userId },
        },
        {
          $unwind: "$wishListProducts",
        },
        {
          $project: {
            item: "$wishListProducts.item",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "item",
            foreignField: "_id",
            as: "WishListItems",
          },
        },
        {
          $project: {
            item: 1,
            quantity: 1,
            products: { $arrayElemAt: ["$WishListItems", 0] },
          },
        },
      ]);
      resolve(WishListItems);
    });
  },
  wishlistCount: (userId) => {
    return new Promise((resolve, reject) => {
      try {
        let wishlistCount = 0;
        db.wishList.find({ user: userId }).then((wishlist) => {
          console.log(wishlist, "wishlist=>");
          wishlistCount = wishlist[0]?.wishListProducts?.length;
          console.log(wishlistCount, "wishlist=>");
          resolve(wishlistCount);
        });
      } catch (err) {
        console.log(err);
      }
    });
  },
};
