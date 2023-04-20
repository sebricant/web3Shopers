const db = require('../model/connection')

module.exports = {
    banner:()=>{
        return new Promise((resolve,reject)=>{
            try{
                db.banner.find({}).then((data)=>{
                    resolve(data)
                })
            }
            catch(error){
                
            }
        })
    },
  
    addBanner:(data)=>{
        console.log(data,'daata of main banners');
        return new Promise(async(resolve,reject)=>{
          let baner=await db.banner(data)
          baner.save()
    
          resolve(baner)
        })
      },
      getAllBanners:()=>{
        try{
            return new Promise(async(resolve,reject)=>{
                let banners = await db.banner.find({})
                resolve(banners)
            })
        }catch(error){
            console.log(error)
        }
      },
      deleteBanner:(bannerId)=>{
        try{
            return new Promise((resolve, reject) => {
                db.banner.deleteOne({_id:bannerId}).then((response)=>{
                    console.log(response,'response deleteBanner')
                    resolve()
                })
            })
        }catch(error){
            console.log(error);
        }
      },
      editBanner:(id)=>{
        return new Promise((resolve, reject) => {
            try{
                db.banner.find({_id:id}).then((data)=>{
                    resolve(data)
                })
            }catch(error){
                console.log(error);
            }
        })
      },
    //   editBannerPost:(id,data)=>{
        
    //     return new Promise((resolve, reject) => {
    //         try {
    //             console.log(id,'id',data,'data');
    //             db.banner.updateOne({_id:id},{
    //                 $set:{
    //                     title:data?.title,
    //                     description:data?.description,
    //                     Image:data?.Image,
    //                     // marketPrice:data?.marketPrice,
    //                     // offerPrice:data?.offerPrice
    //                 }
                    
    //             }).then((response)=>{
    //                 console.log(response,"response")
    //             })
    //             resolve(data)
    //         } catch (error) {
                
    //         }
    //     })
    //   }
}