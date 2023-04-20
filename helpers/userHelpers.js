const db = require("../model/connection");
let bcrypt = require("bcrypt");
const { Promise } = require("mongoose"); 
const ObjectId = require("mongodb").ObjectId;
const Razorpay = require("razorpay"); 

var instance = new Razorpay({
  key_id: "rzp_test_WHk8zzOMe9J9Pz",
  key_secret: "lQfZJjBkAjWDW2Lpo1eT5KlO",
});

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      db.users.find({ email: userData.email }).then(async (data) => {
        let response = {};
        if (data.length != 0) {
          resolve({ status: false });
        } else {
          userData.password = await bcrypt.hash(userData.password, 10);
          console.log(userData.password);
          let data = db.users(userData);
          console.log(data);
          data.save();
          response.value = userData;
          response.status = true;
          response.data = data.insertId;
          resolve(response);
        }
      });
    });
  },
  loginPost: (userData) => {
    return new Promise(async (resolve, reject) => {
      console.log(userData);
      let user = await db.users.findOne({ email: userData.email });
      let response = {};

      if (user && !user.isBlocked) {
        bcrypt.compare(userData.password, user.password).then((logTrue) => {
          if (logTrue) {
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("Login failed password");
            resolve({ status: false });
          }
        });
      } else {
        console.log("Login failed email");
        resolve({ status: false });
      }
    });
  },
  numberCheck: (userData) => {
    return new Promise(async (resolve, reject) => {
      let verifyNumber = await db.users.findOne({ mobile: number });
      let response = {};
      if (verifyNumber) {
      }
    });
  },
  getuser: () => {
    return new Promise(async (resolve, reject) => {
      let user = await db.users.find({});
      resolve(user);
    });
  },
  doBlockUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.users
        .updateOne(
          { _id: userId },
          {
            $set: {
              isBlocked: true,
            },
          }
        )
        .then((d) => {
          resolve();
        });
    });
  },
  doUnblockUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.users
        .updateOne(
          { _id: userId },
          {
            $set: {
              isBlocked: false,
            },
          }
        )
        .then((f) => {
          resolve();
        });
    });
  },
  getAddress: (userid) => {
    return new Promise((resolve, reject) => {
      db.address
        .aggregate([
          { $match: { userId: ObjectId(userid) } },
          { $unwind: "$address" },
          { $project: { address: 1, _id: 0 } },
        ])
        .then((result) => {
          resolve(result);
        });
    }).catch((err) => {
      console.log(err);
    });
  },
  addNewAddress: (formData, userId) => {
    return new Promise(async (resolve, reject) => {
      await db.users
        .updateOne(
          { _id: ObjectId(userId) },
          {
            $addToSet: {
              address: formData,
            },
          },
          { $upsert: true }
        )
        .then((data) => {
          resolve(data);
        });
    });
  },
  addressDetails: (userId) => {
    return new Promise(async (resolve, reject) => {
      await db.address.findOne({ userId: userId }).then((address) => {
        resolve(address);
      });
    });
  },
  placeOrder: (order, total, userId, couponPrice) => {
    return new Promise(async (resolve, reject) => {
      try {
        let products = await db.cart.aggregate([
          {
            $match: { user: ObjectId(userId) },
          },
          {
            $unwind: "$cartproducts",
          },
          {
            $project: {
              item: "$cartproducts.item",
              quantity: "$cartproducts.quantity",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "item",
              foreignField: "_id",
              as: "cartproductsIn",
            },
          },
          {
            $unwind: "$cartproductsIn",
          },
          {
            $set: { cartproductsIn: { status: true } },
          },
          {
            $project: {
              _id: "$cartproductsIn._id",
              quantity: 1,
              productsName: "$cartproductsIn.name",
              productsPrice: "$cartproductsIn.price",
              status: "$cartproductsIn.status",
              stock: "$cartproductsIn.stock",
              orderStatus: "Processing",
              Image: "$cartproductsIn.Image",
            },
          },
        ]);
        console.log(products, "test1");
        //TOTAL QUANTITY
        let totalQuantity = 0;
        for (let i = 0; i < products.length; i++) {
          totalQuantity += products[i].quantity;
        }
        console.log(totalQuantity, "jjjjjjjjjjjjjjjjj");
        console.log(order.number, "nunmbers");
        let Address = {
          fname: order.fname,
          lname: order.lname,
          country: order.country,
          address: order.address,
          landmark: order.landmark,
          town: order.town,
          state: order.state,
          postcode: order.postcode,
          number: order.number,
          email: order.email,
        };

        let addressObj = {
          userId: userId,
          address: Address,
        };

        let addressExist = await db.address.findOne({ userId: userId });
        if (addressExist) {
          db.address
            .find({
              "address.town": order.town,
              "address.pincode": order.postcode,
            })
            .then(async (res) => {
              if (res.length == 0) {
                db.address
                  .updateOne(
                    { userId: userId },
                    {
                      $push: {
                        address: Address,
                      },
                    }
                  )
                  .then((data) => {
                    resolve();
                  });
              }
            });
        } else {
          db.address(addressObj)
            .save()
            .then((adds) => {
              console.log("adds", adds);
              resolve();
            });
        }
        //Inventory
        for (let i = 0; i < products.length; i++) {
          db.product
            .updateOne(
              {
                _id: products[i]._id,
              },
              {
                $inc: { stock: -products[i].quantity },
              }
            )
            .then((res) => {
              console.log(res, "ttttttttttttttttt");
            });
        }
        //orders

        let orderAddress = {
          address: order.address,
          landmark: order.landmark,
          town: order.town,
          country: order.country,
          postcode: order.postcode,
          mobile: order.number,
          email: order.email,
        };

        let orderdata = {
          userId: userId,
          fname: order.fname,
          lname: order.lname,
          mobile: order.number,
          paymentMethod: order.paymentMethod,
          payment: order.paymentStatus,
          productDetails: products,
          totalPrice: total,
          totalQuantity: totalQuantity,
          shippingAddress: orderAddress,
          couponDiscount: couponPrice,
          couponName: order.couponName,
        };
        orderObj = {
          userId: userId,
          orders: orderdata,
        };
        let orderExist = await db.orders.findOne({ userId: userId });
        if (orderExist) {
          db.orders
            .updateOne(
              {
                userId: userId,
              },
              {
                $push: { orders: orderdata },
              }
            )
            .then((order) => {
              console.log(order);
              resolve({ order: "success" });
            });
        } else {
          let saveOrder = await db.orders(orderObj);
          await saveOrder.save();
        }
        let userData = await db.users.find({
          _id: order.userId,
          "coupon.name": order.couponName,
        });
        let couponIndex = await userData[0]?.coupon.findIndex(
          (dataFind) => dataFind.name == order.couponName
        );
        if (couponIndex >= 0) {
          let dbuserCoupenUpdate = await db.users.updateOne(
            { _id: order.userId, "coupon.name": order.couponName },
            {
              $set: {
                ["coupon." + couponIndex + ".purchased"]: true,
              },
            }
          );
          let dbCoupencount = await db.coupon.updateOne(
            { coupon: order.couponName },
            {
              $inc: {
                usageValidity: -1,
              },
            }
          );
        }
        db.cart.deleteMany({ user: userId }).then((response) => {
          resolve({ order: "success" });
        });
      } catch (err) {
        console.log(err);
      }
    });
  },
  orderdetails: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.orders
          .aggregate([
            {
              $unwind: "$orders",
            },
            {
              $match: { userId: userId },
            },
            {
              $sort: { "orders.createdAt": -1 },
            },
          ])
          .then((order) => {
            resolve(order);
          });
      } catch (err) {
        console.log(err);
      }
    });
  },
  adminorderdetails: () => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.orders
          .aggregate([
            {
              $unwind: "$orders",
            },
            {
              $sort: { "orders.createdAt": -1 },
            },
          ])
          .then((order) => {
            resolve(order);
          });
      } catch (err) {
        console.log(err);
      }
    });
  },

  cancelOrder: (data, userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let order = await db.orders.find({ "orders._id": data.orderId });
        if (order) {
          let orderIndex = order[0].orders.findIndex(
            (order) => order._id == data.orderId
          );
          let productIndex = order[0].orders[
            orderIndex
          ].productDetails.findIndex((product) => product._id == data.proId);
          console.log(orderIndex, productIndex, "my index");
          db.orders
            .updateOne(
              { "orders._id": data.orderId },
              {
                $set: {
                  ["orders." +
                  orderIndex +
                  ".productDetails." +
                  productIndex +
                  ".orderStatus"]: "Canceled",
                  ["orders." + orderIndex + ".status"]: false,
                },
              }
            )
            .then((data) => {
              console.log(data, "my update status");
              let quantity =
                order[0].orders[orderIndex].productDetails[productIndex]
                  .quantity;
              db.product
                .updateOne(
                  {
                    _id: data.proId,
                  },
                  {
                    $inc: { stock: quantity },
                  }
                )
                .then((e) => {
                  resolve({ status: true });
                });
            });
        }
      } catch (err) {
        console.log(err);
      }
    });
  },
  returnProduct: (data, userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let order = await db.orders.find({ userId: userId });
        console.log(order, "orderss");
        if (order) {
          let orderIndex = order[0].orders.findIndex(
            (order) => order._id == data.orderId
          );
          let productIndex = order[0].orders[
            orderIndex
          ].productDetails.findIndex((product) => product._id == data.proId);
          await db.orders.updateOne(
            {
              userId: userId,
            },
            {
              $set: {
                [`orders.${orderIndex}.productDetails.${productIndex}.orderStatus`]: "Returned",
                [`orders.${orderIndex}.productDetails.${productIndex}.status`]: false,
              },
            }
          );
          console.log(order, "orderss");
          db.orders
            .aggregate([
              {
                $match: { "orders._id": ObjectId(data.orderId) },
              },
              {
                $unwind: "$orders",
              }, 
              {
                $unwind: "$orders.productDetails",
              },
              {
                $match: {
                  $and: [
                    {
                      "orders._id": ObjectId(data.orderId),
                      "orders.productDetails._id": ObjectId(data.proId),
                    },
                  ],
                },
              },
            ])
            .then((aggrData) => {
              console.log(data, "dataaaa");
              console.log(aggrData, "agrdta");
              let priceToWallet = {
                price: 0,
              };
              let totalPrice =
                aggrData[0].orders.productDetails.price *
                aggrData[0].orders.productDetails.quantity;
              console.log(totalPrice, "total price");
              if (aggrData[0].orders.totalPrice - totalPrice < 0) {
                priceToWallet.price = aggrData[0].orders.totalPrice;
              } else {
                priceToWallet.price = totalPrice;
              }

              db.product
                .updateOne(
                  { _id: data.proId },
                  {
                    $inc: { stock: aggrData[0].orders.productDetails.quantity },
                  }
                )
                .then((e) => {
                  console.log(e, "this One");
                });
              db.users
                .updateOne(
                  {
                    _id: userId,
                  },
                  {
                    $inc: {
                      wallet: parseInt(priceToWallet.price),
                    },
                  }
                )
                .then((e) => {
                  console.log(e, "wall");
                  resolve({ status: true });
                });
            });
        } else {
          resolve({ status: false });
        }
      } catch (err) {
        console.log(err);
      }
    });
  },
  updateOrderStatus: (data, userId) => {
    console.log(data, "test202");
    return new Promise(async (resolve, reject) => {
      try {
        let status = data.value;
        let order = await db.orders.find({ "orders._id": data.orderId });
        if (order) {
          let orderIndex = order[0].orders.findIndex(
            (order) => order._id == data.orderId
          );
          let productIndex = order[0].orders[
            orderIndex
          ].productDetails.findIndex((product) => product._id == data.proId);
          console.log(orderIndex, productIndex, "my index");
          db.orders
            .updateOne(
              { "orders._id": data.orderId },
              {
                $set: {
                  ["orders." +
                  orderIndex +
                  ".productDetails." +
                  productIndex +
                  ".orderStatus"]: status,
                },
              }
            )
            .then((data) => {
              console.log(data, "my update status");
              let quantity =
                order[0].orders[orderIndex].productDetails[productIndex]
                  .quantity;
              db.product
                .updateOne(
                  {
                    _id: data.proId,
                  },
                  {
                    $inc: { stock: quantity },
                  }
                )
                .then((e) => {
                  resolve({ status: true });
                });
            });
        }
      } catch (err) {
        console.log(err);
      }
    });
  },
  getCartCount: (userId) => {
    return new Promise((resolve, reject) => {
      try {
        let cartCount = 0;
        db.cart.find({ user: userId }).then((cart) => {
          console.log(cart, "cart=>");
          for (i = 0; i < cart[0]?.cartproducts?.length; i++) {
            cartCount += cart[0]?.cartproducts[i]?.quantity;
          }
          console.log(cartCount, "count=>");
          resolve(cartCount);
        });
      } catch (err) {
        console.log(err);
      }
    });
  },
  getSingleAddress: (addrId, userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let address = await db.address
          .aggregate([
            {
              $match: { userId: userId },
            },
            {
              $unwind: "$address",
            },
            {
              $match: {
                "address._id": ObjectId(addrId),
              },
            },
          ])
          .then((data) => {
            resolve(data);
          });
      } catch (err) {
        console.log(err);
      }
    });
  },
  getWishlistProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let wishlistItems = await db.wishList.aggregate([
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
            as: "wishlistItems",
          },
        },
        {
          $project: {
            item: 1,
            products: { $arrayElemAt: ["$wishlistItems", 0] },
          },
        },
      ]);
      resolve(wishlistItems);
    });
  },
  generateRazorpay: async (total, userId) => {
    let orderData = await db.orders.find({ userId: ObjectId(userId) });
    let orders = orderData[0].orders.slice().reverse();
    let orderId = orders[0]._id;
    return new Promise((resolve, reject) => {
      try {
        total = total * 100;
        var options = {
          amount: total,
          currency: "INR",
          receipt: "" + orderId,
        };
        instance.orders.create(options, function (err, order) {
          console.log(order);
          resolve(order);
        });
      } catch (err) {
        console.log(err);
      }
    });
  },
  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      try {
        const crypto = require("crypto");
        let hmac = crypto.createHmac("sha256", "lQfZJjBkAjWDW2Lpo1eT5KlO");
        hmac.update(
          details["payment[razorpay_order_id]"] +
            "|" +
            details["payment[razorpay_payment_id]"]
        );
        hmac = hmac.digest("hex");
        if (hmac == details["payment[razorpay_signature]"]) {
          resolve();
        } else {
          reject("not match");
        }
      } catch (err) {
        console.log(err);
      }
    });
  },
  changePaymentStatus: (userId, orderId) => {
    console.log("orderId in userhelpers", orderId);
    return new Promise(async (resolve, reject) => {
      try {
        let order = await db.orders.find({ userId: userId });
        let orderIndex = order[0].orders.findIndex(
          (order) => order._id == orderId
        );
        db.orders
          .updateOne(
            {
              "orders._id": ObjectId(orderId),
            },
            {
              $set: {
                ["orders".orderIndex + ".paymentStatus"]: "PAID",
              },
            }
          )
          .then((data) => {
            resolve();
          });
      } catch (error) {
        console.log(err);
      }
    });
  },
  getTotalCount: (userId) => {
    return new Promise((resolve, reject) => {
      try {
        db.cart
          .aggregate([
            {
              $match: { user: userId },
            },
            {
              $unwind: "$cartproducts",
            },
            {
              $project: {
                item: "$cartproducts.item",
                quantity: "$cartproducts.quantity",
              },
            },
            {
              $lookup: {
                from: "products",
                localField: "item",
                foreignField: "_id",
                as: "cartItems",
              },
            },
            {
              $project: {
                item: 1,
                quantity: 1,
                product: { $arrayElemAt: ["$cartItems", 0] },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: { $multiply: ["$product.price", "$quantity"] } },
              },
            },
          ])
          .then((total) => {
            resolve(total[0]?.total);
          })
          .catch((error) => {
            console.log(error);
          });
      } catch (error) {
        console.log(error);
      }
    });
  },
};
