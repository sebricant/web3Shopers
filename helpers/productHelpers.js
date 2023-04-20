let db = require("../model/connection");

module.exports = {
  addProducts: async (product) => {
    product.price = parseInt(product.price);
    try {
      const data = await db.product(product);

      data.save();
      return data.id;
    } catch (error) {
      throw error;
    }
  },
  allProducts: (page={}) => {
    const options = {
      page: page?.page,
      limit: 9,
      collation: {
        locale: "en",
      },
    };
    return new Promise(async (resolve, reject) => {
      try {
        if (!page?.page) {
          // console.log(page, "newpage");
          let newproduct = await db.product.find(page);
          // console.log("page if condition", newproduct);
          resolve(newproduct);
        } else {
          let newproduct = await db.product.paginate({}, options);
          resolve(newproduct);
          // console.log("else condition");
        }
      } catch (error) {
        console.log(error);
      }
    });
  },
  getProduct: (proid) => {
    return new Promise((resolve, reject) => {
      db.product.findOne({ _id: proid }).then((product) => {
        resolve(product);
      });
    });
  },
  adminEditProducts: (proid, product) => {
    return new Promise(async (resolve, reject) => {
      let dbproData = await db.product.findOne({ _id: proid });
      // console.log(product);
      if (product?.Image?.length == 0) {
        product.Image = dbproData?.Image;
      } else {
        await db.product.updateOne(
          { _id: proid },
          {
            $set: {
              name: product.name,
              price: product.price,
              category: product.category,
              brand: product.brand,
              offerPrice: product.offerPrice,
              offerPercentage: product.offerPercentage,
              stock: product.stock,
              description: product.description,
              Image: product.Image,
            },
          }
        );
      }
      resolve();
    });
  },
  DeleteProduct: (proid) => {
    console.log(proid);
    return new Promise((resolve, reject) => {
      db.product.deleteOne({ _id: proid }).then((res) => {
        resolve(res);
      });
    });
  },
  productview: (proid) => {
    return new Promise((resolve, reject) => {
      // console.log(proid, "fvg");
      db.product.findOne({ _id: proid }).then((product) => {
        resolve(product);
      });
    });
  },
  getCatagoryBanner: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let catagoryBanner = await db.categoryBanner.find({});
        resolve(catagoryBanner);
      } catch (error) {}
    });
  },
  addCategoryBanner: (Catbanner) => {
    return new Promise(async (resolve, reject) => {
      try {
        let catagoryBanner = await db.categoryBanner(Catbanner);
        catagoryBanner.save();
        resolve(catagoryBanner);
      } catch (error) {}
    });
  },
  deleteCategoryBanner: (catBanId) => {
    return new Promise((resolve, reject) => {
      // console.log(catBanId,'lllllllllllll');
      try {
        db.categoryBanner.deleteOne({ _id: catBanId }).then((response) => {
          resolve({ status: true});
        });
      } catch (error) {
        console.log(error);
      }
    });
  },


};
