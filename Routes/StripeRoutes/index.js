const stripeHelper = require('../../Helpers/StripeHelper');

module.exports = {
    /**
     * End point to create a new Stripe customer.
     *
     * @param {Object} req The request.
     * @param {Object} res The response.
     */
    createCustomer(req, res){
        if (req.body) {
            return stripeHelper.createCustomer(req.body.emailAddress)
                .then(customer => res.status(201).send(customer))
                .catch(err => res.status(400).send(`Could not create Stripe customer: ${err.message}`));
        }

        return res.status(400).send('Could create Stripe customer - invalid user data.')
    },

    /**
     * End point to get a Strapi customer.
     *
     * @param {Object} req The request.
     * @param {Object} res The response.
     */
    getCustomer(req, res){
        if (req.body) {
            return stripeHelper.getCustomer(req.body.customerId)
                .then(customer => res.status(200).send(customer))
                .catch(err => res.status(401).send(`Could not get Stripe customer: ${err.message}`))
        }

        return res.status(400).send('Could not get Stripe customer - invalid user data.')
    },

    /**
     * End point to create a payment intent.
     *
     * @param {Object} req The request.
     * @param {Object} res The response.
     */
    createPaymentIntent(req, res){
        if (req.body) {
            return stripeHelper.createPaymentIntent(req.body.emailAddress, req.body.amount)
                .then(() => res.status(200).send(true))
                .catch(err => res.status(401).send(`Could not create payment intent: ${err.message}`))
        }

        return res.status(400).send('Could not create payment intent - invalid data.')
    },

    /**
     * End point to submit a payment.
     *
     * @param {Object} req The request.
     * @param {Object} res The response.
     */
    submitPayment(req, res){
        if (req.body) {
            return stripeHelper.createPaymentIntent(req.body.clientSecret, req.body.cardElement, req.body.sourceData)
                .then(() => res.status(200).send(true))
                .catch(err => res.status(401).send(`Could not create submit payment: ${err.message}`))
        }

        return res.status(400).send('Could not submit payment - invalid data.')
    }
}