let db = require("../model/connection");

module.exports = {

    findUsers: () => {

        let users = db.users.find()
        console.log(users);

    },

    monthlySales: () => {
        let date = new Date()
        let thisMonth = date.getMonth()
        return new Promise((resolve, reject) => {
            try {
                db.orders.aggregate([
                    {
                        $unwind: '$orders'
                    },
                    {
                        $unwind: '$orders.productDetails'
                    },
                    // {
                    //     $match: { 'orders.productDetails.orderStatus': 'Delivered' }
                    // },
                    {
                        $match: {
                            $expr: {
                                $eq: [
                                    {
                                        $month: '$orders.createdAt'
                                    },
                                    thisMonth + 1
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$orders.totalPrice' },
                            orders: { $sum: '$orders.productDetails.quantity' },
                            totalOrders: { $sum: '$orders.totalQuantity' },
                            count: { $sum: 1 }

                        }
                    }
                ]).then((data) => {
                    // console.log(data,"data101");
                    resolve({ status: true, data: data })
                })
            } catch (err) {
                console.log(err);
            }
        })
    },



    dailySales: () => {
        let date = new Date()
        let thisDay = date.getDate()
// console.log(thisDay,"hh");
        return new Promise((resolve, reject) => {
            try {
                db.orders.aggregate([
                    {
                        $unwind: '$orders'
                    },
                    {
                        $unwind: '$orders.productDetails'
                    },
                    {
                        $match: { 'orders.productDetails.orderStatus': 'Delivered' }
                    },
                    {
                        $match: {
                            $expr: {
                                $eq: [
                                    {
                                        $dayOfMonth: '$orders.createdAt'
                                    },
                                    thisDay
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$orders.totalPrice' },
                            orders: { $sum: '$orders.totalQuantity' },
                            count: { $sum: 1 }
                        }
                    }
                ]).then((data) => {
                    // console.log(data,"dailydata on saleshelpers line 98");
                    resolve({ status: true, data: data })
                })
            } catch (err) {
                console.log(err);
            }
        })
    },



    yearlySales: () => {
        let date = new Date()
        let year = date.getFullYear()

        return new Promise((resolve, reject) => {
            try {
                db.orders.aggregate([
                    {
                        $unwind: '$orders'
                    },
                    {
                        $unwind: '$orders.productDetails'
                    },
                    {
                        $match: { 'orders.productDetails.orderStatus': 'Delivered' }
                    },
                    {
                        $match: {
                            $expr: {
                                $eq: [
                                    {
                                        $year: '$orders.createdAt'
                                    },
                                    year
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$orders.totalPrice' },
                            orders: { $sum: '$orders.totalQuantity' },
                            count: { $sum: 1 }
                        }
                    }
                ]).then((data) => {
                    resolve({ status: true, data: data })
                })
            } catch (err) {
                console.log(err);
            }
        })
    },


    monthWiseSales: () => {

        return new Promise(async (resolve, reject) => {
            try {
                let data = []
                for (let i = 0; i < 12; i++) {
                    await db.orders.aggregate([
                        {
                            $unwind: '$orders'
                        },
                        {
                            $unwind: '$orders.productDetails'
                        },
                        {
                            $match: { 'orders.productDetails.orderStatus': 'Delivered' }
                        },
                        {
                            $match: {
                                $expr: {
                                    $eq: [
                                        {
                                            $month: '$orders.createdAt'
                                        },
                                        i + 1
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: '$orders.totalPrice' },
                                orders: { $sum: '$orders.totalQuantity' },
                                count: { $sum: 1 }
                            }
                        }
                    ]).then((monthlyData) => {
                        data[i + 1] = monthlyData[0]
                    })
                }
                for (i = 0; i < 12; i++) {
                    if (data[i + 1] == undefined) {
                        data[i + 1] = {
                            total: 0,
                            orders: 0,
                            count: 0,
                        }
                    } else {
                        data[i]
                    }
                }
                resolve({ status: true, data: data })
            } catch (err) {
                console.log(err);
            }
        })
    },



    getRevenueByDay: () => {
        let date = new Date()
        let thisMonth = date.getMonth()
        let month = thisMonth + 1

        let year = date.getFullYear()


        return new Promise(async (resolve, reject) => {
            try {

                db.orders.aggregate([
                    {
                        $unwind: '$orders'
                    },
                    {
                        $unwind: '$orders.productDetails'
                    },
                    {
                        $match: {
                            'orders.createdAt': { $gt: new Date(`${year}-${month}-01`), $lt: new Date(`${year}-${month}-31`) }
                        }
                    },
                    {
                        $match: { 'orders.productDetails.orderStatus': 'Delivered' }
                    },
                    {
                        $group: {
                            _id: { '$dayOfMonth': '$orders.createdAt' },
                            total: { $sum: '$orders.totalPrice' },
                            orders: { $sum: '$orders.totalQuantity' },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $sort: {
                            'orders.createdAt': 1
                        }
                    }
                ]).then((data) => {
                    resolve({ data: data })
                })

            } catch (err) {
                console.log(err);
            }
        })
    },

}


