const config = require('../config');
const logger = require('../Logger')(module);
const dbHelper = require('./DatabaseHelper');

const stripe = require('stripe')(config.STRIPE.TEST_KEY);

module.exports = {
    /**
     * Creates a stripe customer.
     *
     * @param {String} email The email address of the customer.
     *
     * @returns {Promise} Promise to create the Stripe customer.
     */
    createCustomer(email) {
        return stripe.customers.create({email});
    },
    
    /**
     * Gets a stripe customer.
     *
     * @param {String} email The email address of the customer.
     *
     * @returns {Promise} Promise to retrieve the Stripe customer.
     */
    getCustomer(customerId) {
        return stripe.customers.retrieve(customerId);
    },

    /**
     * Creates a payment intent for a customer.
     *
     * @param {String} emailAddress The email address of the customer.
     * @param {String} amount The amount to be charged.
     *
     * @returns {Promise} Promise to create the payment intent.
     */
    createPaymentIntent(emailAddress, amount) {
        return dbHelper.getUser(emailAddress)
            .then(user =>
                stripe.paymentIntents.create({
                    amount,
                    currency: 'gbp',
                    customer: user.stripeCustomerId,
                    description: `Chooter subscription for ${emailAddress}`
                })
            ).then(response => {
                // The response object will contain a client secret. This should be passed to the frontend
                // and after that returned to the backend with the user's card details.
            }).catch(err => {
                logger.error(`Could not create payment intent for customer ${emailAddress}: ${err.stack}`)
            });
    },

    /**
     * Submits a payment from a user.
     * More information: https://stripe.com/docs/stripe-js/reference#stripe-handle-card-payment
     *
     * @param {String} clientSecret The client secret.
     * @param {Object} cardElement The card element.
     * @param {Object} sourceData The source data.
     * @param {Object} sourceData.owner The owner of the payment.
     * @param {String} sourceData.owner.name The name of the owner of the payment.
     *
     * @returns {Promise} Promise to process the user's payment.
     */
    submitPayment(clientSecret, cardElement, sourceData){
        return stripe.handleCardPayment(
            clientSecret,
            cardElement,
            {source_data: sourceData}
        ).then(result => {
            if (result.error) {
                throw result.error;
            }

            // Do something to confirm that the payment was successful.
        })
        .catch(err => {
            logger.error(`Could not submit payment: ${err.stack}`)
        });
    },
}