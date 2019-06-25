const authenticationHelper = require('../../Helpers/AuthenticationHelper');
const databaseHelper = require('../../Helpers/DatabaseHelper');


module.exports = {
    /**
     * End point to register a new user.
     *
     * @param {Object} req The request.
     * @param {Object} res The response.
     */
    signup(req, res){
        if (req.body) {
            return authenticationHelper.registerUser(req.body.user)
                .then(data => res.status(201).send(data.user))
                .catch(err => res.status(400).send(`Could not register user: ${err.message}`));
        }

        return res.status(400).send('Could not register user - invalid user data.')
    },

    /**
     * End point to sign in a user.
     *
     * @param {Object} req The request.
     * @param {Object} res The response.
     */
    signin(req, res){
        if (req.body) {
            return authenticationHelper.login(req.body.user)
                .then(data => res.status(200).send(data))
                .catch(err => res.status(401).send(`Could not login: ${err.message}`))
        }

        return res.status(400).send('Could not login - invalid user data.')
    },

    getUser(req, res){
        if(req.query){
            return databaseHelper.getUser(req.query.emailAddress)
                .then(result => res.status(200).send(result))
                .catch(err => res.status(500).send(`Could not get user info: ${err.message}`));
        }
    },

    addUser(req,res){
        if(req.body){
            return databaseHelper.addUser(req.body.email, req.body.name, req.body.role)
                .then(() => res.status(201).send('The user has been added'))
                .catch(err => res.status(500).send(`Could not add user info: ${err.message}`));
            }

        return res.status(400).send('Could not add user - missing data.')
            },

    updateUserScore(req,res){
        if(req.body){
            return databaseHelper.updateUserScore(req.body.email, req.body.scoreName, req.body.scoreValue)
                .then(() => res.status(201).send("The user's score has been updated"))
                .catch(err => res.status(500).send(`Could not add user info: ${err.message}`));
        }
    }
    };


