const db = require("../model/connection");

// let arr = [];/
module.exports = {
  revenueGraphMonthnew: () => {
    return new Promise(async (resolve, reject) => {
      let arr = [];
      for (let i = 0; i < 12; i++) {
        let price = await db.orders.aggregate([
          {
            $unwind: "$orders",
          },
          {
            $unwind: "$orders.productDetails",
          },
          // {
          //     '$match': { 'orders.productDetails.orderStatus': 'Delivered' }
          // },
          {
            $match: {
              $expr: {
                $eq: [
                  {
                    $month: "$orders.createdAt",
                  },
                  i + 1,
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$orders.totalPrice" },
            },
          },
        ]);

        arr[i + 1] = price[0]?.total;
      }
      for (i = 0; i < arr.length; i++) {
        if (arr[i] == undefined) {
          arr[i] = 0;
        } else {
          arr[i];
        }
      }
      resolve(arr);
    });
  },
  deliveryGraphMonth: () => {
    return new Promise(async (resolve, reject) => {
      let arr = [];
      for (let i = 0; i < 12; i++) {
        let price = await db.orders.aggregate([
          {
            $unwind: "$orders",
          },
          {
            $unwind: "$orders.productDetails",
          },
          {
            $match: { "orders.productDetails.orderStatus": "Delivered" },
          },
          {
            $match: {
              $expr: {
                $eq: [
                  {
                    $month: "$orders.createdAt",
                  },
                  i + 1,
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$orders.totalPrice" },
            },
          },
        ]);

        arr[i + 1] = price[0]?.total;
      }
      for (i = 0; i < arr.length; i++) {
        if (arr[i] == undefined) {
          arr[i] = 0;
        } else {
          arr[i];
        }
      }

      resolve(arr);
    });
  },
  ReturnGraphMonth: () => {
    return new Promise(async (resolve, reject) => {
      let arr = [];
      for (let i = 0; i < 12; i++) {
        let price = await db.orders.aggregate([
          {
            $unwind: "$orders",
          },
          {
            $unwind: "$orders.productDetails",
          },
          {
            $match: { "orders.productDetails.orderStatus": "Returned" },
          },
          {
            $match: {
              $expr: {
                $eq: [
                  {
                    $month: "$orders.createdAt",
                  },
                  i + 1,
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$orders.totalPrice" },
            },
          },
        ]);

        arr[i + 1] = price[0]?.total;
      }
      for (i = 0; i < arr.length; i++) {
        if (arr[i] == undefined) {
          arr[i] = 0;
        } else {
          arr[i];
        }
      }

      resolve(arr);
    });
  },


  continentSort: () => {
    return new Promise(async (resolve, reject) => {
      let conSort = await db.orders.aggregate([
        {
          $unwind: "$orders",
        },
        {
          $unwind: "$orders.shippingAddress",
        },
        {
          $group: {
            _id: "$orders.country",
            total: { $sum: "$orders.totalPrice" },
          },
        },
      ]);
      resolve(data);
    });
  },

  
};
