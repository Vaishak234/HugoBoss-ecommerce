const express = require('express')
const userHelpers = require('../helpers/userHelpers')
const { isAuth } = require('../middleware/authMiddleware')
const router = express.Router()
require('dotenv').config()

const stripe = require("stripe")(process.env.STRIPE_SECRETKEY)

router.get('/card',isAuth , async (req, res) => {
    
    console.log(req.session.placedOrderId);
    let paymentDetails = await userHelpers.getPaymentDetails(req.session.placedOrderId)
    console.log(paymentDetails);
     try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: "payment",
      line_items: paymentDetails.map(item => {
        return {
          price_data: {
            currency: "inr",
            product_data: {
              name: item.title + '  of size ' + item.size,
            },
                unit_amount: (item.price + item.delevery )*100,
          },
            quantity: item.quantity,
             
        }
      }),
      success_url: `${process.env.URL}/payment/success`,
      cancel_url: `${process.env.URL}/payment/cancel`,
    })
      console.log(session.url);
      res.redirect(session.url)
  } catch (e) {
    res.status(500).send({ error: e.message })
  }


})

router.get('/success',isAuth , (req, res) => {

    userHelpers.confirmPayment(req.session.placedOrderId, req.user._id).then((response) => {
        res.redirect('/my-orders')
    })
})

router.get('/cancel',isAuth , (req, res) => {
     
     userHelpers.paymentFailed(req.session.placedOrderId, req.user._id).then((response) => {
        res.render('users/payment-failed')
    })
})
module.exports = router