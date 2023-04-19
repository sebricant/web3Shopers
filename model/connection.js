const mongoose = require('mongoose')
const db=mongoose.createConnection('mongodb://127.0.0.1:27017/project');
const mongoosePaginate = require('mongoose-paginate-v2');


db.on('error',(err)=>{
    console.log(err);
})

db.once('open',()=>{
    console.log("Database Connected");
})

const wishListschema = new mongoose.Schema({
    user:mongoose.Types.ObjectId,
    wishListProducts:[{
        item:mongoose.Types.ObjectId,
    }]
})


const productschema= new mongoose.Schema({
    name:String,
    category:String,
    brand:String,
    stock:Number,
    price:Number,
    offerPrice:Number,
    offerPercentage:Number,
    description:String,
    Image:Array,
});

productschema.plugin(mongoosePaginate);

const userschema = new mongoose.Schema({
    fName:String,
    email:String,
    mobile:Number,
    password:String,
    createdAt:{
        type:Date,
        default:new Date()
    },
    status:{
        type:Boolean,
        default:true
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    coupon:Array,
    wallet:Array
})
const categoryschema = new mongoose.Schema({
    name:String,
    discount:String,
    offer:Number
})
const cartschema = new mongoose.Schema({
    user:mongoose.Types.ObjectId,
    cartproducts:[{
        item:mongoose.Types.ObjectId,
        quantity:Number,
        price:Number,
    }]
})
const countryschema = new mongoose.Schema({
    name:String,
    code:String
})
const addressSchema = new mongoose.Schema({
    userId:mongoose.Types.ObjectId,
    address:[{
        fname:String,
        lname:String,
        address:String,
        landmark:String,
        town:String,
        country:String,
        state:String,
        postcode:Number,
        number:Number,
        email:String,
    }]
})
const bannerSchema = new mongoose.Schema({
    title:String,
    description:String,
    content1:String,
    content2:String,
    submittitle:String,
    marketprice:Number,
    offeredprice:Number,
    Image:Array,
    category:String,
})

const categoryBannerSchema = new mongoose.Schema({
    category:String,
    title:String,
    url:String,
    Image:Array,
})

const orderschema = new mongoose.Schema({
    userId:mongoose.Types.ObjectId,
    orders:[{
        fname:String,
        lname:String,
        totalPrice:Number,
        totalQuantity:Number,
        mobile:Number,
        paymentMethod:String,
        productDetails:[{}],
        shippingAddress:Object,
        createdAt:{
            type:Date,
            default:new Date()
        },
        paymentStatus:{
            type:Boolean,
            default:false,
        },
        paymentMethod:String,
        status:{
            type:Boolean,
            default:true,
        },
        couponDiscount:{
            type:Number,
            default:0,
        },
        couponName:{
            type:String,
            default:null
        }
    }]
})
const couponSchema = new mongoose.Schema({
    coupon:String,
    discountType:String,
    amount:Number,
    amountValidity:String,
    cappedAmount:Number,
    percentage:Number,
    description:String,
    createdAt:{
        type:Date,
        default: new Date()
    },
    validityTill:Date,
    usageValidity:Number
})

// const adminschema= new mongoose.Schema({
//     name:String,
//     adminId:String,
//     password:String,
//     createdAt:{
//         type:Date,
//         default:new Date()
//     },
//     status:{
//         type:Boolean,
//         default:true
//     }

// })

module.exports = {
    product:db.model('product',productschema),
    users:db.model('users',userschema),
    category:db.model('category',categoryschema),
    cart:db.model('cart',cartschema),
    country:db.model('country',countryschema),
    address:db.model('address',addressSchema),
    orders:db.model('orders',orderschema),
    wishList:db.model('wishList',wishListschema),
    coupon:db.model('coupon',couponSchema),
    banner:db.model("banner",bannerSchema),
    categoryBanner:db.model('categoryBanner',categoryBannerSchema),
    // admin:db.model('user',adminschema),
}
