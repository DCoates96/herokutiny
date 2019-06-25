'use strict'

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const axios = require('axios');
const config = require('../config');
const logger = require('../Logger')(module);
const dbHelper = require('./DatabaseHelper');
const stripeHelper = require('./StripeHelper');
const Promise = require('bluebird');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
global.fetch = require('node-fetch');

const poolData = {
    UserPoolId: config.AWS.USER_POOL_ID, //The pool ID,
    ClientId: config.AWS.CLIENT_ID, //The client ID
};
const pool_region = config.AWS.POOL_REGION; //The pool region
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

const getCognitoUser = username => {
    const cognitoUserData = {Username: username, Pool: userPool};

    return new AmazonCognitoIdentity.CognitoUser(cognitoUserData);
}

module.exports = {
    /**
     * Registers a new user account.
     *
     * @param {Object} userData The user data.
     * @param {String} userData.name The name of the user.
     * @param {String} userData.username The username of the user (we might use only email address).
     * @param {String} userData.email The email address of the user.
     * @param {String} userData.password The cleartext password of the user.
     * @param {String} userData.gender The gender of the user (male/female).
     * @param {String} userData.birthdate The birthdate of the user (yyyy-mm-dd).
     * @param {String} userData.address The address of the user.
     * @param {String} userData.phoneNumber The phoneNumber of the user (+14325551212).
     *
     * @returns {Promise<Object>} Promise containing the confirmation object.
     */
    registerUser(userData) {
        let attributeList = [];

        attributeList.push(
            new AmazonCognitoIdentity.CognitoUserAttribute({Name: 'name', Value: userData.name}),
            new AmazonCognitoIdentity.CognitoUserAttribute({Name: 'gender', Value: userData.gender}),
            new AmazonCognitoIdentity.CognitoUserAttribute({Name: 'birthdate', Value: userData.birthdate}),
            new AmazonCognitoIdentity.CognitoUserAttribute({Name: 'address', Value: userData.address}),
            new AmazonCognitoIdentity.CognitoUserAttribute({Name: 'email', Value: userData.email}),
            new AmazonCognitoIdentity.CognitoUserAttribute({Name: 'phone_number', Value: userData.phoneNumber})
        );
        
        // Callback example in case promises do not work as expected for AWS
        return new Promise((resolve, reject) => {
            userPool.signUp(userData.username, userData.password, attributeList, null, (err, result) => {
                if (err) {
                    logger.error(`Error: Could not create user account: ${JSON.stringify(err.message)}`);
                    reject(err);
                    return;
                }

                logger.silly(`User ${result.user.getUsername()} has been created.`)
                resolve(result);
                // TODO: This should create a Stripe customer for the user and add everything in the database. Replace resolve(result) with the commented out code. Not tested yet
                // return stripeHelper.createCustomer(userData.email)
                //     .then(customer => dbHelper.addUser(userData.email, userData.name, customer.id))
                //     .then(() => resolve(result));
            });
        })
    },

    /**
     * Authenticates and logs in a user.
     *
     * @param {Object} userData The user data.
     * @param {String} userData.username The username of the user.
     * @param {String} userData.password The password of the user.
     *
	 * @returns {Promise<Object>} Promise with the authenticated cognito user details.
     */
    login(userData) {
		const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
			Username: userData.username,
			Password: userData.password,
		});

        const cognitoUser = getCognitoUser(userData.username);

        return new Promise((resolve, reject) => {
            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: result => {
                    const accessToken = result.accessToken.jwtToken;
                    const idToken = result.idToken.jwtToken;
                    const refreshToken = result.refreshToken.token;
                    resolve({cognitoUser, accessToken, idToken, refreshToken});
                },
                onFailure: err => {
                    logger.error(`Error: Could not authenticate user ${userData.username}: ${err.message}`);
                    reject(err);
                },
            });
        });
    },

    /**
     * Signs out a user.
     *
     * @param {Object} cognitoUser The cognito user object.
     */
    logout(cognitoUser) {
        cognitoUser && cognitoUser.signOut();
    },
    
    /**
     * Confirms user's registration.
     *
     * @param {String} username The user's username.
     * @param {String} confirmationCode The registration confirmation code.
     */
    confirmRegistration(username, confirmationCode) {
        const cognitoUser = getCognitoUser(username);

        return new Promise((resolve, reject) => {
            cognitoUser.confirmRegistration(confirmationCode, true, (err, result) => {
                if (err) {
                    logger.error(
                        `Could not confirm registration for user ${username}: ${err.message}`
                    );
                    
                    reject(err);
                    return;
                }

                logger.silly(`Registration for user ${username} has been confirmed.`);
                resolve(result);
            });
        });
    },

    /**
     * Resends a new confirmation code.
     *
     * @param {String} username The user's username.
     */
    resendConfirmationCode(username) {
        const cognitoUser = getCognitoUser(username);

        return new Promise((resolve, reject) => {
            cognitoUser.resendConfirmationCode(function(err, result) {
                if (err) {
                    logger.error(
                        `Could not resend confirmation code for user ${username}: ${err.message}`
                    );
                    
                    reject(err);
                    return;
                }

                logger.silly(`Registration code for user ${username} has been resend.`);
                resolve(result);
            });
        });
    },

    /**
     * Updates a user password.
     *
     * @param {Object} cognitoUser The cognito user object.
     * @param {String} currentPassword The current password.
     * @param {String} newPassword The new password.
     *
     * @returns {Promise<Object>} Promise containing the confirmation object.
     */
    changePassword(cognitoUser, currentPassword, newPassword) {
        return new Promise((resolve, reject) => { 
            cognitoUser.changePassword(currentPassword, newPassword, function(err, result) {
                if (err) {
                    logger.error(
                        `Could not update the password for user ${cognitoUser.getUsername()}: ${err.message}`
                    );
                    
                    reject(err);
                    return;
                }

                logger.silly(`The password for user ${cognitoUser.getUsername()} has been updated.`);
                resolve(result);
            });
        });
    },

    /**
     * Updates specified attributes for a given user account.
     *
     * @param {Object} cognitoUser The cognito user object.
     * @param {Array<Object>} attributes The list of attributes to update.
     * @example updateAttributes([
         {Name: 'address', Value: '1 My Street'}, 
         {Name: 'phone_number', Value: '+14325551212'}
        ])
     * 
     * @returns {Promise<Object>} Promise containing the confirmation object.
     */
    updateAttributes(cognitoUser, attributes) {
        const attributeList = attributes.map(attr => new AmazonCognitoIdentity.CognitoUserAttribute(attr));

        return new Promise((resolve, reject) => {
            cognitoUser.updateAttributes(attributeList, function(err, result) {
                if (err) {
                    logger.error(
                        `Could not update attributes ${JSON.stringify(attributes)} for user ${cognitoUser.getUsername()}: ${err.message}`
                    );
                    
                    reject(err);
                    return;
                }

                logger.silly(`Attributes ${JSON.stringify(attributes)} have been update for user ${cognitoUser.getUsername()}.`);
                resolve(result);
            });
        });
    },

    /**
     * Deletes specified attributes for a given user account.
     *
     * @param {Object} cognitoUser The cognito user object.
     * @param {Array<String>} attributes The list of attributes to delete.
     * @example deleteAttributes(['address', 'phone_number'])
     * 
     * @returns {Promise<Object>} Promise containing the confirmation object.
     */
    deleteAttributes(cognitoUser, attributes) {
        return new Promise((resolve, reject) => {
            cognitoUser.deleteAttributes(attributes, function(err, result) {
                if (err) {
                    logger.error(
                        `Could not delete attributes ${JSON.stringify(attributes)} for user ${cognitoUser.getUsername()}: ${err.message}`
                    );
                    
                    reject(err);
                    return;
                }

                logger.silly(`Attributes ${JSON.stringify(attributes)} have been deleted for user ${cognitoUser.getUsername()}.`);
                resolve(result);
            });
        });
    },


    /**
     * Gets all attributes for a specified user.
     *
     * @param {Object} cognitoUser The cognito user object.
     * 
     * @returns {Promise<Arrray<Object>>} A promise containing a name-value pair array of the user's attributes.
     */
    getAttributes(cognitoUser){
        return new Promise((resolve, reject) => {
            cognitoUser.getUserAttributes(function(err, result) {
                if (err) {
                    logger.error(
                        `Could not get attributes for user ${cognitoUser.getUsername()}: ${err.message}`
                    );

                    reject(err);
                    return;
                }

                const attributes = result.map(attr => {
                    return {
                        Name: attr.getName(), 
                        Value: attr.getValue()
                    };
                });

                resolve(attributes);
            });
        });
    },

    /**
     * Validates the access token or ID token for a user.
     *
     * @param {Object} token The JWT token.
     *
     * @returns {Boolean} Value indicating whether the JWT token is valid.
     */
    validateToken(token) {
        return axios
            .get(`https://cognito-idp.${pool_region}.amazonaws.com/${poolData.UserPoolId}/.well-known/jwks.json`)
            .then(result => {
                let pems = {};
                const keys = result.data.keys;

                keys.map(key => {
                    const jwk = {
                        kty: key.kty,
                        n: key.n,
                        e: key.e,
                    };
                    
                    pems[key.kid] = jwkToPem(jwk);
                });

                const decodedJwt = jwt.decode(token, {complete: true});
                if (!decodedJwt){
                    logger.error('Could not validate JWT token: Invalid token.');
                    return false;
                }

                const kid = decodedJwt.header.kid;
                if (!pems[kid]){
                    logger.error('Could not validate JWT token: Invalid key ID.');
                    return false;
                }

                return jwt.verify(token, pems[kid], (err, decoded) => {
                    if(err) {
                        logger.error(`Could not validate JWT token: ${err}`);
                        return false;
                    }

                    logger.silly(`The JWT token is valid.`);
                    return true;
                });
            })
            .catch(err => {
                logger.error(`Could not validate token: ${err.message}`)
                return false;
            });
    },

    /**
	 * Renews a user session.
     * Usually the JWT tokens are valid for 1 hour only. Use this method to renew the user's session
     * instead of making the user login again.
     *
	 * @param {String} username The user's username.
	 * @param {String} refreshToken The session refresh token.
     *
	 * @returns {Promise<Object>} Promise with the renewed cognito user details.
	 */
	renewToken(username, refreshToken) {
		const RefreshToken = new AmazonCognitoIdentity.CognitoRefreshToken({
			RefreshToken: refreshToken,
		});

		const userData = {
			Username: username,
			Pool: userPool,
		};

		const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

        return new Promise((resolve, reject) => {
            cognitoUser.refreshSession(RefreshToken, (err, session) => {
                if (err) {
                    logger.error(`Could not refresh the token for user ${username}: ${err}`);
                    reject(err);
                    return
                }

                logger.silly(`Token for user ${username} has been updated.`);
                resolve ({
                    cognitoUser,
                    accessToken: session.accessToken.jwtToken,
                    idToken: session.idToken.jwtToken,
                    refreshToken: session.refreshToken.token,
                });
            });
        });
	}
}
