const db = require("../model/connection");
var objectId = require("mongodb").ObjectId;

module.exports = {
  addtoCart: (proid, userId
    ) => {
    prodobj = {
      item: proid,
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db.cart.findOne({ user: userId });
      if (userCart) {
        let proExist = userCart.cartproducts.findIndex(
          (cartproducts) => cartproducts.item == proid
        );
        // console.log(proExist);
        if (proExist != -1) {
          db.cart
            .updateOne(
              { user: userId, "cartproducts.item": proid },
              {
                $inc: { "cartproducts.$.quantity": 1 },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          db.cart
            .updateOne({ user: userId }, { $push: { cartproducts: prodobj } })
            .then((response) => {
              resolve();
            });
        }
      } else {
        cartObj = {
          user: userId,
          cartproducts: [prodobj],
        };
        // console.log(cartObj);
        let data = await db.cart(cartObj);
        data.save((err, data) => {
          if (err) {
            console.log(err);
          } else {
            resolve(data);
          }
        });
        // console.log(data);
      }
    });
  },
  doChangeProductQuantity: async (details) => {
    // console.log(details,'dataa');
    details.count = parseInt(details.count);
    return new Promise((resolve, reject) => {
        try {
          if (details.count == -1 && details.quantity == 1) {
            db.cart
              .updateOne(
                { _id: details.cart },
                {
                  $pull: { cartproducts: { item: details.product } },
                }
              )
              .then((response) => {
                // console.log(response);
                resolve({ removeProduct: true });
              });
          } else {
            db.cart
              .updateOne(
                { _id: details.cart, "cartproducts.item": details.product },
                {
                  $inc: { "cartproducts.$.quantity": details.count },
                }
              )
              .then((response) => {
                // console.log(response,"art respose");
  
                resolve({ status: true });
              });
          }
        } catch (error) {
          console.log(error);
        }
      });
  },
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db.cart.aggregate([
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
            products: { $arrayElemAt: ["$cartItems", 0] },
          },
        },
      ]);
      resolve(cartItems);
    });
  },

  doDeleteproductFromCart: async (data, proId, userId) => {
    return new Promise(async (resolve, reject) => {
      console.log(data);
      db.cart
        .updateOne(
          { _id: data.cart },
          {
            $pull: {
              cartproducts: { item: objectId(proId) },
            },
          }
        )
        .then((result) => {
          resolve(result)
        });
    });
  },
  autofill:(userId,addressId)=>{
    return new Promise((resolve, reject) => {
      // console.log("userId",userId,"addressId",addressId);
      db.address.aggregate([
        {
          $match:{userId:objectId(userId)},
      },
      {
        $unwind:"$address"
      },
      {
        $match:{"address._id":objectId(addressId)},
      }
      ]).then((data)=>{
        // console.log(data,"final data");
        resolve(data)
      });
    });
  }
};
