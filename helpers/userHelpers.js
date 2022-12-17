const db = require('../config/connections')
const collections = require('../config/collections')
const ObjectId = require('mongodb').ObjectId
const bcrypt = require('bcryptjs')
const otpGenerator = require('otp-generator')
const dotenv = require('dotenv')
const { NewKeyPage } = require('twilio/lib/rest/api/v2010/account/newKey')

dotenv.config()
const twilio = require('twilio')(process.env.accountSid,process.env.authToken)

module.exports = {
  
   getProducts: (cateogry) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.PRODUCTS_COLLECTION).find({ cateogry: cateogry }).toArray().then((data) => {
            resolve(data)
         }).catch(error => {
                throw error
            })
      })
   },
   getAllProducts: () => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.PRODUCTS_COLLECTION).find().toArray().then((data) => {
            resolve(data)
         }).catch(error => {
                throw error
            })
      })
   },
   getProduct: (id) => {
      console.log(id);
      return new Promise((resolve, reject) => {
         db.get().collection(collections.PRODUCTS_COLLECTION).findOne({ _id: ObjectId(id) }).then((data) => {
            resolve(data)
         }).catch(error => {
                throw error
            })
      })
   },
   addToCart: (productId, userId, size) => {
      console.log(size);
      return new Promise(async (resolve, reject) => {

         let productObj = {
            item: ObjectId(productId),
            quantity: 1,
            size: size
         }
         
         let userCart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: userId })
         if (userCart) {
            let productExist = userCart.products.findIndex(product => {
               return (
                  product.item == productId && product.size === size
               )
            })
            if (productExist != -1) {
               db.get().collection(collections.CART_COLLECTION).updateOne({ 'products.item': ObjectId(productId), 'products.size': size }, {
                  $inc: { 'products.$.quantity': 1 }
               }).then((response) => {
                  console.log(response);
                  resolve('quantity updated')
               }).catch(error => {
                throw error
               })
            } else {
               db.get().collection(collections.CART_COLLECTION).updateOne({ user: userId }, {
                  $push: { products: productObj }
               }).then((response) => {
                  console.log(response);
                  resolve('product updated')
               }).catch(error => {
                throw error
            })
            }
               
         } else {
            let cartObj = {
               user: userId,
               products: [productObj]
            }
            db.get().collection(collections.CART_COLLECTION).insertOne(cartObj).then((response) => {
               console.log(response);
               resolve('product added')
            }).catch(error => {
                throw error
            })
         }
      })
   },
   getCart: (userId) => {
      return new Promise(async (resolve, reject) => {
         try {
             let cart = await db.get().collection(collections.CART_COLLECTION).aggregate([
            {
               $match: { user: userId }
            },
            {
               $unwind: '$products'
            },
            {
               $project: {
                  item: "$products.item",
                  quantity: "$products.quantity",
                  size: "$products.size"
               }
            },
            {
               $lookup: {
                  from: collections.PRODUCTS_COLLECTION,
                  localField: "item",
                  foreignField: "_id",
                  as: "cartProducts"
               }
            },
            {
               $unwind: '$cartProducts'
            }
            
         ]).toArray()
         resolve(cart);
         } catch (error) {
            throw error
         }
         
      })
   },
   deleteProductCart: (userId, productId, size) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.CART_COLLECTION).updateOne({ user: userId, 'products.item': ObjectId(productId), 'products.size': size }, {
            $pull: { products: { item: ObjectId(productId), size: size } }
         }).then((response) => {
            console.log(response);
            resolve(response)
         }).catch(error => {
                throw error
            })
      })
   },
   changeQuantity: (details) => {
    
      return new Promise((resolve, reject) => {
         let count = parseInt(details.count)
         let quantity = parseInt(details.quantity)
         if (quantity == 1 && count == -1) {
            db.get().collection(collections.CART_COLLECTION).updateOne({ _id: ObjectId(details.cartId) }, {
               $pull: { products: { item: ObjectId(details.productId), size: details.size } }
            }).then((response) => {
               resolve({ removeproduct: true })
            }).catch(error => {
                throw error
            })
         } else {
            db.get().collection(collections.CART_COLLECTION).updateOne({ _id: ObjectId(details.cartId), 'products.item': ObjectId(details.productId), 'products.size': details.size }, {
               $inc: { 'products.$.quantity': count }
            }).then((response) => {
               resolve({ status: true })
            }).catch(error => {
                throw error
            })
       
         }
      })
      
   },
   
   getTotal: (userId) => {
   
      return new Promise(async (resolve, reject) => {
        try {
          let cart = await db.get().collection(collections.CART_COLLECTION).aggregate([
            {
               $match: { user: userId }
            },
            {
               $unwind: '$products'
            },
            {
               $project: {
                  item: "$products.item",
                  quantity: "$products.quantity",
                  size: "$products.size",
               }
            },
            {
               $lookup: {
                  from: collections.PRODUCTS_COLLECTION,
                  localField: "item",
                  foreignField: "_id",
                  as: "cartProducts"
               }
            }, {
               $project: {
                  item: 1,
                  quantity: 1,
                  size: 1,
                  product: { $arrayElemAt: ["$cartProducts", 0] }
               }
            },
            {
               $group: {
                  _id: null,
                  quantity: { $sum: '$quantity' },
                  delevery: { $sum :'$product.delevery'},
                  order: { $sum: { $multiply: ['$quantity', '$product.price'] } },
               }
            },
             {
                $project: {
                   quantity: 1,
                   order: 1,
                   delevery: 1,
                   total:{$add:['$delevery','$order']}
                   
                  }
              }
         
            
         ]).toArray()
         resolve(cart);
        } catch (error) {
          throw error
        }
      })
   },
   addDetails: (details) => {
      console.log(details);
      return new Promise((resolve, reject) => {
         db.get().collection(collections.DETAILS_COLLECTION).insertOne(details).then((response) => {
            resolve(response)
         }).catch(error => {
                throw error
            })
      })
   },
   getDetails: (userId) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.DETAILS_COLLECTION).findOne({ user: userId }).then((response) => {
            resolve(response)
         }).catch(error => {
                throw error
            })
      })
   },
   getUserDetails: (userId) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.DETAILS_COLLECTION).findOne({ user: ObjectId(userId) }).then((response) => {
            resolve(response)
         }).catch(error => {
                throw error
            })
      })
   },
   editDetails: (details) => {
    
      return new Promise((resolve, reject) => {
         db.get().collection(collections.DETAILS_COLLECTION).updateOne({ user: details.user }, {
            $set: {
               firstname: details.firstname,
               lastname: details.lastname,
               address: details.address,
               pincode: details.pincode,
               city: details.city,
               district: details.district,
               state:details.state,
               mobile: details.mobile

            }
         }).then((response) => {
            resolve(response)
         }).catch(error => {
                throw error
            })
      })
   },
   placeOrder: (orderDetails, { products} , userDetails) => {
    
      console.log(products);
      return new Promise((resolve, reject) => {
         console.log(orderDetails);
         let status = orderDetails.payment === 'cod' ? 'placed' : 'pending'
        
         products.forEach(element => {
            element.date= new Date(),
            element.mobile= userDetails.mobile,
            element.address= userDetails.address,
            element.pincode= userDetails.pincode,
            element.city= userDetails.city,
            element.district= userDetails.district,
            element.firstname= userDetails.firstname,
            element.lastname= userDetails.lastname,
            element.user= ObjectId(orderDetails.user),
            element.payment= orderDetails.payment,
            element.status= status,
            element.cancelled = false
            element.delevered = false
            element.review= false
         });
         
         let placeOrder = {
            user: ObjectId(orderDetails.user),
            products,
            
         }
          
         db.get().collection(collections.ORDER_COLLECTION).insertOne(placeOrder).then((response) => {
            db.get().collection(collections.CART_COLLECTION).deleteOne({ user: ObjectId(orderDetails.user) }).then((res) => {
               if (res) {
                  resolve(response)
               }
            }).catch(error => {
                throw error
            })
         }).catch(error => {
                throw error
            })
      })
   },
  
   getCartProductList: (userId) => {
      return new Promise(async (resolve, reject) => {
        try {
              let cart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: ObjectId(userId) })
       
              resolve(cart)
         } catch (error) {
            throw error
         }
         
      })
   },
   getOrders: (userId) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.ORDER_COLLECTION).find({ user: ObjectId(userId) }).toArray().then((response) => {
           
            resolve(response)
         }).catch(error => {
                throw error
            })
      })
   },
   getOrderProducts: (userId) => {
      
      return new Promise(async (resolve, reject) => {
         try {
             let orderProducts = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
            {
               $match: { user: userId }
            },
            {
               $unwind: '$products'
            },
            {
               $project: {
                  user: "$user",
                  item: "$products.item",
                  quantity: "$products.quantity",
                  cancelled: "$products.cancelled",
                  review: "$products.review",
                  delevered: "$products.delevered",
                  size: "$products.size",
                  orderObj: "$products.orderObj"
                 
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
               $project: {
                  _id:1,
                  user: 1,
                  size: 1,
                  quantity: 1,
                  cancelled: 1,
                  delevered: 1,
                  review:1,
                  productId: "$item",
                  title: "$orderProducts.title",
                  images: "$orderProducts.images",
                  color: "$orderProducts.color",
                  price: "$orderProducts.price",
                  delevery: "$orderProducts.delevery",
                  orderAmount: { $multiply: ["$orderProducts.price", "$quantity"] },
                  totalAmount: { $add: [{ $multiply: ["$orderProducts.price", "$quantity"] }, "$orderProducts.delevery"] }
               }
            },
            {
               $sort: { cancelled: 1 ,_id :-1 }
            }

           
         ]).toArray()
         
         resolve(orderProducts);
         } catch (error) {
            throw error
         }
         
      })
   },
  
   updateUserDetails: (userDetails) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.USERS_COLLECTION).updateOne({ email: userDetails.email }, {
            $set: {
               mobile: userDetails.mobile,
               gender: userDetails.gender,
               lastName: userDetails.lastName,
               firstName: userDetails.firstName,
            }
         }).then((response) => {
            resolve(response)
         }).catch(error => {
                throw error
            })
      })
   },
   cancelOrder: (userId, orderId, productId, size) => {
      
      
      return new Promise((resolve, reject) => {
         db.get().collection(collections.ORDER_COLLECTION).updateOne(
            { user: userId, _id: ObjectId(orderId), 'products.item': ObjectId(productId), 'products.size': size },
            {
               $set: {
                  'products.$.status': "cancelled",
                  'products.$.cancelled': true
               }
            }
         ).then(response => (
            resolve(response)
         )).catch(error => {
                throw error
            })
      })
   },
   postReview: (userId, orderId, productId, size, review) => {
      return new Promise((resolve, reject) => {
         let reviewObj = {
            user: userId,
            orderId,
            productId,
            size,
            review,
         }
         console.log(review);
         db.get().collection(collections.REVIEWS_COLLECTION).insertOne(reviewObj).then(res => {
            let savereview =  db.get().collection(collections.ORDER_COLLECTION).updateOne(
            { user: userId, _id: ObjectId(orderId), 'products.item': ObjectId(productId), 'products.size': size },
            {
               $set: {
                  'products.$.review': true
               }
            }
            )
            if (savereview) {
                 resolve(savereview) 
            }
         
         }).catch(error => {
                throw error
            })
      })
   },
   getProductReview: (productId) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.REVIEWS_COLLECTION).aggregate([
            {
               $match:{productId:productId}
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
               $unwind:"$user"
            },
            {
               $project: {
                  id:1,
                  review: 1,
                  email: '$user.email'
               }
            }
         ]).toArray()
            .then((response) => {
            resolve(response)
         }).catch(error => {
                throw error
            })
       })
   },
   searchProducts: (key) => {
      return new Promise((resolve, reject)=> {
         db.get().collection(collections.PRODUCTS_COLLECTION).find({ title:{$regex : ".*"+key+".*"}}).toArray().then(response => {
           resolve(response)
        }).catch(error => {
                throw error
            })
      })
   },
   // confirmPayment: (orderId,userId) => {
   //    return new Promise(async(resolve, reject) => {
   //       let product = await db.get().collection(collections.ORDER_COLLECTION).updateMany({ _id: ObjectId(orderId) ,user: ObjectId(userId)  },
   //          {
   //             $set: {
   //                'products.$[].status': 'placed'
   //             }
   //         })
   //        resolve(product)
   //    })
   // },
   //  paymentFailed: (orderId ,userId) => {
   //    return new Promise((resolve, reject) => {
   //       db.get().collection(collections.ORDER_COLLECTION).deleteOne({ _id: ObjectId(orderId), user: ObjectId(userId)  }).then(response => {
   //            resolve(response);
   //         })
   //    })
   // },
   getBannedUser: (userId) => {
       return new Promise(async(resolve, reject) => {
           try {
            let bannedUser = await db.get().collection(collections.USERS_COLLECTION).findOne({ banned: true ,_id:ObjectId(userId)})
          resolve(bannedUser)
         } catch (error) {
            throw error
         }
         
       })
    }
}