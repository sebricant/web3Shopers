const db = require('../model/connection');
const {response} = require("../app");
const { isObjectIdOrHexString } = require('mongoose');

module.exports={
    addcategory: async(category)=>{
        try{
            const data = await db.category(category);
            data.save();
            return data.id;
        }catch(error){
            throw error;
        }
    },
    allCategory:function(){
        return new Promise (async(resolve,reject)=>{
            let newcategory=await db.category.find({})
            resolve(newcategory)
        })
    },
    DeleteCategory:(catid)=>{
        console.log(catid)
        return new Promise((resolve,reject)=>{
            db.category.deleteOne({_id:catid}).then((res)=>{
                resolve(res)
            })
        })
    },
    getCategory:(catid)=>{
        return new Promise ((resolve,reject)=>{
            db.category.findOne({_id:catid}).then((category)=>{
                resolve(category)
            })
        })
    },
    admineditCategory:(catid,category)=>{
        return new Promise((resolve,reject)=>{
      
         db.category.updateOne({_id:catid},{$set:category}).then((result)=>{
          
             resolve()
         })
        })
    }
}