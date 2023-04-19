let db = require("../model/connection");
var ObjectId = require("mongodb").ObjectId;

module.exports = {
  getCheckOutData: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let total = await db.cart.aggregate([
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
              as: "productInfo",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              products: { $arrayElemAt: ["$productInfo", 0] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$quantity", "$cartproducts.price"] } },
              
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
            $addFields: {
              price: { $toInt: "$cartItems.price" },
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: 1,
              stotal: {
                $multiply: ["$quantity", "$product.price"],
              },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$stotal" },
            },
          },
        ]);
        resolve(total[0]);
        console.log(res,"ress");
      } catch (error) {}
    });
  },
  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const total = await db.cart.aggregate([
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
            $addFields: {
              price: { $toInt: "$cartItems.price" },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$quantity", "$product.price"] } },
            },
          },
        ]);
        console.log(total[0]?.total, "hello testing");
        resolve(total[0]?.total);
      } catch (error) {
        console.log(error);
      }
    });
  },
  adminOrderDetails: (userId, orderId) => {
    return new Promise(async(resolve, reject) => {
      try {
        let data = await db.orders.aggregate([
          {
            $unwind: "$orders",
          },
          {
            $unwind: "$orders.productDetails",
          },
          {
            $match: { "orders._id": ObjectId(orderId) },
          },
        ])
        console.log(data,"dataaaa");
            resolve(data)
     
    }catch(error){
        reject({error:"Unauthorized Action"})
    }
    });
  },
  userOrderDetails: (userId, orderId) => {
    return new Promise(async(resolve, reject) => {
      try {
        let data = await db.orders.aggregate([
          {
            $unwind: "$orders",
          },
          {
            $unwind: "$orders.productDetails",
          },
          {
            $match: { "orders._id": ObjectId(orderId) },
          },
        ])
        console.log(data,"dataaaa");
            resolve(data)
     
    }catch(error){
        reject({error:"Unauthorized Action"})
    }
    });
  },
  allOrders: () => {
    return new Promise(async (resolve, reject) => {
      let newOrders = await db.orders.find({});
      resolve(newOrders);
    });
  },
};
