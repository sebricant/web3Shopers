const {coupon}=require('../model/connection');
const db = require('../model/connection');

module.exports={
    getallcoupon: () => {
        return new Promise((resolve, reject) => {
          try {
    
           let allcoupons= db.coupon.find({})
           resolve(allcoupons)
    
          } catch (error) {
            console.log(error);
          }
        });
      },
    addCoupon:(data)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                console.log(data.percentage);
                discountAmount = data.amount =="" ? 0 : parseInt(data.amount)
                discountPercentage = data.percentage==''?0: parseInt(data.percentage)
                cappedAmount = data.cappedAmount == ""? 0: parseInt(data?.cappedAmount)
                let couponObj={
                    coupon:data.coupon,
                    discountType:data.discountType,
                    amount:discountAmount,
                    amountValidity:data.amountValidity,
                    cappedAmount:cappedAmount,
                    percentage:discountPercentage,
                    validityTill:data.validity,
                    usageValidity:data.redeemTime,
                    description:data.description,
                }
                let coupon= await db.coupon(couponObj)
                await coupon.save()
                resolve({status:true})
            }catch(error){
                console.log(error);
            }
        })
    },
        verifyCoupon:(data,user)=>{
            console.log(data);
            return new Promise((resolve,reject)=>{
                try{
                    db.coupon.findOne({coupon:data}).then(async(response)=>{
                        console.log("res",response);
                        if(response){
                            let couponExit = await db.users.findOne({_id:user,"coupon.name":data})
                            if(!couponExit){
                                let couponData={
                                    name:data,
                                    purchased:false
                                }
                                db.users.updateOne({_id:user},{
                                    $push:{
                                        coupon:couponData
                                    }
                                }).then((e)=>{
                                    console.log(e);
                                    resolve({status:true})
                                })
                            }else{
                                resolve({coupon:true})
                            }
                        }else{
                            resolve({status:false})
                        }
                    })
                }catch(err){
                    console.log(err);
                }
            })
        },
    checkCoupon:(data,user)=>{
        console.log("ddddddddddddddddddddddddddddd");
        console.log(data);
        return new Promise(async(resolve,reject)=>{
            try{
                let purchased= await db.users.aggregate([
                    {
                    $match:{_id:user._id}
                },
            {
            $unwind:"$coupon"
            },
            {
                $match:{
                    $and:[{
                        'coupon.name':data,
                        'coupon.purchased':false
                    }]
                }
            }
        ])
        console.log('checkcoupon',purchased);
        if(!purchased.length){
            resolve({purchased:true})
        }else{
            resolve({purchased:false})
        }
            }catch(error){
                console.log(error);
            }
        })
    },
    applyCoupon:(data,user,total)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let couponData = await db.coupon.findOne({ coupon: data })
                console.log("couponData",data);
                if (couponData) {

                    if ((new Date(couponData.validityTill) - new Date()) > 0 && couponData.usageValidity > 0) {
                        let amountValid = await couponData.amountValidity.split("-")
                        if (couponData.discountType == "Amount") {
                            if (total >= amountValid[0] && total <= amountValid[1]) {
                                let discountAmount = Math.floor(couponData.amount)
                                let finalAmount = Math.floor(total - couponData.amount)
                                resolve({ finalAmount, discountAmount })
                            } else {
                                resolve({ couponNotApplicable: true, amountValid })
                            }
                        } else {
                            if (total >= amountValid[0] && total <= amountValid[1]) {
                                let cappedAmount = couponData?.cappedAmount
                                let discountAmount = await ((total * couponData.percentage) / 100)
                                if(discountAmount>cappedAmount){
                                    discountAmount = cappedAmount
                                    let finalAmount = Math.floor(total - cappedAmount)
                                    resolve({finalAmount,discountAmount})
                                }else{
                                let finalAmount = Math.floor(total - discountAmount)
                                discountAmount = Math.floor(discountAmount)
                                resolve({ finalAmount, discountAmount })
                                }
                            } else {
                                resolve({ couponNotApplicable: true, amountValid })
                            }
                        }
                    } else {
                        resolve({ couponExpired: true })
                    }
                }
            } catch (error) {
                console.log(error);
            }
        })
    },
}