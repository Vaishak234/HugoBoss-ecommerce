const db = require('../config/connections')
const collections = require('../config/collections')
const ObjectId = require('mongodb').ObjectId
const bcrypt = require('bcryptjs')

module.exports = {
    getAllUsers: () => {
        return new Promise(async(resolve, reject) => {
            try {
                let users = await db.get().collection(collections.USERS_COLLECTION).find().toArray()
                resolve(users)
            } catch (error) {
                throw error
            }
        })
    },
    getAllProducts: () => {
        return new Promise(async(resolve, reject) => {
            try {
                let products = await db.get().collection(collections.PRODUCTS_COLLECTION).find().toArray()
                 resolve(products)
            } catch (error) {
                throw error
            }
        })
    },
    getProduct: (productId) => {
         return new Promise(async(resolve, reject) => {
            try {
                 let product = await db.get().collection(collections.PRODUCTS_COLLECTION).findOne({ _id: ObjectId(productId) })
                 resolve(product)
            } catch (error) {
                throw error
            }
        })
    },
    addProduct: (productDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCTS_COLLECTION).insertOne(productDetails).then((response) => {
                resolve(response)
            }).catch(error => {
                throw error
            })
        })
    },
    deleteProduct: (productId) => {
         return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCTS_COLLECTION).deleteOne({_id:ObjectId(productId)}).then((response) => {
                resolve(response)
            }).catch(error => {
                throw error
            })
        })
    },
    editProduct: (productId, productDetails) => {
        
         return new Promise((resolve, reject) => {
             db.get().collection(collections.PRODUCTS_COLLECTION).updateOne({_id:ObjectId(productId)}, {
                 $set: {
                    title:productDetails.title,
                    description:productDetails.description,
                    color:productDetails.color,
                    date:productDetails.date, 
                    ratings:productDetails.ratings,
                    artno:productDetails.artno,
                    price:productDetails.price,
                    composition:productDetails.composition,
                    fit:productDetails.fit,
                    cateogry: productDetails.cateogry,
                    delevery:productDetails.delevery,
                    images: productDetails.images,
                    small:productDetails.small,
                    large:productDetails.large,
                    medium:productDetails.medium,
                    xl:productDetails.xl,
                    xxl:productDetails.xxl,
                     xxxl: productDetails.xxl,
                    outOfDelevery:productDetails.outOfDelevery,

                }
            }).then((response) => {
                resolve(response)
            }).catch(error => {
                throw error
            })
        })
    },
    editProductWithoutImage: (productId, productDetails) => {
       
         return new Promise((resolve, reject) => {
             db.get().collection(collections.PRODUCTS_COLLECTION).updateOne({_id:ObjectId(productId)}, {
                 $set: {
                    title:productDetails.title,
                    description:productDetails.description,
                    color:productDetails.color,
                    date:productDetails.date, 
                    ratings:productDetails.ratings,
                    artno:productDetails.artno,
                    price:productDetails.price,
                    composition:productDetails.composition,
                    fit:productDetails.fit,
                    cateogry: productDetails.cateogry,
                    delevery:productDetails.delevery,
                    small:productDetails.small,
                    large:productDetails.large,
                    medium:productDetails.medium,
                    xl:productDetails.xl,
                    xxl:productDetails.xxl,
                     xxxl: productDetails.xxl,
                    outOfDelevery:productDetails.outOfDelevery,
                }
            }).then((response) => {
                resolve(response)
            }).catch(error => {
                throw error
            })
        })
    },
    getOrders: () => {
        return new Promise(async (resolve, reject) => {
         
            try {
                let orderProducts = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
            {
               $unwind: '$products'
            },
            {
               $project: {
                   user: "$user",
                  item: "$products.item",
                  quantity: "$products.quantity",
                  cancelled:"$products.cancelled",
                  size: "$products.size",
                  status: "$products.status",
                  date: "$products.date"
                 
               }
            },
            {
               $lookup: {
                  from: collections.PRODUCTS_COLLECTION,
                  localField: "item",
                  foreignField: "_id",
                  as: "orderProducts"
               }
             },
            {
               $unwind: '$orderProducts'
             },
             {
               $lookup: {
                  from: collections.USERS_COLLECTION,
                  localField: "user",
                  foreignField: "_id",
                  as: "user"
               }
             },
             {
               $unwind: '$user'
             },

            {
               $project: {
                    user: "$user.email",
                   _id:1,
                  size: 1,
                  quantity: 1,
                  cancelled: 1,
                  date:1,
                  status:1,
                  title: "$orderProducts.title",
                  productId: "$orderProducts._id",
                  images: "$orderProducts.images",
                  totalAmount: { $add: [{ $multiply: ["$orderProducts.price", "$quantity"] } , "$orderProducts.delevery" ]  }
               }
            },
            {
               $sort: {date:-1 }
             },
            
           
                ]).toArray()
                 
              resolve(orderProducts);
            } catch (error) {
                throw error
            }
        
      })
    },
    getLimitOrders: () => {
        return new Promise(async (resolve, reject) => {
         try {
              let orderProducts = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
            {
               $unwind: '$products'
            },
            {
               $project: {
                   user: "$user",
                  item: "$products.item",
                  quantity: "$products.quantity",
                  cancelled:"$products.cancelled",
                    size: "$products.size",
                    date:"$products.date",
                    status:"$products.status",
                  
                 
               }
            },
            {
               $lookup: {
                  from: collections.PRODUCTS_COLLECTION,
                  localField: "item",
                  foreignField: "_id",
                  as: "orderProducts"
               }
             },
            {
               $unwind: '$orderProducts'
             },
             {
               $lookup: {
                  from: collections.USERS_COLLECTION,
                  localField: "user",
                  foreignField: "_id",
                  as: "user"
               }
             },
             {
               $unwind: '$user'
             },

            {
               $project: {
                    user: "$user.email",
                   _id:1,
                  size: 1,
                  quantity: 1,
                  cancelled: 1,
                  date:1,
                  status:1,
                  title: "$orderProducts.title",
                  productId: "$orderProducts._id",
                  images: "$orderProducts.images",
                  totalAmount: { $add: [{ $multiply: ["$orderProducts.price", "$quantity"] } , "$orderProducts.delevery" ]  }
               }
            },
            {
               $sort: {date:-1 }
             },
            {
                $limit:10
            }
            
           
              ]).toArray()
              resolve(orderProducts);
         } catch (error) {
            throw error
         }
         
        
      })
    },
    getOrderDetails: (orderId,productId,size) => {
        
        return new Promise(async (resolve, reject) => {
         try {
              let orderProduct = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
            {
             $match:{_id:ObjectId(orderId)}
              },
              
            {
               $unwind: '$products'
            },
            {
               $project: {
                  user: "$user",
                  item: "$products.item",
                  quantity: "$products.quantity",
                  cancelled:"$products.cancelled",
                  delevered:"$products.delevered",
                  size: "$products.size",
                  status: "$products.status",
                    date: "$products.date",
                    orderMobile:"$products.mobile",
                     address:"$products.address",
                     pincode:"$products.pincode",
                     city:"$products.city",
                     district:"$products.district",
                     state:"$products.state",
                     state: "$products.state",
                     orderFirstName:"$products.firstname",
                     orderLastName: "$products.lastname",
                     payment:"$products.payment",
                 
               }
            },
            {
               $lookup: {
                  from: collections.PRODUCTS_COLLECTION,
                  localField: "item",
                  foreignField: "_id",
                  as: "orderProducts"
               }
             },
            {
               $unwind: '$orderProducts'
             },
             {
               $lookup: {
                  from: collections.USERS_COLLECTION,
                  localField: "user",
                  foreignField: "_id",
                  as: "user"
               }
             },
             {
               $unwind: '$user'
             },
             {
               $project: {
                     email: "$user.email",
                     firstName:"$user.firstName",
                     lastName: "$user.lastName",
                     mobile:"$user.mobile",
                     size: 1,
                     quantity: 1,
                     cancelled: 1,
                     delevered:1,
                     date: 1,
                     orderMobile:1,
                     address:1,
                     pincode:1,
                     city:1,
                     district:1,
                     state:1,
                     state: 1,
                     orderFirstName:1,
                     orderLastName: 1,
                     payment:1,
                     status:1,
                     title: "$orderProducts.title",
                     productId: "$orderProducts._id",
                     images: "$orderProducts.images",
                     delevery: "$orderProducts.delevery",
                     price: "$orderProducts.price",
                     totalAmount: { $add: [{ $multiply: ["$orderProducts.price", "$quantity"] } , "$orderProducts.delevery" ]  }
                 }
              },
             {$match:{productId:ObjectId(productId) , size:size}}
            
         ]).toArray()
         
         resolve(orderProduct[0]);
         } catch (error) {
            throw error
         }
         
      })
    },
    placeDelevery: (orderId, productId, size) => {
       
        return new Promise((resolve, reject) => {
             db.get().collection(collections.ORDER_COLLECTION).updateOne(
                {  _id: ObjectId(orderId), 'products.item': ObjectId(productId) ,'products.size': size },
             {
               $set: {
                  'products.$.status': "delevered",
                  'products.$.delevered': true
               }
             }
            ).then(response => {
                resolve(response)
            }).catch(error => {
                throw error
            })
        })
    },
    getNumber: () => {
        return new Promise(async(resolve, reject) => {
            try {
             let users = await db.get().collection(collections.USERS_COLLECTION).count()
            let products = await db.get().collection(collections.PRODUCTS_COLLECTION).count()
            let orders = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                {
                    $unwind:'$products'
                },
                {
                    $match:{'products.cancelled':false , 'products.delevered':false}
                },
                {
                    $count:'orders'
                }
            ]).toArray()
            let delevery = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                {
                    $unwind:'$products'
                },
                {
                    $match:{'products.delevered':true}
                },
                {
                    $count:'delevery'
                }
             ]).toArray()
            resolve({users,products,orders,delevery})
         } catch (error) {
            throw error
         }
         
        })
    },
    getTopSellingProduct:()=>{
       return new Promise(async (resolve, reject) => {
          try {
              let topProducts = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
               {
                   $unwind:"$products"
               },
               {
                   $project:{_id:0,item:'$products.item'}
               },
               {
                   $group: {
                       _id:"$item"
                   }
               },{
                   $limit:10
               },
                {
               $lookup: {
                  from: collections.PRODUCTS_COLLECTION,
                  localField: "_id",
                  foreignField: "_id",
                  as: "Products"
               }
               }, 
               {
                    $unwind:"$Products"
               },
               {
                   $project: {
                       title:'$Products.title',
                       price: '$Products.price',
                       images: '$Products.images',
                   }
               }
               
           ]).toArray()
           console.log(topProducts);
           resolve(topProducts)
         } catch (error) {
            throw error
         }
         
       })
    },
    banUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USERS_COLLECTION).updateOne({ _id: ObjectId(userId) },
                {
                    $set: {
                     banned:true
                 }
                }
            ).then(response => {
                resolve(response)
            }).catch(error => {
                throw error
            })
        })
    },
    unbanUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USERS_COLLECTION).updateOne({ _id: ObjectId(userId) },
                {
                    $set: {
                     banned:false
                 }
                }
            ).then(response => {
                resolve(response)
            }).catch(error => {
                throw error
            })
        })
    }

}